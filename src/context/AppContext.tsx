import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmailCategory, EmailItem, WithdrawalRequest, UserRole, CategoryId, PaymentMethod, SubmissionStatus, UserProfile, AnnouncementNotice, PayoutMethodConfig, SellerActivityLog, AdminActivityLog } from '../types';
import { INITIAL_CATEGORIES } from '../mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { sendTelegramAlert } from '../lib/telegram';
import { playCashSound, playSuccessSound } from '../utils/audio';
import confetti from 'canvas-confetti';

export type AppTheme = 'emerald' | 'purple' | 'cyan' | 'gold' | 'ruby';
export type AppLang = 'en' | 'bn';

interface AppContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  lang: AppLang;
  setLang: (l: AppLang) => void;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  categories: EmailCategory[];
  submissions: EmailItem[];
  withdrawals: WithdrawalRequest[];
  announcements: AnnouncementNotice[];
  payoutMethods: PayoutMethodConfig[];
  addPayoutMethod: (name: string, minAmount: number) => void;
  togglePayoutMethodStatus: (id: string) => void;
  
  // Auth Actions
  loginUser: (identifier: string, pass: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (email: string, pass: string, name: string, phone: string) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (updatedFields: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => void;
  setupFirstAdmin: (name: string, username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  
  // Seller Actions
  submitBatchEmails: (categoryId: CategoryId, rawText: string) => Promise<{ success: boolean; added: number; duplicates: number; message: string }>;
  requestWithdrawal: (amount: number, method: PaymentMethod, accountDetails: string) => Promise<{ success: boolean; message: string }>;
  
  // Admin Actions
  updateCategoryRate: (categoryId: CategoryId, newRate: number) => Promise<void>;
  toggleCategoryStatus: (categoryId: CategoryId) => Promise<void>;
  reviewSubmission: (itemId: string, status: SubmissionStatus, reason?: string) => Promise<void>;
  reviewBatchSubmissions: (itemIds: string[], status: SubmissionStatus, reason?: string) => Promise<void>;
  processWithdrawal: (withdrawalId: string, status: 'COMPLETED' | 'REJECTED', txId?: string) => Promise<void>;
  exportApprovedEmails: (categoryId?: CategoryId) => void;
  
  // Announcement Actions
  addAnnouncement: (text: string, type: 'INFO' | 'BONUS' | 'WARNING') => void;
  deleteAnnouncement: (id: string) => void;

  // User Management
  users: UserProfile[];
  fetchUsers: () => Promise<{ success: boolean; message?: string }>;
  updateUserRole: (userId: string, newRole: 'SELLER' | 'ADMIN') => Promise<{ success: boolean; message: string }>;
  banUser: (userId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  unbanUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;

  // Activity Logs
  sellerActivityLogs: SellerActivityLog[];
  adminActivityLogs: AdminActivityLog[];
  logSellerActivity: (sellerId: string, sellerName: string, actionType: 'LOGIN' | 'SUBMISSION' | 'WITHDRAWAL_REQUEST' | 'PROFILE_UPDATE', details: string) => Promise<void>;
  logAdminActivity: (adminId: string, adminName: string, actionType: AdminActivityLog['actionType'], details: string, targetUserId?: string, targetUserName?: string) => Promise<void>;
  
  // Calculated Stats
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  referralEarnings: number;
  totalEmailsBought: number;
  isSupabaseLive: boolean;
}



const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current User Session — null by default, requires real login
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mailvault_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Role
  const [role, setRole] = useState<UserRole>('SELLER');
  
  const [lang, setLangState] = useState<AppLang>(() => {
    return (localStorage.getItem('mailvault_lang') as AppLang) || 'en';
  });

  const [theme, setThemeState] = useState<AppTheme>(() => {
    return (localStorage.getItem('mailvault_theme') as AppTheme) || 'emerald';
  });

  const setLang = (l: AppLang) => {
    setLangState(l);
    localStorage.setItem('mailvault_lang', l);
  };

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    localStorage.setItem('mailvault_theme', t);
  };

  // Payout Methods Config State
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethodConfig[]>(() => {
    const saved = localStorage.getItem('mailvault_payout_methods');
    return saved ? JSON.parse(saved) : [
      { id: 'bkash', name: 'bKash Personal', minAmount: 100, status: 'ACTIVE' },
      { id: 'nagad', name: 'Nagad Personal', minAmount: 100, status: 'ACTIVE' },
      { id: 'rocket', name: 'Rocket', minAmount: 100, status: 'ACTIVE' },
      { id: 'usdt_trc20', name: 'Binance USDT (TRC20)', minAmount: 500, status: 'ACTIVE' },
      { id: 'cellfin', name: 'Islami Bank CellFin', minAmount: 200, status: 'ACTIVE' },
      { id: 'upay', name: 'Upay Personal', minAmount: 100, status: 'ACTIVE' },
    ];
  });

  const addPayoutMethod = (name: string, minAmount: number) => {
    const newMethod: PayoutMethodConfig = {
      id: `pm_${Date.now()}`,
      name: name.trim(),
      minAmount,
      status: 'ACTIVE'
    };
    const updated = [...payoutMethods, newMethod];
    setPayoutMethods(updated);
    localStorage.setItem('mailvault_payout_methods', JSON.stringify(updated));
  };

  const togglePayoutMethodStatus = (id: string) => {
    const updated = payoutMethods.map(m => m.id === id ? { ...m, status: m.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } as PayoutMethodConfig : m);
    setPayoutMethods(updated);
    localStorage.setItem('mailvault_payout_methods', JSON.stringify(updated));
  };

  // Announcements — loaded from Supabase only
  const [announcements, setAnnouncements] = useState<AnnouncementNotice[]>([]);

  // Categories
  const [categories, setCategories] = useState<EmailCategory[]>(() => {
    const saved = localStorage.getItem('mailvault_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Submissions — loaded from Supabase only
  const [submissions, setSubmissions] = useState<EmailItem[]>([]);

  // Withdrawals — loaded from Supabase only
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

  // Users — loaded from Supabase only
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Seller Activity Logs — loaded from Supabase only
  const [sellerActivityLogs, setSellerActivityLogs] = useState<SellerActivityLog[]>([]);

  // Admin Activity Logs — loaded from Supabase only
  const [adminActivityLogs, setAdminActivityLogs] = useState<AdminActivityLog[]>([]);

  // Track Referral Code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('mailvault_ref_code', ref);
    }
  }, []);

  // One-time: clear any stale mock localStorage data from previous sessions
  useEffect(() => {
    const cleaned = localStorage.getItem('mailvault_db_cleaned_v2');
    if (!cleaned) {
      localStorage.removeItem('mailvault_submissions');
      localStorage.removeItem('mailvault_withdrawals');
      localStorage.removeItem('mailvault_announcements');
      localStorage.setItem('mailvault_db_cleaned_v2', '1');
    }
  }, []);

  // Local Storage Save — only save user session and categories
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mailvault_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mailvault_current_user');
    }
  }, [currentUser]);

  // Fetch initial data & subscribe to Supabase Realtime if configured
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    const fetchFromSupabase = async () => {
      try {
        const { data: catData } = await client.from('categories').select('*');
        if (catData && catData.length > 0) {
          setCategories(catData.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            ratePerUnit: Number(c.rate_per_unit),
            minBatch: c.min_batch,
            status: c.status,
            icon: c.icon,
            formatGuide: c.format_guide,
            totalBought: c.total_bought || 0
          })));
        }

        const { data: subData } = await client.from('email_submissions').select('*').order('submitted_at', { ascending: false });
        if (subData) {
          setSubmissions(subData.map(s => ({
            id: s.id,
            batchId: s.batch_id,
            sellerId: s.seller_id,
            sellerName: s.seller_name,
            categoryId: s.category_id,
            email: s.email,
            password: s.password,
            recoveryEmail: s.recovery_email,
            submittedAt: s.submitted_at,
            status: s.status,
            rate: Number(s.rate),
            rejectionReason: s.rejection_reason
          })));
        }

        const { data: wdData } = await client.from('withdrawals').select('*').order('requested_at', { ascending: false });
        if (wdData) {
          setWithdrawals(wdData.map(w => ({
            id: w.id,
            sellerId: w.seller_id,
            sellerName: w.seller_name,
            amount: Number(w.amount),
            method: w.method,
            accountDetails: w.account_details,
            requestedAt: w.requested_at,
            status: w.status,
            transactionId: w.transaction_id,
            processedAt: w.processed_at
          })));
        }

        const { data: pmData } = await client.from('payout_methods').select('*');
        if (pmData && pmData.length > 0) {
          setPayoutMethods(pmData.map(p => ({
            id: p.id,
            name: p.name,
            minAmount: Number(p.min_amount),
            status: p.status
          })));
        }

        const { data: ancData } = await client.from('announcements').select('*').order('created_at', { ascending: false });
        if (ancData && ancData.length > 0) {
          setAnnouncements(ancData.map(a => ({
            id: a.id,
            text: a.text,
            type: a.type,
            active: a.active,
            createdAt: a.created_at
          })));
        }

        const { data: userData } = await client.from('profiles').select('*').order('created_at', { ascending: false });
        if (userData) {
          setUsers(userData.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            role: u.role || 'SELLER',
            refCode: u.ref_code || '',
            username: u.username,
            referredBy: u.referred_by,
            referralEarnings: u.referral_earnings || 0,
            totalReferredCount: u.total_referred_count || 0,
            defaultBkash: u.default_bkash,
            defaultNagad: u.default_nagad,
            defaultRocket: u.default_rocket,
            defaultUsdt: u.default_usdt,
            createdAt: u.created_at,
            isBanned: u.is_banned,
            bannedReason: u.banned_reason,
            lastLoginAt: u.last_login_at
          })));
        }

        const { data: sellerLogs } = await client.from('seller_activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
        if (sellerLogs) {
          setSellerActivityLogs(sellerLogs.map(l => ({
            id: l.id,
            sellerId: l.seller_id,
            sellerName: l.seller_name,
            actionType: l.action_type,
            details: l.details,
            createdAt: l.created_at
          })));
        }

        const { data: adminLogs } = await client.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
        if (adminLogs) {
          setAdminActivityLogs(adminLogs.map(l => ({
            id: l.id,
            adminId: l.admin_id,
            adminName: l.admin_name,
            actionType: l.action_type,
            targetUserId: l.target_user_id,
            targetUserName: l.target_user_name,
            details: l.details,
            createdAt: l.created_at
          })));
        }
      } catch (err) {
        console.warn('Supabase fetch error, falling back to local state:', err);
      }
    };

    fetchFromSupabase();

    const channel = client.channel('mailvault_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_submissions' }, () => fetchFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, () => fetchFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payout_methods' }, () => fetchFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => fetchFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_activity_logs' }, () => fetchFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_activity_logs' }, () => fetchFromSupabase())
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('mailvault_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mailvault_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('mailvault_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  // Auth Methods
  const loginUser = async (identifier: string, pass: string) => {
    if (!identifier || !pass) return { success: false, message: 'Please enter username/email and password.' };

    const client = supabase;

    // Supabase configured হলে database থেকে verify করো
    if (isSupabaseConfigured && client) {
      const query = client
        .from('profiles')
        .select('*')
        .eq('password', pass);

      if (identifier.includes('@')) {
        query.eq('email', identifier.toLowerCase().trim());
      } else {
        query.eq('username', identifier.trim().toLowerCase());
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Login DB error:', error);
        return { success: false, message: 'Database error. Please try again.' };
      }

      if (!data) {
        return { success: false, message: 'Invalid username/email or password. Please check and try again.' };
      }

      const user: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: data.role || 'SELLER',
        refCode: data.ref_code || '',
        username: data.username,
        referredBy: data.referred_by,
        referralEarnings: data.referral_earnings || 0,
        totalReferredCount: data.total_referred_count || 0,
        defaultBkash: data.default_bkash,
        defaultNagad: data.default_nagad,
        defaultRocket: data.default_rocket,
        defaultUsdt: data.default_usdt,
        createdAt: data.created_at
      };

      setCurrentUser(user);
      localStorage.setItem('mailvault_current_user', JSON.stringify(user));
      logSellerActivity(user.id, user.name, 'LOGIN', `Logged in via ${data.username ? 'username' : 'email'} (${data.email})`);
      return { success: true, message: 'Logged in successfully!' };
    }

    // Supabase not configured হলে localStorage fallback (dev mode)
    const saved = localStorage.getItem(`mailvault_user_${identifier.toLowerCase().trim()}`);
    if (!saved) return { success: false, message: 'No account found.' };
    const savedUser = JSON.parse(saved);
    if (savedUser.password !== pass) return { success: false, message: 'Incorrect password.' };

    const { password: _, ...userWithoutPass } = savedUser;
    setCurrentUser(userWithoutPass);
    localStorage.setItem('mailvault_current_user', JSON.stringify(userWithoutPass));
    logSellerActivity(userWithoutPass.id, userWithoutPass.name, 'LOGIN', `Logged in via ${userWithoutPass.username ? 'username' : 'email'} (${userWithoutPass.email})`);
    return { success: true, message: 'Logged in successfully!' };
  };

  const setupFirstAdmin = async (name: string, username: string, email: string, password: string) => {
    if (!name || !username || !email || !password) {
      return { success: false, message: 'Please fill all required fields.' };
    }

    const client = supabase;
    if (isSupabaseConfigured && client) {
      const trimmedEmail = email.toLowerCase().trim();
      const trimmedUsername = username.trim().toLowerCase();

      const { data: existingAdmin, error: adminCheckError } = await client
        .from('profiles')
        .select('id')
        .eq('role', 'ADMIN')
        .limit(1);

      if (adminCheckError) {
        console.error('Admin pre-check DB error:', adminCheckError);
        return { success: false, message: `Database check failed: ${adminCheckError.message}` };
      }

      if (existingAdmin && existingAdmin.length > 0) {
        return { success: false, message: 'Admin setup has already been completed.' };
      }

      const { data: existingEmail, error: emailCheckError } = await client
        .from('profiles')
        .select('id')
        .eq('email', trimmedEmail)
        .maybeSingle();

      if (emailCheckError) {
        console.error('Email check DB error:', emailCheckError);
        return { success: false, message: `Database check failed: ${emailCheckError.message}` };
      }

      if (existingEmail) {
        return { success: false, message: 'This email is already registered.' };
      }

      const { data: existingUsername, error: usernameCheckError } = await client
        .from('profiles')
        .select('id')
        .eq('username', trimmedUsername)
        .maybeSingle();

      if (usernameCheckError) {
        console.error('Username check DB error:', usernameCheckError);
        return { success: false, message: `Database check failed: ${usernameCheckError.message}` };
      }

      if (existingUsername) {
        return { success: false, message: 'This username is already taken.' };
      }

      const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const { data, error } = await client
        .from('profiles')
        .insert({
          id: userId,
          name: name.trim(),
          username: trimmedUsername,
          email: trimmedEmail,
          phone: '',
          password: password,
          role: 'ADMIN',
          ref_code: '',
          referred_by: null,
          referral_earnings: 0,
          total_referred_count: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Admin setup DB insert error:', error);
        if (error.code === '23505') {
          return { success: false, message: 'Username or email already exists. Please use different values.' };
        }
        return { success: false, message: `Setup failed: ${error.message}` };
      }

      const adminUser: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: 'ADMIN',
        refCode: data.ref_code || '',
        username: data.username,
        referredBy: data.referred_by,
        referralEarnings: 0,
        totalReferredCount: 0,
        createdAt: data.created_at
      };

      setCurrentUser(adminUser);
      localStorage.setItem('mailvault_current_user', JSON.stringify(adminUser));
      localStorage.setItem('mailvault_admin_initialized', 'true');
      return { success: true, message: 'Admin account created successfully!' };
    }

    const adminUser: UserProfile = {
      id: `admin-${Date.now()}`,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.toLowerCase().trim(),
      phone: '',
      role: 'ADMIN',
      refCode: '',
      referredBy: undefined,
      referralEarnings: 0,
      totalReferredCount: 0,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(adminUser);
    localStorage.setItem('mailvault_current_user', JSON.stringify(adminUser));
    localStorage.setItem('mailvault_admin_initialized', 'true');
    return { success: true, message: 'Admin account created successfully!' };
  };

  // User Management Methods
  const fetchUsers = async () => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { data, error } = await client.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Fetch users error:', error);
        return { success: false, message: error.message };
      }
      if (data) {
        setUsers(data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          role: u.role || 'SELLER',
          refCode: u.ref_code || '',
          username: u.username,
          referredBy: u.referred_by,
          referralEarnings: u.referral_earnings || 0,
          totalReferredCount: u.total_referred_count || 0,
          defaultBkash: u.default_bkash,
          defaultNagad: u.default_nagad,
          defaultRocket: u.default_rocket,
          defaultUsdt: u.default_usdt,
          createdAt: u.created_at,
          isBanned: u.is_banned,
          bannedReason: u.banned_reason,
          lastLoginAt: u.last_login_at
        })));
      }
    }
    return { success: true };
  };

  const updateUserRole = async (userId: string, newRole: 'SELLER' | 'ADMIN') => {
    const client = supabase;
    const targetUser = users.find(u => u.id === userId);
    if (isSupabaseConfigured && client) {
      const { error } = await client.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) {
        console.error('Update user role error:', error);
        return { success: false, message: error.message };
      }
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser && targetUser) {
      logAdminActivity(currentUser.id, currentUser.name, 'USER_ROLE_CHANGE', `Changed role to ${newRole}`, userId, targetUser.name);
    }
    return { success: true, message: 'User role updated successfully!' };
  };

  const banUser = async (userId: string, reason: string) => {
    const client = supabase;
    const targetUser = users.find(u => u.id === userId);
    if (isSupabaseConfigured && client) {
      const { error } = await client.from('profiles').update({ is_banned: true, banned_reason: reason }).eq('id', userId);
      if (error) {
        console.error('Ban user error:', error);
        return { success: false, message: error.message };
      }
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: true, bannedReason: reason } : u));
    if (currentUser && targetUser) {
      logAdminActivity(currentUser.id, currentUser.name, 'USER_BAN', `Banned user. Reason: ${reason}`, userId, targetUser.name);
    }
    return { success: true, message: 'User banned successfully!' };
  };

  const unbanUser = async (userId: string) => {
    const client = supabase;
    const targetUser = users.find(u => u.id === userId);
    if (isSupabaseConfigured && client) {
      const { error } = await client.from('profiles').update({ is_banned: false, banned_reason: null }).eq('id', userId);
      if (error) {
        console.error('Unban user error:', error);
        return { success: false, message: error.message };
      }
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: false, bannedReason: undefined } : u));
    if (currentUser && targetUser) {
      logAdminActivity(currentUser.id, currentUser.name, 'USER_UNBAN', `Unbanned user`, userId, targetUser.name);
    }
    return { success: true, message: 'User unbanned successfully!' };
  };

  const resetUserPassword = async (userId: string, newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }
    const client = supabase;
    const targetUser = users.find(u => u.id === userId);
    if (isSupabaseConfigured && client) {
      const { error } = await client.from('profiles').update({ password: newPassword }).eq('id', userId);
      if (error) {
        console.error('Reset password error:', error);
        return { success: false, message: error.message };
      }
    }
    if (currentUser && targetUser) {
      logAdminActivity(currentUser.id, currentUser.name, 'PASSWORD_RESET', `Reset password for user`, userId, targetUser.name);
    }
    return { success: true, message: 'Password reset successfully!' };
  };

  const deleteUser = async (userId: string) => {
    const client = supabase;
    const targetUser = users.find(u => u.id === userId);
    if (isSupabaseConfigured && client) {
      const { error } = await client.from('profiles').delete().eq('id', userId);
      if (error) {
        console.error('Delete user error:', error);
        return { success: false, message: error.message };
      }
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser && targetUser) {
      logAdminActivity(currentUser.id, currentUser.name, 'USER_DELETE', `Deleted user permanently`, userId, targetUser.name);
    }
    return { success: true, message: 'User deleted permanently!' };
  };

  // Activity Log Methods
  const logSellerActivity = async (sellerId: string, sellerName: string, actionType: 'LOGIN' | 'SUBMISSION' | 'WITHDRAWAL_REQUEST' | 'PROFILE_UPDATE', details: string) => {
    const logId = `sal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const client = supabase;
    if (isSupabaseConfigured && client) {
      await client.from('seller_activity_logs').insert({
        id: logId,
        seller_id: sellerId,
        seller_name: sellerName,
        action_type: actionType,
        details
      });
    }
    setSellerActivityLogs(prev => [{
      id: logId,
      sellerId,
      sellerName,
      actionType,
      details,
      createdAt: new Date().toISOString()
    }, ...prev].slice(0, 200));
  };

  const logAdminActivity = async (adminId: string, adminName: string, actionType: 'USER_ROLE_CHANGE' | 'USER_BAN' | 'USER_UNBAN' | 'USER_DELETE' | 'PASSWORD_RESET' | 'SUBMISSION_REVIEW' | 'WITHDRAWAL_PROCESS' | 'CATEGORY_UPDATE', details: string, targetUserId?: string, targetUserName?: string) => {
    const logId = `aal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const client = supabase;
    if (isSupabaseConfigured && client) {
      await client.from('admin_activity_logs').insert({
        id: logId,
        admin_id: adminId,
        admin_name: adminName,
        action_type: actionType,
        target_user_id: targetUserId,
        target_user_name: targetUserName,
        details
      });
    }
    setAdminActivityLogs(prev => [{
      id: logId,
      adminId,
      adminName,
      actionType,
      targetUserId,
      targetUserName,
      details,
      createdAt: new Date().toISOString()
    }, ...prev].slice(0, 200));
  };

  const registerUser = async (email: string, pass: string, name: string, phone: string) => {
    if (!email || !pass || !name || !phone) {
      return { success: false, message: 'Please fill all required fields.' };
    }

    const trimmedEmail = email.toLowerCase().trim();
    const savedRefCode = localStorage.getItem('mailvault_ref_code') || undefined;
    const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    let refCode = `${name.toLowerCase().replace(/\s+/g, '')}${Math.floor(10 + Math.random() * 89)}`;

    const client = supabase;

    if (isSupabaseConfigured && client) {
      const { data: existing } = await client
        .from('profiles')
        .select('id')
        .eq('email', trimmedEmail)
        .maybeSingle();

      if (existing) {
        return { success: false, message: 'An account with this email already exists. Please login instead.' };
      }

      let refCodeAvailable = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: refTaken } = await client
          .from('profiles')
          .select('id')
          .eq('ref_code', refCode)
          .maybeSingle();

        if (!refTaken) {
          refCodeAvailable = true;
          break;
        }

        refCode = `${name.toLowerCase().replace(/\s+/g, '')}${Math.floor(10 + Math.random() * 899)}`;
      }

      const { data, error } = await client
        .from('profiles')
        .insert({
          id: userId,
          name: name.trim(),
          email: trimmedEmail,
          phone: phone.trim(),
          password: pass,
          role: 'SELLER',
          ref_code: refCode,
          referred_by: savedRefCode || null,
          referral_earnings: 0,
          total_referred_count: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Register DB error:', error);
        if (error.code === '23505') {
          const message = error.message || '';
          if (message.includes('ref_code')) {
            return { success: false, message: 'Could not generate a unique referral code. Please try again.' };
          }
          if (message.includes('email')) {
            return { success: false, message: 'This email is already registered. Please login.' };
          }
          return { success: false, message: 'A duplicate value was found. Please try again.' };
        }
        return { success: false, message: `Registration failed: ${error.message}` };
      }

      const newUser: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: 'SELLER',
        refCode: data.ref_code || refCode,
        referredBy: data.referred_by,
        referralEarnings: 0,
        totalReferredCount: 0,
        createdAt: data.created_at
      };

      setCurrentUser(newUser);
      localStorage.setItem('mailvault_current_user', JSON.stringify(newUser));
      return { success: true, message: 'Seller account registered successfully!' };
    }

    const emailKey = `mailvault_user_${trimmedEmail}`;
    if (localStorage.getItem(emailKey)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: UserProfile = {
      id: userId,
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      role: 'SELLER',
      refCode,
      referredBy: savedRefCode,
      referralEarnings: 0,
      totalReferredCount: 0,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(emailKey, JSON.stringify({ ...newUser, password: pass }));
    setCurrentUser(newUser);
    localStorage.setItem('mailvault_current_user', JSON.stringify(newUser));
    return { success: true, message: 'Seller account registered successfully!' };
  };

  const updateUserProfile = async (updatedFields: Partial<UserProfile>) => {
    if (!currentUser) return { success: false, message: 'User not logged in.' };
    const updated = { ...currentUser, ...updatedFields };
    
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { error } = await client
        .from('profiles')
        .update({
          name: updated.name,
          phone: updated.phone,
          default_bkash: updated.defaultBkash,
          default_nagad: updated.defaultNagad,
          default_rocket: updated.defaultRocket,
          default_usdt: updated.defaultUsdt
        })
        .eq('id', updated.id);
      
      if (error) {
        console.error('Profile update DB error:', error);
        return { success: false, message: `Failed to update profile: ${error.message}` };
      }
    }
    
    setCurrentUser(updated);
    localStorage.setItem('mailvault_current_user', JSON.stringify(updated));
    logSellerActivity(updated.id, updated.name, 'PROFILE_UPDATE', 'Updated profile information');
    return { success: true, message: 'Profile updated successfully!' };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setRole('SELLER');
  };

  // Wallet Calculations for Current Seller
  const sellerId = currentUser ? currentUser.id : null;
  const mySubmissions = sellerId ? submissions.filter(s => s.sellerId === sellerId) : [];
  const myWithdrawals = sellerId ? withdrawals.filter(w => w.sellerId === sellerId) : [];

  const approvedItems = mySubmissions.filter(s => s.status === 'APPROVED');
  const pendingItems = mySubmissions.filter(s => s.status === 'PENDING');
  
  const referralBonus = currentUser ? (currentUser.referralEarnings || 0) : 0;
  const totalApprovedEarnings = approvedItems.reduce((acc, curr) => acc + curr.rate, 0) + referralBonus;
  const pendingBalance = pendingItems.reduce((acc, curr) => acc + curr.rate, 0);

  const completedWithdrawals = myWithdrawals.filter(w => w.status === 'COMPLETED' || w.status === 'PENDING');
  const totalWithdrawn = myWithdrawals.filter(w => w.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingOrDoneWithdrawn = completedWithdrawals.reduce((acc, curr) => acc + curr.amount, 0);

  const availableBalance = Math.max(0, totalApprovedEarnings - pendingOrDoneWithdrawn);
  const totalEmailsBought = approvedItems.length;

  // Announcement Actions
  const addAnnouncement = (text: string, type: 'INFO' | 'BONUS' | 'WARNING') => {
    if (!text.trim()) return;
    const newNotice: AnnouncementNotice = {
      id: `not-${Date.now()}`,
      text: text.trim(),
      type,
      active: true,
      createdAt: new Date().toISOString()
    };
    setAnnouncements(prev => [newNotice, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(n => n.id !== id));
  };

  // Submit Batch Emails
  const submitBatchEmails = async (categoryId: CategoryId, rawText: string) => {
    // Auth guard — login ছাড়া submit করা যাবে না
    if (!currentUser) {
      return { success: false, added: 0, duplicates: 0, message: 'Please login to submit emails.' };
    }

    const category = categories.find(c => c.id === categoryId);
    if (!category) return { success: false, added: 0, duplicates: 0, message: 'Invalid category' };
    if (category.status === 'PAUSED') {
      return { success: false, added: 0, duplicates: 0, message: 'Buying is currently PAUSED for this category.' };
    }

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return { success: false, added: 0, duplicates: 0, message: 'Please enter at least 1 email line.' };
    }

    const existingEmails = new Set(submissions.map(s => s.email.toLowerCase()));
    const newItems: EmailItem[] = [];
    const dbPayloads: any[] = [];
    let duplicateCount = 0;
    const batchId = `BATCH-${Math.floor(1000 + Math.random() * 9000)}`;

    const currentSellerName = currentUser.name;
    const currentSellerId = currentUser.id;

    for (const line of lines) {
      const parts = line.split(/[:,\s|\t]+/);
      if (parts.length < 2) continue;

      const email = parts[0].trim();
      const password = parts[1].trim();
      const recoveryEmail = parts[2] ? parts[2].trim() : undefined;

      if (existingEmails.has(email.toLowerCase())) {
        duplicateCount++;
        continue;
      }

      existingEmails.add(email.toLowerCase());
      const itemId = `em-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      
      const itemObj: EmailItem = {
        id: itemId,
        batchId,
        sellerId: currentSellerId,
        sellerName: currentSellerName,
        categoryId,
        email,
        password,
        recoveryEmail,
        submittedAt: new Date().toISOString(),
        status: 'PENDING',
        rate: category.ratePerUnit
      };

      newItems.push(itemObj);
      dbPayloads.push({
        id: itemId,
        batch_id: batchId,
        seller_id: currentSellerId,
        seller_name: currentSellerName,
        category_id: categoryId,
        email,
        password,
        recovery_email: recoveryEmail,
        submitted_at: new Date().toISOString(),
        status: 'PENDING',
        rate: category.ratePerUnit
      });
    }

    if (newItems.length === 0) {
      if (duplicateCount > 0) {
        return { success: false, added: 0, duplicates: duplicateCount, message: `All ${duplicateCount} emails were already submitted before (Duplicates)!` };
      }
      return { success: false, added: 0, duplicates: 0, message: 'No valid email lines found. Format: email:password:recovery' };
    }

    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { error } = await client.from('email_submissions').insert(dbPayloads);
      if (error) {
        console.error('Supabase batch insert error:', error);
        return { success: false, added: 0, duplicates: duplicateCount, message: `Database error: ${error.message}` };
      }
    }

    setSubmissions(prev => [...newItems, ...prev]);

    // Send Telegram Alert to Admin
    sendTelegramAlert(
      `<b>📧 New Bulk Email Submission!</b>\n\n` +
      `<b>Seller:</b> ${currentSellerName}\n` +
      `<b>Category:</b> ${category.name}\n` +
      `<b>Quantity:</b> ${newItems.length} Mails\n` +
      `<b>Total Potential Value:</b> ৳${newItems.length * category.ratePerUnit}\n` +
      `<b>Batch ID:</b> <code>${batchId}</code>`
    );

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    
    playSuccessSound();

    logSellerActivity(currentSellerId, currentSellerName, 'SUBMISSION', `Submitted ${newItems.length} ${category.name} emails (Batch: ${batchId})`);

    return {
      success: true,
      added: newItems.length,
      duplicates: duplicateCount,
      message: `Successfully submitted ${newItems.length} emails! ${duplicateCount > 0 ? `(${duplicateCount} duplicates filtered out)` : ''}`
    };
  };

  // Request Withdrawal
  const requestWithdrawal = async (amount: number, method: PaymentMethod, accountDetails: string) => {
    // Auth guard — login ছাড়া withdrawal করা যাবে না
    if (!currentUser) return { success: false, message: 'Please login to request withdrawal.' };
    if (amount <= 0) return { success: false, message: 'Amount must be greater than 0.' };
    if (amount > availableBalance) return { success: false, message: 'Insufficient available balance.' };
    if (amount < 100) return { success: false, message: 'Minimum withdrawal amount is ৳100.' };
    if (!accountDetails.trim()) return { success: false, message: 'Please provide account number/address.' };

    const reqId = `wd-${Date.now()}`;
    const currentSellerName = currentUser.name;
    const currentSellerId = currentUser.id;

    const newReq: WithdrawalRequest = {
      id: reqId,
      sellerId: currentSellerId,
      sellerName: currentSellerName,
      amount,
      method,
      accountDetails: accountDetails.trim(),
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { error } = await client.from('withdrawals').insert({
        id: reqId,
        seller_id: currentSellerId,
        seller_name: currentSellerName,
        amount,
        method,
        account_details: accountDetails.trim(),
        requested_at: new Date().toISOString(),
        status: 'PENDING'
      });
      if (error) {
        console.error('Withdrawal insert error:', error);
        return { success: false, message: `Database error: ${error.message}` };
      }
    }

    setWithdrawals(prev => [newReq, ...prev]);

    // Send Telegram Alert to Admin
    sendTelegramAlert(
      `<b>💰 New Cashout Withdrawal Request!</b>\n\n` +
      `<b>Seller:</b> ${currentSellerName}\n` +
      `<b>Amount:</b> ৳${amount}\n` +
      `<b>Method:</b> ${method.toUpperCase()}\n` +
      `<b>Account / Address:</b> <code>${accountDetails.trim()}</code>`
    );

    // Play Cha-ching cash sound FX
    playCashSound();

    logSellerActivity(currentSellerId, currentSellerName, 'WITHDRAWAL_REQUEST', `Requested withdrawal of ৳${amount} via ${method.toUpperCase()}`);

    return { success: true, message: `Withdrawal request of ৳${amount} submitted! Admin will process via ${method.toUpperCase()}.` };
  };

  // Admin Actions
  const updateCategoryRate = async (categoryId: CategoryId, newRate: number) => {
    const client = supabase;
    const target = categories.find(c => c.id === categoryId);
    if (isSupabaseConfigured && client) {
      await client.from('categories').update({ rate_per_unit: newRate }).eq('id', categoryId);
    }
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ratePerUnit: newRate } : c));
    if (currentUser && target) {
      logAdminActivity(currentUser.id, currentUser.name, 'CATEGORY_UPDATE', `Updated rate for ${target.name} to ৳${newRate}`);
    }
  };

  const toggleCategoryStatus = async (categoryId: CategoryId) => {
    const target = categories.find(c => c.id === categoryId);
    if (!target) return;
    const nextStatus = target.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    const client = supabase;
    if (isSupabaseConfigured && client) {
      await client.from('categories').update({ status: nextStatus }).eq('id', categoryId);
    }
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, status: nextStatus } : c));
    if (currentUser && target) {
      logAdminActivity(currentUser.id, currentUser.name, 'CATEGORY_UPDATE', `Toggled ${target.name} to ${nextStatus}`);
    }
  };

  const reviewSubmission = async (itemId: string, status: SubmissionStatus, reason?: string) => {
    const client = supabase;
    const item = submissions.find(s => s.id === itemId);
    if (isSupabaseConfigured && client) {
      await client.from('email_submissions').update({ status, rejection_reason: reason }).eq('id', itemId);
    }
    setSubmissions(prev => prev.map(i => i.id === itemId ? { ...i, status, rejectionReason: reason } : i));
    if (currentUser && item) {
      logAdminActivity(currentUser.id, currentUser.name, 'SUBMISSION_REVIEW', `${status === 'APPROVED' ? 'Approved' : 'Rejected'} submission from ${item.sellerName} (${item.email})${reason ? `: ${reason}` : ''}`, item.sellerId, item.sellerName);
    }
  };

  const reviewBatchSubmissions = async (itemIds: string[], status: SubmissionStatus, reason?: string) => {
    const idSet = new Set(itemIds);
    const client = supabase;
    if (isSupabaseConfigured && client) {
      await client.from('email_submissions').update({ status, rejection_reason: reason }).in('id', itemIds);
    }
    setSubmissions(prev => prev.map(item => idSet.has(item.id) ? { ...item, status, rejectionReason: reason } : item));
    if (currentUser && itemIds.length > 0) {
      const sample = submissions.find(s => s.id === itemIds[0]);
      logAdminActivity(currentUser.id, currentUser.name, 'SUBMISSION_REVIEW', `Batch ${status === 'APPROVED' ? 'approved' : 'rejected'} ${itemIds.length} submissions${reason ? `: ${reason}` : ''}`, sample?.sellerId, sample?.sellerName);
    }
  };

  const processWithdrawal = async (withdrawalId: string, status: 'COMPLETED' | 'REJECTED', txId?: string) => {
    const client = supabase;
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    if (isSupabaseConfigured && client) {
      await client.from('withdrawals').update({
        status,
        transaction_id: txId,
        processed_at: new Date().toISOString()
      }).eq('id', withdrawalId);
    }
    setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? {
      ...w,
      status,
      transactionId: txId || w.transactionId,
      processedAt: new Date().toISOString()
    } : w));
    if (currentUser && withdrawal) {
      logAdminActivity(currentUser.id, currentUser.name, 'WITHDRAWAL_PROCESS', `Marked withdrawal ৳${withdrawal.amount} as ${status}${txId ? ` with TrxID ${txId}` : ''}`, withdrawal.sellerId, withdrawal.sellerName);
    }
  };

  const exportApprovedEmails = (categoryId?: CategoryId) => {
    let filtered = submissions.filter(s => s.status === 'APPROVED');
    if (categoryId) {
      filtered = filtered.filter(s => s.categoryId === categoryId);
    }

    if (filtered.length === 0) {
      return;
    }

    const content = filtered.map(s => `${s.email}:${s.password}${s.recoveryEmail ? `:${s.recoveryEmail}` : ''}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MailVault_Approved_Emails_${categoryId || 'ALL'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        role,
        setRole,
        lang,
        setLang,
        theme,
        setTheme,
        categories,
        submissions,
        withdrawals,
        announcements,
        payoutMethods,
        addPayoutMethod,
        togglePayoutMethodStatus,
         loginUser,
         registerUser,
         updateUserProfile,
         logoutUser,
         setupFirstAdmin,
         submitBatchEmails,
        requestWithdrawal,
        updateCategoryRate,
        toggleCategoryStatus,
        reviewSubmission,
        reviewBatchSubmissions,
        processWithdrawal,
        exportApprovedEmails,
        addAnnouncement,
        deleteAnnouncement,
        users,
        fetchUsers,
        updateUserRole,
        banUser,
        unbanUser,
        resetUserPassword,
        deleteUser,
        sellerActivityLogs,
        adminActivityLogs,
        logSellerActivity,
        logAdminActivity,
        availableBalance,
        pendingBalance,
        totalWithdrawn,
        referralEarnings: referralBonus,
        totalEmailsBought,
        isSupabaseLive: isSupabaseConfigured
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
