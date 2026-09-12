import Link from "next/link";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12">
      <Link href="/dashboard" className="mb-8 text-xl font-semibold text-zinc-900">
        Artos AI
      </Link>
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
