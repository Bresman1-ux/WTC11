import type { Transaction } from "@/lib/finance";
import { formatDate, formatIDR } from "@/lib/format";

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-zinc-400">No transactions yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="border-b border-zinc-200 text-zinc-500">
          <tr>
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Title</th>
            <th className="py-2 pr-4 font-medium">Category</th>
            <th className="py-2 pr-0 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {transactions.map((t) => (
            <tr key={t.id}>
              <td className="py-2 pr-4 whitespace-nowrap text-zinc-500">
                {formatDate(t.date)}
              </td>
              <td className="py-2 pr-4 text-zinc-900">{t.title}</td>
              <td className="py-2 pr-4 text-zinc-500">{t.category}</td>
              <td
                className={`py-2 pr-0 text-right font-medium whitespace-nowrap ${
                  t.type === "income" ? "text-emerald-600" : "text-zinc-900"
                }`}
              >
                {t.type === "income" ? "+" : "-"}
                {formatIDR(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
