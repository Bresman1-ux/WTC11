-- Transactions table: per-user income/expense records for Artos AI.
-- Apply against the project's InsForge Postgres database (SQL editor or migration
-- runner) before using the transaction CRUD or dashboard features.
--
-- Conventions follow InsForge's own RLS pattern (auth.uid(), auth.users, the
-- `authenticated` PostgREST role): a row's owner defaults to the caller's JWT
-- subject, and RLS policies re-check that on every read/write so the API layer
-- never has to trust a client-supplied user_id.

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL CHECK (char_length(category) BETWEEN 1 AND 40),
  transaction_date DATE NOT NULL,
  description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_id_transaction_date_idx
  ON public.transactions (user_id, transaction_date DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_update_own" ON public.transactions;
CREATE POLICY "transactions_update_own" ON public.transactions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_delete_own" ON public.transactions;
CREATE POLICY "transactions_delete_own" ON public.transactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- No policy exists for the `anon` role, so unauthenticated requests see and
-- change nothing (PostgREST/RLS default-deny).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;

-- Reuses the update_updated_at_column() trigger function InsForge creates for
-- every project (see its own migrations/000_create-base-tables.sql).
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
