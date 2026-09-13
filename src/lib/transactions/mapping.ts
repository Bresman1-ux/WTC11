import type { Transaction, TransactionCategory, TransactionType } from "@/lib/finance";

/** Shape of a row as returned by the `transactions` table (snake_case, from Postgres/PostgREST). */
export type TransactionRow = {
  id: string;
  title: string;
  amount: number | string;
  type: string;
  category: string;
  transaction_date: string;
  description: string | null;
};

/** Maps a raw database row to the application's Transaction shape. Never spread rows directly into UI. */
export function mapRowToTransaction(row: TransactionRow): Transaction {
  const amount = typeof row.amount === "number" ? row.amount : Number(row.amount);

  return {
    id: row.id,
    title: row.title,
    amount: Number.isFinite(amount) ? amount : 0,
    type: row.type as TransactionType,
    category: row.category as TransactionCategory,
    date: row.transaction_date,
    description: row.description ?? undefined,
  };
}
