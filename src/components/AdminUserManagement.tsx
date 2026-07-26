import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { Search, Shield, ShieldOff, KeyRound, Trash2, UserX, UserCheck, Mail, Phone, Calendar, Award, Filter, X, AlertTriangle, CheckCircle2, Copy, Eye, Users } from 'lucide-react';

interface AdminUserManagementProps {
  onViewUser?: (userId: string) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ onViewUser }) => {
  const { users, fetchUsers, updateUserRole, banUser, unbanUser, resetUserPassword, deleteUser, submissions, withdrawals } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [actionNotice, setActionNotice] = useState<{ success?: boolean; message?: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [showBulkBanModal, setShowBulkBanModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkBanReason, setBulkBanReason] = useState('');
  const [newRole, setNewRole] = useState<'SELLER' | 'ADMIN'>('SELLER');
  const [banReason, setBanReason] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.phone.includes(searchQuery);
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'BANNED' && user.isBanned) ||
      (statusFilter === 'ACTIVE' && !user.isBanned);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getUserStats = (userId: string) => {
    const userSubmissions = submissions.filter(s => s.sellerId === userId);
    const userWithdrawals = withdrawals.filter(w => w.sellerId === userId);
    const approvedSubmissions = userSubmissions.filter(s => s.status === 'APPROVED');
    return {
      totalSubmissions: userSubmissions.length,
      approvedSubmissions: approvedSubmissions.length,
      totalWithdrawals: userWithdrawals.length,
      totalEarned: approvedSubmissions.reduce((acc, curr) => acc + curr.rate, 0)
    };
  };

  const handleToggleSelect = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkRoleChange = async () => {
    setActionLoading(true);
    const results = await Promise.all(selectedUserIds.map(id => updateUserRole(id, newRole)));
    const failed = results.filter(r => !r.success);
    setActionLoading(false);
    setShowBulkRoleModal(false);
    setSelectedUserIds([]);
    setActionNotice({
      success: failed.length === 0,
      message: failed.length === 0
        ? `Successfully updated role for ${selectedUserIds.length} users.`
        : `Updated ${selectedUserIds.length - failed.length} users. ${failed.length} failed.`
    });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleBulkBan = async () => {
    if (!bulkBanReason.trim()) return;
    setActionLoading(true);
    const results = await Promise.all(selectedUserIds.map(id => banUser(id, bulkBanReason)));
    const failed = results.filter(r => !r.success);
    setActionLoading(false);
    setShowBulkBanModal(false);
    setBulkBanReason('');
    setSelectedUserIds([]);
    setActionNotice({
      success: failed.length === 0,
      message: failed.length === 0
        ? `Successfully banned ${selectedUserIds.length} users.`
        : `Banned ${selectedUserIds.length - failed.length} users. ${failed.length} failed.`
    });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleBulkDelete = async () => {
    setActionLoading(true);
    const results = await Promise.all(selectedUserIds.map(id => deleteUser(id)));
    const failed = results.filter(r => !r.success);
    setActionLoading(false);
    setShowBulkDeleteModal(false);
    setSelectedUserIds([]);
    setActionNotice({
      success: failed.length === 0,
      message: failed.length === 0
        ? `Successfully deleted ${selectedUserIds.length} users.`
        : `Deleted ${selectedUserIds.length - failed.length} users. ${failed.length} failed.`
    });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const res = await updateUserRole(selectedUser.id, newRole);
    setActionLoading(false);
    setActionNotice(res);
    setShowRoleModal(false);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleBan = async () => {
    if (!selectedUser || !banReason.trim()) return;
    setActionLoading(true);
    const res = await banUser(selectedUser.id, banReason);
    setActionLoading(false);
    setActionNotice(res);
    setShowBanModal(false);
    setBanReason('');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleUnban = async (userId: string) => {
    setActionLoading(true);
    const res = await unbanUser(userId);
    setActionLoading(false);
    setActionNotice(res);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handlePasswordReset = async () => {
    if (!selectedUser || !newPassword) return;
    setActionLoading(true);
    const res = await resetUserPassword(selectedUser.id, newPassword);
    setActionLoading(false);
    setActionNotice(res);
    setShowPasswordModal(false);
    setNewPassword('');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const res = await deleteUser(selectedUser.id);
    setActionLoading(false);
    setActionNotice(res);
    setShowDeleteModal(false);
    setSelectedUser(null);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isAllSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="glass-card p-3 rounded-2xl border border-dark-border">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Users</div>
          <div className="text-xl font-black text-white">{users.length}</div>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-dark-border">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Sellers</div>
          <div className="text-xl font-black text-emerald-400">{users.filter(u => u.role === 'SELLER').length}</div>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-dark-border">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Admins</div>
          <div className="text-xl font-black text-accent-purple">{users.filter(u => u.role === 'ADMIN').length}</div>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-dark-border">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Banned</div>
          <div className="text-xl font-black text-rose-400">{users.filter(u => u.isBanned).length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-2xl border border-dark-border">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, username, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Roles</option>
            <option value="SELLER">Sellers</option>
            <option value="ADMIN">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-2xl border border-dark-border overflow-hidden">
        {selectedUserIds.length > 0 && (
          <div className="bg-brand-500/10 border-b border-brand-500/30 p-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-brand-400">
              {selectedUserIds.length} User(s) Selected
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowBulkRoleModal(true)} className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-[11px] transition-all">Change Role</button>
              <button onClick={() => setShowBulkBanModal(true)} className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-all">Ban Selected</button>
              <button onClick={() => setShowBulkDeleteModal(true)} className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px] transition-all">Delete Selected</button>
              <button onClick={() => setSelectedUserIds([])} className="px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-slate-300 font-bold text-[11px] hover:bg-dark-hover transition-all">Cancel</button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-dark-panel/60 border-b border-dark-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-dark-border bg-dark-bg text-brand-500 focus:ring-0"
                  />
                </th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userStats = getUserStats(user.id);
                  return (
                    <tr key={user.id} className={`hover:bg-dark-hover/50 transition-all ${user.isBanned ? 'opacity-60 bg-rose-500/5' : ''}`}>
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => handleToggleSelect(user.id)}
                          className="rounded border-dark-border bg-dark-bg text-brand-500 focus:ring-0"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${user.role === 'ADMIN' ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30' : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'}`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold text-white">
                              {onViewUser ? (
                                <button onClick={() => onViewUser(user.id)} className="hover:text-brand-400 transition-colors underline decoration-dotted underline-offset-2">
                                  {user.name}
                                </button>
                              ) : (
                                user.name
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{user.username || user.email}</div>
                            {user.isBanned && (
                              <div className="text-[9px] text-rose-400 font-semibold mt-0.5">BANNED: {user.bannedReason}</div>
                            )}
                            <div className="text-[9px] text-slate-500 mt-0.5">
                              {userStats.totalSubmissions} subs | {userStats.approvedSubmissions} approved | ৳{userStats.totalEarned}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-300 font-mono text-[11px]">{user.email}</div>
                        <div className="text-slate-400 text-[10px]">{user.phone}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${user.role === 'ADMIN' ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/30' : 'bg-brand-500/10 text-brand-400 border-brand-500/20'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {user.isBanned ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Banned</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedUser(user); setNewRole(user.role); setShowRoleModal(true); }}
                            className="p-2 rounded-lg bg-dark-bg hover:bg-dark-hover border border-dark-border text-slate-400 hover:text-white transition-all"
                            title="Change Role"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                          {user.isBanned ? (
                            <button
                              onClick={() => handleUnban(user.id)}
                              className="p-2 rounded-lg bg-dark-bg hover:bg-dark-hover border border-dark-border text-emerald-400 hover:text-emerald-300 transition-all"
                              title="Unban User"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => { setSelectedUser(user); setShowBanModal(true); }}
                              className="p-2 rounded-lg bg-dark-bg hover:bg-dark-hover border border-dark-border text-amber-400 hover:text-amber-300 transition-all"
                              title="Ban User"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }}
                            className="p-2 rounded-lg bg-dark-bg hover:bg-dark-hover border border-dark-border text-accent-cyan hover:text-cyan-300 transition-all"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                            className="p-2 rounded-lg bg-dark-bg hover:bg-dark-hover border border-dark-border text-rose-400 hover:text-rose-300 transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${actionNotice.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
          {actionNotice.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-3xl border border-brand-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Change User Role</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Change role for <strong className="text-white">{selectedUser.name}</strong></p>
            <div className="space-y-3">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'SELLER' | 'ADMIN')}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="SELLER">SELLER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button
                onClick={handleRoleChange}
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all disabled:opacity-60"
              >
                {actionLoading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-3xl border border-rose-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Ban User</h3>
              <button onClick={() => setShowBanModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Ban <strong className="text-white">{selectedUser.name}</strong> from accessing the platform.</p>
            <div className="space-y-3">
              <textarea
                placeholder="Enter ban reason..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                rows={3}
              />
              <button
                onClick={handleBan}
                disabled={actionLoading || !banReason.trim()}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all disabled:opacity-60"
              >
                {actionLoading ? 'Banning...' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-3xl border border-accent-cyan/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Reset Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Reset password for <strong className="text-white">{selectedUser.name}</strong></p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan font-mono"
              />
              <button
                onClick={handlePasswordReset}
                disabled={actionLoading || !newPassword}
                className="w-full py-2.5 rounded-xl bg-accent-cyan hover:bg-cyan-600 text-slate-950 font-bold text-xs transition-all disabled:opacity-60"
              >
                {actionLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-3xl border border-rose-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Delete User Permanently</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl mb-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-rose-400 font-semibold mb-1">This action cannot be undone!</p>
                <p className="text-[11px] text-slate-400">All data related to <strong className="text-white">{selectedUser.name}</strong> will be permanently deleted, including submissions and withdrawal history.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-slate-300 font-bold text-xs hover:bg-dark-hover transition-all">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all disabled:opacity-60"
              >
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Role Change Modal */}
      {showBulkRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-3xl border border-brand-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Bulk Change Role</h3>
              <button onClick={() => setShowBulkRoleModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Change role for <strong className="text-white">{selectedUserIds.length} users</strong></p>
            <div className="space-y-3">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'SELLER' | 'ADMIN')}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="SELLER">SELLER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button
                onClick={handleBulkRoleChange}
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all disabled:opacity-60"
              >
                {actionLoading ? 'Updating...' : `Update ${selectedUserIds.length} Users`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Ban Modal */}
      {showBulkBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-3xl border border-rose-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Bulk Ban Users</h3>
              <button onClick={() => setShowBulkBanModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Ban <strong className="text-white">{selectedUserIds.length} users</strong></p>
            <div className="space-y-3">
              <textarea
                placeholder="Enter ban reason for all selected users..."
                value={bulkBanReason}
                onChange={(e) => setBulkBanReason(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                rows={3}
              />
              <button
                onClick={handleBulkBan}
                disabled={actionLoading || !bulkBanReason.trim()}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all disabled:opacity-60"
              >
                {actionLoading ? 'Banning...' : `Ban ${selectedUserIds.length} Users`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-3xl border border-rose-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Bulk Delete Users</h3>
              <button onClick={() => setShowBulkDeleteModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl mb-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-rose-400 font-semibold mb-1">This action cannot be undone!</p>
                <p className="text-[11px] text-slate-400">You are about to permanently delete <strong className="text-white">{selectedUserIds.length} users</strong> and all their associated data.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowBulkDeleteModal(false)} className="flex-1 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-slate-300 font-bold text-xs hover:bg-dark-hover transition-all">
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all disabled:opacity-60"
              >
                {actionLoading ? 'Deleting...' : `Delete ${selectedUserIds.length} Users`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
