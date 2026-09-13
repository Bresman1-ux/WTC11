import Link from "next/link";
import { NavLinks } from "./nav-links";
import { signOutAction } from "@/app/actions/auth";

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-zinc-950 px-4 py-6 md:flex">
      <Link href="/dashboard" className="mb-8 px-3 text-lg font-semibold text-white">
        Artos AI
      </Link>
      <NavLinks />
      <div className="mt-auto">
        <form action={signOutAction}>
          <button
            type="submit"
            className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
