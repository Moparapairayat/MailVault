import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Clock, CheckCircle2, Award, LogOut, Wallet, PlusCircle, User } from 'lucide-react';

interface SellerSidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  openSubmitModal: () => void;
  totalApprovedCount?: number;
}

export const SellerSidebar: React.FC<SellerSidebarProps> = ({ activeSection, setActiveSection, openSubmitModal, totalApprovedCount = 0 }) => {
  const { currentUser, logoutUser, availableBalance } = useApp();

  const getSellerTier = (count: number) => {
    if (count >= 500) return '🥇 Gold VIP';
    if (count >= 50) return '🥈 Silver';
    return '🥉 Bronze';
  };

  const navItems = [
    { id: 'overview', label: 'Wallet & Overview', icon: LayoutDashboard },
    { id: 'submissions', label: 'Submissions History', icon: Clock },
    { id: 'withdrawals', label: 'Cashout Payouts', icon: CheckCircle2 },
    { id: 'referrals', label: 'Referral Bonus (3%)', icon: Award },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="w-64 bg-dark-card border-r border-dark-border min-h-[calc(100vh-5rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-6">
          
          {/* User Card */}
          <div className="bg-dark-bg p-3.5 rounded-2xl border border-dark-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-extrabold text-sm">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'K'}
            </div>
             <div className="overflow-hidden">
               <div className="font-bold text-xs text-white truncate">{currentUser ? currentUser.name : 'Seller'}</div>
               <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 inline-block mt-0.5">
                 {getSellerTier(totalApprovedCount)}
               </span>
             </div>
          </div>

          {/* Action Button CTA */}
          <button
            onClick={openSubmitModal}
            className="w-full bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 font-extrabold py-3 rounded-xl text-xs transition-all shadow-lg shadow-brand-500/20 hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 fill-slate-950 text-brand-400" />
            <span>Submit New Mails</span>
          </button>

          {/* Sidebar Nav Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block mb-2">Navigation</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wallet Balance Pill & Logout */}
        <div className="space-y-3 pt-4 border-t border-dark-border">
          <div className="bg-dark-bg p-3 rounded-xl border border-dark-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 text-[11px]">Ready Cash</span>
            </div>
            <span className="font-extrabold text-emerald-400 text-sm">৳{availableBalance}</span>
          </div>

          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Horizontal Sub-page Tab Swiper Bar (Mobile Only) */}
      <div className="md:hidden w-full overflow-x-auto bg-dark-card border-b border-dark-border p-2 flex items-center gap-2 shrink-0 scrollbar-none sticky top-20 z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-dark-bg text-slate-400 border border-dark-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
