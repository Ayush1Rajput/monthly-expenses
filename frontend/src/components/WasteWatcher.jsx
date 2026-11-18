import React, { useState } from 'react';
import {
  Flame,
  PiggyBank,
  Sparkles,
  CheckCircle2,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { formatINR } from '../utils/categories';
import CategoryIcon from './CategoryIcon';

// Custom SVG Semicircular Leakage Signal Gauge
function LeakageGauge({ percentage = 0 }) {
  const clamped = Math.max(0, Math.min(100, Number(percentage) || 0));
  const radius = 44;
  const circumference = Math.PI * radius; // semicircle arc length
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const gaugeColor = clamped > 30 ? '#FF4D3D' : clamped > 15 ? '#FFB830' : '#C8FF2E';

  return (
    <div className="relative flex flex-col items-center justify-center w-28 h-16 flex-shrink-0">
      <svg viewBox="0 0 110 64" className="w-full h-full overflow-visible">
        {/* Background track */}
        <path
          d="M 11 55 A 44 44 0 0 1 99 55"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Active arc */}
        <path
          d="M 11 55 A 44 44 0 0 1 99 55"
          fill="none"
          stroke={gaugeColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute bottom-0 text-center">
        <span className="font-mono text-base font-extrabold tabular-nums leading-none" style={{ color: gaugeColor }}>
          {clamped}%
        </span>
        <span className="font-mono text-[8px] uppercase tracking-widest text-[#8E8E98] block">
          LEAK RATE
        </span>
      </div>
    </div>
  );
}

export default function WasteWatcher({ analytics, expenses, onDeleteExpense }) {
  const [cutPercentage, setCutPercentage] = useState(50);

  const summary = analytics?.summary || { totalSpent: 0, unnecessarySpent: 0, wastePercentage: 0 };
  const unnecessaryItems = expenses.filter(e => e.isUnnecessary);
  const unnecessaryCategories = analytics?.unnecessaryBreakdown || [];

  const monthlyWaste = summary.unnecessarySpent || 0;

  // Interactive Simulator Calculations
  const savedPerMonth = Math.round((monthlyWaste * cutPercentage) / 100);
  const oneYearSavings = Math.round(savedPerMonth * 12 * 1.06);
  const threeYearSavings = Math.round(savedPerMonth * 36 * 1.21);

  let healthRating = {
    label: 'OPTIMAL',
    badgeClass: 'bg-[#C8FF2E]/15 text-[#C8FF2E] border-[#C8FF2E]/35'
  };
  if (summary.wastePercentage > 30) {
    healthRating = {
      label: 'CRITICAL LEAK',
      badgeClass: 'bg-[#FF4D3D]/20 text-[#FF7A6E] border-[#FF4D3D]/45'
    };
  } else if (summary.wastePercentage > 15) {
    healthRating = {
      label: 'MODERATE LEAK',
      badgeClass: 'bg-[#FFB830]/20 text-[#FFB830] border-[#FFB830]/40'
    };
  }

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* 1. Vermilion Radar Hero Plate */}
      <div className="relative overflow-hidden rounded-[26px] p-5 atelier-vault-vermilion text-[#F5F4F0]">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF4D3D]/20 border border-[#FF4D3D]/40 text-[#FF7A6E] flex items-center justify-center">
                <Flame size={16} strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#FF7A6E] block">
                  LEAK RADAR
                </span>
                <span className="font-mono text-[9px] text-[#8E8E98]">AVOIDABLE SPEND MONITOR</span>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-lg font-mono text-[9px] font-extrabold tracking-wider border ${healthRating.badgeClass}`}>
              {healthRating.label}
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 mt-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A2A2AE] block">
                Avoidable Burn This Month
              </span>
              <h2 className="font-display text-[38px] leading-none font-extrabold text-[#FF7A6E] tracking-tight tabular-nums mt-1.5">
                {formatINR(summary.unnecessarySpent)}
              </h2>
              <span className="font-mono text-[10px] text-[#8E8E98] block mt-1.5">
                {unnecessaryItems.length} FLAGGED {unnecessaryItems.length === 1 ? 'ENTRY' : 'ENTRIES'}
              </span>
            </div>

            <LeakageGauge percentage={summary.wastePercentage} />
          </div>

          {/* Perforated Split Bar */}
          <div className="mt-5 pt-4 ticket-divider">
            <div className="flex justify-between font-mono text-[10px] font-bold mb-1.5">
              <span className="text-[#C8FF2E]">ESSENTIAL {100 - summary.wastePercentage}%</span>
              <span className="text-[#FF7A6E]">LEAKS {summary.wastePercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/[0.08] rounded-full overflow-hidden flex p-[2px]">
              <div
                className="bg-[#C8FF2E] rounded-l-full transition-all duration-500"
                style={{ width: `${100 - summary.wastePercentage}%` }}
              />
              <div
                className="bg-[#FF4D3D] rounded-r-full transition-all duration-500"
                style={{ width: `${summary.wastePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Wealth Recovery Simulator */}
      {monthlyWaste > 0 && (
        <div className="p-5 rounded-[24px] atelier-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#C8FF2E] border border-[#0A0A0C] text-[#0A0A0C] flex items-center justify-center">
                <PiggyBank size={18} strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="font-display text-sm font-extrabold text-[#141418] dark:text-[#F5F4F0]">
                  Wealth Recovery Fader
                </h3>
                <p className="font-mono text-[10px] text-[#6B6A64] dark:text-[#8E8E98]">
                  SAVE {formatINR(savedPerMonth)}/MO IF INVESTED
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-xl bg-[#141418] text-[#C8FF2E] dark:bg-[#C8FF2E] dark:text-[#0A0A0C]">
              -{cutPercentage}%
            </span>
          </div>

          <div className="mt-4">
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={cutPercentage}
              onChange={(e) => setCutPercentage(Number(e.target.value))}
              className="w-full atelier-slider bg-[#E7E1D3] dark:bg-white/[0.1]"
            />
            <div className="flex justify-between font-mono text-[9px] font-bold uppercase text-[#8E8E98] mt-2">
              <span>CUT 10%</span>
              <span>CUT 50%</span>
              <span>CUT 100%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <div className="p-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#19191F] border border-[#141418]/10 dark:border-white/[0.07]">
              <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-[#6B6A64] dark:text-[#8E8E98] block">
                1-YEAR SIP
              </span>
              <span className="font-mono text-lg font-extrabold text-[#16794B] dark:text-[#C8FF2E] tabular-nums block mt-0.5">
                {formatINR(oneYearSavings)}
              </span>
              <span className="font-mono text-[9px] text-[#8E8E98] block mt-0.5">@ 12% index est.</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141418] text-[#F5F4F0] border border-[#141418] dark:border-[#C8FF2E]/25">
              <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-[#A2A2AE] block">
                3-YEAR COMPOUND
              </span>
              <span className="font-mono text-lg font-extrabold text-[#C8FF2E] tabular-nums block mt-0.5">
                {formatINR(threeYearSavings)}
              </span>
              <span className="font-mono text-[9px] text-[#8E8E98] block mt-0.5">recovered wealth</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Smart Diagnostic Tips */}
      {analytics?.smartTips && analytics.smartTips.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Sparkles size={13} className="text-[#FFB830]" />
            <h3 className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#6B6A64] dark:text-[#8E8E98]">
              Diagnostic Notes
            </h3>
          </div>
          {analytics.smartTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 atelier-card rounded-2xl border-l-[3px] border-l-[#FFB830] text-xs text-[#141418] dark:text-[#E2E2EA] leading-relaxed flex items-start gap-2.5"
            >
              <ShieldAlert size={15} className="text-[#FFB830] flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* 4. Leak Categories Leaderboard */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#6B6A64] dark:text-[#8E8E98]">
            Top Leak Sources
          </h3>
          <span className="font-mono text-[10px] text-[#8E8E98]">{unnecessaryCategories.length} CATEGORIES</span>
        </div>

        {unnecessaryCategories.length === 0 ? (
          <div className="p-8 text-center atelier-card rounded-[24px]">
            <CheckCircle2 size={36} className="mx-auto text-[#16794B] dark:text-[#C8FF2E] mb-2.5" />
            <p className="font-display text-sm font-extrabold text-[#141418] dark:text-[#F5F4F0]">
              Zero Leaks Detected
            </p>
            <p className="text-xs text-[#6B6A64] dark:text-[#8E8E98] mt-1 max-w-[240px] mx-auto">
              Every rupee logged this month went toward true essentials.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {unnecessaryCategories.map((item, idx) => (
              <div
                key={item.name}
                className="p-3.5 atelier-card rounded-2xl space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] font-extrabold text-[#FF4D3D] w-5">
                      0{idx + 1}
                    </span>
                    <CategoryIcon category={item.name} size={16} className="p-2 rounded-xl" />
                    <div>
                      <h4 className="font-display text-xs font-extrabold text-[#141418] dark:text-[#F5F4F0]">
                        {item.name}
                      </h4>
                      <p className="font-mono text-[10px] text-[#E03424] dark:text-[#FF7A6E] font-bold">
                        {item.percentage}% OF TOTAL LEAKS
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-[#E03424] dark:text-[#FF7A6E] tabular-nums">
                    {formatINR(item.amount)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E7E1D3] dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF4D3D] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Flagged Items List */}
      {unnecessaryItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#6B6A64] dark:text-[#8E8E98]">
              Flagged Receipts ({unnecessaryItems.length})
            </h3>
          </div>

          <div className="space-y-2">
            {unnecessaryItems.map((exp) => (
              <div
                key={exp._id}
                className="p-3.5 atelier-row rounded-2xl border-l-[3px] border-l-[#FF4D3D] flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon category={exp.category} size={16} className="p-2 rounded-xl flex-shrink-0" />
                  <div className="truncate">
                    <h4 className="font-display text-xs font-extrabold text-[#141418] dark:text-[#F5F4F0] truncate">
                      {exp.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono text-[10px] text-[#6B6A64] dark:text-[#8E8E98]">
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()}
                      </span>
                      {exp.unnecessaryReason && (
                        <span className="font-mono text-[9px] font-bold bg-[#FF4D3D]/15 text-[#E03424] dark:text-[#FF7A6E] px-1.5 py-0.5 rounded-md truncate">
                          {exp.unnecessaryReason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
                  <span className="font-mono text-xs font-extrabold text-[#E03424] dark:text-[#FF7A6E] tabular-nums">
                    {formatINR(exp.amount)}
                  </span>
                  <button
                    onClick={() => onDeleteExpense(exp._id)}
                    className="p-1.5 rounded-lg text-[#8E8E98] hover:text-[#FF4D3D] hover:bg-[#FF4D3D]/10 active:scale-90 transition-all"
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
