"""
PrepPilotAI Lambda handler.

Endpoints:
    POST /generate  — validate input, call Claude, store plan, return plan + plan_id
    GET  /plans/{id} — retrieve a saved plan from DynamoDB
"""

from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
import uuid
from decimal import Decimal
from typing import Any

import boto3
from botocore.exceptions import ClientError

# ---------------------------------------------------------------------------
# Logging setup — include request ID on every line via LogRecord filter
# ---------------------------------------------------------------------------

logger = logging.getLogger()
logger.setLevel(logging.INFO)

_request_id: str = "bootstrap"


class _RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:  # noqa: D102
        record.request_id = _request_id
        return True


for _h in logger.handlers:
    _h.setFormatter(
        logging.Formatter("%(levelname)s [%(request_id)s] %(message)s")
    )
    _h.addFilter(_RequestIdFilter())


# ---------------------------------------------------------------------------
# AWS clients
# ---------------------------------------------------------------------------

_dynamodb = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION", "us-east-1"))
_ssm = boto3.client("ssm", region_name=os.environ.get("AWS_REGION", "us-east-1"))

TABLE_NAME = os.environ.get("DYNAMODB_TABLE", "preppilotai-plans")
SSM_KEY_PATH = os.environ.get("SSM_PARAM_PATH", "preppilotai-anthropic-api-key")
ANTHROPIC_VERSION = "2023-06-01"
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
CLAUDE_MODEL = "claude-sonnet-4-6"

_table = _dynamodb.Table(TABLE_NAME)

VALID_GOALS = {"cut", "maintain", "bulk"}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _cors_headers() -> dict[str, str]:
    """Return permissive CORS headers for API Gateway responses."""
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Content-Type": "application/json",
    }


def _decimal_default(obj: Any) -> Any:
    """JSON serializer for Decimal values returned by DynamoDB."""
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


def _response(status: int, body: Any) -> dict[str, Any]:
    """Build an API Gateway proxy-compatible response dict."""
    return {
        "statusCode": status,
        "headers": _cors_headers(),
        "body": json.dumps(body, default=_decimal_default),
    }


def _error(status: int, message: str) -> dict[str, Any]:
    """Convenience wrapper for error responses."""
    logger.warning("Returning %d: %s", status, message)
    return _response(status, {"error": message})


def _get_anthropic_key() -> str:
    """Fetch the Anthropic API key from SSM Parameter Store (with decryption)."""
    try:
        result = _ssm.get_parameter(Name=SSM_KEY_PATH, WithDecryption=True)
        return result["Parameter"]["Value"]
    except ClientError as exc:
        logger.error("Failed to retrieve SSM parameter: %s", exc)
        raise RuntimeError("Could not load Anthropic API key from SSM") from exc


def _validate_input(body: dict[str, Any]) -> str | None:
    """
    Validate the /generate request body.

    Returns an error message string if validation fails, otherwise None.
    """
    calories = body.get("calories")
    protein = body.get("protein_g")
    dislikes = body.get("dislikes", [])
    budget = body.get("budget_per_day_usd")

    if not isinstance(calories, (int, float)) or not (500 <= calories <= 5000):
        return "calories must be a number between 500 and 5000"

    if not isinstance(protein, (int, float)) or not (0 <= protein <= 500):
        return "protein_g must be a number between 0 and 500"

    if not isinstance(dislikes, list) or not all(isinstance(d, str) for d in dislikes):
        return "dislikes must be a list of strings"

    if not isinstance(budget, (int, float)) or not (1 <= budget <= 100):
        return "budget_per_day_usd must be a number between 1 and 100"

    # Optional advanced fields
    carbs_g = body.get("carbs_g")
    fat_g = body.get("fat_g")
    meals_per_day = body.get("meals_per_day")
    goal = body.get("goal")

    if carbs_g is not None:
        if not isinstance(carbs_g, (int, float)) or not (0 <= carbs_g <= 600):
            return "carbs_g must be a number between 0 and 600"

    if fat_g is not None:
        if not isinstance(fat_g, (int, float)) or not (0 <= fat_g <= 200):
            return "fat_g must be a number between 0 and 200"

    if meals_per_day is not None:
        if not isinstance(meals_per_day, int) or not (2 <= meals_per_day <= 6):
            return "meals_per_day must be an integer between 2 and 6"

    if goal is not None:
        if goal not in VALID_GOALS:
            return f"goal must be one of: {', '.join(sorted(VALID_GOALS))}"

    return None


