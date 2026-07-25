import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DuplicateCheckerModal } from './DuplicateCheckerModal';
import { Mail, Wallet, Sparkles, Home, LayoutDashboard, PlusCircle, LogIn, LogOut, User, Menu, X, Globe, Search, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  openSubmitModal: () => void;
  openAuthModal: (mode?: 'LOGIN' | 'SIGNUP') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, openSubmitModal, openAuthModal }) => {
  const { currentUser, logoutUser, availableBalance, lang, setLang } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDupCheckerOpen, setIsDupCheckerOpen] = useState(false);

  return (
    <>
      {/* Desktop & Mobile Header Bar */}
      <header className="sticky top-0 z-40 bg-[#070A12]/90 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/20">
              <div className="w-full h-full bg-dark-card rounded-[10px] flex items-center justify-center">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white font-sans">
                  Mail<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-cyan">Vault</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full">
                  Portal
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400">Direct Email Procurement</p>
            </div>
          </div>

          {/* Center Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-dark-card/80 p-1.5 rounded-xl border border-dark-border">
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPath === '/' || currentPath === ''
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover'
              }`}
            >
              Buying Rates & Calculator
            </button>
            
            <button
              onClick={() => navigate('/seller')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                currentPath === '/seller' || currentPath === '/dashboard'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-hover'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Seller Portal</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Seller Balance Pill */}
            {currentUser && currentPath !== '/admin' && (
              <div className="flex items-center gap-2 bg-dark-card px-3 py-1.5 rounded-xl border border-dark-border text-xs">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-slate-400 block text-[9px] leading-tight">Ready Cash</span>
                  <span className="font-extrabold text-emerald-400 text-xs sm:text-sm">৳{availableBalance}</span>
                </div>
              </div>
            )}

            {/* Language Switcher Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="bg-dark-card hover:bg-dark-hover border border-dark-border px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all"
              title="Switch Language (English / বাংলা)"
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>{lang === 'en' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Anti-Duplicate Pre-Checker Button */}
            <button
              onClick={() => setIsDupCheckerOpen(true)}
              className="hidden lg:flex bg-dark-card hover:bg-dark-hover border border-dark-border px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 items-center gap-1.5 transition-all"
              title="Pre-check email list for duplicates"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Check Duplicates</span>
            </button>

            {/* Sell Button CTA (Desktop) */}
            {currentPath !== '/admin' && (
              <button
                onClick={openSubmitModal}
                className="hidden sm:flex bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs hover:brightness-110 transition-all shadow-lg shadow-brand-500/20 items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sell Emails</span>
              </button>
            )}

            {/* Auth Login / Logout Profile Button */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2">
                <div
                  onClick={() => navigate('/seller')}
                  className="flex items-center gap-2 bg-dark-card px-3 py-1.5 rounded-xl border border-dark-border text-xs cursor-pointer hover:border-brand-500/50 transition-all"
                >
                  <User className="w-3.5 h-3.5 text-brand-400" />
                  <span className="font-bold text-white max-w-[100px] truncate">{currentUser.name}</span>
                </div>
                <button
                  onClick={logoutUser}
                  title="Logout"
                  className="p-2 rounded-xl bg-dark-card hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-dark-border transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('LOGIN')}
                className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login / Sign Up</span>
              </button>
            )}

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-dark-card border border-dark-border text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu Modal */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex flex-col justify-between p-6 animate-fade-in">
          
          <div className="space-y-6">
            {/* Mobile Menu Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-400" />
                <span className="font-bold text-lg text-white">MailVault Navigation</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-dark-card border border-dark-border text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card (If Logged In) */}
            {currentUser && (
              <div className="bg-dark-card p-4 rounded-2xl border border-dark-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{currentUser.name}</div>
                  <div className="text-xs text-emerald-400 font-mono">Available: ৳{availableBalance}</div>
                </div>
              </div>
            )}

            {/* Menu Links */}
            <div className="space-y-2">
              <button
                onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  currentPath === '/' || currentPath === '' ? 'bg-brand-500 text-white' : 'bg-dark-card text-slate-300 border border-dark-border'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Buying Rates & Calculator</span>
              </button>

              <button
                onClick={() => { navigate('/seller'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  currentPath === '/seller' ? 'bg-brand-500 text-white' : 'bg-dark-card text-slate-300 border border-dark-border'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Seller Portal</span>
              </button>

              <button
                onClick={() => { openSubmitModal(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sell Emails Now</span>
              </button>
            </div>
          </div>

          {/* Logout / Sign In Footer */}
          <div className="pt-4 border-t border-dark-border">
            {currentUser ? (
              <button
                onClick={() => { logoutUser(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Account</span>
              </button>
            ) : (
              <button
                onClick={() => { openAuthModal('LOGIN'); setIsMobileMenuOpen(false); }}
                className="w-full py-3 rounded-xl text-xs font-bold bg-brand-500 text-white"
              >
                Sign In / Register
              </button>
            )}
          </div>

        </div>
      )}

      {/* App-Like Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070A12]/95 backdrop-blur-lg border-t border-dark-border px-3 py-2">
        <div className="flex items-center justify-around">
          
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-all ${
              currentPath === '/' || currentPath === '' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Rates</span>
          </button>

          {/* Floating Sell CTA */}
          {currentPath !== '/admin' && (
            <button
              onClick={openSubmitModal}
              className="bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 p-3 rounded-full shadow-lg shadow-brand-500/30 -mt-6 border-2 border-[#070A12]"
            >
              <PlusCircle className="w-6 h-6 fill-slate-950 text-brand-400" />
            </button>
          )}

          <button
            onClick={() => navigate('/seller')}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-all ${
              currentPath === '/seller' || currentPath === '/dashboard' ? 'text-brand-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Seller Portal</span>
          </button>

        </div>
      </div>
      {/* Anti-Duplicate Checker Modal */}
      <DuplicateCheckerModal
        isOpen={isDupCheckerOpen}
        onClose={() => setIsDupCheckerOpen(false)}
      />
    </>
  );
};
