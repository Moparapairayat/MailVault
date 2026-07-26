import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, Phone, User, X, CheckCircle2, AlertTriangle, ArrowRight, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'SIGNUP';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'LOGIN', onSuccess }) => {
  const { loginUser, registerUser } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notice, setNotice] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (mode === 'LOGIN') {
      const res = await loginUser(email, password);
      if (res.success) {
        setNotice({ success: true, message: 'Logged in! Redirecting to dashboard...' });
        setTimeout(() => {
          onClose();
          setNotice(null);
          onSuccess?.(); // navigate to /seller
        }, 900);
      } else {
        setNotice({ success: false, message: res.message });
      }
    } else {
      if (!name.trim()) return setNotice({ success: false, message: 'Please enter your full name.' });
      if (!phone.trim()) return setNotice({ success: false, message: 'Please enter your bKash/Nagad phone number.' });

      const res = await registerUser(email, password, name, phone);
      if (res.success) {
        setNotice({ success: true, message: 'Account created! Redirecting to dashboard...' });
        setTimeout(() => {
          onClose();
          setNotice(null);
          onSuccess?.(); // navigate to /seller
        }, 900);
      } else {
        setNotice({ success: false, message: res.message });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md sm:rounded-3xl rounded-t-3xl border border-brand-500/30 p-6 sm:p-8 relative shadow-2xl bg-dark-card overflow-hidden max-h-[95vh] sm:max-h-none overflow-y-auto">
        
        {/* Header Close */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              {mode === 'LOGIN' ? <User className="w-5 h-5" /> : <Shield className="w-5 h-5 text-accent-cyan" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{mode === 'LOGIN' ? 'Seller Login' : 'Create Seller Account'}</h2>
              <p className="text-xs text-slate-400">Access your wallet, submissions & cashouts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-dark-panel hover:bg-dark-hover flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Notice */}
        {notice && (
          <div className={`p-3.5 rounded-xl mb-5 text-xs font-semibold flex items-center gap-2 ${
            notice.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}>
            {notice.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{notice.message}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Karim Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>
            </div>
          )}

          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">bKash / Nagad Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="01700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="seller@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{mode === 'LOGIN' ? 'Login to Dashboard' : 'Create Seller Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-4 border-t border-dark-border text-center text-xs text-slate-400">
          {mode === 'LOGIN' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('SIGNUP'); setNotice(null); }}
                className="text-brand-400 font-bold hover:underline"
              >
                Sign Up Free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('LOGIN'); setNotice(null); }}
                className="text-brand-400 font-bold hover:underline"
              >
                Login
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
