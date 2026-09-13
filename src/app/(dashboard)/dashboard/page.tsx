import { redirect } from "next/navigation";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { InsightCard } from "@/components/dashboard/insight-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import {
  computeCategoryBreakdown,
  computeCurrentMonthSummary,
  generateFamilyInsight,
  getRecentTransactions,
} from "@/lib/finance";
import { listTransactions } from "@/lib/transactions/queries";
import { createInsForgeServerClient } from "@/lib/insforge/server";

export default async function DashboardPage() {
  const result = await listTransactions();

  if (!result.ok) {
    if (result.error === "not_authenticated") {
      redirect("/login");
    }
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-red-600 shadow-sm">
        We couldn&apos;t load your dashboard right now. Please refresh the page.
      </div>
    );
  }

  const insforge = await createInsForgeServerClient();
  const { data: currentUser } = await insforge.auth.getCurrentUser();
  const displayName = currentUser?.user?.profile?.name || currentUser?.user?.email || "there";

  const transactions = result.transactions;
  const monthSummary = computeCurrentMonthSummary(transactions);
  const categoryBreakdown = computeCategoryBreakdown(transactions);
  const recentTransactions = getRecentTransactions(transactions);
  const insight = generateFamilyInsight(monthSummary, categoryBreakdown);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">Financial overview for {displayName}</p>
      </div>

      <SummaryCards summary={monthSummary} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-900">Spending by Category</h2>
          <div className="mt-4">
            <CategoryBreakdown items={categoryBreakdown} />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Family Insight</h2>
          <div className="mt-4">
            <InsightCard insight={insight} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Recent Transactions</h2>
        <div className="mt-4">
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
}
