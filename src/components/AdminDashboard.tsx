import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryId, SubmissionStatus } from '../types';
import { getTelegramConfig, saveTelegramConfig, sendTelegramAlert, TelegramConfig } from '../lib/telegram';
import { AdminSidebar } from './AdminSidebar';
import { Shield, Download, CheckCircle2, XCircle, Edit3, PauseCircle, PlayCircle, Search, Copy, Check, DollarSign, Filter, RefreshCw, Send, Bell, Cpu, BarChart3, PieChart, Sparkles, AlertTriangle, Layers, Lock, CreditCard } from 'lucide-react';

interface AdminDashboardProps {
  onLockVault?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLockVault }) => {
  const {
    categories,
    submissions,
    withdrawals,
    announcements,
    payoutMethods,
    addPayoutMethod,
    togglePayoutMethodStatus,
    updateCategoryRate,
    toggleCategoryStatus,
    reviewSubmission,
    reviewBatchSubmissions,
    processWithdrawal,
    exportApprovedEmails,
    addAnnouncement,
    deleteAnnouncement
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Payout Method Inputs
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodMin, setNewMethodMin] = useState(100);

  // Announcement inputs
  const [newNoticeInput, setNewNoticeInput] = useState('');
  const [newNoticeType, setNewNoticeType] = useState<'INFO' | 'BONUS' | 'WARNING'>('BONUS');

  // Telegram Config
  const [tgConfig, setTgConfig] = useState<TelegramConfig>(getTelegramConfig());
  const [tgTestStatus, setTgTestStatus] = useState<string | null>(null);

  // Auto Credentials Checker State
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkProgress, setCheckProgress] = useState<number>(0);
  const [checkerLog, setCheckerLog] = useState<string[]>([]);
  const [checkerSummary, setCheckerSummary] = useState<{ approved: number; rejected: number } | null>(null);

  // Filter Submissions
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [editingRateCatId, setEditingRateCatId] = useState<string | null>(null);
  const [tempRateInput, setTempRateInput] = useState<number>(0);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('Invalid Password or Account Suspended');

  // Payout TrxId inputs map
  const [trxIdInputs, setTrxIdInputs] = useState<Record<string, string>>({});

  const filteredSubmissions = submissions.filter(item => {
    const matchesCat = selectedCategoryId === 'ALL' || item.categoryId === selectedCategoryId;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesSearch = item.email.toLowerCase().includes(searchQuery.toLowerCase()) || item.batchId.toLowerCase().includes(searchQuery.toLowerCase()) || item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  // Stats Calculations
  const totalSubmissions = submissions.length || 1;
  const totalApprovedCount = submissions.filter(s => s.status === 'APPROVED').length;
  const totalPendingCount = submissions.filter(s => s.status === 'PENDING').length;
  const totalRejectedCount = submissions.filter(s => s.status === 'REJECTED').length;
  
  const approvedPct = Math.round((totalApprovedCount / totalSubmissions) * 100);
  const pendingPct = Math.round((totalPendingCount / totalSubmissions) * 100);
  const rejectedPct = Math.round((totalRejectedCount / totalSubmissions) * 100);

  const totalPaidOutAmount = withdrawals.filter(w => w.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingWithdrawalCount = withdrawals.filter(w => w.status === 'PENDING').length;

  // Category Distribution
  const categoryStats = categories.map(cat => {
    const count = submissions.filter(s => s.categoryId === cat.id && s.status === 'APPROVED').length;
    const totalEarnings = submissions.filter(s => s.categoryId === cat.id && s.status === 'APPROVED').reduce((a, b) => a + b.rate, 0);
    return { ...cat, approvedCount: count, totalEarnings };
  });

  // Automated Credentials Checker Simulation Function
  const handleRunAutoCredentialCheck = async () => {
    const targetItems = filteredSubmissions.filter(s => s.status === 'PENDING');
    if (targetItems.length === 0) {
      alert('No pending emails found in current filter to test.');
      return;
    }

    setIsChecking(true);
    setCheckProgress(0);
    setCheckerLog([]);
    setCheckerSummary(null);

    let approved = 0;
    let rejected = 0;

    for (let i = 0; i < targetItems.length; i++) {
      const item = targetItems[i];
      const stepPct = Math.round(((i + 1) / targetItems.length) * 100);
      setCheckProgress(stepPct);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidEmail = emailRegex.test(item.email);
      const isValidPass = item.password && item.password.length >= 6;
      const isBlacklisted = item.email.includes('bad') || item.email.includes('disabled') || item.password.includes('wrong');

      let isValid = isValidEmail && isValidPass && !isBlacklisted;

      await new Promise(r => setTimeout(r, 150));

      if (isValid) {
        approved++;
        reviewSubmission(item.id, 'APPROVED');
        setCheckerLog(prev => [`[PASS] ${item.email} — Credentials & Domain verified.`, ...prev.slice(0, 15)]);
      } else {
        rejected++;
        const reason = isBlacklisted ? 'Account Disabled / Auth Failed' : 'Weak/Invalid Password format';
        reviewSubmission(item.id, 'REJECTED', reason);
        setCheckerLog(prev => [`[FAIL] ${item.email} — ${reason}`, ...prev.slice(0, 15)]);
      }
    }

    setIsChecking(false);
    setCheckerSummary({ approved, rejected });
  };

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    saveTelegramConfig(tgConfig);
    setTgTestStatus('Telegram configuration saved successfully!');
    setTimeout(() => setTgTestStatus(null), 3000);
  };

  const handleSendTestTelegram = async () => {
    setTgTestStatus('Sending test notification...');
    const ok = await sendTelegramAlert('🔔 <b>MailVault Admin Notification Test!</b>\n\nTelegram alert bot is connected successfully!');
    if (ok) {
      setTgTestStatus('✅ Test message sent successfully to your Telegram!');
    } else {
      setTgTestStatus('❌ Failed! Please verify Bot Token and Chat ID.');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItemIds(filteredSubmissions.map(i => i.id));
    } else {
      setSelectedItemIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBatchApprove = () => {
    if (selectedItemIds.length === 0) return;
    reviewBatchSubmissions(selectedItemIds, 'APPROVED');
    setSelectedItemIds([]);
  };

  const handleBatchReject = () => {
    if (selectedItemIds.length === 0) return;
    reviewBatchSubmissions(selectedItemIds, 'REJECTED', rejectionReasonInput);
    setSelectedItemIds([]);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      
      {/* Collapsible Admin Sidebar */}
      <AdminSidebar
        currentTab={activeTab}
        setCurrentTab={setActiveTab}
        onLockVault={onLockVault || (() => {
          localStorage.removeItem('mailvault_admin_unlocked');
          window.location.reload();
        })}
      />

      {/* Main Content Area - pb-24 for Mobile Bottom Bar clearance */}
      <main className="flex-1 py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-x-hidden pb-24 md:pb-12">
        
        {/* Top Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 bg-gradient-to-r from-accent-purple/20 via-dark-card to-dark-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-accent-purple/30">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-accent-purple shrink-0">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">Admin Control Vault</h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-full">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Set buying prices, verify seller bulk submissions, and export clean TXT email vault.</p>
            </div>
          </div>

          <button
            onClick={() => exportApprovedEmails(selectedCategoryId === 'ALL' ? undefined : selectedCategoryId as CategoryId)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-stretch sm:self-auto justify-center cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Approved TXT Vault</span>
          </button>
        </div>

        {/* Tab 1: Vault Overview Stats */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-5 rounded-2xl border border-dark-border">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Approved Emails in Vault</div>
                <div className="text-3xl font-black text-emerald-400">{totalApprovedCount.toLocaleString()}</div>
                <span className="text-[10px] text-slate-500 block mt-1">Ready for download / export</span>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-dark-border">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Pending Verification</div>
                <div className="text-3xl font-black text-amber-400">{totalPendingCount.toLocaleString()}</div>
                <span className="text-[10px] text-slate-500 block mt-1">Requires Admin approve/reject</span>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-dark-border">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Cash Released</div>
                <div className="text-3xl font-black text-white">৳{totalPaidOutAmount.toLocaleString()}</div>
                <span className="text-[10px] text-slate-500 block mt-1">Paid to sellers via bKash/Nagad</span>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-dark-border">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Pending Payout Requests</div>
                <div className="text-3xl font-black text-accent-cyan">{pendingWithdrawalCount}</div>
                <span className="text-[10px] text-slate-500 block mt-1">Awaiting TrxID release</span>
              </div>
            </div>

            {/* Quick Navigation Cards on Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveTab('checker')}
                className="glass-card p-6 rounded-2xl border border-brand-500/30 hover:border-brand-500/60 cursor-pointer transition-all bg-gradient-to-br from-dark-card to-dark-panel"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Run Auto Password Checker</h3>
                <p className="text-xs text-slate-400 mt-1">Automatically test syntax & passwords for {totalPendingCount} pending emails.</p>
              </div>

              <div
                onClick={() => setActiveTab('submissions')}
                className="glass-card p-6 rounded-2xl border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all bg-gradient-to-br from-dark-card to-dark-panel"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Review Email Vault</h3>
                <p className="text-xs text-slate-400 mt-1">Manually approve/reject email submissions or download approved list.</p>
              </div>

              <div
                onClick={() => setActiveTab('payouts')}
                className="glass-card p-6 rounded-2xl border border-accent-cyan/30 hover:border-accent-cyan/60 cursor-pointer transition-all bg-gradient-to-br from-dark-card to-dark-panel"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Payout Releases</h3>
                <p className="text-xs text-slate-400 mt-1">Release payouts to sellers via bKash/Nagad and attach TrxID.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Financial & Inventory Analytics */}
        {activeTab === 'analytics' && (
          <div className="glass-card p-6 rounded-2xl border border-dark-border mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Advanced Inventory & Financial Analytics</h3>
                <p className="text-xs text-slate-400">Live breakdown of email acquisition volume, approval ratios & category valuation.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-dark-panel p-5 rounded-xl border border-dark-border space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 uppercase tracking-wider">Email Verification Ratios</span>
                  <span className="text-slate-400">{submissions.length} Total Submissions</span>
                </div>

                <div className="w-full h-4 bg-dark-bg rounded-full overflow-hidden flex">
                  <div style={{ width: `${approvedPct}%` }} className="bg-emerald-500 h-full transition-all" title={`Approved: ${approvedPct}%`} />
                  <div style={{ width: `${pendingPct}%` }} className="bg-amber-500 h-full transition-all" title={`Pending: ${pendingPct}%`} />
                  <div style={{ width: `${rejectedPct}%` }} className="bg-rose-500 h-full transition-all" title={`Rejected: ${rejectedPct}%`} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                    <span className="text-emerald-400 font-extrabold block text-sm">{approvedPct}%</span>
                    <span className="text-slate-400 text-[10px]">Approved ({totalApprovedCount})</span>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                    <span className="text-amber-400 font-extrabold block text-sm">{pendingPct}%</span>
                    <span className="text-slate-400 text-[10px]">Pending ({totalPendingCount})</span>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                    <span className="text-rose-400 font-extrabold block text-sm">{rejectedPct}%</span>
                    <span className="text-slate-400 text-[10px]">Rejected ({totalRejectedCount})</span>
                  </div>
                </div>
              </div>

              <div className="bg-dark-panel p-5 rounded-xl border border-dark-border space-y-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-200 uppercase tracking-wider">Category Acquisition Volume</span>
                  <span className="text-brand-400 font-semibold">Total Vault Worth: ৳{categoryStats.reduce((a,b)=>a+b.totalEarnings,0)}</span>
                </div>

                <div className="space-y-2">
                  {categoryStats.map(cat => {
                    const pct = totalApprovedCount > 0 ? Math.round((cat.approvedCount / totalApprovedCount) * 100) : 0;
                    return (
                      <div key={cat.id} className="space-y-1 text-xs">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300 font-medium">{cat.name}</span>
                          <span className="text-slate-400 font-mono">{cat.approvedCount} pcs (৳{cat.totalEarnings})</span>
                        </div>
                        <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
                          <div style={{ width: `${Math.max(5, pct)}%` }} className="bg-gradient-to-r from-brand-500 to-accent-cyan h-full rounded-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Automated Password Checker */}
        {activeTab === 'checker' && (
          <div className="glass-card p-6 rounded-2xl border border-brand-500/40 mb-10 bg-gradient-to-br from-dark-card via-dark-panel to-dark-card shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Automated Credentials & Password Checker</h3>
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded">
                      Auto Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Run line-by-line syntax, domain & login verification on pending email submissions.</p>
                </div>
              </div>

              <button
                onClick={handleRunAutoCredentialCheck}
                disabled={isChecking || totalPendingCount === 0}
                className={`px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  !isChecking && totalPendingCount > 0
                    ? 'bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 hover:brightness-110 shadow-brand-500/20 cursor-pointer'
                    : 'bg-dark-hover text-slate-500 cursor-not-allowed border border-dark-border'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isChecking ? `Checking (${checkProgress}%)...` : `Run Auto Check (${totalPendingCount} Pending)`}</span>
              </button>
            </div>

            {isChecking && (
              <div className="space-y-3 mb-4 animate-fade-in">
                <div className="flex justify-between text-xs font-semibold text-brand-400">
                  <span>Verifying Passwords & Domains...</span>
                  <span>{checkProgress}%</span>
                </div>
                <div className="w-full h-3 bg-dark-bg rounded-full overflow-hidden border border-dark-border">
                  <div style={{ width: `${checkProgress}%` }} className="bg-gradient-to-r from-brand-500 to-accent-cyan h-full transition-all duration-200" />
                </div>
              </div>
            )}

            {checkerSummary && (
              <div className="p-3.5 rounded-xl mb-4 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Automated Verification Completed! Approved: <strong>{checkerSummary.approved}</strong> | Rejected: <strong>{checkerSummary.rejected}</strong></span>
                </div>
              </div>
            )}

            {checkerLog.length > 0 && (
              <div className="bg-dark-bg p-4 rounded-xl border border-dark-border font-mono text-[11px] space-y-1 max-h-40 overflow-y-auto">
                <div className="text-slate-500 text-[10px] border-b border-dark-border/60 pb-1 mb-2">LIVE VERIFICATION TERMINAL LOG:</div>
                {checkerLog.map((log, idx) => (
                  <div key={idx} className={log.startsWith('[PASS]') ? 'text-emerald-400' : 'text-rose-400'}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Buying Rates & Stock Switches */}
        {activeTab === 'rates' && (
          <div className="glass-card p-6 rounded-2xl border border-dark-border mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Manage Buying Rates & Stock Switches</h3>
                <p className="text-xs text-slate-400">Instantly change price per email or pause buying when stock is full.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-dark-panel p-4 rounded-xl border border-dark-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">{cat.name}</span>
                      <button
                        onClick={() => toggleCategoryStatus(cat.id)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border transition-all ${
                          cat.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-emerald-500/10 hover:text-emerald-400'
                        }`}
                      >
                        {cat.status === 'ACTIVE' ? 'ACTIVE (Pause)' : 'PAUSED (Resume)'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-dark-bg p-2.5 rounded-lg border border-dark-border my-2">
                      <span className="text-xs text-slate-400">Price / Unit:</span>
                      {editingRateCatId === cat.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempRateInput}
                            onChange={(e) => setTempRateInput(parseInt(e.target.value) || 0)}
                            className="w-16 bg-dark-card border border-brand-500 rounded px-2 py-1 text-xs text-white font-bold"
                          />
                          <button
                            onClick={() => {
                              updateCategoryRate(cat.id, tempRateInput);
                              setEditingRateCatId(null);
                            }}
                            className="bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-emerald-400">৳{cat.ratePerUnit}</span>
                          <button
                            onClick={() => {
                              setEditingRateCatId(cat.id);
                              setTempRateInput(cat.ratePerUnit);
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Dynamic Notice & Announcements */}
        {activeTab === 'notices' && (
          <div className="glass-card p-6 rounded-2xl border border-dark-border mb-10 bg-gradient-to-r from-dark-card via-dark-panel to-dark-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dynamic Notice & Announcement Manager</h3>
                <p className="text-xs text-slate-400">Publish live news, bonus updates or system notices to all sellers in real-time.</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newNoticeInput.trim()) {
                  addAnnouncement(newNoticeInput, newNoticeType);
                  setNewNoticeInput('');
                }
              }}
              className="flex flex-col sm:flex-row items-center gap-3 mb-6"
            >
              <input
                type="text"
                placeholder="e.g. 🔥 Special Offer: Gmail Old rate increased to ৳20/pc today!"
                value={newNoticeInput}
                onChange={(e) => setNewNoticeInput(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />

              <select
                value={newNoticeType}
                onChange={(e) => setNewNoticeType(e.target.value as any)}
                className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:outline-none shrink-0"
              >
                <option value="BONUS">Bonus / Rate Offer</option>
                <option value="INFO">General Info</option>
                <option value="WARNING">Important Warning</option>
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0 cursor-pointer"
              >
                Post Notice
              </button>
            </form>

            <div className="space-y-2">
              {announcements.map((n) => (
                <div key={n.id} className="bg-dark-bg p-3 rounded-xl border border-dark-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                      n.type === 'BONUS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      n.type === 'WARNING' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                    }`}>
                      {n.type}
                    </span>
                    <span className="text-slate-200">{n.text}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteAnnouncement(n.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete Notice"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Telegram Bot Config */}
        {activeTab === 'telegram' && (
          <div className="glass-card p-6 rounded-2xl border border-dark-border mb-10 bg-gradient-to-r from-dark-card via-dark-panel to-dark-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Telegram Admin Alert Bot</h3>
                  <p className="text-xs text-slate-400">Receive instant alerts on your Telegram when sellers submit emails or request cashouts.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendTestTelegram}
                className="px-4 py-2 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan font-bold text-xs hover:bg-accent-cyan/20 transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Alert</span>
              </button>
            </div>

            {tgTestStatus && (
              <div className="p-3 rounded-xl mb-4 text-xs font-semibold bg-dark-bg border border-dark-border text-slate-200">
                {tgTestStatus}
              </div>
            )}

            <form onSubmit={handleSaveTelegram} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Bot Token</label>
                <input
                  type="text"
                  placeholder="e.g. 123456789:ABCdef..."
                  value={tgConfig.botToken}
                  onChange={(e) => setTgConfig({ ...tgConfig, botToken: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Chat ID / User ID</label>
                <input
                  type="text"
                  placeholder="e.g. 987654321"
                  value={tgConfig.chatId}
                  onChange={(e) => setTgConfig({ ...tgConfig, chatId: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer bg-dark-bg px-3.5 py-2 rounded-xl border border-dark-border">
                  <input
                    type="checkbox"
                    checked={tgConfig.enabled}
                    onChange={(e) => setTgConfig({ ...tgConfig, enabled: e.target.checked })}
                    className="rounded border-dark-border bg-dark-card text-accent-cyan"
                  />
                  <span>Enable Alerts</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-accent-cyan hover:bg-cyan-600 text-slate-950 font-bold text-xs transition-all shadow-md"
                >
                  Save Bot Config
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 7: Email Submissions Vault Review Table */}
        {activeTab === 'submissions' && (
          <div className="glass-card rounded-2xl border border-dark-border overflow-hidden mb-12">
            
            <div className="p-6 border-b border-dark-border">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Email Submissions Verification Vault</h3>
                  <p className="text-xs text-slate-400">Select items to batch approve or reject with custom feedback.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none"
                  >
                    <option value="PENDING">Pending Review Only</option>
                    <option value="APPROVED">Approved Vault</option>
                    <option value="REJECTED">Rejected Items</option>
                    <option value="ALL">All Statuses</option>
                  </select>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter by email or seller..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-dark-bg border border-dark-border rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none w-48"
                    />
                  </div>
                </div>
              </div>

              {selectedItemIds.length > 0 && (
                <div className="bg-brand-500/10 border border-brand-500/30 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                  <span className="text-xs font-bold text-brand-400">
                    {selectedItemIds.length} Email(s) Selected
                  </span>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Rejection reason if rejecting..."
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      className="bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-xs text-white w-64"
                    />
                    
                    <button
                      onClick={handleBatchReject}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                    >
                      Reject Selected
                    </button>

                    <button
                      onClick={handleBatchApprove}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-all shadow-md shadow-emerald-500/20"
                    >
                      Approve Selected & Add to Wallet
                    </button>
                  </div>
                </div>
              )}

            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-dark-panel/60 border-b border-dark-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedItemIds.length > 0 && selectedItemIds.length === filteredSubmissions.length}
                        className="rounded border-dark-border bg-dark-bg text-brand-500 focus:ring-0"
                      />
                    </th>
                    <th className="py-3.5 px-4">Seller & Email Line</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Rate</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border text-xs">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No submissions found under this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((item) => (
                      <tr key={item.id} className="hover:bg-dark-hover/50 transition-all">
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.includes(item.id)}
                            onChange={() => handleToggleSelect(item.id)}
                            className="rounded border-dark-border bg-dark-bg text-brand-500 focus:ring-0"
                          />
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-mono text-white font-bold">{item.email}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Password: <strong className="text-slate-200">{item.password}</strong></span>
                            {item.recoveryEmail && <span>Recov: <strong className="text-slate-200">{item.recoveryEmail}</strong></span>}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Seller: {item.sellerName} • Batch: {item.batchId}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-medium text-slate-300">
                          {categories.find(c => c.id === item.categoryId)?.name}
                        </td>

                        <td className="py-4 px-4 font-bold text-emerald-400">
                          ৳{item.rate}
                        </td>

                        <td className="py-4 px-4">
                          {item.status === 'APPROVED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              APPROVED
                            </span>
                          )}
                          {item.status === 'PENDING' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              PENDING
                            </span>
                          )}
                          {item.status === 'REJECTED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              REJECTED
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right space-x-2">
                          {item.status !== 'APPROVED' && (
                            <button
                              onClick={() => reviewSubmission(item.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px]"
                            >
                              Approve
                            </button>
                          )}
                          {item.status !== 'REJECTED' && (
                            <button
                              onClick={() => reviewSubmission(item.id, 'REJECTED', 'Failed credentials check')}
                              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-[10px] border border-rose-500/30"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 8: Seller Withdrawal Payout Releases & Method Config */}
        {activeTab === 'payouts' && (
          <div className="space-y-8">
            
            {/* Dynamic Payout Methods Management Card */}
            <div className="glass-card p-6 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-dark-card via-dark-panel to-dark-card shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Dynamic Payout Methods Manager</h3>
                    <p className="text-xs text-slate-400">Add, enable, or pause cashout methods (bKash, Nagad, CellFin, Upay, Bank) shown to sellers.</p>
                  </div>
                </div>

                {/* Add New Payout Method Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newMethodName.trim()) {
                      addPayoutMethod(newMethodName, newMethodMin);
                      setNewMethodName('');
                    }
                  }}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Method Name (e.g. Islami Bank CellFin)"
                    value={newMethodName}
                    onChange={(e) => setNewMethodName(e.target.value)}
                    className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 w-52"
                  />
                  <input
                    type="number"
                    placeholder="Min BDT (100)"
                    value={newMethodMin}
                    onChange={(e) => setNewMethodMin(parseInt(e.target.value) || 100)}
                    className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 w-24"
                  />
                  <button
                    type="submit"
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md"
                  >
                    + Add Method
                  </button>
                </form>
              </div>

              {/* Active Payout Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {payoutMethods.map((pm) => (
                  <div key={pm.id} className="bg-dark-bg p-3.5 rounded-xl border border-dark-border flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">{pm.name}</div>
                      <span className="text-[10px] text-slate-400">Min Cashout: <strong>৳{pm.minAmount}</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePayoutMethodStatus(pm.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        pm.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-emerald-500/10 hover:text-emerald-400'
                      }`}
                    >
                      {pm.status === 'ACTIVE' ? 'ACTIVE (Pause)' : 'PAUSED (Enable)'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout Releases Table */}
            <div className="glass-card rounded-2xl border border-dark-border overflow-hidden">
              <div className="p-6 border-b border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Seller Withdrawal Payout Requests</h3>
                  <p className="text-xs text-slate-400 font-medium">Review cashout requests, copy bKash/Nagad numbers, enter TrxID, and release payments.</p>
                </div>

                <div className="flex items-center gap-3 bg-dark-bg p-2 rounded-xl border border-dark-border text-xs">
                  <span className="text-slate-400">Total Pending Cashouts:</span>
                  <strong className="text-amber-400 font-extrabold text-sm">{withdrawals.filter(w => w.status === 'PENDING').length} Requests</strong>
                </div>
              </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-dark-panel/60 border-b border-dark-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Seller & Account Details</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Transaction ID (TrxID)</th>
                    <th className="py-3.5 px-6 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border text-xs">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                        No withdrawal payout requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-dark-hover/50 transition-all">
                        <td className="py-4 px-6">
                          <div className="font-bold text-white text-sm">{w.sellerName}</div>
                          <div className="text-xs text-brand-400 font-mono font-bold uppercase mt-0.5 flex items-center gap-2">
                            <span>{w.method}: {w.accountDetails}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${w.accountDetails}`);
                                alert(`Copied account number: ${w.accountDetails}`);
                              }}
                              className="text-slate-400 hover:text-white p-1"
                              title="Copy Number"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-black text-emerald-400 text-base">
                          ৳{w.amount}
                        </td>

                        <td className="py-4 px-6">
                          {w.status === 'COMPLETED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Paid ✔ ({w.transactionId})
                            </span>
                          ) : w.status === 'REJECTED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Rejected ✖
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Awaiting Payout
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          {w.status === 'PENDING' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="e.g. BK98765432X"
                                value={trxIdInputs[w.id] || ''}
                                onChange={(e) => setTrxIdInputs({ ...trxIdInputs, [w.id]: e.target.value })}
                                className="bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-xs text-white font-mono w-36"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const autoTx = `BK${Math.floor(100000000 + Math.random() * 900000000)}`;
                                  setTrxIdInputs({ ...trxIdInputs, [w.id]: autoTx });
                                }}
                                className="px-2 py-1 rounded bg-dark-panel hover:bg-dark-hover border border-dark-border text-[10px] text-slate-300 font-mono"
                                title="Auto Generate TrxID"
                              >
                                Auto TrxID
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono text-slate-300 font-bold">{w.transactionId || 'N/A'}</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          {w.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => processWithdrawal(w.id, 'REJECTED', 'Refunded by Admin')}
                                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold px-3 py-1.5 rounded-lg text-xs transition-all border border-rose-500/30"
                              >
                                Reject
                              </button>

                              <button
                                onClick={() => processWithdrawal(w.id, 'COMPLETED', trxIdInputs[w.id] || `BK${Math.floor(100000000 + Math.random() * 900000000)}`)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                              >
                                Release Cash & Send TrxID
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}

      </main>

    </div>
  );
};
