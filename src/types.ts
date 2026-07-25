export type CategoryId = 'gmail_fresh' | 'gmail_old' | 'gmail_pva' | 'edu_mail' | 'outlook_hotmail';

export interface EmailCategory {
  id: CategoryId;
  name: string;
  description: string;
  ratePerUnit: number; // in BDT
  minBatch: number;
  status: 'ACTIVE' | 'PAUSED';
  icon: string;
  formatGuide: string;
  totalBought: number;
}

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EmailItem {
  id: string;
  batchId: string;
  sellerId: string;
  sellerName: string;
  categoryId: CategoryId;
  email: string;
  password: string;
  recoveryEmail?: string;
  submittedAt: string;
  status: SubmissionStatus;
  rate: number;
  rejectionReason?: string;
}

export interface SubmissionBatch {
  id: string;
  sellerId: string;
  sellerName: string;
  categoryId: CategoryId;
  categoryName: string;
  totalCount: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  totalEarned: number;
  submittedAt: string;
  status: SubmissionStatus;
}

export type PaymentMethod = string;

export interface PayoutMethodConfig {
  id: string;
  name: string;
  minAmount: number;
  status: 'ACTIVE' | 'PAUSED';
}

export interface WithdrawalRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number; // BDT
  method: PaymentMethod;
  accountDetails: string;
  requestedAt: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  transactionId?: string;
  processedAt?: string;
}

export interface SellerWallet {
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  referralEarnings: number;
}

export type UserRole = 'SELLER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  refCode: string;
  referredBy?: string;
  referralEarnings: number;
  totalReferredCount: number;
  createdAt: string;
  // Saved Default Payout Accounts
  defaultBkash?: string;
  defaultNagad?: string;
  defaultRocket?: string;
  defaultUsdt?: string;
}

export interface AnnouncementNotice {
  id: string;
  text: string;
  type: 'INFO' | 'BONUS' | 'WARNING';
  active: boolean;
  createdAt: string;
}
