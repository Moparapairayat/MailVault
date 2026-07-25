import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, CategoryId } from '../types';
import { SellerSidebar } from './SellerSidebar';
import { TopSellerLeaderboard } from './TopSellerLeaderboard';
import { Wallet, ArrowDownRight, Clock, CheckCircle2, XCircle, Search, Copy, Check, Sparkles, Award, UploadCloud, Share2, MessageSquare, Send, CreditCard, Layers, Download, Smartphone } from 'lucide-react';

interface SellerDashboardProps {
  openSubmitModal: (categoryId?: CategoryId) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ openSubmitModal }) => {
  const {
    currentUser,
    availableBalance,
    pendingBalance,
    totalWithdrawn,
    referralEarnings,
    submissions,
    withdrawals,
    categories,
    payoutMethods,
    requestWithdrawal,
    submitBatchEmails,
    updateUserProfile
  } = useApp();

  const [activeSection, setActiveSection] = useState<string>('overview');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Profile Form State
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [phoneInput, setPhoneInput] = useState(currentUser?.phone || '');
  const [bkashInput, setBkashInput] = useState(currentUser?.defaultBkash || '');
  const [nagadInput, setNagadInput] = useState(currentUser?.defaultNagad || '');
  const [rocketInput, setRocketInput] = useState(currentUser?.defaultRocket || '');
  const [usdtInput, setUsdtInput] = useState(currentUser?.defaultUsdt || '');
  const [profileNotice, setProfileNotice] = useState<{ success: boolean; text: string } | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);
    const res = await updateUserProfile({
      name: nameInput,
      phone: phoneInput,
      defaultBkash: bkashInput,
      defaultNagad: nagadInput,
      defaultRocket: rocketInput,
      defaultUsdt: usdtInput
    });
    setProfileNotice({ success: res.success, text: res.message });
    setTimeout(() => setProfileNotice(null), 3000);
  };

  // File Drag & Drop State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileNotice, setFileNotice] = useState<string | null>(null);

  // Withdraw Modal State
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(availableBalance);
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>('bkash');
  const [accountDetails, setAccountDetails] = useState('');
  const [withdrawNotice, setWithdrawNotice] = useState<{ success: boolean; text: string } | null>(null);

  // Filter Submissions for current seller
  const sellerId = currentUser ? currentUser.id : 'usr-seller-1';
  const mySubmissions = submissions.filter(s => s.sellerId === sellerId);
  const filteredSubmissions = mySubmissions.filter(s => {
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase()) || s.batchId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalApprovedCount = mySubmissions.filter(s => s.status === 'APPROVED').length;

  // Gamified Seller Tier Logic
  const getSellerTier = (count: number) => {
    if (count >= 500) {
      return { title: 'Gold VIP Seller', badge: '🥇 Gold VIP', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', perk: '+৳1.0/pc Extra Bonus & 10-Min Payouts' };
    } else if (count >= 50) {
      return { title: 'Silver Seller', badge: '🥈 Silver', color: 'text-slate-300 bg-slate-400/10 border-slate-400/30', perk: '+৳0.5/pc Extra Bonus & Priority Review' };
    }
    return { title: 'Bronze Seller', badge: '🥉 Bronze', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', perk: 'Standard Instant Procurement' };
  };

  const sellerTier = getSellerTier(totalApprovedCount);
  const refCode = currentUser?.refCode || 'karim88';
  const refLink = `${window.location.origin}/?ref=${refCode}`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Drag & Drop File Parsing
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
        setFileNotice('Please upload a valid .TXT or .CSV email list file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          const res = await submitBatchEmails('gmail_fresh', text);
          setFileNotice(res.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawNotice(null);
    const res = await requestWithdrawal(withdrawAmount, withdrawMethod, accountDetails);
    if (res.success) {
      setWithdrawNotice({ success: true, text: res.message });
      setTimeout(() => {
        setIsWithdrawOpen(false);
        setWithdrawNotice(null);
        setAccountDetails('');
      }, 2000);
    } else {
      setWithdrawNotice({ success: false, text: res.message });
    }
  };

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Email,Category,Rate (BDT),Status,Submitted At\n";
    mySubmissions.forEach(s => {
      csvContent += `"${s.email}","${s.categoryId}","${s.rate}","${s.status}","${new Date(s.submittedAt).toLocaleString()}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MailVault_Statement_${currentUser?.name || 'Seller'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  const shareText = encodeURIComponent(`Sell your verified Gmails & Edu Mails directly to MailVault for instant bKash/Nagad payouts! Join via my link: ${refLink}`);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${shareText}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refLink)}`;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      
      {/* Collapsible Left Sidebar / Mobile Swiper */}
      <SellerSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        openSubmitModal={() => openSubmitModal()}
      />

      {/* Main Content Area - pb-24 for Mobile Bottom Bar clearance */}
      <main className="flex-1 py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-x-hidden pb-24 md:pb-12">
        
        {/* Top Header with Seller Profile & Tier Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-gradient-to-r from-dark-card via-dark-panel to-dark-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-500/30">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-extrabold text-lg sm:text-xl shrink-0">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'K'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser ? currentUser.name : 'Karim Ahmed'}</h1>
                <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase border rounded-full ${sellerTier.color}`}>
                  {sellerTier.badge}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-medium">
                Phone: <span className="text-slate-200 font-mono">{currentUser ? currentUser.phone : '01711223344'}</span> • Perk: <strong className="text-emerald-400">{sellerTier.perk}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => openSubmitModal()}
            className="w-full sm:w-auto bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 font-extrabold px-5 py-3 rounded-xl sm:rounded-2xl text-xs transition-all shadow-xl shadow-brand-500/20 hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit Bulk Mails</span>
          </button>
        </div>

        {/* Gamified Tier Milestone Level Progress Bar */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-brand-500/20 mb-6 bg-gradient-to-r from-dark-card to-dark-panel">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-400" />
              <span>Next Level Progress: <strong className="text-brand-400">Gold VIP Tier</strong></span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">{totalApprovedCount} / 500 Accounts Approved</span>
          </div>

          <div className="w-full h-2.5 bg-dark-bg rounded-full overflow-hidden border border-dark-border">
            <div
              className="h-full bg-gradient-to-r from-brand-500 via-accent-cyan to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (totalApprovedCount / 500) * 100)}%` }}
            />
          </div>

          <span className="text-[10px] text-slate-400 mt-1.5 block">
            Unlock <strong>Gold VIP (+৳1.0/pc bonus & 10-Min Payouts)</strong> by approving {Math.max(0, 500 - totalApprovedCount)} more accounts!
          </span>
        </div>

        {/* View 1: Overview & Wallet Summary */}
        {activeSection === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* FinTech Glowing Balance Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              {/* Available Balance Card */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-emerald-500/40 relative overflow-hidden bg-gradient-to-br from-dark-card via-dark-panel to-dark-card shadow-xl group hover:border-emerald-500/60 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Ready Cash
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">Available Balance</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">৳{availableBalance.toLocaleString()}</div>

                <button
                  onClick={() => {
                    setWithdrawAmount(availableBalance);
                    setIsWithdrawOpen(true);
                  }}
                  disabled={availableBalance < 100}
                  className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    availableBalance >= 100
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 cursor-pointer'
                      : 'bg-dark-hover text-slate-500 cursor-not-allowed border border-dark-border'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Withdraw Cash</span>
                </button>
              </div>

              {/* Pending Verification Card */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-amber-500/30 relative overflow-hidden group hover:border-amber-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    In Review
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">Pending Verification</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">৳{pendingBalance.toLocaleString()}</div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-4 leading-tight">
                  Verification speed: <strong>15-30 mins</strong>
                </p>
              </div>

              {/* Total Paid Out Card */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-accent-cyan/30 relative overflow-hidden group hover:border-accent-cyan/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                    Paid Out
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">Total Cash Paid</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">৳{totalWithdrawn.toLocaleString()}</div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-4 leading-tight">
                  Via bKash / Nagad / Rocket
                </p>
              </div>

              {/* Referral Bonus Earnings Card */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-purple-500/30 relative overflow-hidden group hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    3% Bonus
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">Referral Earnings</div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">৳{referralEarnings.toLocaleString()}</div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-4 leading-tight">
                  Referred Sellers: <strong>{currentUser?.totalReferredCount || 4} Members</strong>
                </p>
              </div>

            </div>

            {/* Drag & Drop File Upload Zone Card */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all text-center ${
                isDragging
                  ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
                  : 'border-dark-border hover:border-brand-500/40 bg-dark-card/60'
              }`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto mb-3">
                <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Drag & Drop Your Bulk Email File (.TXT / .CSV)</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Drop your email text file directly here for instant auto-parsing in <code>email:password:recovery</code> format.
              </p>

              {fileNotice && (
                <div className="mt-4 inline-block bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold px-4 py-2 rounded-xl">
                  {fileNotice}
                </div>
              )}
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div
                onClick={() => setActiveSection('submissions')}
                className="glass-card p-5 rounded-2xl border border-dark-border hover:border-brand-500/50 cursor-pointer transition-all bg-gradient-to-br from-dark-card to-dark-panel"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Submissions History</h4>
                <p className="text-[11px] text-slate-400 mt-1">Check status for all {mySubmissions.length} submitted emails.</p>
              </div>

              <div
                onClick={() => setActiveSection('withdrawals')}
                className="glass-card p-5 rounded-2xl border border-emerald-500/50 cursor-pointer transition-all bg-gradient-to-br from-dark-card to-dark-panel"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Cashout & Payouts</h4>
                <p className="text-[11px] text-slate-400 mt-1">Request bKash/Nagad cashout or view TrxIDs.</p>
              </div>

              <div
                onClick={handleDownloadCSV}
                className="glass-card p-5 rounded-2xl border border-purple-500/50 cursor-pointer transition-all bg-gradient-to-br from-dark-card to-dark-panel group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                  <Download className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Download Earnings Statement</h4>
                <p className="text-[11px] text-slate-400 mt-1">1-Click CSV export of your submission records.</p>
              </div>
            </div>

            {/* Weekly Top Seller Leaderboard Widget */}
            <div className="mt-8">
              <TopSellerLeaderboard />
            </div>
          </div>
        )}

        {/* View 2: Referral Program Card Only */}
        {activeSection === 'referrals' && (
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-brand-500/30 mb-10 bg-gradient-to-r from-dark-card via-dark-panel to-dark-card shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-brand-500/10 text-brand-400 border border-brand-500/30 rounded-full">
                    3% Lifetime Bonus Commission
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">Invite Sellers & Earn Passive Cash</h3>
                <p className="text-xs text-slate-400 max-w-xl">
                  Share your personal referral link with friends or Facebook groups. Whenever your referred friends sell emails to MailVault, you automatically receive 3% bonus cash in your wallet!
                </p>
              </div>

              <div className="bg-dark-bg p-4 rounded-2xl border border-dark-border space-y-3 shrink-0">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Your Unique Referral Link</span>
                  <div className="font-mono text-xs text-brand-400 font-bold max-w-[260px] truncate">
                    {refLink}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyRef}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </a>

                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 3: Email Submissions History Table Only */}
        {activeSection === 'submissions' && (
          <div className="glass-card rounded-2xl border border-dark-border overflow-hidden mb-12">
            
            <div className="p-4 sm:p-6 border-b border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Your Submitted Email Items</h3>
                <p className="text-xs text-slate-400">View exact status, batch IDs and approved rate calculations.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="relative w-full sm:w-auto">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search email or batch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-48 lg:w-60 bg-dark-bg border border-dark-border rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex bg-dark-bg p-1 rounded-xl border border-dark-border w-full sm:w-auto overflow-x-auto">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                        filterStatus === status
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-dark-panel/60 border-b border-dark-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Batch ID / Email</th>
                    <th className="py-3.5 px-4 sm:px-6">Category</th>
                    <th className="py-3.5 px-4 sm:px-6">Rate</th>
                    <th className="py-3.5 px-4 sm:px-6">Status</th>
                    <th className="py-3.5 px-4 sm:px-6">Submitted</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border text-xs">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No email submissions found under this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((item) => (
                      <tr key={item.id} className="hover:bg-dark-hover/50 transition-all">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-mono text-white font-medium flex items-center gap-2 break-all">
                            <span>{item.email}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="bg-dark-bg px-1.5 py-0.5 rounded border border-dark-border">{item.batchId}</span>
                            {item.recoveryEmail && <span>Recov: {item.recoveryEmail}</span>}
                          </div>
                        </td>

                        <td className="py-4 px-4 sm:px-6 font-medium text-slate-300">
                          {getCategoryName(item.categoryId)}
                        </td>

                        <td className="py-4 px-4 sm:px-6 font-bold text-emerald-400">
                          ৳{item.rate}
                        </td>

                        <td className="py-4 px-4 sm:px-6">
                          {item.status === 'APPROVED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          )}
                          {item.status === 'PENDING' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending Review
                            </span>
                          )}
                          {item.status === 'REJECTED' && (
                            <div>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Rejected
                              </span>
                              {item.rejectionReason && (
                                <p className="text-[10px] text-rose-400 mt-1">{item.rejectionReason}</p>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-slate-400 font-mono text-[11px]">
                          {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <button
                            onClick={() => handleCopy(`${item.email}:${item.password}${item.recoveryEmail ? `:${item.recoveryEmail}` : ''}`, item.id)}
                            className="p-1.5 rounded-lg bg-dark-bg hover:bg-dark-panel border border-dark-border text-slate-400 hover:text-white transition-all inline-flex items-center gap-1 text-[11px]"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View 5: Seller Profile & Account Settings Only */}
        {activeSection === 'profile' && (
          <div className="space-y-6">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-brand-500/30 bg-gradient-to-br from-dark-card via-dark-panel to-dark-card shadow-xl">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dark-border">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-extrabold text-2xl">
                  {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'K'}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">{currentUser?.name || 'Karim Ahmed'}</h3>
                  <p className="text-xs text-slate-400">Manage your profile, phone number, and saved default cashout accounts.</p>
                </div>
              </div>

              {profileNotice && (
                <div className={`p-4 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2 ${
                  profileNotice.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{profileNotice.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-6">
                
                {/* Personal Information */}
                <div>
                  <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-4">Personal Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (bKash/Nagad)</label>
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Saved Default Payout Accounts */}
                <div>
                  <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-4">Saved Default Cashout Accounts</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Default bKash Personal Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 01711223344"
                        value={bkashInput}
                        onChange={(e) => setBkashInput(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Default Nagad Personal Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 01811223344"
                        value={nagadInput}
                        onChange={(e) => setNagadInput(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Default Rocket Account Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 019112233447"
                        value={rocketInput}
                        onChange={(e) => setRocketInput(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Default Binance USDT Address (TRC20)</label>
                      <input
                        type="text"
                        placeholder="e.g. TXYZ123456789..."
                        value={usdtInput}
                        onChange={(e) => setUsdtInput(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-dark-border flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs shadow-lg shadow-brand-500/20 hover:brightness-110 transition-all cursor-pointer"
                  >
                    Save Profile & Accounts
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
        {activeSection === 'withdrawals' && (
          <div className="glass-card rounded-2xl border border-dark-border overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-dark-border">
              <h3 className="text-base sm:text-lg font-bold text-white">Cashout / Withdrawal Requests</h3>
              <p className="text-xs text-slate-400">Track payouts sent to your bKash, Nagad, or Crypto address.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-dark-panel/60 border-b border-dark-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Method & Account</th>
                    <th className="py-3.5 px-4 sm:px-6">Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-4 sm:px-6">Transaction ID</th>
                    <th className="py-3.5 px-4 sm:px-6">Requested Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border text-xs">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No withdrawal requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-dark-hover/50 transition-all">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-white uppercase flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-brand-400 shrink-0" />
                            <span>{w.method}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 break-all">{w.accountDetails}</div>
                        </td>

                        <td className="py-4 px-4 sm:px-6 font-extrabold text-emerald-400 text-sm">
                          ৳{w.amount}
                        </td>

                        <td className="py-4 px-4 sm:px-6">
                          {w.status === 'COMPLETED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Paid / Completed
                            </span>
                          )}
                          {w.status === 'PENDING' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Processing
                            </span>
                          )}
                          {w.status === 'REJECTED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Rejected
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 sm:px-6 font-mono text-slate-300">
                          {w.transactionId ? (
                            <span className="bg-dark-bg px-2 py-1 rounded border border-dark-border font-bold text-emerald-400 text-[11px]">
                              {w.transactionId}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Pending Admin release</span>
                          )}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-slate-400 font-mono text-[11px]">
                          {new Date(w.requestedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Withdrawal Request Modal Popup */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-3xl border border-brand-500/30 p-6 shadow-2xl bg-dark-card">
            
            <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-4">
              <h3 className="font-bold text-lg text-white">Withdraw Funds</h3>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {withdrawNotice && (
              <div className={`p-3 rounded-xl mb-4 text-xs font-semibold ${
                withdrawNotice.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {withdrawNotice.text}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (BDT)</label>
                <input
                  type="number"
                  min="100"
                  max={availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-brand-500"
                />
                <span className="text-[10px] text-slate-400">Available: ৳{availableBalance}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => {
                    const m = e.target.value as PaymentMethod;
                    setWithdrawMethod(m);
                    if (m === 'bkash' && currentUser?.defaultBkash) setAccountDetails(currentUser.defaultBkash);
                    else if (m === 'nagad' && currentUser?.defaultNagad) setAccountDetails(currentUser.defaultNagad);
                    else if (m === 'rocket' && currentUser?.defaultRocket) setAccountDetails(currentUser.defaultRocket);
                    else if (m === 'usdt_trc20' && currentUser?.defaultUsdt) setAccountDetails(currentUser.defaultUsdt);
                  }}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-brand-500"
                >
                  {payoutMethods.filter(pm => pm.status === 'ACTIVE').map(pm => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name} (Min ৳{pm.minAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Number / Address</label>
                <input
                  type="text"
                  placeholder="01700000000 or USDT Address"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              {/* Simulated Mobile SMS Payout Preview Card */}
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-pink-500/30 font-mono text-[11px] text-pink-300 space-y-1 my-3">
                <div className="flex items-center gap-1.5 font-bold text-pink-400">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>bKash / SMS Alert Preview:</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-snug">
                  "You have received <strong>৳{withdrawAmount}</strong> from <strong>MailVault Direct</strong>. TrxID <span className="text-emerald-400">9K7X81MLQ2</span>. Fee ৳0.00."
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-dark-panel hover:bg-dark-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20"
                >
                  Confirm Request ৳{withdrawAmount}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
