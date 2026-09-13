"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signUpAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Create an account</h1>
        <p className="text-sm text-zinc-500">Start tracking your finances with Artos AI.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Name
          <input
            type="text"
            name="name"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.message && <p className="text-sm text-emerald-600">{state.message}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900">
          Log in
        </Link>
      </p>
    </div>
  );
}
