"use client";

import { useActionState, useState } from "react";
import { deleteTransactionAction } from "@/app/actions/transactions";

export function DeleteTransactionButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(deleteTransactionAction, undefined);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm font-medium text-red-600 hover:text-red-700"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-sm text-zinc-500">Delete &ldquo;{title}&rdquo;?</span>
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {pending ? "Deleting..." : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="text-sm font-medium text-zinc-500 hover:text-zinc-700 disabled:opacity-50"
      >
        Cancel
      </button>
      {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
    </form>
  );
}
