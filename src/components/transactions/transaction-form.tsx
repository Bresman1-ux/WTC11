"use client";

import { useActionState, useEffect } from "react";
import { createTransactionAction, updateTransactionAction } from "@/app/actions/transactions";
import { TRANSACTION_CATEGORIES, type Transaction } from "@/lib/finance";

type TransactionFormProps = {
  mode: "create" | "edit";
  initial?: Transaction;
  onDone: () => void;
  onCancel: () => void;
};

export function TransactionForm({ mode, initial, onDone, onCancel }: TransactionFormProps) {
  const action = mode === "create" ? createTransactionAction : updateTransactionAction;
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.success) {
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
    >
      {mode === "edit" && initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Title
          <input
            type="text"
            name="title"
            required
            maxLength={120}
            defaultValue={initial?.title}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Amount
          <input
            type="number"
            name="amount"
            required
            min="0.01"
            step="0.01"
            defaultValue={initial?.amount}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Type
          <select
            name="type"
            required
            defaultValue={initial?.type ?? "expense"}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Category
          <select
            name="category"
            required
            defaultValue={initial?.category ?? TRANSACTION_CATEGORIES[0]}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {TRANSACTION_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Date
          <input
            type="date"
            name="date"
            required
            defaultValue={initial?.date}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 sm:col-span-2">
          Description (optional)
          <textarea
            name="description"
            maxLength={500}
            defaultValue={initial?.description}
            rows={2}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? "Saving..." : mode === "create" ? "Add Transaction" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
