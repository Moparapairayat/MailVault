import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmailCategory, EmailItem, WithdrawalRequest, UserRole, CategoryId, PaymentMethod, SubmissionStatus } from '../types';
import { INITIAL_CATEGORIES, INITIAL_SUBMISSIONS, INITIAL_WITHDRAWALS } from '../mockData';
import confetti from 'canvas-confetti';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  categories: EmailCategory[];
  submissions: EmailItem[];
  withdrawals: WithdrawalRequest[];
  
  // Seller Actions
  submitBatchEmails: (categoryId: CategoryId, rawText: string) => { success: boolean; added: number; duplicates: number; message: string };
  requestWithdrawal: (amount: number, method: PaymentMethod, accountDetails: string) => { success: boolean; message: string };
  
  // Admin Actions
  updateCategoryRate: (categoryId: CategoryId, newRate: number) => void;
  toggleCategoryStatus: (categoryId: CategoryId) => void;
  reviewSubmission: (itemId: string, status: SubmissionStatus, reason?: string) => void;
  reviewBatchSubmissions: (itemIds: string[], status: SubmissionStatus, reason?: string) => void;
  processWithdrawal: (withdrawalId: string, status: 'COMPLETED' | 'REJECTED', txId?: string) => void;
  exportApprovedEmails: (categoryId?: CategoryId) => void;
  
  // Calculated Stats
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  totalEmailsBought: number;
  activeAnnouncements: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role
  const [role, setRole] = useState<UserRole>('SELLER');

  // Categories
  const [categories, setCategories] = useState<EmailCategory[]>(() => {
    const saved = localStorage.getItem('mailvault_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Submissions
  const [submissions, setSubmissions] = useState<EmailItem[]>(() => {
    const saved = localStorage.getItem('mailvault_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem('mailvault_withdrawals');
    return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS;
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('mailvault_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mailvault_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('mailvault_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  // Wallet Calculations for Current Seller (usr-seller-1)
  const approvedItems = submissions.filter(s => s.status === 'APPROVED');
  const pendingItems = submissions.filter(s => s.status === 'PENDING');
  
  const totalApprovedEarnings = approvedItems.reduce((acc, curr) => acc + curr.rate, 0);
  const pendingBalance = pendingItems.reduce((acc, curr) => acc + curr.rate, 0);

  const completedWithdrawals = withdrawals.filter(w => w.status === 'COMPLETED' || w.status === 'PENDING');
  const totalWithdrawn = withdrawals.filter(w => w.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingOrDoneWithdrawn = completedWithdrawals.reduce((acc, curr) => acc + curr.amount, 0);

  const availableBalance = Math.max(0, totalApprovedEarnings - pendingOrDoneWithdrawn);
  const totalEmailsBought = approvedItems.length;

  // Submit Batch Emails
  const submitBatchEmails = (categoryId: CategoryId, rawText: string) => {
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
    let duplicateCount = 0;
    const batchId = `BATCH-${Math.floor(1000 + Math.random() * 9000)}`;

    for (const line of lines) {
      // Format parser: email:password or email:password:recovery
      const parts = line.split(/[:,\s|\t]+/);
      if (parts.length < 2) continue; // Invalid format line

      const email = parts[0].trim();
      const password = parts[1].trim();
      const recoveryEmail = parts[2] ? parts[2].trim() : undefined;

      if (existingEmails.has(email.toLowerCase())) {
        duplicateCount++;
        continue;
      }

      existingEmails.add(email.toLowerCase());
      newItems.push({
        id: `em-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        batchId,
        sellerId: 'usr-seller-1',
        sellerName: 'Karim Ahmed',
        categoryId,
        email,
        password,
        recoveryEmail,
        submittedAt: new Date().toISOString(),
        status: 'PENDING',
        rate: category.ratePerUnit
      });
    }

    if (newItems.length === 0) {
      if (duplicateCount > 0) {
        return { success: false, added: 0, duplicates: duplicateCount, message: `All ${duplicateCount} emails were already submitted in system before (Duplicates)!` };
      }
      return { success: false, added: 0, duplicates: 0, message: 'No valid email lines found. Format: email:password:recovery' };
    }

    setSubmissions(prev => [...newItems, ...prev]);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    return {
      success: true,
      added: newItems.length,
      duplicates: duplicateCount,
      message: `Successfully submitted ${newItems.length} emails! ${duplicateCount > 0 ? `(${duplicateCount} duplicates filtered out)` : ''}`
    };
  };

  // Request Withdrawal
  const requestWithdrawal = (amount: number, method: PaymentMethod, accountDetails: string) => {
    if (amount <= 0) return { success: false, message: 'Amount must be greater than 0.' };
    if (amount > availableBalance) return { success: false, message: 'Insufficient available balance.' };
    if (amount < 100) return { success: false, message: 'Minimum withdrawal amount is ৳100.' };
    if (!accountDetails.trim()) return { success: false, message: 'Please provide account number/address.' };

    const newReq: WithdrawalRequest = {
      id: `wd-${Date.now()}`,
      sellerId: 'usr-seller-1',
      sellerName: 'Karim Ahmed',
      amount,
      method,
      accountDetails: accountDetails.trim(),
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    setWithdrawals(prev => [newReq, ...prev]);

    return { success: true, message: `Withdrawal request of ৳${amount} submitted! Admin will process via ${method.toUpperCase()}.` };
  };

  // Admin Actions
  const updateCategoryRate = (categoryId: CategoryId, newRate: number) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ratePerUnit: newRate } : c));
  };

  const toggleCategoryStatus = (categoryId: CategoryId) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, status: c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : c));
  };

  const reviewSubmission = (itemId: string, status: SubmissionStatus, reason?: string) => {
    setSubmissions(prev => prev.map(item => item.id === itemId ? { ...item, status, rejectionReason: reason } : item));
  };

  const reviewBatchSubmissions = (itemIds: string[], status: SubmissionStatus, reason?: string) => {
    const idSet = new Set(itemIds);
    setSubmissions(prev => prev.map(item => idSet.has(item.id) ? { ...item, status, rejectionReason: reason } : item));
  };

  const processWithdrawal = (withdrawalId: string, status: 'COMPLETED' | 'REJECTED', txId?: string) => {
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

  const activeAnnouncements = [
    "🔥 Gmail Old (2018-2022) Buying Rate increased to ৳18/pc!",
    "⚡ Instant payouts via bKash & Nagad within 30 minutes.",
    "🛡️ 100% Secure Procurement System - Only Admin buys your emails."
  ];

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        categories,
        submissions,
        withdrawals,
        submitBatchEmails,
        requestWithdrawal,
        updateCategoryRate,
        toggleCategoryStatus,
        reviewSubmission,
        reviewBatchSubmissions,
        processWithdrawal,
        exportApprovedEmails,
        availableBalance,
        pendingBalance,
        totalWithdrawn,
        totalEmailsBought,
        activeAnnouncements
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
