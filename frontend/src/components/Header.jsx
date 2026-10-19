import React from 'react';
import { Sparkles, Sun, Moon } from 'lucide-react';

export default function Header({ dbStatus, theme, onToggleTheme, onSeedDemo, hasExpenses }) {
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 px-4 pt-3 pb-2.5 glass-surface border-b border-slate-200/80 dark:border-white/[0.06] backdrop-blur-2xl transition-colors duration-200">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: Avatar & Greeting */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[14px] flex items-center justify-center font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                ₹
              </div>
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-100 dark:border-slate-950 ${
                dbStatus.dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">PennyWise</h1>
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-white/[0.06]">
                MOBILE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <span>Smart Wealth & Waste</span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* MongoDB Atlas Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              dbStatus.dbConnected
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[11px] font-bold">{dbStatus.dbConnected ? 'Atlas Cloud' : 'Local Storage'}</span>
          </div>

          {!hasExpenses && (
            <button
              onClick={onSeedDemo}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 active:scale-95 transition-all shadow-sm shadow-indigo-500/20"
            >
              <Sparkles size={12} className="text-indigo-500 dark:text-indigo-400" />
              <span>Demo</span>
            </button>
          )}

          {/* THEME TOGGLE BUTTON (Replaces the Settings Icon) */}
          <button
            onClick={onToggleTheme}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-90 shadow-sm ${
              isDark
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300'
                : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-600 hover:bg-indigo-500/20 hover:text-indigo-700'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark and Light Mode"
          >
            {isDark ? (
              <Sun size={18} strokeWidth={2.4} className="text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon size={18} strokeWidth={2.4} className="text-indigo-600 transition-transform hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
