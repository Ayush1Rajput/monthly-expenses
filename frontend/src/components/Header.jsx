import React from 'react';
import { Database, Settings, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function Header({ dbStatus, onOpenSettings, onSeedDemo, hasExpenses }) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-3 pb-2.5 glass-surface border-b border-white/[0.06] backdrop-blur-2xl">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: Avatar & Greeting */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-extrabold text-base text-emerald-400">
                ₹
              </div>
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                dbStatus.dbConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white tracking-tight">PennyWise</h1>
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-white/[0.08] text-slate-300 border border-white/[0.06]">
                MOBILE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span>Smart Wealth & Waste</span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* MongoDB Atlas Status Pill */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              dbStatus.dbConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[11px] font-bold">{dbStatus.dbConnected ? 'Atlas Cloud' : 'Local Storage'}</span>
          </button>

          {!hasExpenses && (
            <button
              onClick={onSeedDemo}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 active:scale-95 transition-all shadow-sm shadow-indigo-500/20"
            >
              <Sparkles size={12} className="text-indigo-400" />
              <span>Demo</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-all"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
