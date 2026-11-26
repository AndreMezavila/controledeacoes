-- ==============================================================================
-- CONTROLE DE ATIVOS - SCRIPT DE CRIAÇÃO E ROW LEVEL SECURITY (RLS) PARA SUPABASE
-- Execute este script no SQL Editor do seu Dashboard Supabase
-- ==============================================================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  email_verified TIMESTAMPTZ,
  verification_token TEXT,
  verification_code TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garantir colunas se a tabela já existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
    ALTER TABLE public.users ADD COLUMN email_verified TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verification_token') THEN
    ALTER TABLE public.users ADD COLUMN verification_token TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verification_code') THEN
    ALTER TABLE public.users ADD COLUMN verification_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='image') THEN
    ALTER TABLE public.users ADD COLUMN image TEXT;
  END IF;
END $$;

-- 2. TABELA DE ATIVOS MONITORADOS (WATCHLIST & GATILHOS)
CREATE TABLE IF NOT EXISTS public.watchlist_assets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ticker VARCHAR(20) NOT NULL,
  asset_name TEXT,
  target_buy_price DOUBLE PRECISION NOT NULL,
  target_sell_price DOUBLE PRECISION NOT NULL,
  stop_loss_price DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA DE OPERAÇÕES MANUAIS (COMPRAS E VENDAS)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ticker VARCHAR(20) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('COMPRA', 'VENDA')),
  quantity DOUBLE PRECISION NOT NULL CHECK (quantity > 0),
  unit_price DOUBLE PRECISION NOT NULL CHECK (unit_price >= 0),
  fees DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (fees >= 0),
  trade_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ticker ON public.transactions(ticker);
CREATE INDEX IF NOT EXISTS idx_transactions_trade_date ON public.transactions(trade_date);

-- ==============================================================================
-- 4. HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
-- Segunda camada de defesa contra vulnerabilidades IDOR
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA USERS
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid()::text = id OR current_user = 'service_role');

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid()::text = id OR current_user = 'service_role');

-- POLÍTICAS PARA WATCHLIST_ASSETS
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlist_assets;
CREATE POLICY "Users can view own watchlist" 
  ON public.watchlist_assets FOR SELECT 
  USING (auth.uid()::text = user_id OR current_user = 'service_role');

DROP POLICY IF EXISTS "Users can insert into own watchlist" ON public.watchlist_assets;
CREATE POLICY "Users can insert into own watchlist" 
  ON public.watchlist_assets FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id OR current_user = 'service_role');

DROP POLICY IF EXISTS "Users can update own watchlist" ON public.watchlist_assets;
CREATE POLICY "Users can update own watchlist" 
  ON public.watchlist_assets FOR UPDATE 
  USING (auth.uid()::text = user_id OR current_user = 'service_role');

DROP POLICY IF EXISTS "Users can delete from own watchlist" ON public.watchlist_assets;
CREATE POLICY "Users can delete from own watchlist" 
  ON public.watchlist_assets FOR DELETE 
  USING (auth.uid()::text = user_id OR current_user = 'service_role');

-- POLÍTICAS PARA TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid()::text = user_id OR current_user = 'service_role');

DROP POLICY IF EXISTS "Users can insert into own transactions" ON public.transactions;
CREATE POLICY "Users can insert into own transactions" 
  ON public.transactions FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id OR current_user = 'service_role');

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" 
  ON public.transactions FOR UPDATE 
  USING (auth.uid()::text = user_id OR current_user = 'service_role');

DROP POLICY IF EXISTS "Users can delete from own transactions" ON public.transactions;
CREATE POLICY "Users can delete from own transactions" 
  ON public.transactions FOR DELETE 
  USING (auth.uid()::text = user_id OR current_user = 'service_role');
