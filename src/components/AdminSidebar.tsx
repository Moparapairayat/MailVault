import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Cpu, BarChart3, Edit3, Bell, Send, Layers, CreditCard, Lock } from 'lucide-react';

interface AdminSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLockVault: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentTab, setCurrentTab, onLockVault }) => {
  const { submissions, withdrawals } = useApp();

  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING').length;

  const navItems = [
    { id: 'overview', label: 'Vault Overview', icon: Shield },
    { id: 'checker', label: 'Auto Password Checker', icon: Cpu, badge: pendingSubmissions > 0 ? `${pendingSubmissions}` : undefined, badgeColor: 'bg-brand-500 text-slate-950 font-black' },
    { id: 'analytics', label: 'Financial Analytics', icon: BarChart3 },
    { id: 'rates', label: 'Buying Rates & Stock', icon: Edit3 },
    { id: 'submissions', label: 'Email Review Vault', icon: Layers, badge: pendingSubmissions > 0 ? `${pendingSubmissions}` : undefined, badgeColor: 'bg-amber-500 text-slate-950 font-black' },
    { id: 'payouts', label: 'Payout Releases', icon: CreditCard, badge: pendingWithdrawals > 0 ? `${pendingWithdrawals}` : undefined, badgeColor: 'bg-accent-cyan text-slate-950 font-black' },
    { id: 'notices', label: 'Notice & Announcements', icon: Bell },
    { id: 'telegram', label: 'Telegram Alert Bot', icon: Send },
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="w-64 bg-dark-card border-r border-dark-border min-h-[calc(100vh-5rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-6">
          
          {/* Admin Header Card */}
          <div className="bg-gradient-to-r from-accent-purple/20 to-dark-bg p-3.5 rounded-2xl border border-accent-purple/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-accent-purple font-extrabold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-white">Admin Vault</div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 inline-block mt-0.5">
                Super Admin
              </span>
            </div>
          </div>

          {/* Sidebar Nav Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block mb-2 font-mono">Vault Controls</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-accent-purple text-white shadow-md shadow-purple-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[9px] rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Lock Session Button */}
        <div className="pt-4 border-t border-dark-border space-y-2">
          <button
            onClick={onLockVault}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Admin Vault</span>
          </button>
        </div>
      </aside>

      {/* Mobile Horizontal Sub-page Tab Swiper Bar (Mobile Only) */}
      <div className="md:hidden w-full overflow-x-auto bg-dark-card border-b border-dark-border p-2 flex items-center gap-2 shrink-0 scrollbar-none sticky top-20 z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all ${
                isActive
                  ? 'bg-accent-purple text-white shadow-md'
                  : 'bg-dark-bg text-slate-400 border border-dark-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`px-1.5 py-0.2 text-[8px] rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
