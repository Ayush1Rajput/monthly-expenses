import React from 'react';
import { Sparkles, Sun, Moon } from 'lucide-react';

export default function Header({ dbStatus, theme, onToggleTheme, onSeedDemo, hasExpenses }) {
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 px-4 py-3 atelier-header transition-colors duration-200">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: Atelier Brand Stamp */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-[#C8FF2E] border-2 border-[#0A0A0C] flex items-center justify-center shadow-[0_3px_0_#0A0A0C] dark:shadow-[0_3px_0_#6B8F00] transition-transform group-hover:-rotate-3">
              <span className="font-display font-extrabold text-xl text-[#0A0A0C] leading-none">₹</span>
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#F3EFE6] dark:border-[#0A0A0C] ${
                dbStatus.dbConnected ? 'bg-[#22C55E] animate-pulse' : 'bg-[#FFB830]'
              }`}
              title={dbStatus.dbConnected ? 'Atlas Connected' : 'Local Mode'}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-base font-extrabold tracking-tight text-[#141418] dark:text-[#F5F4F0] leading-none">
                PennyWise
              </h1>
              <span className="font-mono text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-md bg-[#141418] text-[#C8FF2E] dark:bg-white/[0.08] dark:text-[#C8FF2E] border border-[#141418]/10 dark:border-white/[0.08]">
                LEDGER
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#6B6A64] dark:text-[#8E8E98] tracking-wide mt-0.5">
              INR // WEALTH &amp; LEAK RADAR
            </p>
          </div>
        </div>

        {/* Right: Hardware Status + Theme Flip */}
        <div className="flex items-center gap-2">
          {/* Status Indicator Chip */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider border transition-all ${
              dbStatus.dbConnected
                ? 'bg-[#22C55E]/10 text-[#16794B] dark:text-[#C8FF2E] border-[#22C55E]/30'
                : 'bg-[#FFB830]/15 text-[#9A6300] dark:text-[#FFB830] border-[#FFB830]/35'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dbStatus.dbConnected ? 'bg-[#22C55E] animate-pulse' : 'bg-[#FFB830]'
              }`}
            />
            <span>{dbStatus.dbConnected ? 'Atlas' : 'Local'}</span>
          </div>

          {!hasExpenses && (
            <button
              onClick={onSeedDemo}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider bg-[#7C7CFF]/15 text-[#4B4BC7] dark:text-[#B3B3FF] border border-[#7C7CFF]/35 active:scale-95 transition-all"
            >
              <Sparkles size={11} />
              <span>Demo</span>
            </button>
          )}

          {/* Tactile Theme Toggle Key */}
          <button
            onClick={onToggleTheme}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:translate-y-[1px] ${
              isDark
                ? 'bg-[#19191F] border-white/[0.12] text-[#C8FF2E] hover:border-[#C8FF2E]/50'
                : 'bg-[#FFFDF8] border-[#141418]/20 text-[#141418] shadow-[0_2px_0_rgba(20,20,24,0.12)] hover:border-[#141418]'
            }`}
            title={isDark ? 'Switch to Parchment Light' : 'Switch to Obsidian Dark'}
            aria-label="Toggle Dark and Light Mode"
          >
            {isDark ? (
              <Sun size={16} strokeWidth={2.4} className="transition-transform hover:rotate-45" />
            ) : (
              <Moon size={16} strokeWidth={2.4} className="transition-transform hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
