# Artos AI

AI-powered personal finance application built with Next.js (App Router) and
InsForge.

This is the initial project shell: routing, layout, and static UI only.
Authentication, database access, transaction CRUD, and the AI assistant are
implemented in later phases.

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

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
    layout.tsx         Root layout
    page.tsx           Redirects "/" to "/dashboard"
  components/
    layout/            Sidebar, mobile topbar, nav links
```

Route groups `(auth)` and `(dashboard)` organize layouts without affecting
the URL path.
