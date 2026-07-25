import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryId, EmailCategory } from '../types';
import { Calculator, Mail, Archive, ShieldCheck, GraduationCap, Inbox, ArrowRight, CheckCircle2, PauseCircle, HelpCircle } from 'lucide-react';

interface RateCardProps {
  onSelectCategoryToSell: (categoryId: CategoryId) => void;
}

export const RateCard: React.FC<RateCardProps> = ({ onSelectCategoryToSell }) => {
  const { categories } = useApp();
  const [calcCategory, setCalcCategory] = useState<CategoryId>('gmail_old');
  const [calcQuantity, setCalcQuantity] = useState<number>(25);

  const selectedCategoryObj = categories.find(c => c.id === calcCategory) || categories[0];
  const calculatedEarnings = (selectedCategoryObj ? selectedCategoryObj.ratePerUnit : 0) * calcQuantity;

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail': return <Mail className="w-6 h-6 text-brand-400" />;
      case 'Archive': return <Archive className="w-6 h-6 text-accent-cyan" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6 text-amber-400" />;
      case 'Inbox': return <Inbox className="w-6 h-6 text-purple-400" />;
      default: return <Mail className="w-6 h-6 text-brand-400" />;
    }
  };

  return (
    <section id="pricing" className="py-16 border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Today's <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-cyan">Buying Rate Sheet</span>
          </h2>
          <p className="mt-3 text-slate-400">
            Prices are updated daily by Admin based on market demand. No hidden fees or commissions.
          </p>
        </div>

        {/* Rate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`glass-card p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                cat.status === 'ACTIVE'
                  ? 'border-dark-border hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/10'
                  : 'border-dark-border opacity-70 bg-dark-card/40'
              }`}
            >
              <div>
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-dark-panel border border-dark-border flex items-center justify-center">
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{cat.name}</h3>
                      <p className="text-xs text-slate-400">Min Batch: {cat.minBatch} pcs</p>
                    </div>
                  </div>

                  {cat.status === 'ACTIVE' ? (
                    <span className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Buying</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-1">
                      <PauseCircle className="w-3 h-3" />
                      <span>Paused</span>
                    </span>
                  )}
                </div>

                {/* Rate Display */}
                <div className="bg-dark-panel p-4 rounded-xl border border-dark-border mb-4">
                  <div className="text-xs text-slate-400 mb-1">Current Rate per Email</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-400">৳{cat.ratePerUnit}</span>
                    <span className="text-xs text-slate-400 font-medium">/ per account</span>
                  </div>
                </div>

                {/* Description & Format */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {cat.description}
                </p>

                <div className="bg-dark-bg/60 p-2.5 rounded-lg border border-dark-border/60 text-[11px] font-mono text-slate-400 flex items-center gap-2 mb-6">
                  <HelpCircle className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                  <span className="truncate">Format: <strong>{cat.formatGuide}</strong></span>
                </div>

              </div>

              {/* Action Button */}
              <button
                disabled={cat.status !== 'ACTIVE'}
                onClick={() => onSelectCategoryToSell(cat.id)}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  cat.status === 'ACTIVE'
                    ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 cursor-pointer'
                    : 'bg-dark-hover text-slate-500 cursor-not-allowed border border-dark-border'
                }`}
              >
                <span>{cat.status === 'ACTIVE' ? 'Sell Now at ৳' + cat.ratePerUnit : 'Stock Full - Paused'}</span>
                {cat.status === 'ACTIVE' && <ArrowRight className="w-4 h-4" />}
              </button>

            </div>
          ))}
        </div>

        {/* Interactive Earnings Calculator Box */}
        <div className="mt-16 glass-card p-8 rounded-3xl border border-brand-500/30 bg-gradient-to-r from-dark-card via-dark-panel to-dark-card shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Live Earnings Calculator</h3>
              <p className="text-xs text-slate-400">Calculate how much cash you will receive for your bulk emails</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Select Email Type</label>
              <select
                value={calcCategory}
                onChange={(e) => setCalcCategory(e.target.value as CategoryId)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (৳{c.ratePerUnit}/pc)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Quantity (Number of Emails)</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={calcQuantity}
                onChange={(e) => setCalcQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            {/* Total Result Box */}
            <div className="bg-brand-500/10 border border-brand-500/40 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Estimated Total Payout</span>
                <span className="text-3xl font-black text-emerald-400">৳{calculatedEarnings.toLocaleString()}</span>
              </div>

              <button
                onClick={() => onSelectCategoryToSell(calcCategory)}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                Sell Now
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
