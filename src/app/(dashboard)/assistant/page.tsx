const suggestedQuestions = [
  "Where did I spend the most money?",
  "Summarize my finances this month.",
  "What is my biggest expense category?",
  "How much money did I save?",
];

export default function AssistantPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          AI Assistant
        </h1>
        <p className="text-sm text-zinc-500">
          Ask questions about your financial activity.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex min-h-64 flex-1 flex-col items-center justify-center text-sm text-zinc-400">
          Start a conversation to see answers here.
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question) => (
            <span
              key={question}
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600"
            >
              {question}
            </span>
          ))}
        </div>

        <form className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about your finances..."
            disabled
            className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-500 disabled:bg-zinc-50"
          />
          <button
            type="submit"
            disabled
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
