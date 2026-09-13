"use server";

import { revalidatePath } from "next/cache";
import { validateTransactionInput, isValidTransactionId } from "@/lib/transactions/validation";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  type MutationError,
} from "@/lib/transactions/queries";

export type TransactionActionState = { error: string | null; success?: boolean } | undefined;

function mapMutationError(error: MutationError): string {
  switch (error) {
    case "not_authenticated":
      return "Your session has expired. Please log in again.";
    case "not_found_or_forbidden":
      return "That transaction could not be found.";
    case "invalid_id":
      return "Invalid transaction reference.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function readFormInput(formData: FormData) {
  return {
    title: formData.get("title"),
    amount: formData.get("amount"),
    type: formData.get("type"),
    category: formData.get("category"),
    date: formData.get("date"),
    description: formData.get("description"),
  };
}

export async function createTransactionAction(
  _prevState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const validated = validateTransactionInput(readFormInput(formData));
  if (!validated.success) {
    return { error: validated.error };
  }

  const result = await createTransaction(validated.data);
  if (!result.ok) {
    return { error: mapMutationError(result.error) };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function updateTransactionAction(
  _prevState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const id = formData.get("id");
  if (!isValidTransactionId(id)) {
    return { error: "Invalid transaction reference." };
  }

  const validated = validateTransactionInput(readFormInput(formData));
  if (!validated.success) {
    return { error: validated.error };
  }

  const result = await updateTransaction(id, validated.data);
  if (!result.ok) {
    return { error: mapMutationError(result.error) };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function deleteTransactionAction(
  _prevState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const id = formData.get("id");
  if (!isValidTransactionId(id)) {
    return { error: "Invalid transaction reference." };
  }

  const result = await deleteTransaction(id);
  if (!result.ok) {
    return { error: mapMutationError(result.error) };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}
