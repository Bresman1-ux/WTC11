export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Health"
  | "Education"
  | "Salary"
  | "Investment"
  | "Other";

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Salary",
  "Investment",
  "Other",
];

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  description?: string;
};

export type FinancialSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
};

export function computeSummary(transactions: Transaction[]): FinancialSummary {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  return { totalIncome, totalExpense, balance, savingsRate };
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

export function computeCurrentMonthSummary(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): FinancialSummary {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  const currentMonthTransactions = transactions.filter((t) => {
    if (!isValidISODate(t.date)) return false;
    const parsed = new Date(t.date);
    return parsed.getFullYear() === year && parsed.getMonth() === month;
  });

  return computeSummary(currentMonthTransactions);
}

export type CategoryBreakdownItem = {
  category: TransactionCategory;
  amount: number;
  percentage: number;
};

export function computeCategoryBreakdown(
  transactions: Transaction[],
): CategoryBreakdownItem[] {
  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const totalsByCategory = new Map<TransactionCategory, number>();
  for (const t of expenseTransactions) {
    totalsByCategory.set(t.category, (totalsByCategory.get(t.category) ?? 0) + t.amount);
  }

  return Array.from(totalsByCategory.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getRecentTransactions(
  transactions: Transaction[],
  count = 6,
): Transaction[] {
  return [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}

export function getLargestTransactions(
  transactions: Transaction[],
  count = 5,
): Transaction[] {
  return [...transactions].sort((a, b) => b.amount - a.amount).slice(0, count);
}

export function generateFamilyInsight(
  summary: FinancialSummary,
  breakdown: CategoryBreakdownItem[],
): string {
  if (breakdown.length === 0) {
    return "Add some transactions to see a financial insight for your family.";
  }

  const topCategory = breakdown[0];
  const healthAndEducationShare = breakdown
    .filter((item) => item.category === "Health" || item.category === "Education")
    .reduce((sum, item) => sum + item.percentage, 0);
  const savingsRate = Math.round(summary.savingsRate);

  return (
    `With a new baby on the way, Health and Education already make up about ` +
    `${Math.round(healthAndEducationShare)}% of monthly spending, while ${topCategory.category} ` +
    `remains your largest expense at ${Math.round(topCategory.percentage)}%. ` +
    `At a ${savingsRate}% savings rate, your family is building a steady cushion ahead of your second child's arrival.`
  );
}
