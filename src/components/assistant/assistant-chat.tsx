"use client";

import { useCallback, useState, type FormEvent } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./markdown-components";

// Keep in sync with MAX_QUESTION_LENGTH in src/lib/assistant/prompt.ts.
const MAX_QUESTION_LENGTH = 500;

const SUGGESTED_QUESTIONS = [
  "Where did I spend the most money?",
  "Summarize my finances this month.",
  "What is my biggest expense category?",
  "Give me three insights about my spending.",
];

type AssistantAnswer = {
  answer: string;
  period: string;
  transactionCount: number;
};

export function AssistantChat() {
  const [question, setQuestion] = useState("");
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [result, setResult] = useState<AssistantAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const ask = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    setPending(true);
    setError(null);
    setLastQuestion(trimmed);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data && typeof data === "object" && typeof (data as Record<string, unknown>).error === "string"
            ? ((data as Record<string, unknown>).error as string)
            : "Something went wrong. Please try again.";
        setError(message);
        setResult(null);
        return;
      }

      setResult(data as AssistantAnswer);
    } catch {
      setError("Couldn't reach the assistant. Check your connection and try again.");
      setResult(null);
    } finally {
      setPending(false);
    }
  }, [pending]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = question;
    setQuestion("");
    void ask(text);
  }

  function handleSuggestion(text: string) {
    setQuestion("");
    void ask(text);
  }

  function handleRetry() {
    if (lastQuestion) void ask(lastQuestion);
  }

  const hasStarted = lastQuestion !== null;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex min-h-64 flex-1 flex-col justify-center gap-3">
        {!hasStarted && !pending && (
          <p className="text-center text-sm text-zinc-400">Ask a question to see answers here.</p>
        )}

        {pending && <p className="text-center text-sm text-zinc-400">Thinking...</p>}

        {!pending && error && (
          <div className="flex flex-col items-center gap-2 px-2 text-center">
            <p className="text-sm text-red-600">{error}</p>
            {lastQuestion && (
              <button
                type="button"
                onClick={handleRetry}
                className="text-sm font-medium text-zinc-900 underline underline-offset-2"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {!pending && !error && result && (
          <div className="flex flex-col gap-2 overflow-x-hidden">
            <p className="text-xs text-zinc-400">
              Analyzed period: {result.period} &middot; {result.transactionCount} transaction
              {result.transactionCount === 1 ? "" : "s"} considered
            </p>
            <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {result.answer}
            </Markdown>
            <p className="mt-1 text-xs text-zinc-400">
              General ideas above are not professional financial advice.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={pending}
            onClick={() => handleSuggestion(suggestion)}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about your finances..."
          disabled={pending}
          maxLength={MAX_QUESTION_LENGTH}
          className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 disabled:bg-zinc-50"
        />
        <button
          type="submit"
          disabled={pending || question.trim().length === 0}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
