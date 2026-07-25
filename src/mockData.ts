import { EmailCategory, EmailItem, WithdrawalRequest } from './types';

export const INITIAL_CATEGORIES: EmailCategory[] = [
  {
    id: 'gmail_fresh',
    name: 'Fresh Gmail Account',
    description: 'New clean Gmail accounts (0-30 days old). Minimum 2FA off.',
    ratePerUnit: 8,
    minBatch: 5,
    status: 'ACTIVE',
    icon: 'Mail',
    formatGuide: 'email:password:recovery_email',
    totalBought: 14200
  },
  {
    id: 'gmail_old',
    name: 'Aged/Old Gmail (2018-2022)',
    description: 'Aged accounts created between 2018 to 2022. High trust score.',
    ratePerUnit: 18,
    minBatch: 2,
    status: 'ACTIVE',
    icon: 'Archive',
    formatGuide: 'email:password:recovery_email',
    totalBought: 8650
  },
  {
    id: 'gmail_pva',
    name: 'Phone Verified (PVA) Gmail',
    description: 'Phone verified Gmails with recovery set and 2FA configured.',
    ratePerUnit: 14,
    minBatch: 5,
    status: 'ACTIVE',
    icon: 'ShieldCheck',
    formatGuide: 'email:password:recovery_email:phone',
    totalBought: 6400
  },
  {
    id: 'edu_mail',
    name: '.Edu Student Mail',
    description: 'University / College student email (.edu domain with portal access).',
    ratePerUnit: 45,
    minBatch: 1,
    status: 'ACTIVE',
    icon: 'GraduationCap',
    formatGuide: 'email:password:login_url',
    totalBought: 2300
  },
  {
    id: 'outlook_hotmail',
    name: 'Outlook / Hotmail Fresh',
    description: 'Clean Microsoft Outlook or Hotmail accounts with POP3/IMAP enabled.',
    ratePerUnit: 4,
    minBatch: 10,
    status: 'ACTIVE',
    icon: 'Inbox',
    formatGuide: 'email:password',
    totalBought: 32000
  }
];

export const INITIAL_SUBMISSIONS: EmailItem[] = [
  {
    id: 'em-101',
    batchId: 'BATCH-8801',
    sellerId: 'usr-seller-1',
    sellerName: 'Karim Ahmed',
    categoryId: 'gmail_old',
    email: 'karim.old2020@gmail.com',
    password: 'Pass1234Secure!',
    recoveryEmail: 'recov.karim@outlook.com',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'APPROVED',
    rate: 18
  },
  {
    id: 'em-102',
    batchId: 'BATCH-8801',
    sellerId: 'usr-seller-1',
    sellerName: 'Karim Ahmed',
    categoryId: 'gmail_old',
    email: 'karim.old2021@gmail.com',
    password: 'Pass1234Secure!',
    recoveryEmail: 'recov.karim2@outlook.com',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'APPROVED',
    rate: 18
  },
  {
    id: 'em-103',
    batchId: 'BATCH-8802',
    sellerId: 'usr-seller-1',
    sellerName: 'Karim Ahmed',
    categoryId: 'gmail_fresh',
    email: 'fresh.batch.0192@gmail.com',
    password: 'FreshPass2026',
    recoveryEmail: 'recov01@mail.com',
    submittedAt: new Date(Date.now() - 1800000).toISOString(),
    status: 'PENDING',
    rate: 8
  },
  {
    id: 'em-104',
    batchId: 'BATCH-8802',
    sellerId: 'usr-seller-1',
    sellerName: 'Karim Ahmed',
    categoryId: 'gmail_fresh',
    email: 'fresh.batch.0193@gmail.com',
    password: 'FreshPass2026',
    recoveryEmail: 'recov02@mail.com',
    submittedAt: new Date(Date.now() - 1800000).toISOString(),
    status: 'PENDING',
    rate: 8
  },
  {
    id: 'em-105',
    batchId: 'BATCH-8790',
    sellerId: 'usr-seller-2',
    sellerName: 'Rahim Chowdhury',
    categoryId: 'edu_mail',
    email: 'r.chowdhury@mit.edu',
    password: 'StudentEduPass#99',
    recoveryEmail: 'portal.mit.edu/login',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'APPROVED',
    rate: 45
  },
  {
    id: 'em-106',
    batchId: 'BATCH-8788',
    sellerId: 'usr-seller-2',
    sellerName: 'Rahim Chowdhury',
    categoryId: 'gmail_fresh',
    email: 'bad.email.disabled@gmail.com',
    password: 'WrongPassword',
    recoveryEmail: 'none@mail.com',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'REJECTED',
    rate: 8,
    rejectionReason: 'Invalid Password / Account Disabled on Login Check'
  }
];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wd-501',
    sellerId: 'usr-seller-1',
    sellerName: 'Karim Ahmed',
    amount: 500,
    method: 'bkash',
    accountDetails: '01711223344 (Personal)',
    requestedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'COMPLETED',
    transactionId: 'BK78941029X',
    processedAt: new Date(Date.now() - 86400000 * 0.8).toISOString()
  },
  {
    id: 'wd-502',
    sellerId: 'usr-seller-1',
    sellerName: 'Karim Ahmed',
    amount: 350,
    method: 'nagad',
    accountDetails: '01899887766 (Personal)',
    requestedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'PENDING'
  }
];
