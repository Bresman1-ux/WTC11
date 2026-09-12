import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { InsightCard } from "@/components/dashboard/insight-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import {
  computeCategoryBreakdown,
  computeSummary,
  generateFamilyInsight,
  getRecentTransactions,
} from "@/lib/finance";
import { profile, transactions } from "@/lib/mock-data";

export default function DashboardPage() {
  const summary = computeSummary(transactions);
  const categoryBreakdown = computeCategoryBreakdown(transactions);
  const recentTransactions = getRecentTransactions(transactions);
  const insight = generateFamilyInsight(summary, categoryBreakdown);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">
          Financial overview for {profile.name}
        </p>
      </div>

      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-900">
            Spending by Category
          </h2>
          <div className="mt-4">
            <CategoryBreakdown items={categoryBreakdown} />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Family Insight
          </h2>
          <div className="mt-4">
            <InsightCard insight={insight} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">
          Recent Transactions
        </h2>
        <div className="mt-4">
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
}
