import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { Wallet, ArrowDownRight, Clock, CheckCircle2, XCircle, Search, Copy, Check, Sparkles, DollarSign, CreditCard } from 'lucide-react';

interface SellerDashboardProps {
  openSubmitModal: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ openSubmitModal }) => {
  const {
    availableBalance,
    pendingBalance,
    totalWithdrawn,
    submissions,
    withdrawals,
    categories,
    requestWithdrawal
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Withdraw Modal State
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(availableBalance);
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>('bkash');
  const [accountDetails, setAccountDetails] = useState('');
  const [withdrawNotice, setWithdrawNotice] = useState<{ success: boolean; text: string } | null>(null);

  // Filter Submissions for current seller
  const mySubmissions = submissions.filter(s => s.sellerId === 'usr-seller-1');
  const filteredSubmissions = mySubmissions.filter(s => {
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase()) || s.batchId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawNotice(null);
    const res = requestWithdrawal(withdrawAmount, withdrawMethod, accountDetails);
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

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Seller Dashboard & Wallet</h1>
          <p className="text-sm text-slate-400">Track your submitted emails, live approval status, and payout history.</p>
        </div>

        <button
          onClick={openSubmitModal}
          className="bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Submit New Batch Emails</span>
        </button>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Available Balance Card */}
        <div className="glass-card p-6 rounded-2xl border border-brand-500/40 relative overflow-hidden bg-gradient-to-br from-dark-card via-dark-panel to-dark-card shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Ready to Withdraw
            </span>
          </div>

          <div className="text-xs text-slate-400 font-medium">Available Wallet Balance</div>
          <div className="text-3xl font-black text-white mt-1">৳{availableBalance.toLocaleString()}</div>

          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={() => {
                setWithdrawAmount(availableBalance);
                setIsWithdrawOpen(true);
              }}
              disabled={availableBalance < 100}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                availableBalance >= 100
                  ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-dark-hover text-slate-500 cursor-not-allowed border border-dark-border'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Withdraw Cash (Min ৳100)</span>
            </button>
          </div>
        </div>

        {/* Pending Verification Card */}
        <div className="glass-card p-6 rounded-2xl border border-dark-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              In Review
            </span>
          </div>

          <div className="text-xs text-slate-400 font-medium">Pending Verification</div>
          <div className="text-3xl font-black text-amber-400 mt-1">৳{pendingBalance.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-6">
            Admin verifies submitted emails within 15-30 minutes.
          </p>
        </div>

        {/* Total Withdrawn Card */}
        <div className="glass-card p-6 rounded-2xl border border-dark-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
              Completed
            </span>
          </div>

          <div className="text-xs text-slate-400 font-medium">Total Paid Out</div>
          <div className="text-3xl font-black text-white mt-1">৳{totalWithdrawn.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-6">
            Successfully received via bKash / Nagad / Rocket.
          </p>
        </div>

      </div>

      {/* Email Submissions History Section */}
      <div className="glass-card rounded-2xl border border-dark-border overflow-hidden mb-12">
        
        {/* Table Controls */}
        <div className="p-6 border-b border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Your Submitted Email Items</h3>
            <p className="text-xs text-slate-400">View exact status, batch IDs and approved rate calculations.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search email or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-bg border border-dark-border rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500 w-48 sm:w-60"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-dark-bg p-1 rounded-xl border border-dark-border">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-panel/60 border-b border-dark-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Batch ID / Email</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Rate</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Submitted</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
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
                    <td className="py-4 px-6">
                      <div className="font-mono text-white font-medium flex items-center gap-2">
                        <span>{item.email}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="bg-dark-bg px-1.5 py-0.5 rounded border border-dark-border">{item.batchId}</span>
                        {item.recoveryEmail && <span>Recov: {item.recoveryEmail}</span>}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-300">
                      {getCategoryName(item.categoryId)}
                    </td>

                    <td className="py-4 px-6 font-bold text-emerald-400">
                      ৳{item.rate}
                    </td>

                    <td className="py-4 px-6">
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

                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleCopy(`${item.email}:${item.password}${item.recoveryEmail ? `:${item.recoveryEmail}` : ''}`, item.id)}
                        className="p-1.5 rounded-lg bg-dark-bg hover:bg-dark-panel border border-dark-border text-slate-400 hover:text-white transition-all inline-flex items-center gap-1 text-[11px]"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy Line'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal History Section */}
      <div className="glass-card rounded-2xl border border-dark-border overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <h3 className="text-lg font-bold text-white">Cashout / Withdrawal Requests</h3>
          <p className="text-xs text-slate-400">Track payouts sent to your bKash, Nagad, or Crypto address.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-panel/60 border-b border-dark-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Method & Account</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Transaction ID</th>
                <th className="py-3.5 px-6">Requested Date</th>
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
                    <td className="py-4 px-6">
                      <div className="font-bold text-white uppercase flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-brand-400" />
                        <span>{w.method}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{w.accountDetails}</div>
                    </td>

                    <td className="py-4 px-6 font-extrabold text-emerald-400 text-sm">
                      ৳{w.amount}
                    </td>

                    <td className="py-4 px-6">
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

                    <td className="py-4 px-6 font-mono text-slate-300">
                      {w.transactionId ? (
                        <span className="bg-dark-bg px-2 py-1 rounded border border-dark-border font-bold text-emerald-400 text-[11px]">
                          {w.transactionId}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Pending Admin release</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {new Date(w.requestedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  onChange={(e) => setWithdrawMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-brand-500"
                >
                  <option value="bkash">bKash Personal</option>
                  <option value="nagad">Nagad Personal</option>
                  <option value="rocket">Rocket</option>
                  <option value="usdt_trc20">Binance USDT (TRC20)</option>
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
