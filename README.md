# PrepPilotAI

AI-powered meal planner. Enter your calorie target, protein goal, daily budget, and foods to avoid — Claude AI generates a full day of meals with macros and a shopping list. Plans are saved and shareable by URL.

---

## 1. Architecture

```
Browser (Next.js 14 PWA — Vercel)
         │
         │  POST /generate
         │  GET  /plans/{id}
         ▼
API Gateway HTTP API (prod stage)
         │
         ▼
AWS Lambda  (Python 3.11, 256 MB, 30s timeout)
    │          │
    │          └─► SSM Parameter Store
    │                /preppilotai/anthropic_api_key (SecureString)
    │                        │
    │                        ▼
    │               Anthropic API  (claude-sonnet-4-6)
    │
    └─► DynamoDB  (preppilotai-plans, PAY_PER_REQUEST)
```

---

## 2. Prerequisites

| Tool | Version |
|------|---------|
| AWS CLI | v2+ (configured with credentials) |
| Terraform | >= 1.5.0 |
| Node.js | >= 18 |
| Python | 3.11 |

---

## 3. Backend & Infrastructure Setup

### 3a. Store your Anthropic API key in SSM (once)

```bash
aws ssm put-parameter \
  --name "/preppilotai/anthropic_api_key" \
  --value "sk-ant-YOUR_KEY_HERE" \
  --type SecureString \
  --region us-east-1
```

### 3b. Deploy with Terraform

```bash
cd infra
terraform init
terraform apply
```

Terraform will:
- Create the DynamoDB table `preppilotai-plans`
- Package `backend/handler.py` into a zip and deploy it as a Lambda function
- Create an API Gateway HTTP API with `/generate` and `/plans/{id}` routes
- Wire up IAM with least-privilege permissions

At the end of `terraform apply`, note the output:

```
api_invoke_url = "https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod"
```

You will need this URL for the frontend.

---

## 4. Frontend Setup

### 4a. Install dependencies

```bash
cd frontend
npm install
```

### 4b. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local and paste the invoke URL from terraform output:
# NEXT_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### 4c. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 4d. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
# Set NEXT_PUBLIC_API_URL as an environment variable in the Vercel dashboard
# or pass it during deploy:
vercel --prod -e NEXT_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

---

## 5. Generating PWA Icons

The manifest references `icon-192.png` and `icon-512.png`. Place your icons in `frontend/public/` before deploying. A quick way using ImageMagick:

```bash
convert -size 192x192 xc:#16a34a -gravity Center \
  -pointsize 100 -fill white -annotate 0 "🥗" public/icon-192.png
convert -size 512x512 xc:#16a34a -gravity Center \
  -pointsize 260 -fill white -annotate 0 "🥗" public/icon-512.png
```

---

## 6. Testing with curl

### Generate a meal plan

```bash
curl -X POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/generate \
  -H "Content-Type: application/json" \
  -d '{
    "calories": 2000,
    "protein_g": 150,
    "dislikes": ["shellfish", "mushrooms"],
    "budget_per_day_usd": 15
  }' | jq .
```

Expected response shape:

```json
{
  "plan_id": "550e8400-e29b-41d4-a716-446655440000",
  "plan": {
    "meals": [...],
    "totals": { "kcal": 2010, "protein": 153, "carbs": 220, "fat": 65 },
    "shopping_list": [...],
    "notes": "..."
  },
  "metadata": { "calories": 2000, "protein_g": 150, ... }
}
```

### Retrieve a saved plan

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/plans/550e8400-e29b-41d4-a716-446655440000 \
  | jq .
```

### Test input validation (expect 400)

```bash
curl -X POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/generate \
  -H "Content-Type: application/json" \
  -d '{"calories": 9999, "protein_g": 150, "dislikes": [], "budget_per_day_usd": 15}'
# → {"error": "calories must be a number between 500 and 5000"}
```

---

## 7. What This Demonstrates

**For résumé / portfolio:**

- **Serverless architecture** — API Gateway + Lambda + DynamoDB; no servers to manage
- **LLM integration** — Anthropic Claude API called via raw `urllib` (no SDK dependency bloat); strict JSON prompt engineering with fence-stripping
- **Security best practices** — API keys stored in SSM SecureString, never in code or env vars; IAM scoped to exact resources; CORS configured at both API Gateway and Lambda level
- **Infrastructure as Code** — full Terraform configuration with least-privilege IAM policies, `archive_file` for reproducible Lambda zips, and parameterised variables
- **PWA** — `next-pwa` service worker, Web App Manifest, `theme-color`, `apple-web-app-capable` meta; installable on iOS and Android
- **Type-safe frontend** — Next.js 14 App Router, TypeScript strict mode, no `any` types, server-side `fetchPlan` with proper `notFound()` integration
- **UX polish** — range sliders with live value display, tag input for dislikes, 35-second fetch timeout with AbortController, inline error messages, loading spinner
- **Observability** — structured Lambda logging with `aws_request_id` injected via a `logging.Filter` on every line

---

## Project Structure

```
preppilotai/
├── infra/
│   ├── main.tf          # All AWS resources (DynamoDB, Lambda, API Gateway, IAM)
│   ├── variables.tf     # region, project name
│   └── outputs.tf       # api_invoke_url
├── backend/
│   ├── handler.py       # Lambda function (validate → Claude → DynamoDB)
│   └── requirements.txt # boto3 only
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout + PWA metadata
│   │   │   ├── page.tsx          # / (home — form)
│   │   │   └── plan/[id]/page.tsx # /plan/:id (meal plan display)
│   │   ├── components/
│   │   │   ├── GeneratePlanForm.tsx
│   │   │   ├── MealCard.tsx
│   │   │   ├── MacroBadge.tsx
│   │   │   ├── SliderField.tsx
│   │   │   └── TagInput.tsx
│   │   ├── lib/api.ts            # fetch wrappers (generatePlan, fetchPlan)
│   │   └── types/meal-plan.ts    # Shared TypeScript interfaces
│   ├── public/manifest.json
│   ├── .env.local.example
│   └── next.config.js            # next-pwa config
└── README.md
```
