const summaryCards = [
  { label: "Total Balance", value: "—" },
  { label: "Total Income", value: "—" },
  { label: "Total Expense", value: "—" },
  { label: "Savings Rate", value: "—" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">
          Overview of your financial activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-900">
            Spending by Category
          </h2>
          <div className="mt-4 flex h-48 items-center justify-center text-sm text-zinc-400">
            Chart placeholder
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">AI Insight</h2>
          <p className="mt-4 text-sm text-zinc-400">
            Insights will appear here once transaction data is available.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">
          Recent Transactions
        </h2>
        <p className="mt-4 text-sm text-zinc-400">No transactions yet.</p>
      </div>
    </div>
  );
}
