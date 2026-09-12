"use client";

import Link from "next/link";
import { useState } from "react";
import { NavLinks } from "./nav-links";

export function MobileTopbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
      <Link href="/dashboard" className="text-lg font-semibold text-zinc-900">
        Artos AI
      </Link>
      <button
        type="button"
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 top-[57px] z-40 bg-zinc-950 px-4 py-6">
          <NavLinks onNavigate={() => setOpen(false)} />
          <div className="mt-6 border-t border-zinc-800 pt-4">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Logout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
