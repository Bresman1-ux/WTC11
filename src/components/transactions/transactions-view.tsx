"use client";

import { useState } from "react";
import type { Transaction } from "@/lib/finance";
import { formatDate, formatIDR } from "@/lib/format";
import { TransactionForm } from "./transaction-form";
import { DeleteTransactionButton } from "./delete-transaction-button";

export function TransactionsView({ transactions }: { transactions: Transaction[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Transactions</h1>
          <p className="text-sm text-zinc-500">View and manage your income and expenses.</p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setAdding(true);
            }}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add Transaction
          </button>
        )}
      </div>

      {adding && (
        <TransactionForm mode="create" onDone={() => setAdding(false)} onCancel={() => setAdding(false)} />
      )}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-400">
                  No transactions yet. Add your first income or expense above.
                </td>
              </tr>
            )}

            {transactions.map((t) =>
              editingId === t.id ? (
                <tr key={t.id}>
                  <td colSpan={6} className="px-4 py-4">
                    <TransactionForm
                      mode="edit"
                      initial={t}
                      onDone={() => setEditingId(null)}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={t.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 text-zinc-900">{t.title}</td>
                  <td className="px-4 py-3 text-zinc-500">{t.category}</td>
                  <td className="px-4 py-3 text-zinc-500 capitalize">{t.type}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                      t.type === "income" ? "text-emerald-600" : "text-zinc-900"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatIDR(t.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAdding(false);
                          setEditingId(t.id);
                        }}
                        className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                      >
                        Edit
                      </button>
                      <DeleteTransactionButton id={t.id} title={t.title} />
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
