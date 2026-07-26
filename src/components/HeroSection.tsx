import React from 'react';
import { useApp } from '../context/AppContext';
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, Zap, DollarSign } from 'lucide-react';

interface HeroSectionProps {
  onStartSell: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartSell }) => {
  const { totalEmailsBought, categories } = useApp();

  const totalActiveCategories = categories.filter(c => c.status === 'ACTIVE').length;

  return (
    <div className="relative overflow-hidden pt-8 sm:pt-12 pb-20 sm:pb-16 border-b border-dark-border/50">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-[10px] sm:text-xs font-semibold mb-5 sm:mb-6 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="hidden sm:inline">Direct Admin Procurement Portal • Guaranteed Payout</span>
            <span className="sm:hidden">Guaranteed Payout • Instant Cash</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Sell Your Emails <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-accent-cyan to-accent-emerald">
              Directly To Us
            </span> for Daily Cash
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-slate-300 leading-relaxed">
            We purchase verified <strong className="text-emerald-400">Gmail, Old Gmail, Edu Mail &amp; Outlook</strong> accounts in bulk. Upload your file, get auto-verified by Admin, and cash out instantly via <strong className="text-white">bKash, Nagad &amp; Crypto</strong>.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartSell}
              className="w-full sm:w-auto bg-gradient-to-r from-brand-500 to-accent-cyan text-slate-950 font-bold px-8 py-4 rounded-xl text-base hover:scale-105 transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-3"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>Sell Bulk Emails Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#pricing"
              className="w-full sm:w-auto bg-dark-card hover:bg-dark-hover text-slate-200 border border-dark-border font-medium px-6 py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2"
            >
              <span>View Today's Rate Sheet</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
            <div className="glass-card p-4 rounded-xl border border-dark-border">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Buying Status</span>
              </div>
              <p className="text-xl font-bold text-white">{totalActiveCategories} Categories Active</p>
            </div>

              <div className="glass-card p-4 rounded-xl border border-dark-border">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Mail className="w-4 h-4 text-accent-cyan" />
                  <span>Total Purchased</span>
                </div>
                <p className="text-xl font-bold text-white">{totalEmailsBought.toLocaleString()} Mails</p>
              </div>

            <div className="glass-card p-4 rounded-xl border border-dark-border">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Avg Verification</span>
              </div>
              <p className="text-xl font-bold text-white">15-30 Minutes</p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-dark-border">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Min Cashout</span>
              </div>
              <p className="text-xl font-bold text-white">৳100 Only</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
