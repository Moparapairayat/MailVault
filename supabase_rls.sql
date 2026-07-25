-- Enable RLS and add public read policies for newly created tables

-- payout_methods: anyone can read
ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read payout_methods" ON public.payout_methods;
CREATE POLICY "Public read payout_methods" ON public.payout_methods FOR SELECT USING (true);

-- announcements: anyone can read
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);

-- profiles: anyone can read their own, or public
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert profiles" ON public.profiles;
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update profiles" ON public.profiles;
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);

-- withdrawals: public insert + read
DROP POLICY IF EXISTS "Public read withdrawals" ON public.withdrawals;
CREATE POLICY "Public read withdrawals" ON public.withdrawals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert withdrawals" ON public.withdrawals;
CREATE POLICY "Public insert withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update withdrawals" ON public.withdrawals;
CREATE POLICY "Public update withdrawals" ON public.withdrawals FOR UPDATE USING (true);

-- email_submissions: public insert + read
DROP POLICY IF EXISTS "Public read email_submissions" ON public.email_submissions;
CREATE POLICY "Public read email_submissions" ON public.email_submissions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert email_submissions" ON public.email_submissions;
CREATE POLICY "Public insert email_submissions" ON public.email_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update email_submissions" ON public.email_submissions;
CREATE POLICY "Public update email_submissions" ON public.email_submissions FOR UPDATE USING (true);
