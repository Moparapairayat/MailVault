import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Search, CheckCircle2, XCircle, ShieldCheck, FileText } from 'lucide-react';

interface DuplicateCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DuplicateCheckerModal: React.FC<DuplicateCheckerModalProps> = ({ isOpen, onClose }) => {
  const { submissions } = useApp();
  const [inputText, setInputText] = useState('');
  const [checkedResults, setCheckedResults] = useState<{ email: string; isDuplicate: boolean }[] | null>(null);

  if (!isOpen) return null;

  const handleCheckDuplicates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Parse emails from text input
    const lines = inputText.split('\n').map(l => l.trim()).filter(Boolean);
    const results = lines.map(line => {
      const email = line.split(':')[0].trim().toLowerCase();
      const isDuplicate = submissions.some(s => s.email.toLowerCase() === email);
      return { email, isDuplicate };
    });

    setCheckedResults(results);
  };

  const dupCount = checkedResults ? checkedResults.filter(r => r.isDuplicate).length : 0;
  const cleanCount = checkedResults ? checkedResults.filter(r => !r.isDuplicate).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-xl rounded-3xl border border-brand-500/30 p-6 sm:p-8 shadow-2xl bg-dark-card">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Anti-Duplicate Pre-Checker</h3>
              <p className="text-xs text-slate-400">Check if your email list has already been submitted to MailVault</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-dark-panel hover:bg-dark-hover flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCheckDuplicates} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Paste Emails to Verify (1 per line)
            </label>
            <textarea
              rows={5}
              placeholder="e.g. test.email1@gmail.com:pass123&#10;test.email2@gmail.com:pass456"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-3.5 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Scan Database for Duplicates</span>
          </button>
        </form>

        {/* Scan Results Output */}
        {checkedResults && (
          <div className="mt-6 pt-4 border-t border-dark-border space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {cleanCount} Clean Emails (Ready to Sell)
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> {dupCount} Duplicate Emails
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto bg-dark-bg p-3 rounded-xl border border-dark-border font-mono text-[11px] space-y-1">
              {checkedResults.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-white">{r.email}</span>
                  {r.isDuplicate ? (
                    <span className="text-rose-400 font-bold text-[10px]">Already Submitted ✖</span>
                  ) : (
                    <span className="text-emerald-400 font-bold text-[10px]">Clean ✔</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
