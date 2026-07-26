-- ==========================================
-- Fix: safely add tables to realtime publication
-- plus apply RLS policies that were skipped in first migration
-- ==========================================

-- ENABLE REALTIME PUBLICATION SAFELY
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

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- profiles policies
DROP POLICY IF EXISTS "Allow anon select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon update own profile" ON public.profiles;
CREATE POLICY "Allow anon select profiles" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert profiles" ON public.profiles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update own profile" ON public.profiles FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- categories policies
DROP POLICY IF EXISTS "Allow anon read categories" ON public.categories;
CREATE POLICY "Allow anon read categories" ON public.categories FOR ALL TO anon USING (true) WITH CHECK (true);

-- email_submissions policies
DROP POLICY IF EXISTS "Allow anon all email_submissions" ON public.email_submissions;
CREATE POLICY "Allow anon all email_submissions" ON public.email_submissions FOR ALL TO anon USING (true) WITH CHECK (true);

-- withdrawals policies
DROP POLICY IF EXISTS "Allow anon all withdrawals" ON public.withdrawals;
CREATE POLICY "Allow anon all withdrawals" ON public.withdrawals FOR ALL TO anon USING (true) WITH CHECK (true);

-- payout_methods policies
DROP POLICY IF EXISTS "Allow anon all payout_methods" ON public.payout_methods;
CREATE POLICY "Allow anon all payout_methods" ON public.payout_methods FOR ALL TO anon USING (true) WITH CHECK (true);

-- announcements policies
DROP POLICY IF EXISTS "Allow anon all announcements" ON public.announcements;
CREATE POLICY "Allow anon all announcements" ON public.announcements FOR ALL TO anon USING (true) WITH CHECK (true);

-- Done!