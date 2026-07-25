import React from 'react';
import { Mail, ShieldCheck, Zap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-bg border-t border-dark-border py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-slate-950 font-bold">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl text-white">
                Mail<span className="text-brand-400">Vault</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The #1 Direct Email Procurement Portal in Bangladesh. We buy verified Gmails, Old accounts, Edu mails, and Outlook directly from sellers.
            </p>
          </div>

          {/* Col 2: Supported Payment Methods */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">Supported Payout Methods</h4>
            <ul className="space-y-2 font-semibold">
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span> bKash Personal (Instant)
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> Nagad Personal (Instant)
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Dutch Bangla Rocket
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Binance Crypto (USDT TRC20)
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Admin Guarantees */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">Seller Benefits</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Middleman Commission</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Fast 15-Min Email Review</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                <span>Automatic Duplicate Email Filter</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">Admin Support</h4>
            <p className="text-slate-400 mb-2">Have a custom bulk deal or business query?</p>
            <div className="bg-dark-card p-3 rounded-xl border border-dark-border text-slate-200 font-mono text-xs">
              Telegram: @MailVaultAdmin<br/>
              WhatsApp: +880 1700-000000
            </div>
          </div>

        </div>

        <div className="border-t border-dark-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500">
          <p>© {new Date().getFullYear()} MailVault. All rights reserved. Vercel Serverless Ready.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            <span>Built with Next-Gen Tech</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
