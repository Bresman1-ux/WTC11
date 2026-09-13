import "server-only";
import {
  computeCategoryBreakdown,
  computeCurrentMonthSummary,
  computeSummary,
  getLargestTransactions,
  getRecentTransactions,
  isValidISODate,
  type CategoryBreakdownItem,
  type FinancialSummary,
  type Transaction,
} from "@/lib/finance";

// Documented context bounds: the assistant only ever sees a recent, capped
// slice of a user's data, with free-text fields truncated before they reach
// the model.
export const CONTEXT_WINDOW_DAYS = 90;
export const CONTEXT_MAX_ROWS = 200;
export const CONTEXT_TITLE_MAX_LENGTH = 80;
export const CONTEXT_DESCRIPTION_MAX_LENGTH = 160;
export const CONTEXT_LARGEST_COUNT = 5;
export const CONTEXT_RECENT_COUNT = 8;

// Only the fields Gemini actually needs to ground an answer — no row id and
// nothing else from the transaction record.
export type ContextTransaction = {
  title: string;
  amount: number;
  type: Transaction["type"];
  category: Transaction["category"];
  date: string;
  description?: string;
};

export type FinancialContext = {
  periodLabel: string;
  rowCount: number;
  isEmpty: boolean;
  totals: FinancialSummary;
  monthSummary: FinancialSummary;
  categoryBreakdown: CategoryBreakdownItem[];
  largestItems: ContextTransaction[];
  recentItems: ContextTransaction[];
};

function toContextTransaction(t: Transaction): ContextTransaction {
  return {
    title: t.title,
    amount: t.amount,
    type: t.type,
    category: t.category,
    date: t.date,
    description: t.description,
  };
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function isWithinWindow(transaction: Transaction, cutoff: Date): boolean {
  if (!isValidISODate(transaction.date)) return false;
  return new Date(transaction.date).getTime() >= cutoff.getTime();
}

/**
 * Builds a deterministic, bounded financial context for the assistant from
 * the caller's already RLS-scoped transactions. Titles/descriptions are
 * truncated here so nothing beyond the documented bounds ever reaches Gemini.
 */
export function buildFinancialContext(allTransactions: Transaction[]): FinancialContext {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - CONTEXT_WINDOW_DAYS);

  // allTransactions is already ordered most-recent-first, so slicing after
  // the window filter keeps the most recent rows within the row cap.
  const windowed: Transaction[] = allTransactions
    .filter((t) => isWithinWindow(t, cutoff))
    .slice(0, CONTEXT_MAX_ROWS)
    .map((t) => ({
      ...t,
      title: truncate(t.title, CONTEXT_TITLE_MAX_LENGTH),
      description: t.description ? truncate(t.description, CONTEXT_DESCRIPTION_MAX_LENGTH) : undefined,
    }));

  return {
    periodLabel: `the last ${CONTEXT_WINDOW_DAYS} days`,
    rowCount: windowed.length,
    isEmpty: windowed.length === 0,
    totals: computeSummary(windowed),
    monthSummary: computeCurrentMonthSummary(windowed),
    categoryBreakdown: computeCategoryBreakdown(windowed),
    largestItems: getLargestTransactions(windowed, CONTEXT_LARGEST_COUNT).map(toContextTransaction),
    recentItems: getRecentTransactions(windowed, CONTEXT_RECENT_COUNT).map(toContextTransaction),
  };
}
