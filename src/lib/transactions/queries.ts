import "server-only";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import { mapRowToTransaction, type TransactionRow } from "./mapping";
import type { TransactionInput } from "./validation";
import type { Transaction } from "@/lib/finance";

const TABLE = "transactions";
const SELECT_COLUMNS = "id,title,amount,type,category,transaction_date,description";
const MAX_ROWS = 1000;

export type QueryError = "not_authenticated" | "query_failed";
export type MutationError = "not_authenticated" | "invalid_id" | "not_found_or_forbidden" | "write_failed";

export type ListResult =
  | { ok: true; transactions: Transaction[] }
  | { ok: false; error: QueryError };

export type MutationResult =
  | { ok: true; transaction: Transaction }
  | { ok: false; error: MutationError };

export type DeleteResult = { ok: true } | { ok: false; error: MutationError };

async function requireAuthenticatedClient() {
  try {
    const insforge = await createInsForgeServerClient();
    const { data, error } = await insforge.auth.getCurrentUser();

    if (error || !data?.user) {
      return { insforge: null, userId: null };
    }

    return { insforge, userId: data.user.id };
  } catch {
    // Misconfigured or unreachable backend: treat like "not authenticated"
    // rather than crashing the page.
    return { insforge: null, userId: null };
  }
}

/** Lists the signed-in user's transactions. RLS scopes rows to that user regardless of any filter here. */
export async function listTransactions(): Promise<ListResult> {
  const { insforge } = await requireAuthenticatedClient();
  if (!insforge) {
    return { ok: false, error: "not_authenticated" };
  }

  const { data, error } = await insforge.database
    .from(TABLE)
    .select(SELECT_COLUMNS)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);

  if (error) {
    return { ok: false, error: "query_failed" };
  }

  return { ok: true, transactions: ((data ?? []) as TransactionRow[]).map(mapRowToTransaction) };
}

function toInsertPayload(input: TransactionInput) {
  return {
    title: input.title,
    amount: input.amount,
    type: input.type,
    category: input.category,
    transaction_date: input.date,
    description: input.description ?? null,
  };
}

/**
 * Creates a transaction for the signed-in user. `user_id` is never taken from the
 * caller: the database column defaults to auth.uid() and RLS's WITH CHECK enforces it.
 */
export async function createTransaction(input: TransactionInput): Promise<MutationResult> {
  const { insforge } = await requireAuthenticatedClient();
  if (!insforge) {
    return { ok: false, error: "not_authenticated" };
  }

  const { data, error } = await insforge.database
    .from(TABLE)
    .insert(toInsertPayload(input))
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    return { ok: false, error: "write_failed" };
  }

  return { ok: true, transaction: mapRowToTransaction(data as TransactionRow) };
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<MutationResult> {
  const { insforge } = await requireAuthenticatedClient();
  if (!insforge) {
    return { ok: false, error: "not_authenticated" };
  }

  const { data, error } = await insforge.database
    .from(TABLE)
    .update(toInsertPayload(input))
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    // RLS silently drops rows the user does not own, so a missing row and a
    // forbidden row look the same here. Do not leak which one it was.
    return { ok: false, error: "not_found_or_forbidden" };
  }

  return { ok: true, transaction: mapRowToTransaction(data as TransactionRow) };
}

export async function deleteTransaction(id: string): Promise<DeleteResult> {
  const { insforge } = await requireAuthenticatedClient();
  if (!insforge) {
    return { ok: false, error: "not_authenticated" };
  }

  const { data, error } = await insforge.database.from(TABLE).delete().eq("id", id).select("id");

  if (error) {
    return { ok: false, error: "write_failed" };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: "not_found_or_forbidden" };
  }

  return { ok: true };
}
