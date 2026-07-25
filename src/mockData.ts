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
    totalBought: 0
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
    totalBought: 0
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
    totalBought: 0
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
    totalBought: 0
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
    totalBought: 0
  }
];

// No mock/demo data — all data comes from Supabase database
export const INITIAL_SUBMISSIONS: EmailItem[] = [];
export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];
