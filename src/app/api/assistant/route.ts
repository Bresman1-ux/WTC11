import { NextResponse } from "next/server";
import { listTransactions } from "@/lib/transactions/queries";
import { buildFinancialContext } from "@/lib/assistant/context";
import { buildPrompt, MAX_QUESTION_LENGTH } from "@/lib/assistant/prompt";
import { askGemini, type GeminiError } from "@/lib/assistant/gemini";
import { isRateLimited } from "@/lib/assistant/rate-limit";

type AssistantResponseBody = {
  answer: string;
  period: string;
  transactionCount: number;
};

type AssistantErrorBody = { error: string };

function safeErrorResponse(message: string, status: number): NextResponse<AssistantErrorBody> {
  return NextResponse.json({ error: message }, { status });
}

const GEMINI_ERROR_MESSAGES: Record<GeminiError, { message: string; status: number }> = {
  configuration: {
    message: "The assistant is not available right now. Please try again later.",
    status: 503,
  },
  timeout: {
    message: "The assistant took too long to respond. Please try again.",
    status: 504,
  },
  rate_limited: {
    message: "The assistant is busy right now. Please try again in a moment.",
    status: 429,
  },
  unavailable: {
    message: "The assistant is temporarily unavailable. Please try again later.",
    status: 503,
  },
  provider_error: {
    message: "The assistant couldn't produce an answer. Please try again.",
    status: 502,
  },
};

export async function POST(request: Request): Promise<NextResponse<AssistantResponseBody | AssistantErrorBody>> {
  // 1. Authenticate before loading any data. RLS further scopes the query
  // below to the signed-in user; this is a distinct outer check that also
  // avoids ever calling Gemini for an unauthenticated request.
  const listResult = await listTransactions();
  if (!listResult.ok) {
    if (listResult.error === "not_authenticated") {
      return safeErrorResponse("Please log in to use the assistant.", 401);
    }
    return safeErrorResponse("We couldn't load your transactions right now. Please try again.", 500);
  }

  // 2. Parse and bound the untrusted request body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return safeErrorResponse("Invalid request.", 400);
  }

  const question = typeof body === "object" && body !== null ? (body as Record<string, unknown>).question : undefined;
  if (typeof question !== "string" || question.trim().length === 0) {
    return safeErrorResponse("Please enter a question.", 400);
  }
  const trimmedQuestion = question.trim();
  if (trimmedQuestion.length > MAX_QUESTION_LENGTH) {
    return safeErrorResponse(`Please keep your question under ${MAX_QUESTION_LENGTH} characters.`, 400);
  }

  // 3. Per-user request limit (process-local; see rate-limit.ts).
  if (isRateLimited(listResult.userId)) {
    return safeErrorResponse("You've asked a lot of questions recently. Please wait a bit and try again.", 429);
  }

  // 4. Deterministic, bounded context — never trust totals or user_id from the browser.
  const context = buildFinancialContext(listResult.transactions);
  const { systemInstruction, contents } = buildPrompt(context, trimmedQuestion);

  // 5. Call Gemini. All failure modes map to fixed, safe messages below.
  const result = await askGemini(systemInstruction, contents);

  if (!result.ok) {
    const mapped = GEMINI_ERROR_MESSAGES[result.error];
    return safeErrorResponse(mapped.message, mapped.status);
  }

  return NextResponse.json({
    answer: result.answer,
    period: context.periodLabel,
    transactionCount: context.rowCount,
  });
}
