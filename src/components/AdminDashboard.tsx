import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryId, SubmissionStatus } from '../types';
import { Shield, Download, CheckCircle2, XCircle, Edit3, PauseCircle, PlayCircle, Search, Copy, Check, DollarSign, Filter, RefreshCw } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    categories,
    submissions,
    withdrawals,
    updateCategoryRate,
    toggleCategoryStatus,
    reviewSubmission,
    reviewBatchSubmissions,
    processWithdrawal,
    exportApprovedEmails
  } = useApp();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [editingRateCatId, setEditingRateCatId] = useState<string | null>(null);
  const [tempRateInput, setTempRateInput] = useState<number>(0);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('Invalid Password or Account Suspended');

  // Payout TrxId inputs map
  const [trxIdInputs, setTrxIdInputs] = useState<Record<string, string>>({});

  // Filter Submissions
  const filteredSubmissions = submissions.filter(item => {
    const matchesCat = selectedCategoryId === 'ALL' || item.categoryId === selectedCategoryId;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesSearch = item.email.toLowerCase().includes(searchQuery.toLowerCase()) || item.batchId.toLowerCase().includes(searchQuery.toLowerCase()) || item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  // Calculate Admin Stats
  const totalApprovedCount = submissions.filter(s => s.status === 'APPROVED').length;
  const totalPendingCount = submissions.filter(s => s.status === 'PENDING').length;
  const totalPaidOutAmount = withdrawals.filter(w => w.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingWithdrawalCount = withdrawals.filter(w => w.status === 'PENDING').length;

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
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-accent-purple/20 via-dark-card to-dark-card p-6 rounded-3xl border border-accent-purple/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-accent-purple">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Admin Control & Vault</h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-full">
                Single Buyer Mode
              </span>
            </div>
            <p className="text-xs text-slate-300">Set buying prices, verify seller bulk submissions, and export clean TXT email vault.</p>
          </div>
        </div>

        {/* Bulk Export Button */}
        <button
          onClick={() => exportApprovedEmails(selectedCategoryId === 'ALL' ? undefined : selectedCategoryId as CategoryId)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Approved TXT Vault</span>
        </button>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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

      {/* Category Buying Rate & Stock Control Panel */}
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
                    {cat.status === 'ACTIVE' ? 'ACTIVE (Click to Pause)' : 'PAUSED (Click to Resume)'}
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

      {/* Main Email Submissions Review Vault */}
      <div className="glass-card rounded-2xl border border-dark-border overflow-hidden mb-12">
        
        <div className="p-6 border-b border-dark-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Email Submissions Verification Vault</h3>
              <p className="text-xs text-slate-400">Select items to batch approve or reject with custom feedback.</p>
            </div>

            {/* Filter & Controls */}
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

          {/* Batch Actions Bar */}
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

        {/* Submissions Review Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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

      {/* Seller Withdrawal Requests Approval Panel */}
      <div className="glass-card rounded-2xl border border-dark-border overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <h3 className="text-lg font-bold text-white">Seller Withdrawal Payout Releases</h3>
          <p className="text-xs text-slate-400">Review payout requests, transfer cash via bKash/Nagad, and enter Transaction ID (TrxID).</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-panel/60 border-b border-dark-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Seller & Account Details</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Enter Transaction ID (TrxID)</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs">
              {withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-dark-hover/50 transition-all">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white">{w.sellerName}</div>
                    <div className="text-[11px] text-brand-400 font-mono font-semibold uppercase">{w.method}: {w.accountDetails}</div>
                  </td>

                  <td className="py-4 px-6 font-black text-emerald-400 text-sm">
                    ৳{w.amount}
                  </td>

                  <td className="py-4 px-6">
                    {w.status === 'COMPLETED' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Paid ({w.transactionId})
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Awaiting Payment
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    {w.status === 'PENDING' ? (
                      <input
                        type="text"
                        placeholder="e.g. BK98765432X"
                        value={trxIdInputs[w.id] || ''}
                        onChange={(e) => setTrxIdInputs({ ...trxIdInputs, [w.id]: e.target.value })}
                        className="bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-xs text-white font-mono w-44"
                      />
                    ) : (
                      <span className="font-mono text-slate-400">{w.transactionId}</span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    {w.status === 'PENDING' && (
                      <button
                        onClick={() => processWithdrawal(w.id, 'COMPLETED', trxIdInputs[w.id] || 'TRX-DEFAULT-123')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-all shadow-md"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
