# Artos AI

AI-powered personal finance application built with Next.js (App Router) and
InsForge.

Authentication, transaction CRUD, and the live dashboard are implemented
against InsForge. The AI assistant is implemented in a later phase.

## Getting Started

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY from your InsForge project
npm run dev
```

Apply `migrations/0001_transactions.sql` against the InsForge project's
Postgres database (SQL editor or migration runner) before using transactions.

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint
- `npm run typecheck` — run the TypeScript compiler in check-only mode

## Project Structure

```text
src/
  app/
    (auth)/            Login and register pages (centered, no sidebar)
      login/
      register/
    (dashboard)/       Authenticated app shell (sidebar + topbar)
      dashboard/
      transactions/
      assistant/
    actions/           Server Actions (auth, transactions)
    api/auth/refresh/  InsForge SSR session refresh route
    layout.tsx         Root layout
    page.tsx           Redirects "/" to "/dashboard"
  components/
    layout/            Sidebar, mobile topbar, nav links
    dashboard/          Summary cards, category breakdown, recent transactions
    transactions/       Transaction list, form, delete confirmation
  lib/
    insforge/           InsForge SSR server client helper
    transactions/       Validation, row mapping, data-access queries
  proxy.ts              Session refresh + route protection (Next.js 16 proxy)
migrations/             SQL to apply against the InsForge Postgres database
```

Route groups `(auth)` and `(dashboard)` organize layouts without affecting
the URL path.
