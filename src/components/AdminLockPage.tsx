import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

interface AdminLockPageProps {
  onUnlock: () => void;
  onGoHome: () => void;
}

export const AdminLockPage: React.FC<AdminLockPageProps> = ({ onUnlock, onGoHome }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin123' || passcode === '1234') {
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md rounded-3xl border border-accent-purple/40 p-8 shadow-2xl bg-dark-card text-center relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-accent-purple/20 blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-accent-purple mx-auto mb-6">
          <Shield className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-xs font-bold mb-3 uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>Admin Security Guard</span>
        </div>

        <h2 className="text-2xl font-black text-white">MailVault Admin Access</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          This area is restricted to MailVault Admin only. Please enter your secret admin passcode to continue to <code className="text-brand-400">/admin</code>.
        </p>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold p-3 rounded-xl mb-4">
            Incorrect Passcode! Default passcode is <strong>admin123</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              autoFocus
              placeholder="Enter Admin Passcode"
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(false); }}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3.5 text-center text-sm text-white font-mono focus:outline-none focus:border-accent-purple font-bold tracking-widest"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-accent-purple hover:bg-purple-600 text-white font-bold text-xs transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Unlock Admin Vault (/admin)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-dark-border">
          <button
            onClick={onGoHome}
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Seller Home</span>
          </button>
        </div>

      </div>
    </div>
  );
};
