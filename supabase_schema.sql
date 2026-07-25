-- ============================================================
-- MailVault - Supabase Database Schema Migration SQL Script
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    rate_per_unit NUMERIC NOT NULL DEFAULT 10,
    min_batch INT NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    icon TEXT DEFAULT 'Mail',
    format_guide TEXT DEFAULT 'email:password:recovery',
    total_bought INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Categories
INSERT INTO public.categories (id, name, description, rate_per_unit, min_batch, status, icon, format_guide)
VALUES
('gmail_fresh', 'Fresh Gmail Account', 'New clean Gmail accounts (0-30 days old). Minimum 2FA off.', 8, 5, 'ACTIVE', 'Mail', 'email:password:recovery_email'),
('gmail_old', 'Aged/Old Gmail (2018-2022)', 'Aged accounts created between 2018 to 2022. High trust score.', 18, 2, 'ACTIVE', 'Archive', 'email:password:recovery_email'),
('gmail_pva', 'Phone Verified (PVA) Gmail', 'Phone verified Gmails with recovery set and 2FA configured.', 14, 5, 'ACTIVE', 'ShieldCheck', 'email:password:recovery_email:phone'),
('edu_mail', '.Edu Student Mail', 'University / College student email (.edu domain with portal access).', 45, 1, 'ACTIVE', 'GraduationCap', 'email:password:login_url'),
('outlook_hotmail', 'Outlook / Hotmail Fresh', 'Clean Microsoft Outlook or Hotmail accounts with POP3/IMAP enabled.', 4, 10, 'ACTIVE', 'Inbox', 'email:password')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Email Submissions Table
CREATE TABLE IF NOT EXISTS public.email_submissions (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id),
    email TEXT NOT NULL UNIQUE, -- Prevents duplicates automatically
    password TEXT NOT NULL,
    recovery_email TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'PENDING',
    rate NUMERIC NOT NULL,
    rejection_reason TEXT
);

-- Create Index for fast duplicate lookups & batch filtering
CREATE INDEX IF NOT EXISTS idx_email_submissions_email ON public.email_submissions(email);
CREATE INDEX IF NOT EXISTS idx_email_submissions_seller ON public.email_submissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_email_submissions_status ON public.email_submissions(status);

-- 3. Create Withdrawals Table
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

-- 4. Enable Row Level Security (RLS) & Public Read/Write Access
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Allow Public Access (For dev/testing without restriction)
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admin update categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Allow public read submissions" ON public.email_submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert submissions" ON public.email_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update submissions" ON public.email_submissions FOR UPDATE USING (true);

CREATE POLICY "Allow public read withdrawals" ON public.withdrawals FOR SELECT USING (true);
CREATE POLICY "Allow public insert withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update withdrawals" ON public.withdrawals FOR UPDATE USING (true);

-- Enable Realtime Replication for instant UI updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;
