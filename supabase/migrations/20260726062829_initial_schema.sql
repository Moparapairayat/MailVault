-- ==========================================
-- Initial Schema + Seed + Auth + RLS
-- ==========================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rate_per_unit NUMERIC NOT NULL DEFAULT 0,
  min_batch INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  icon TEXT DEFAULT 'Mail',
  format_guide TEXT,
  total_bought INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EMAIL SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.email_submissions (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  recovery_email TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'PENDING',
  rate NUMERIC NOT NULL DEFAULT 0,
  rejection_reason TEXT
);

-- 3. WITHDRAWALS (PAYOUTS) TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  account_details TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'PENDING',
  transaction_id TEXT,
  processed_at TIMESTAMPTZ
);

-- 4. PAYOUT METHODS CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.payout_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  min_amount NUMERIC NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'BONUS',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'SELLER',
  ref_code TEXT UNIQUE,
  username TEXT UNIQUE,
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
-- SEED INITIAL DATA
-- ==========================================

INSERT INTO public.categories (id, name, description, rate_per_unit, min_batch, status, icon, format_guide)
VALUES 
  ('gmail_fresh', 'Gmail Fresh Accounts', 'Recently created fresh Gmail accounts with 2FA off.', 18, 10, 'ACTIVE', 'Mail', 'email:password:recovery'),
  ('gmail_old', 'Gmail Aged (2020-2023)', 'Aged Gmail accounts with high trust score.', 28, 5, 'ACTIVE', 'Archive', 'email:password:recovery'),
  ('gmail_pva', 'Gmail Phone Verified (PVA)', 'Phone verified accounts ready for instant use.', 22, 10, 'ACTIVE', 'ShieldCheck', 'email:password:recovery'),
  ('edu_mail', 'University Edu Mails (.edu)', 'Student edu email accounts with Azure/Github access.', 65, 2, 'ACTIVE', 'GraduationCap', 'email:password'),
  ('outlook_hotmail', 'Outlook / Hotmail Bulk', 'Bulk Microsoft Outlook & Hotmail accounts.', 12, 20, 'ACTIVE', 'Inbox', 'email:password')
ON CONFLICT (id) DO NOTHING;

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
-- AUTH: add missing columns on existing tables
-- ==========================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- ==========================================
-- ENABLE REALTIME PUBLICATION FOR ALL TABLES
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.email_submissions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payout_methods;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ==========================================
-- RLS: enable and apply policies
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "Allow anon select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon update own profile" ON public.profiles;
CREATE POLICY "Allow anon select profiles" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert profiles" ON public.profiles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update own profile" ON public.profiles FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- categories
DROP POLICY IF EXISTS "Allow anon read categories" ON public.categories;
CREATE POLICY "Allow anon read categories" ON public.categories FOR ALL TO anon USING (true) WITH CHECK (true);

-- email_submissions
DROP POLICY IF EXISTS "Allow anon all email_submissions" ON public.email_submissions;
CREATE POLICY "Allow anon all email_submissions" ON public.email_submissions FOR ALL TO anon USING (true) WITH CHECK (true);

-- withdrawals
DROP POLICY IF EXISTS "Allow anon all withdrawals" ON public.withdrawals;
CREATE POLICY "Allow anon all withdrawals" ON public.withdrawals FOR ALL TO anon USING (true) WITH CHECK (true);

-- payout_methods
DROP POLICY IF EXISTS "Allow anon all payout_methods" ON public.payout_methods;
CREATE POLICY "Allow anon all payout_methods" ON public.payout_methods FOR ALL TO anon USING (true) WITH CHECK (true);

-- announcements
DROP POLICY IF EXISTS "Allow anon all announcements" ON public.announcements;
CREATE POLICY "Allow anon all announcements" ON public.announcements FOR ALL TO anon USING (true) WITH CHECK (true);

-- Done!