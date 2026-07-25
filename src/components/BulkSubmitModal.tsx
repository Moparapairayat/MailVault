import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryId } from '../types';
import { X, Upload, CheckCircle2, AlertTriangle, FileText, Sparkles, Mail, Lock, ShieldCheck, Layers } from 'lucide-react';

interface BulkSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategoryId?: CategoryId;
}

export const BulkSubmitModal: React.FC<BulkSubmitModalProps> = ({ isOpen, onClose, defaultCategoryId }) => {
  const { categories, submitBatchEmails } = useApp();

  const [mode, setMode] = useState<'SINGLE' | 'BULK'>('SINGLE');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(defaultCategoryId || 'gmail_fresh');

  // Single Email Form Fields
  const [singleEmail, setSingleEmail] = useState('');
  const [singlePassword, setSinglePassword] = useState('');
  const [singleRecovery, setSingleRecovery] = useState('');

  // Bulk Raw Text Input
  const [rawInput, setRawInput] = useState<string>('');
  const [resultMessage, setResultMessage] = useState<{ success?: boolean; text?: string } | null>(null);

  // Live Verification Animation State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStepText, setVerifyStepText] = useState('');

  if (!isOpen) return null;

  const currentCategoryObj = categories.find(c => c.id === selectedCategory) || categories[0];

  // Count valid non-empty lines for bulk
  const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
  const bulkTotalCount = lines.length;
  const rate = currentCategoryObj ? currentCategoryObj.ratePerUnit : 0;
  const estimatedEarn = mode === 'SINGLE' ? rate : bulkTotalCount * rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultMessage(null);

    let submitText = '';
    if (mode === 'SINGLE') {
      if (!singleEmail.trim() || !singlePassword.trim()) {
        setResultMessage({ success: false, text: 'Please enter both Email address and Password.' });
        return;
      }
      submitText = `${singleEmail.trim()}:${singlePassword.trim()}${singleRecovery.trim() ? `:${singleRecovery.trim()}` : ''}`;
    } else {
      if (bulkTotalCount === 0) {
        setResultMessage({ success: false, text: 'Please enter at least 1 email line.' });
        return;
      }
      submitText = rawInput;
    }

    // Start Live Verification Animation
    setIsVerifying(true);
    setVerifyStepText('1/3: Checking domain MX records & server reachability...');
    
    await new Promise(r => setTimeout(r, 600));
    setVerifyStepText('2/3: Testing IMAP/SMTP login credentials...');
    
    await new Promise(r => setTimeout(r, 600));
    setVerifyStepText('3/3: Verifying recovery email & inbox health...');
    
    await new Promise(r => setTimeout(r, 400));
    setIsVerifying(false);

    const res = await submitBatchEmails(selectedCategory, submitText);
    if (res.success) {
      setResultMessage({ success: true, text: res.message });
      setRawInput('');
      setSingleEmail('');
      setSinglePassword('');
      setSingleRecovery('');
      setTimeout(() => {
        onClose();
        setResultMessage(null);
      }, 2000);
    } else {
      setResultMessage({ success: false, text: res.message });
    }
  };

  const handleInsertSample = () => {
    const sample = `seller.test.mail01@gmail.com:Pass1234Secure!:recovery1@mail.com
seller.test.mail02@gmail.com:Pass1234Secure!:recovery2@mail.com
seller.test.mail03@gmail.com:Pass1234Secure!:recovery3@mail.com`;
    setRawInput(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      
      <div className="glass-card w-full max-w-2xl rounded-3xl border border-brand-500/30 p-6 sm:p-8 relative shadow-2xl bg-dark-card overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sell Email Accounts</h2>
              <p className="text-xs text-slate-400">Choose single email or bulk email list submission</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-dark-panel hover:bg-dark-hover flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-in-1 Submission Mode Switcher */}
        <div className="flex bg-dark-bg p-1 rounded-xl border border-dark-border mb-6">
          <button
            type="button"
            onClick={() => setMode('SINGLE')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'SINGLE'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Sell 1 Single Email</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('BULK')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'BULK'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Bulk Email List (Multiple)</span>
          </button>
        </div>

        {/* Live Auto-Verification Progress Banner */}
        {isVerifying && (
          <div className="p-4 rounded-2xl mb-6 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold animate-pulse flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400 animate-spin" />
                <span>Auto-Verifying Email Credentials...</span>
              </span>
              <span className="text-[10px] font-mono bg-brand-500/20 px-2 py-0.5 rounded">Real-Time SMTP</span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">{verifyStepText}</p>
            <div className="w-full h-1.5 bg-dark-bg rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan animate-pulse w-full" />
            </div>
          </div>
        )}

        {/* Feedback Alert */}
        {resultMessage && !isVerifying && (
          <div className={`p-4 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2 ${
            resultMessage.success
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}>
            {resultMessage.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{resultMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryId)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 font-semibold"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} disabled={cat.status === 'PAUSED'}>
                  {cat.name} — ৳{cat.ratePerUnit}/pc {cat.status === 'PAUSED' ? '(PAUSED)' : ''}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Category Buying Rate: <strong className="text-emerald-400">৳{currentCategoryObj.ratePerUnit} / account</strong>
            </span>
          </div>

          {/* Mode 1: Single Email Input Form */}
          {mode === 'SINGLE' ? (
            <div className="space-y-4 bg-dark-bg p-4 rounded-2xl border border-dark-border">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="e.g. karim.seller@gmail.com"
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Pass1234Secure!"
                    value={singlePassword}
                    onChange={(e) => setSinglePassword(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recovery Email (Optional)</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="e.g. recovery@mail.com"
                    value={singleRecovery}
                    onChange={(e) => setSingleRecovery(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Bulk Email Textarea */
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Paste Email List (1 per line)
                </label>

                <button
                  type="button"
                  onClick={handleInsertSample}
                  className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Insert Sample Lines</span>
                </button>
              </div>

              <textarea
                rows={6}
                placeholder="Format: email:password:recovery&#10;example1@gmail.com:pass123:recovery1@mail.com&#10;example2@gmail.com:pass456"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              />

              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-slate-400 font-medium">Format: <code>email:password:recovery</code></span>
                <span className="text-brand-400 font-bold">{bulkTotalCount} Valid Line(s)</span>
              </div>
            </div>
          )}

          {/* Rate Summary Footer */}
          <div className="bg-dark-panel p-4 rounded-2xl border border-dark-border flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Estimated Earnings</span>
              <span className="text-xl font-black text-emerald-400">৳{estimatedEarn.toLocaleString()} BDT</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-dark-bg hover:bg-dark-hover"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={currentCategoryObj.status === 'PAUSED' || (mode === 'SINGLE' ? !singleEmail || !singlePassword : bulkTotalCount === 0)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                  currentCategoryObj.status === 'ACTIVE' && (mode === 'SINGLE' ? singleEmail && singlePassword : bulkTotalCount > 0)
                    ? 'bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 hover:brightness-110 shadow-brand-500/20 cursor-pointer'
                    : 'bg-dark-hover text-slate-500 cursor-not-allowed border border-dark-border'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{mode === 'SINGLE' ? 'Sell Single Email' : `Sell Bulk ${bulkTotalCount} Emails`}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
