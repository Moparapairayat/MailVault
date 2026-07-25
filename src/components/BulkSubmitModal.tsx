import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryId } from '../types';
import { X, Upload, CheckCircle2, AlertTriangle, HelpCircle, FileText, Sparkles } from 'lucide-react';

interface BulkSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategoryId?: CategoryId;
}

export const BulkSubmitModal: React.FC<BulkSubmitModalProps> = ({ isOpen, onClose, defaultCategoryId }) => {
  const { categories, submitBatchEmails } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(defaultCategoryId || 'gmail_fresh');
  const [rawInput, setRawInput] = useState<string>('');
  const [resultMessage, setResultMessage] = useState<{ success?: boolean; text?: string } | null>(null);

  if (!isOpen) return null;

  const currentCategoryObj = categories.find(c => c.id === selectedCategory) || categories[0];

  // Count valid non-empty lines
  const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
  const totalCount = lines.length;
  const estimatedEarn = totalCount * (currentCategoryObj ? currentCategoryObj.ratePerUnit : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultMessage(null);

    const res = await submitBatchEmails(selectedCategory, rawInput);
    if (res.success) {
      setResultMessage({ success: true, text: res.message });
      setRawInput('');
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
        <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Submit Bulk Emails</h2>
              <p className="text-xs text-slate-400">Paste your accounts below for Admin review</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-dark-panel hover:bg-dark-hover flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {resultMessage && (
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
              {categories.map(c => (
                <option key={c.id} value={c.id} disabled={c.status === 'PAUSED'}>
                  {c.name} — ৳{c.ratePerUnit}/pc {c.status === 'PAUSED' ? '(PAUSED)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Format Guide Note */}
          <div className="bg-dark-panel p-3.5 rounded-xl border border-dark-border/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <HelpCircle className="w-4 h-4 text-accent-cyan shrink-0" />
              <span>Required Format: <strong className="text-white font-mono">{currentCategoryObj?.formatGuide}</strong></span>
            </div>
            <button
              type="button"
              onClick={handleInsertSample}
              className="text-[11px] text-brand-400 hover:underline font-semibold"
            >
              Insert Demo Sample
            </button>
          </div>

          {/* Raw Input Text Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Paste Accounts (1 line per email)
              </label>
              <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                {totalCount} Line{totalCount !== 1 ? 's' : ''} Detected
              </span>
            </div>

            <textarea
              rows={7}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={`email1@gmail.com:password123:recovery1@mail.com\nemail2@gmail.com:password456:recovery2@mail.com`}
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed resize-none"
            />
          </div>

          {/* Live Calculation Bar */}
          <div className="bg-dark-bg/80 p-4 rounded-xl border border-dark-border flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Total Potential Value</span>
              <span className="text-2xl font-black text-emerald-400">৳{estimatedEarn.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-dark-panel hover:bg-dark-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={totalCount === 0 || currentCategoryObj?.status === 'PAUSED'}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
                  totalCount > 0 && currentCategoryObj?.status === 'ACTIVE'
                    ? 'bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 hover:brightness-110 shadow-brand-500/20'
                    : 'bg-dark-hover text-slate-500 cursor-not-allowed border border-dark-border'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit {totalCount} Mails for Review</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
