import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { X, Mail, Phone, User, Shield, Calendar, Award, Clock, DollarSign, ArrowLeft, Copy, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface AdminUserDetailProps {
  userId: string;
  onBack: () => void;
}

export const AdminUserDetail: React.FC<AdminUserDetailProps> = ({ userId, onBack }) => {
  const { users, submissions, withdrawals, banUser, unbanUser, updateUserRole, logAdminActivity } = useApp();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'submissions' | 'withdrawals'>('info');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user || null);
  }, [userId, users]);

  if (!selectedUser) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-dark-border text-center">
        <div className="text-slate-400 animate-pulse">Loading user details...</div>
      </div>
    );
  }

  const userSubmissions = submissions.filter(s => s.sellerId === userId);
  const userWithdrawals = withdrawals.filter(w => w.sellerId === userId);
  const approvedSubmissions = userSubmissions.filter(s => s.status === 'APPROVED');
  const totalEarned = approvedSubmissions.reduce((acc, curr) => acc + curr.rate, 0);

  const handleRoleChange = async (newRole: 'SELLER' | 'ADMIN') => {
    setActionLoading(true);
    const res = await updateUserRole(selectedUser.id, newRole);
    setActionLoading(false);
    setActionNotice(res);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleBan = async () => {
    setActionLoading(true);
    const res = await banUser(selectedUser.id, 'Banned by admin');
    setActionLoading(false);
    setActionNotice(res);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleUnban = async () => {
    setActionLoading(true);
    const res = await unbanUser(selectedUser.id);
    setActionLoading(false);
    setActionNotice(res);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Action Notice */}
      {actionNotice && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${actionNotice.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
          {actionNotice.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-dark-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-dark-bg border border-dark-border text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-xl ${selectedUser.role === 'ADMIN' ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30' : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'}`}>
              {selectedUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{selectedUser.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${selectedUser.role === 'ADMIN' ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/30' : 'bg-brand-500/10 text-brand-400 border-brand-500/20'}`}>
                  {selectedUser.role}
                </span>
                {selectedUser.isBanned && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Banned</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedUser.isBanned ? (
              <button
                onClick={handleUnban}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all disabled:opacity-60"
              >
                Unban User
              </button>
            ) : (
              <button
                onClick={handleBan}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all disabled:opacity-60"
              >
                Ban User
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-dark-bg p-3 rounded-xl border border-dark-border">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Submissions</div>
            <div className="text-lg font-black text-white">{userSubmissions.length}</div>
          </div>
          <div className="bg-dark-bg p-3 rounded-xl border border-dark-border">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Approved</div>
            <div className="text-lg font-black text-emerald-400">{approvedSubmissions.length}</div>
          </div>
          <div className="bg-dark-bg p-3 rounded-xl border border-dark-border">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Earned</div>
            <div className="text-lg font-black text-white">৳{totalEarned.toLocaleString()}</div>
          </div>
          <div className="bg-dark-bg p-3 rounded-xl border border-dark-border">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Withdrawals</div>
            <div className="text-lg font-black text-accent-cyan">{userWithdrawals.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-dark-border">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${activeTab === 'info' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${activeTab === 'submissions' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Submissions ({userSubmissions.length})
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all ${activeTab === 'withdrawals' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Withdrawals ({userWithdrawals.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Full Name</div>
              <div className="text-sm font-bold text-white">{selectedUser.name}</div>
            </div>
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Email</div>
              <div className="text-sm font-bold text-white font-mono">{selectedUser.email}</div>
            </div>
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Phone</div>
              <div className="text-sm font-bold text-white font-mono">{selectedUser.phone || 'N/A'}</div>
            </div>
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Username</div>
              <div className="text-sm font-bold text-white font-mono">{selectedUser.username || 'N/A'}</div>
            </div>
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Referral Code</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-brand-400 font-mono">{selectedUser.refCode || 'N/A'}</span>
                {selectedUser.refCode && (
                  <button onClick={() => navigator.clipboard.writeText(selectedUser.refCode)} className="text-slate-400 hover:text-white">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Joined Date</div>
              <div className="text-sm font-bold text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="glass-card rounded-2xl border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-dark-panel/60 border-b border-dark-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Rate</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-xs">
                {userSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">No submissions yet.</td>
                  </tr>
                ) : (
                  userSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-dark-hover/50 transition-all">
                      <td className="py-3.5 px-4 font-mono text-white font-bold">{sub.email}</td>
                      <td className="py-3.5 px-4 text-slate-300">{sub.categoryId}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">৳{sub.rate}</td>
                      <td className="py-3.5 px-4">
                        {sub.status === 'APPROVED' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">APPROVED</span>}
                        {sub.status === 'PENDING' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">PENDING</span>}
                        {sub.status === 'REJECTED' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">REJECTED</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="glass-card rounded-2xl border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-dark-panel/60 border-b border-dark-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Account</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-xs">
                {userWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">No withdrawal requests yet.</td>
                  </tr>
                ) : (
                  userWithdrawals.map((wd) => (
                    <tr key={wd.id} className="hover:bg-dark-hover/50 transition-all">
                      <td className="py-3.5 px-4 font-black text-emerald-400">৳{wd.amount}</td>
                      <td className="py-3.5 px-4 text-slate-300 uppercase">{wd.method}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{wd.accountDetails}</td>
                      <td className="py-3.5 px-4">
                        {wd.status === 'COMPLETED' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PAID</span>}
                        {wd.status === 'PENDING' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">PENDING</span>}
                        {wd.status === 'REJECTED' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">REJECTED</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">{new Date(wd.requestedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
