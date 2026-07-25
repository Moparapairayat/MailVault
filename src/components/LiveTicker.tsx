import React from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export const LiveTicker: React.FC = () => {
  const { categories } = useApp();

  const tickerItems = [
    ...categories.map(c => `🔥 ${c.name}: ৳${c.ratePerUnit}/pc (${c.status})`),
    "⚡ Fast Payout via bKash, Nagad & Rocket within 30 min",
    "🛡️ 100% Direct Procurement - No middleman commission",
    "🎉 Recent Payout: Seller Karim A. withdrew ৳500 via bKash",
    "🎉 Recent Payout: Seller Rahim C. withdrew ৳1,450 via Nagad",
  ];

  return (
    <div className="bg-dark-card/90 border-y border-dark-border py-2 overflow-hidden relative">
      <div className="flex items-center">
        
        {/* Sticky Label */}
        <div className="bg-brand-500/20 text-brand-400 border-r border-dark-border px-4 py-1 flex items-center gap-2 text-xs font-bold shrink-0 z-10">
          <Zap className="w-3.5 h-3.5 fill-brand-400" />
          <span>LIVE MARKET</span>
        </div>

        {/* Marquee Track */}
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-marquee flex items-center gap-8 text-xs text-slate-300 font-medium">
            {tickerItems.concat(tickerItems).map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2">
                <span className="text-slate-200">{item}</span>
                <span className="text-dark-border">|</span>
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
