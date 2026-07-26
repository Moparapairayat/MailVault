-- Seller Activity Log: track seller actions
CREATE TABLE IF NOT EXISTS public.seller_activity_logs (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'LOGIN',
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_activity_logs_seller_id ON public.seller_activity_logs(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_activity_logs_created_at ON public.seller_activity_logs(created_at DESC);

-- Admin Activity Log: track admin actions
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'USER_ROLE_CHANGE',
  target_user_id TEXT,
  target_user_name TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.seller_activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_activity_logs;
