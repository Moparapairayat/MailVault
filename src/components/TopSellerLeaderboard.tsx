import React from 'react';
import { Trophy, Flame, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopSellerLeaderboard: React.FC = () => {
  const { submissions } = useApp();

  // Calculate leaderboard from real Supabase submissions data
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklySubmissions = submissions.filter(s => s.status === 'APPROVED' && new Date(s.submittedAt) >= oneWeekAgo);

  const sellerMap: Record<string, { name: string; count: number; earned: number }> = {};
  for (const s of weeklySubmissions) {
    if (!sellerMap[s.sellerId]) {
      sellerMap[s.sellerId] = { name: s.sellerName, count: 0, earned: 0 };
    }
    sellerMap[s.sellerId].count += 1;
    sellerMap[s.sellerId].earned += s.rate || 0;
  }

  const topSellers = Object.values(sellerMap)
    .sort((a, b) => b.earned - a.earned)
    .slice(0, 5)
    .map((seller, i) => ({
      rank: i + 1,
      name: seller.name,
      count: seller.count,
      earned: seller.earned,
      tier:
        i === 0 ? '🥇 Gold VIP' :
        i <= 1 ? '🥈 Silver' :
        i <= 3 ? '🥉 Bronze' :
                  '🥉 Bronze',
      badgeColor:
        i === 0 ? 'border-amber-400/40 bg-amber-500/10 text-amber-400' :
        i === 1 ? 'border-slate-300/40 bg-slate-400/10 text-slate-300' :
        i === 2 ? 'border-amber-600/40 bg-amber-600/10 text-amber-500' :
        i === 3 ? 'border-purple-500/40 bg-purple-500/10 text-purple-400' :
                  'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
    }));

  const totalWeeklyPool = topSellers.reduce((a, b) => a + b.earned, 0);

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
            <p className="text-xs text-slate-400">Top email suppliers ranked by approved weekly earnings</p>
          </div>
        </div>

        <div className="bg-dark-bg px-4 py-2 rounded-xl border border-dark-border text-xs text-slate-400 flex items-center gap-2 shrink-0">
          <span>Weekly Approved Payouts:</span>
          <strong className="text-emerald-400 font-extrabold text-sm">৳{totalWeeklyPool.toLocaleString()} BDT</strong>
        </div>
      </div>

      {topSellers.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="font-semibold text-sm">No approved submissions this week yet.</p>
          <p className="text-xs text-slate-600 mt-1">Submit emails and get approved to appear on the leaderboard!</p>
        </div>
      ) : (
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
                    {seller.name.length > 12 ? seller.name.substring(0, 3) + '***' + seller.name.slice(-2) : seller.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${seller.badgeColor}`}>
                      {seller.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                    {seller.count.toLocaleString()} pcs
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-400">
                    ৳{seller.earned.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
