import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, Mail, KeyRound, CheckCircle2, AlertTriangle, ArrowRight, User } from 'lucide-react';

interface AdminSetupWizardProps {
  onComplete: () => void;
}

export const AdminSetupWizard: React.FC<AdminSetupWizardProps> = ({ onComplete }) => {
  const { setupFirstAdmin } = useApp();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState<{ success?: boolean; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      return setNotice({ success: false, message: 'Please fill all required fields.' });
    }

    if (password !== confirmPassword) {
      return setNotice({ success: false, message: 'Passwords do not match.' });
    }

    setLoading(true);
    const res = await setupFirstAdmin(name.trim(), username.trim(), email.trim(), password);
    setLoading(false);

    if (res.success) {
      setNotice({ success: true, message: 'Admin setup complete! Redirecting to control vault...' });
      setTimeout(() => {
        onComplete();
      }, 1200);
    } else {
      setNotice({ success: false, message: res.message });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-lg rounded-3xl border border-accent-purple/30 p-6 sm:p-8 relative shadow-2xl bg-dark-card animate-fade-in">
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-accent-purple/20 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-accent-purple">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Admin Setup Wizard</h2>
              <p className="text-xs text-slate-400">Create the first super admin account for MailVault</p>
            </div>
          </div>

          {notice && (
            <div className={`p-3.5 rounded-xl mb-5 text-xs font-semibold flex items-center gap-2 ${
              notice.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}>
              {notice.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{notice.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Admin Ali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Username</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="superadmin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">You will use this username or email to login to the admin vault.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@mailvault.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple font-mono"
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
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-accent-purple to-brand-500 text-white font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Admin...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Create Admin Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="mt-6 pt-4 border-t border-dark-border text-center text-[10px] text-slate-500">
            This wizard runs only once. Keep your credentials safe.
          </div>
        </div>
      </div>
    </div>
  );
};
