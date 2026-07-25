import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmailCategory, EmailItem, WithdrawalRequest, UserRole, CategoryId, PaymentMethod, SubmissionStatus, UserProfile, AnnouncementNotice, PayoutMethodConfig } from '../types';
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
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (email: string, pass: string, name: string, phone: string) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (updatedFields: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => void;
  
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
  const loginUser = async (email: string, pass: string) => {
    if (!email || !pass) return { success: false, message: 'Please enter email and password.' };

    const username = email.split('@')[0];
    const newUser: UserProfile = {
      id: `usr-${username}`,
      name: username.toUpperCase(),
      email,
      phone: '01700000000',
      role: 'SELLER',
      refCode: `${username}${Math.floor(10 + Math.random() * 89)}`,
      referralEarnings: 0,
      totalReferredCount: 0,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    return { success: true, message: 'Logged in successfully!' };
  };

  const registerUser = async (email: string, pass: string, name: string, phone: string) => {
    if (!email || !pass || !name || !phone) {
      return { success: false, message: 'Please fill all required fields.' };
    }

    const savedRefCode = localStorage.getItem('mailvault_ref_code') || undefined;

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      role: 'SELLER',
      refCode: `${name.toLowerCase().replace(/\s+/g, '')}${Math.floor(10 + Math.random() * 89)}`,
      referredBy: savedRefCode,
      referralEarnings: 0,
      totalReferredCount: 0,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    return { success: true, message: 'Seller account registered successfully!' };
  };

  const updateUserProfile = async (updatedFields: Partial<UserProfile>) => {
    if (!currentUser) return { success: false, message: 'User not logged in.' };
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);
    localStorage.setItem('mailvault_current_user', JSON.stringify(updated));
    return { success: true, message: 'Profile updated successfully!' };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setRole('SELLER');
  };

  // Wallet Calculations for Current Seller
  const sellerId = currentUser ? currentUser.id : 'usr-seller-1';
  const mySubmissions = submissions.filter(s => s.sellerId === sellerId);
  const myWithdrawals = withdrawals.filter(w => w.sellerId === sellerId);

  const approvedItems = mySubmissions.filter(s => s.status === 'APPROVED');
  const pendingItems = mySubmissions.filter(s => s.status === 'PENDING');
  
  const referralBonus = currentUser ? (currentUser.referralEarnings || 0) : 150;
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

    const currentSellerName = currentUser ? currentUser.name : 'Karim Ahmed';

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
        sellerId,
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
        seller_id: sellerId,
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

    return {
      success: true,
      added: newItems.length,
      duplicates: duplicateCount,
      message: `Successfully submitted ${newItems.length} emails! ${duplicateCount > 0 ? `(${duplicateCount} duplicates filtered out)` : ''}`
    };
  };

  // Request Withdrawal
  const requestWithdrawal = async (amount: number, method: PaymentMethod, accountDetails: string) => {
    if (amount <= 0) return { success: false, message: 'Amount must be greater than 0.' };
    if (amount > availableBalance) return { success: false, message: 'Insufficient available balance.' };
    if (amount < 100) return { success: false, message: 'Minimum withdrawal amount is ৳100.' };
    if (!accountDetails.trim()) return { success: false, message: 'Please provide account number/address.' };

    const reqId = `wd-${Date.now()}`;
    const currentSellerName = currentUser ? currentUser.name : 'Karim Ahmed';

    const newReq: WithdrawalRequest = {
      id: reqId,
      sellerId,
      sellerName: currentSellerName,
      amount,
      method,
      accountDetails: accountDetails.trim(),
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    const client = supabase;
    if (isSupabaseConfigured && client) {
      await client.from('withdrawals').insert({
        id: reqId,
        seller_id: sellerId,
        seller_name: currentSellerName,
        amount,
        method,
        account_details: accountDetails.trim(),
        requested_at: new Date().toISOString(),
        status: 'PENDING'
      });
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

    return { success: true, message: `Withdrawal request of ৳${amount} submitted! Admin will process via ${method.toUpperCase()}.` };
  };

  // Admin Actions
  const updateCategoryRate = async (categoryId: CategoryId, newRate: number) => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      await client.from('categories').update({ rate_per_unit: newRate }).eq('id', categoryId);
    }
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ratePerUnit: newRate } : c));
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
  };

  const reviewSubmission = async (itemId: string, status: SubmissionStatus, reason?: string) => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      await client.from('email_submissions').update({ status, rejection_reason: reason }).eq('id', itemId);
    }
    setSubmissions(prev => prev.map(item => item.id === itemId ? { ...item, status, rejectionReason: reason } : item));
  };

  const reviewBatchSubmissions = async (itemIds: string[], status: SubmissionStatus, reason?: string) => {
    const idSet = new Set(itemIds);
    const client = supabase;
    if (isSupabaseConfigured && client) {
      await client.from('email_submissions').update({ status, rejection_reason: reason }).in('id', itemIds);
    }
    setSubmissions(prev => prev.map(item => idSet.has(item.id) ? { ...item, status, rejectionReason: reason } : item));
  };

  const processWithdrawal = async (withdrawalId: string, status: 'COMPLETED' | 'REJECTED', txId?: string) => {
    const client = supabase;
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
  };

  const exportApprovedEmails = (categoryId?: CategoryId) => {
    let filtered = submissions.filter(s => s.status === 'APPROVED');
    if (categoryId) {
      filtered = filtered.filter(s => s.categoryId === categoryId);
    }

    if (filtered.length === 0) {
      alert('No approved emails found to export.');
      return;
    }

    const content = filtered.map(s => `${s.email}:${s.password}${s.recoveryEmail ? `:${s.recoveryEmail}` : ''}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MailVault_Approved_Emails_${categoryId || 'ALL'}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
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
