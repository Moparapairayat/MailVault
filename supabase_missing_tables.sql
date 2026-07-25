-- ==========================================
-- MAILVAULT - MISSING TABLES ONLY
-- Run this in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/jxzkymnowcyjlpcmijwe/sql/new
-- ==========================================

-- 1. PAYOUT METHODS CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.payout_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  min_amount NUMERIC NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'BONUS',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'SELLER',
  ref_code TEXT UNIQUE,
  referred_by TEXT,
  referral_earnings NUMERIC DEFAULT 0,
  total_referred_count INT DEFAULT 0,
  default_bkash TEXT,
  default_nagad TEXT,
  default_rocket TEXT,
  default_usdt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SEED DEFAULT DATA
-- ==========================================

INSERT INTO public.payout_methods (id, name, min_amount, status)
VALUES 
  ('bkash', 'bKash Personal', 100, 'ACTIVE'),
  ('nagad', 'Nagad Personal', 100, 'ACTIVE'),
  ('rocket', 'Rocket', 100, 'ACTIVE'),
  ('usdt_trc20', 'Binance USDT (TRC20)', 500, 'ACTIVE'),
  ('cellfin', 'Islami Bank CellFin', 200, 'ACTIVE'),
  ('upay', 'Upay Personal', 100, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.announcements (id, text, type, active)
VALUES 
  ('1', '🔥 High Demand Offer: Fresh Gmail buying rate increased to ৳18/pc today!', 'BONUS', true),
  ('2', '⚡ Instant Payouts: bKash & Nagad cashouts are being processed within 15 mins.', 'INFO', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- ENABLE REALTIME FOR NEW TABLES
-- ==========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.payout_methods;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