def _build_prompt(
    calories: float,
    protein_g: float,
    dislikes: list[str],
    budget_per_day_usd: float,
    carbs_g: float | None = None,
    fat_g: float | None = None,
    meals_per_day: int = 3,
    goal: str | None = None,
) -> str:
    """Construct the Claude prompt for meal plan generation."""
    dislike_text = (
        f"Avoid these foods/ingredients: {', '.join(dislikes)}."
        if dislikes
        else "No specific food restrictions."
    )

    goal_line = ""
    if goal:
        goal_descriptions = {
            "cut": "CUT (caloric deficit phase — prioritise lean protein, minimise fat, low carbs)",
            "maintain": "MAINTAIN (maintenance phase — balanced macros for performance)",
            "bulk": "BULK (caloric surplus phase — support muscle growth with higher carbs)",
        }
        goal_line = f"\n- Athletic goal: {goal_descriptions.get(goal, goal.upper())}"

    macro_lines = f"- Daily calorie target: {calories} kcal\n- Daily protein target: {protein_g}g"
    if carbs_g is not None:
        macro_lines += f"\n- Daily carbohydrate target: {carbs_g}g (hit this precisely)"
    if fat_g is not None:
        macro_lines += f"\n- Daily fat target: {fat_g}g (hit this precisely)"

    return f"""You are a precision sports nutritionist creating meal plans for serious athletes.

Create a one-day meal plan with the following exact requirements:
{macro_lines}
- Daily food budget: ${budget_per_day_usd:.2f} USD
- {dislike_text}{goal_line}
- Number of meals: provide EXACTLY {meals_per_day} meals, no more, no less

{'CRITICAL: The macro targets (protein, carbs, fat) are precise athletic requirements. Each meal must contribute appropriately. Hitting these targets is more important than exact round numbers.' if carbs_g is not None or fat_g is not None else ''}

Return ONLY valid JSON (no markdown, no explanation) in exactly this shape:
{{
  "meals": [
    {{
      "name": "Meal name",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "macros": {{"kcal": 0, "protein": 0, "carbs": 0, "fat": 0}},
      "prep": "Brief preparation instructions (2-4 sentences)."
    }}
  ],
  "totals": {{"kcal": 0, "protein": 0, "carbs": 0, "fat": 0}},
  "shopping_list": ["item 1", "item 2"],
  "notes": "Performance nutrition notes, timing recommendations, or substitution ideas."
}}

Provide exactly {meals_per_day} meals. All numeric macro values must be integers."""


