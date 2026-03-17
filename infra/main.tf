terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# ---------------------------------------------------------------------------
# DynamoDB
# ---------------------------------------------------------------------------

resource "aws_dynamodb_table" "plans" {
  name         = "${var.project}-plans"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "plan_id"

  attribute {
    name = "plan_id"
    type = "S"
  }

  tags = {
    Project = var.project
  }
}

# ---------------------------------------------------------------------------
# SSM Parameter (created manually by the operator — referenced here for IAM)
# The parameter must be created before `terraform apply`:
#   aws ssm put-parameter \
#     --name /preppilotai/anthropic_api_key \
#     --value "sk-ant-..." \
#     --type SecureString
# ---------------------------------------------------------------------------

data "aws_ssm_parameter" "anthropic_key" {
  name            = "${var.project}-anthropic-api-key"
  with_decryption = false # Only used to get the ARN for IAM; Lambda decrypts at runtime
}

# ---------------------------------------------------------------------------
# IAM role for Lambda
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${var.project}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json

  tags = {
    Project = var.project
  }
}

data "aws_iam_policy_document" "lambda_policy" {
  # CloudWatch Logs
  statement {
    sid    = "Logs"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }

  # DynamoDB — scoped to the plans table only
  statement {
    sid    = "DynamoDB"
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
    ]
    resources = [aws_dynamodb_table.plans.arn]
  }

  # SSM — scoped to the specific parameter
  statement {
    sid    = "SSMGetParam"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
    ]
    resources = [data.aws_ssm_parameter.anthropic_key.arn]
  }

  # KMS — decrypt the SecureString (uses the AWS-managed SSM key)
  statement {
    sid    = "KMSDecrypt"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:ViaService"
      values   = ["ssm.${var.region}.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "lambda" {
  name   = "${var.project}-lambda-policy"
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.lambda_policy.json
}

# ---------------------------------------------------------------------------
# Lambda deployment package
# ---------------------------------------------------------------------------

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../backend"
  output_path = "${path.module}/lambda.zip"
  excludes    = ["__pycache__", "*.pyc", "requirements.txt", "tests"]
}

resource "aws_lambda_function" "api" {
  function_name    = "${var.project}-api"
  role             = aws_iam_role.lambda.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      DYNAMODB_TABLE  = aws_dynamodb_table.plans.name
      SSM_PARAM_PATH  = "${var.project}-anthropic-api-key"
    }
  }

  tags = {
    Project = var.project
  }
}

# ---------------------------------------------------------------------------
# API Gateway HTTP API
# ---------------------------------------------------------------------------

resource "aws_apigatewayv2_api" "http" {
  name          = "${var.project}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }

  tags = {
    Project = var.project
  }
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "prod"
  auto_deploy = true

  tags = {
    Project = var.project
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "generate" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /generate"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "get_plan" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /plans/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "options_generate" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "OPTIONS /generate"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "options_plans" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "OPTIONS /plans/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# Allow API Gateway to invoke the Lambda function
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}
