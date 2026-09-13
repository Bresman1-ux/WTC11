import { redirect } from "next/navigation";
import { listTransactions } from "@/lib/transactions/queries";
import { TransactionsView } from "@/components/transactions/transactions-view";

export default async function TransactionsPage() {
  const result = await listTransactions();

  if (!result.ok) {
    if (result.error === "not_authenticated") {
      redirect("/login");
    }
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-red-600 shadow-sm">
        We couldn&apos;t load your transactions right now. Please refresh the page.
      </div>
    );
  }

  return <TransactionsView transactions={result.transactions} />;
}