def _call_claude(prompt: str, api_key: str) -> dict[str, Any]:
    """
    Call the Anthropic Messages API using urllib (no third-party dependencies).

    Raises RuntimeError if the API call fails or the response cannot be parsed.
    """
    payload = json.dumps(
        {
            "model": CLAUDE_MODEL,
            "max_tokens": 2048,
            "messages": [{"role": "user", "content": prompt}],
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        ANTHROPIC_URL,
        data=payload,
        headers={
            "x-api-key": api_key,
            "anthropic-version": ANTHROPIC_VERSION,
            "content-type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=28) as resp:
            raw = resp.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        logger.error("Anthropic API HTTP error %d: %s", exc.code, body)
        raise RuntimeError(f"Anthropic API returned status {exc.code}") from exc
    except urllib.error.URLError as exc:
        logger.error("Anthropic API URL error: %s", exc.reason)
        raise RuntimeError("Failed to reach Anthropic API") from exc

    response_data: dict[str, Any] = json.loads(raw)
    content_blocks: list[dict[str, Any]] = response_data.get("content", [])
    text_block = next((b for b in content_blocks if b.get("type") == "text"), None)
    if not text_block:
        raise RuntimeError("No text content in Anthropic response")

    raw_text: str = text_block["text"].strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("\n", 1)[-1]
        if raw_text.endswith("```"):
            raw_text = raw_text[: raw_text.rfind("```")]

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse Claude JSON: %s", raw_text[:500])
        raise RuntimeError("Claude returned malformed JSON") from exc


def _save_plan(plan_id: str, plan: dict[str, Any], metadata: dict[str, Any]) -> None:
    """Persist a meal plan to DynamoDB."""
    try:
        _table.put_item(
            Item={
                "plan_id": plan_id,
                "plan": plan,
                "metadata": metadata,
            }
        )
    except ClientError as exc:
        logger.error("DynamoDB put_item failed: %s", exc)
        raise RuntimeError("Failed to save plan to database") from exc


def _fetch_plan(plan_id: str) -> dict[str, Any] | None:
    """Retrieve a meal plan from DynamoDB by plan_id. Returns None if not found."""
    try:
        result = _table.get_item(Key={"plan_id": plan_id})
        return result.get("Item")
    except ClientError as exc:
        logger.error("DynamoDB get_item failed: %s", exc)
        raise RuntimeError("Failed to retrieve plan from database") from exc


# ---------------------------------------------------------------------------
# Route handlers
# ---------------------------------------------------------------------------


def _handle_generate(event: dict[str, Any]) -> dict[str, Any]:
    """Handle POST /generate."""
    raw_body = event.get("body") or "{}"
    try:
        body: dict[str, Any] = json.loads(raw_body)
    except json.JSONDecodeError:
        return _error(400, "Request body must be valid JSON")

    validation_error = _validate_input(body)
    if validation_error:
        return _error(400, validation_error)

    calories: float = body["calories"]
    protein_g: float = body["protein_g"]
    dislikes: list[str] = body.get("dislikes", [])
    budget: float = body["budget_per_day_usd"]
    carbs_g: float | None = body.get("carbs_g")
    fat_g: float | None = body.get("fat_g")
    meals_per_day: int = int(body.get("meals_per_day", 3))
    goal: str | None = body.get("goal")

    logger.info(
        "Generating plan: calories=%.0f protein=%.0f carbs=%s fat=%s meals=%d goal=%s budget=%.2f",
        calories,
        protein_g,
        carbs_g,
        fat_g,
        meals_per_day,
        goal,
        budget,
    )

    try:
        api_key = _get_anthropic_key()
        prompt = _build_prompt(
            calories, protein_g, dislikes, budget,
            carbs_g=carbs_g, fat_g=fat_g,
            meals_per_day=meals_per_day, goal=goal,
        )
        plan = _call_claude(prompt, api_key)
    except RuntimeError as exc:
        return _error(502, str(exc))

    plan_id = str(uuid.uuid4())
    metadata: dict[str, Any] = {
        "calories": calories,
        "protein_g": protein_g,
        "dislikes": dislikes,
        "budget_per_day_usd": budget,
        "meals_per_day": meals_per_day,
    }
    if carbs_g is not None:
        metadata["carbs_g"] = carbs_g
    if fat_g is not None:
        metadata["fat_g"] = fat_g
    if goal is not None:
        metadata["goal"] = goal

    try:
        _save_plan(plan_id, plan, metadata)
    except RuntimeError as exc:
        return _error(502, str(exc))

    logger.info("Plan saved with id=%s", plan_id)
    return _response(200, {"plan_id": plan_id, "plan": plan, "metadata": metadata})


def _handle_get_plan(plan_id: str) -> dict[str, Any]:
    """Handle GET /plans/{id}."""
    logger.info("Fetching plan id=%s", plan_id)

    try:
        item = _fetch_plan(plan_id)
    except RuntimeError as exc:
        return _error(502, str(exc))

    if item is None:
        return _error(404, f"Plan '{plan_id}' not found")

    return _response(200, {
        "plan_id": plan_id,
        "plan": item["plan"],
        "metadata": item.get("metadata", {}),
    })


# ---------------------------------------------------------------------------
# Lambda entry point
# ---------------------------------------------------------------------------


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    """
    AWS Lambda entry point.

    Routes requests to the appropriate handler based on HTTP method and path.
    """
    global _request_id  # noqa: PLW0603
    _request_id = getattr(context, "aws_request_id", "local")

    method: str = event.get("requestContext", {}).get("http", {}).get("method", "")
    raw_path: str = event.get("rawPath", "")

    stage: str = event.get("requestContext", {}).get("stage", "")
    if stage and raw_path.startswith(f"/{stage}"):
        path = raw_path[len(f"/{stage}"):]
    else:
        path = raw_path

    logger.info("Received %s %s (rawPath=%s)", method, path, raw_path)

    if method == "OPTIONS":
        return _response(200, {})

    if method == "POST" and path == "/generate":
        return _handle_generate(event)

    if method == "GET" and path.startswith("/plans/"):
        plan_id = path.split("/plans/", 1)[-1].strip("/")
        if not plan_id:
            return _error(400, "Missing plan_id in path")
        return _handle_get_plan(plan_id)

    return _error(404, f"No route for {method} {path}")
