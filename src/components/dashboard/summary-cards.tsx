import type { FinancialSummary } from "@/lib/finance";
import { formatIDR } from "@/lib/format";

export function SummaryCards({ summary }: { summary: FinancialSummary }) {
  const cards = [
    { label: "Available Balance", value: formatIDR(summary.balance) },
    { label: "Total Income", value: formatIDR(summary.totalIncome) },
    { label: "Total Expense", value: formatIDR(summary.totalExpense) },
    { label: "Savings Rate", value: `${Math.round(summary.savingsRate)}%` },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
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
  );
}
