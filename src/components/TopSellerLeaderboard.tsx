import React from 'react';
import { Trophy, Award, Flame, CheckCircle2 } from 'lucide-react';

export const TopSellerLeaderboard: React.FC = () => {
  const topSellers = [
    { rank: 1, name: 'Tanvir Hossain', tier: '🥇 Gold VIP', totalEarned: 64200, count: 3200, badgeColor: 'border-amber-400/40 bg-amber-500/10 text-amber-400' },
    { rank: 2, name: 'Karim Ahmed', tier: '🥇 Gold VIP', totalEarned: 48500, count: 2410, badgeColor: 'border-slate-300/40 bg-slate-400/10 text-slate-300' },
    { rank: 3, name: 'Robiul Islam', tier: '🥈 Silver', totalEarned: 32100, count: 1600, badgeColor: 'border-amber-600/40 bg-amber-600/10 text-amber-500' },
    { rank: 4, name: 'Sabbir Hossain', tier: '🥈 Silver', totalEarned: 24500, count: 1220, badgeColor: 'border-purple-500/40 bg-purple-500/10 text-purple-400' },
    { rank: 5, name: 'Fahim Morshed', tier: '🥉 Bronze', totalEarned: 18900, count: 940, badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  ];

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-dark-card via-dark-panel to-dark-card shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white">Weekly Top Seller Leaderboard</h3>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3 fill-amber-400" /> Live Rankings
              </span>
            </div>
            <p className="text-xs text-slate-400">Top email suppliers receiving weekly cash bonuses & 10-minute instant payouts</p>
          </div>
        </div>

        <div className="bg-dark-bg px-4 py-2 rounded-xl border border-dark-border text-xs text-slate-400 flex items-center gap-2 shrink-0">
          <span>Weekly Pool Payouts:</span>
          <strong className="text-emerald-400 font-extrabold text-sm">৳1,88,700 BDT</strong>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-dark-border text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Seller Name</th>
              <th className="py-3 px-4">Tier Status</th>
              <th className="py-3 px-4">Emails Approved</th>
              <th className="py-3 px-4 text-right">Weekly Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/60 text-xs">
            {topSellers.map((seller) => (
              <tr key={seller.rank} className="hover:bg-dark-hover/40 transition-all">
                <td className="py-3.5 px-4 font-black">
                  {seller.rank === 1 && <span className="text-amber-400 text-sm">🥇 #1</span>}
                  {seller.rank === 2 && <span className="text-slate-300 text-sm">🥈 #2</span>}
                  {seller.rank === 3 && <span className="text-amber-600 text-sm">🥉 #3</span>}
                  {seller.rank > 3 && <span className="text-slate-500 font-mono">#{seller.rank}</span>}
                </td>

                <td className="py-3.5 px-4 font-bold text-white">
                  {seller.name}
                </td>

                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${seller.badgeColor}`}>
                    {seller.tier}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-slate-300 font-mono">
                  {seller.count.toLocaleString()} accounts
                </td>

                <td className="py-3.5 px-4 text-right font-black text-emerald-400 text-sm">
                  ৳{seller.totalEarned.toLocaleString()} BDT
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
