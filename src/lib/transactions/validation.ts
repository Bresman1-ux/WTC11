import { TRANSACTION_CATEGORIES, type TransactionCategory, type TransactionType } from "@/lib/finance";

export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 500;
export const MAX_AMOUNT = 1_000_000_000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type TransactionInput = {
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  description?: string;
};

export type ValidationResult =
  | { success: true; data: TransactionInput }
  | { success: false; error: string };

function isRealCalendarDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidTransactionId(id: unknown): id is string {
  return typeof id === "string" && UUID_RE.test(id);
}

/** Validates untrusted transaction input on the server boundary. */
export function validateTransactionInput(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { success: false, error: "Invalid input." };
  }
  const input = raw as Record<string, unknown>;

  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) {
    return { success: false, error: "Title is required." };
  }
  if (title.length > TITLE_MAX_LENGTH) {
    return { success: false, error: `Title must be at most ${TITLE_MAX_LENGTH} characters.` };
  }

  const rawAmount = input.amount;
  const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: "Amount must be a positive number." };
  }
  if (amount > MAX_AMOUNT) {
    return { success: false, error: "Amount is too large." };
  }

  if (input.type !== "income" && input.type !== "expense") {
    return { success: false, error: "Type must be 'income' or 'expense'." };
  }
  const type = input.type;

  if (typeof input.category !== "string" || !TRANSACTION_CATEGORIES.includes(input.category as TransactionCategory)) {
    return { success: false, error: "Category is not recognized." };
  }
  const category = input.category as TransactionCategory;

  const date = typeof input.date === "string" ? input.date : "";
  if (!isRealCalendarDate(date)) {
    return { success: false, error: "Date must be a valid calendar date." };
  }

  let description: string | undefined;
  if (input.description !== undefined && input.description !== null && input.description !== "") {
    if (typeof input.description !== "string") {
      return { success: false, error: "Description must be text." };
    }
    const trimmed = input.description.trim();
    if (trimmed.length > DESCRIPTION_MAX_LENGTH) {
      return { success: false, error: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.` };
    }
    description = trimmed || undefined;
  }

  return {
    success: true,
    data: {
      title,
      amount: Math.round(amount * 100) / 100,
      type,
      category,
      date,
      description,
    },
  };
}
