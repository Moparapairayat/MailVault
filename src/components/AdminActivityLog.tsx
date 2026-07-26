import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Users, Calendar, Clock, Filter, Search, ChevronDown, ChevronUp, UserCheck, UserX, KeyRound, Trash2, Edit3, CheckCircle2, XCircle, Send, RefreshCw, CreditCard } from 'lucide-react';

export const AdminActivityLog: React.FC = () => {
  const { adminActivityLogs, users, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'USER_ROLE_CHANGE': return <Edit3 className="w-4 h-4 text-brand-400" />;
      case 'USER_BAN': return <UserX className="w-4 h-4 text-rose-400" />;
      case 'USER_UNBAN': return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'USER_DELETE': return <Trash2 className="w-4 h-4 text-rose-500" />;
      case 'PASSWORD_RESET': return <KeyRound className="w-4 h-4 text-accent-cyan" />;
      case 'SUBMISSION_REVIEW': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WITHDRAWAL_PROCESS': return <CreditCard className="w-4 h-4 text-amber-400" />;
      case 'CATEGORY_UPDATE': return <RefreshCw className="w-4 h-4 text-purple-400" />;
      default: return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'USER_ROLE_CHANGE': return 'bg-brand-500/10 text-brand-400 border-brand-500/30';
      case 'USER_BAN': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'USER_UNBAN': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'USER_DELETE': return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'PASSWORD_RESET': return 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30';
      case 'SUBMISSION_REVIEW': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'WITHDRAWAL_PROCESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CATEGORY_UPDATE': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getUserById = (userId?: string) => {
    if (!userId) return null;
    return users.find(u => u.id === userId);
  };

  const filteredLogs = adminActivityLogs.filter(log => {
    const matchesSearch = !searchQuery ||
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetUserName && log.targetUserName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const actionCounts = {
    total: adminActivityLogs.length,
    USER_ROLE_CHANGE: adminActivityLogs.filter(l => l.actionType === 'USER_ROLE_CHANGE').length,
    USER_BAN: adminActivityLogs.filter(l => l.actionType === 'USER_BAN').length,
    USER_UNBAN: adminActivityLogs.filter(l => l.actionType === 'USER_UNBAN').length,
    USER_DELETE: adminActivityLogs.filter(l => l.actionType === 'USER_DELETE').length,
    PASSWORD_RESET: adminActivityLogs.filter(l => l.actionType === 'PASSWORD_RESET').length,
    SUBMISSION_REVIEW: adminActivityLogs.filter(l => l.actionType === 'SUBMISSION_REVIEW').length,
    WITHDRAWAL_PROCESS: adminActivityLogs.filter(l => l.actionType === 'WITHDRAWAL_PROCESS').length,
    CATEGORY_UPDATE: adminActivityLogs.filter(l => l.actionType === 'CATEGORY_UPDATE').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="glass-card p-3 rounded-2xl border border-dark-border">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Actions</div>
          <div className="text-xl font-black text-white">{actionCounts.total}</div>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-dark-border">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">User Reviews</div>
          <div className="text-xl font-black text-emerald-400">{actionCounts.SUBMISSION_REVIEW}</div>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-dark-border">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Bans</div>
          <div className="text-xl font-black text-rose-400">{actionCounts.USER_BAN}</div>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-dark-border">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Payouts</div>
          <div className="text-xl font-black text-amber-400">{actionCounts.WITHDRAWAL_PROCESS}</div>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-dark-border col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Role Changes</div>
          <div className="text-xl font-black text-brand-400">{actionCounts.USER_ROLE_CHANGE}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-2xl border border-dark-border">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by admin name, action details, or target user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Actions</option>
            <option value="USER_ROLE_CHANGE">Role Changes</option>
            <option value="USER_BAN">Bans</option>
            <option value="USER_UNBAN">Unbans</option>
            <option value="USER_DELETE">Deletions</option>
            <option value="PASSWORD_RESET">Password Resets</option>
            <option value="SUBMISSION_REVIEW">Submission Reviews</option>
            <option value="WITHDRAWAL_PROCESS">Payouts</option>
            <option value="CATEGORY_UPDATE">Rate Updates</option>
          </select>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="glass-card rounded-2xl border border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-dark-panel/60 border-b border-dark-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Admin</th>
                <th className="py-3.5 px-4">Target / Details</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No admin activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const targetUser = getUserById(log.targetUserId);
                  const isExpanded = expandedLogId === log.id;
                  
                  return (
                    <tr key={log.id} className="hover:bg-dark-hover/50 transition-all">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg border ${getActionColor(log.actionType)}`}>
                            {getActionIcon(log.actionType)}
                          </div>
                          <span className="font-bold text-white text-[11px]">
                            {log.actionType.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-[11px]">{log.adminName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.adminId}</div>
                      </td>
                      <td className="py-4 px-4">
                        {targetUser && (
                          <div className="mb-1">
                            <span className="text-[10px] text-slate-400">Target: </span>
                            <span className="text-[11px] text-slate-200 font-medium">{targetUser.name}</span>
                          </div>
                        )}
                        <div className={`text-[11px] ${isExpanded ? 'text-slate-200' : 'text-slate-400'} line-clamp-2`}>
                          {log.details}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-[10px] font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
