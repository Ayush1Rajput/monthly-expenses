import React, { useState } from 'react';
import {
  AlertOctagon,
  TrendingDown,
  PiggyBank,
  Sparkles,
  Flame,
  CheckCircle2,
  Trash2,
  Sliders,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { formatINR } from '../utils/categories';
import CategoryIcon from './CategoryIcon';

export default function WasteWatcher({ analytics, expenses, onDeleteExpense }) {
  const [cutPercentage, setCutPercentage] = useState(50); // Cut 50% by default in simulator

  const summary = analytics?.summary || { totalSpent: 0, unnecessarySpent: 0, wastePercentage: 0 };
  const unnecessaryItems = expenses.filter(e => e.isUnnecessary);
  const unnecessaryCategories = analytics?.unnecessaryBreakdown || [];

  const monthlyWaste = summary.unnecessarySpent || 0;
  
  // Interactive Simulator Calculations
  const savedPerMonth = Math.round((monthlyWaste * cutPercentage) / 100);
  const oneYearSavings = Math.round(savedPerMonth * 12 * 1.06); // 12% compounding
  const threeYearSavings = Math.round(savedPerMonth * 36 * 1.21);

  // Waste Health Rating
  let healthRating = { label: 'Optimal Mindset', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' };
  if (summary.wastePercentage > 30) {
    healthRating = { label: 'Critical Money Leaks', color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' };
  } else if (summary.wastePercentage > 15) {
    healthRating = { label: 'Moderate Leakage', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' };
  }

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* 1. Waste Hero Radar Card */}
      <div className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border border-rose-500/30 shadow-2xl shadow-rose-950/30">
        <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-400">
                <AlertOctagon size={18} />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-300 block">
                  Waste Watcher Radar
                </span>
                <span className="text-[10px] text-slate-400">Avoidable Spending Detection</span>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${healthRating.bg} ${healthRating.color} ${healthRating.border}`}>
              {healthRating.label}
            </span>
          </div>

          <div className="mt-2">
            <span className="text-xs text-slate-400 font-semibold block">Avoidable Money Spent This Month</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h2 className="text-4xl font-black text-rose-400 tracking-tight">
                {formatINR(summary.unnecessarySpent)}
              </h2>
              <span className="text-xs text-slate-400 font-semibold">
                ({summary.wastePercentage}% of budget)
              </span>
            </div>
          </div>

          {/* Progress split */}
          <div className="mt-4 pt-3 border-t border-rose-500/20">
            <div className="flex justify-between text-[11px] font-bold mb-1.5">
              <span className="text-emerald-400">Essential: {100 - summary.wastePercentage}%</span>
              <span className="text-rose-400">Unnecessary: {summary.wastePercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-white/[0.05]">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${100 - summary.wastePercentage}%` }}
              />
              <div
                className="bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-500"
                style={{ width: `${summary.wastePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Wealth Recovery Simulator */}
      {monthlyWaste > 0 && (
        <div className="p-5 rounded-[28px] glass-card-interactive border border-emerald-500/25 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400">
                <PiggyBank size={18} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white">Wealth Recovery Simulator</h3>
                <p className="text-[10px] text-slate-400">See what happens when you cut waste</p>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Cut {cutPercentage}%
            </span>
          </div>

          {/* Interactive Range Slider */}
          <div className="mt-3">
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={cutPercentage}
              onChange={(e) => setCutPercentage(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
              <span>Cut 10%</span>
              <span>Cut 50%</span>
              <span>Cut 100%</span>
            </div>
          </div>

          {/* Dynamic wealth cards */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-center">
            <div className="p-3 bg-slate-950/70 rounded-2xl border border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">In 1 Year</span>
              <span className="text-base font-black text-emerald-400">~{formatINR(oneYearSavings)}</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">at 12% mutual fund</span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-2xl border border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">In 3 Years (SIP)</span>
              <span className="text-base font-black text-teal-300">~{formatINR(threeYearSavings)}</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">compounded return</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Smart Tips */}
      {analytics?.smartTips && analytics.smartTips.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Sparkles size={14} className="text-amber-400" />
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Smart Waste Reduction Tips
            </h3>
          </div>
          {analytics.smartTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 glass-card-interactive rounded-2xl border border-white/[0.06] text-xs text-slate-200 leading-relaxed flex items-start gap-2.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* 4. Top Unnecessary Spending Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Where Your Leaks Are
          </h3>
          <span className="text-[11px] text-slate-500">{unnecessaryCategories.length} categories</span>
        </div>

        {unnecessaryCategories.length === 0 ? (
          <div className="p-8 text-center glass-card-interactive rounded-[28px] border border-white/[0.06]">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-sm font-bold text-white">No Extra Spend Logged This Month!</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">
              Every single rupee was spent on essentials. That's financial mastery!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {unnecessaryCategories.map((item, idx) => (
              <div
                key={item.name}
                className="p-3.5 glass-card-interactive rounded-2xl border border-white/[0.06] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <CategoryIcon category={item.name} size={18} className="p-2.5 rounded-2xl" />
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">{item.name}</h4>
                    <p className="text-[11px] text-rose-400 font-bold">{item.percentage}% of total waste</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-rose-400">{formatINR(item.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Flagged Expenses List */}
      {unnecessaryItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Flagged Items ({unnecessaryItems.length})
            </h3>
          </div>

          <div className="space-y-2">
            {unnecessaryItems.map((exp) => (
              <div
                key={exp._id}
                className="p-3.5 glass-card-interactive rounded-2xl border border-rose-500/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon category={exp.category} size={16} className="p-2 rounded-xl" />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{exp.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      {exp.unnecessaryReason && (
                        <span className="text-[9px] font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded-full truncate">
                          {exp.unnecessaryReason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-black text-rose-400">
                    {formatINR(exp.amount)}
                  </span>
                  <button
                    onClick={() => onDeleteExpense(exp._id)}
                    className="p-1.5 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
