import React, { useState } from 'react';
import { MessageSquare, Send, X, ShieldCheck, CheckCircle2, HelpCircle, PhoneCall } from 'lucide-react';

export const LiveSupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sentNotice, setSentNotice] = useState(false);

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSentNotice(true);
    setTimeout(() => {
      setSentNotice(false);
      setMessageText('');
      setIsOpen(false);
    }, 2500);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 p-3.5 sm:p-4 rounded-full shadow-2xl shadow-brand-500/40 hover:scale-105 transition-all border-2 border-white/20 flex items-center gap-2 group cursor-pointer"
        >
          <MessageSquare className="w-6 h-6 fill-slate-950 text-brand-400" />
          <span className="hidden sm:inline font-black text-xs pr-1">Live Support</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
        </button>
      )}

      {/* Support Chat Box Window */}
      {isOpen && (
        <div className="glass-card w-[320px] sm:w-[360px] rounded-3xl border border-brand-500/30 p-5 shadow-2xl bg-dark-card animate-fade-in relative">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">MailVault Help Desk</h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online (24/7 Support)
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-dark-panel hover:bg-dark-hover text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Instant Social Channels */}
          <div className="space-y-2 mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Direct Contact Channels</span>
            
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://t.me/mailvault_support"
                target="_blank"
                rel="noreferrer"
                className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Telegram Admin</span>
              </a>

              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Ticket Form */}
          {sentNotice ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 my-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ticket Sent! Admin will reply via Telegram.</span>
            </div>
          ) : (
            <form onSubmit={handleSendTicket} className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Send In-App Ticket</span>
              
              <textarea
                rows={3}
                placeholder="Ask about rate, email verification, or bKash payout..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500"
              />

              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-dark-border text-center">
            <span className="text-[10px] text-slate-500 font-medium">Average Response Time: <strong>&lt; 5 Minutes</strong></span>
          </div>

        </div>
      )}

    </div>
  );
};
