import type { GenerateFormValues, GenerateResponse, PlanResponse } from "@/types/meal-plan";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const FETCH_TIMEOUT_MS = 35_000;

/** Wraps fetch with an AbortController timeout. */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** POST /generate — generate and store a new meal plan. */
export async function generatePlan(values: GenerateFormValues): Promise<GenerateResponse> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not set. Check your .env.local file.");
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${API_URL}/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      },
      FETCH_TIMEOUT_MS
    );
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out. The AI is taking too long — please try again.");
    }
    throw new Error("Network error. Please check your connection and try again.");
  }

  const data: unknown = await response.json();

  if (!response.ok) {
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as Record<string, unknown>)["error"])
        : `Request failed with status ${response.status}`;
    throw new Error(msg);
  }

  return data as GenerateResponse;
}

/** GET /plans/{id} — retrieve a saved meal plan. */
export async function fetchPlan(planId: string): Promise<PlanResponse> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not set. Check your .env.local file.");
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${API_URL}/plans/${encodeURIComponent(planId)}`,
      { method: "GET" },
      FETCH_TIMEOUT_MS
    );
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out.");
    }
    throw new Error("Network error. Please check your connection and try again.");
  }

  const data: unknown = await response.json();

  if (!response.ok) {
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as Record<string, unknown>)["error"])
        : `Request failed with status ${response.status}`;
    throw new Error(msg);
  }

  return data as PlanResponse;
}
