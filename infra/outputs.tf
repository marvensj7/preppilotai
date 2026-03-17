output "api_invoke_url" {
  description = "Full invoke URL for the API Gateway prod stage"
  value       = "${aws_apigatewayv2_stage.prod.invoke_url}"
}

output "lambda_function_name" {
  description = "Name of the deployed Lambda function"
  value       = aws_lambda_function.api.function_name
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB plans table"
  value       = aws_dynamodb_table.plans.name
}
