import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  AlertTriangle,
  TrendingUp,
  PieChart as PieIcon
} from 'lucide-react';
import { formatINR, getCategoryMeta } from '../utils/categories';
import CategoryIcon from './CategoryIcon';

export default function YearlyReview({ yearlyData, selectedYear, onYearChange, onSelectMonth, theme }) {
  const [activeView, setActiveView] = useState('trends'); // 'trends' | 'categories' | 'wrapped'
  const isDark = theme === 'dark';

  const trends = yearlyData?.monthlyTrends || [];
  const categories = yearlyData?.categoryDistribution || [];
  const review = yearlyData?.yearInReview || {};

  const triggerConfetti = () => {
    confetti({
      particleCount: 95,
      spread: 75,
      colors: ['#C8FF2E', '#FF4D3D', '#7C7CFF', '#FFB830', '#F5F4F0'],
      origin: { y: 0.62 }
    });
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  const essentialStroke = isDark ? '#C8FF2E' : '#16794B';
  const gridStroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(20,20,24,0.08)';
  const axisStroke = isDark ? '#8E8E98' : '#6B6A64';

  const peakMonthName = review.highestMonth?.name;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#141418] text-[#F5F4F0] border border-white/[0.15] p-3 rounded-xl shadow-2xl font-mono text-[11px]">
          <p className="font-extrabold text-[#C8FF2E] uppercase tracking-wider mb-1.5">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-[#A2A2AE]">
                <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="font-extrabold text-[#F5F4F0] tabular-nums">{formatINR(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* 1. Year Selector & Hardware View Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#E7E1D3] dark:bg-[#131317] border border-[#141418]/12 dark:border-white/[0.08]">
          {yearOptions.map((y) => (
            <button
              key={y}
              onClick={() => onYearChange(y)}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-extrabold transition-all active:scale-95 ${
                selectedYear === y
                  ? 'bg-[#141418] text-[#C8FF2E] dark:bg-[#C8FF2E] dark:text-[#0A0A0C]'
                  : 'text-[#6B6A64] dark:text-[#8E8E98] hover:text-[#141418] dark:hover:text-white'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#E7E1D3] dark:bg-[#131317] border border-[#141418]/12 dark:border-white/[0.08]">
          <button
            onClick={() => setActiveView('trends')}
            className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-extrabold uppercase flex items-center gap-1 transition-all active:scale-95 ${
              activeView === 'trends'
                ? 'bg-[#FFFDF8] dark:bg-white text-[#0A0A0C] shadow-sm'
                : 'text-[#6B6A64] dark:text-[#8E8E98]'
            }`}
          >
            <TrendingUp size={12} />
            <span>Flow</span>
          </button>
          <button
            onClick={() => setActiveView('categories')}
            className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-extrabold uppercase flex items-center gap-1 transition-all active:scale-95 ${
              activeView === 'categories'
                ? 'bg-[#FFFDF8] dark:bg-white text-[#0A0A0C] shadow-sm'
                : 'text-[#6B6A64] dark:text-[#8E8E98]'
            }`}
          >
            <PieIcon size={12} />
            <span>Mix</span>
          </button>
          <button
            onClick={() => {
              setActiveView('wrapped');
              triggerConfetti();
            }}
            className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-extrabold uppercase flex items-center gap-1 transition-all active:scale-95 ${
              activeView === 'wrapped'
                ? 'bg-[#C8FF2E] text-[#0A0A0C] border border-[#0A0A0C]'
                : 'text-[#6B6A64] dark:text-[#8E8E98]'
            }`}
          >
            <Sparkles size={12} />
            <span>Pass</span>
          </button>
        </div>
      </div>

      {/* 2. Flagship Annual Dossier Vault Card */}
      <div className="relative overflow-hidden rounded-[26px] p-5 atelier-vault-cobalt text-[#F5F4F0]">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#B3B3FF]">
              ANNUAL DOSSIER // {selectedYear}
            </span>
            <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-md bg-white/[0.08] text-[#C8FF2E] border border-white/[0.1] font-bold">
              {review.totalTransactions || 0} TXNS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E8E98] block">Total Outflow</span>
              <h2 className="font-display text-3xl font-extrabold text-[#F5F4F0] tracking-tight tabular-nums mt-1">
                {formatINR(review.totalSpent)}
              </h2>
            </div>
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#FF7A6E] block">Avoidable Burn</span>
              <h2 className="font-display text-3xl font-extrabold text-[#FF7A6E] tracking-tight tabular-nums mt-1">
                {formatINR(review.unnecessarySpent)}
              </h2>
              <span className="font-mono text-[9px] text-[#FF7A6E]/80 font-bold block mt-0.5">
                {review.wastePercentage || 0}% OF ANNUAL
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3.5 ticket-divider flex items-center justify-between">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E8E98] block">Monthly Avg</span>
              <span className="font-mono text-xs font-extrabold text-[#C8FF2E] tabular-nums">
                {formatINR(review.monthlyAverage)}/mo
              </span>
            </div>
            {review.highestMonth && (
              <div className="text-right">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E8E98] block">Peak Month</span>
                <span className="font-mono text-xs font-extrabold text-[#FFB830] tabular-nums">
                  {review.highestMonth.name.toUpperCase()} ({formatINR(review.highestMonth.amount)})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. VIEW 1: 12-MONTH FLOW CHARTS */}
      {activeView === 'trends' && (
        <div className="space-y-4">
          <div className="p-5 rounded-[24px] atelier-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-sm font-extrabold text-[#141418] dark:text-[#F5F4F0]">
                  12-Month Outflow Curve
                </h3>
                <p className="font-mono text-[10px] text-[#6B6A64] dark:text-[#8E8E98]">
                  ESSENTIAL VS LEAK TRAJECTORY
                </p>
              </div>
              <div className="flex items-center gap-2.5 font-mono text-[9px] font-bold uppercase">
                <span className="flex items-center gap-1 text-[#16794B] dark:text-[#C8FF2E]">
                  <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: essentialStroke }} /> Ess
                </span>
                <span className="flex items-center gap-1 text-[#E03424] dark:text-[#FF7A6E]">
                  <span className="w-2 h-2 rounded-[2px] bg-[#FF4D3D]" /> Leak
                </span>
              </div>
            </div>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={essentialStroke} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={essentialStroke} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLeak" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4D3D" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#FF4D3D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 4" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="month" stroke={axisStroke} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisStroke} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="necessary"
                    name="Essential"
                    stroke={essentialStroke}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorEss)"
                  />
                  <Area
                    type="monotone"
                    dataKey="unnecessary"
                    name="Avoidable"
                    stroke="#FF4D3D"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorLeak)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clickable Month Bar Matrix */}
          <div className="p-5 rounded-[24px] atelier-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-sm font-extrabold text-[#141418] dark:text-[#F5F4F0]">
                  Monthly Drill-Down
                </h3>
                <p className="font-mono text-[10px] text-[#6B6A64] dark:text-[#8E8E98]">
                  TAP ANY MONTH BAR TO OPEN LEDGER
                </p>
              </div>
              <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#C8FF2E]/20 text-[#16794B] dark:text-[#C8FF2E]">
                PEAK HIGHLIGHTED
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 5, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 4" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="month" stroke={axisStroke} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisStroke} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="total"
                    name="Total Spend"
                    radius={[6, 6, 2, 2]}
                    onClick={(data) => {
                      if (data && data.monthIndex && onSelectMonth) {
                        onSelectMonth(data.monthIndex);
                      }
                    }}
                    cursor="pointer"
                  >
                    {trends.map((entry, idx) => (
                      <Cell
                        key={`bar-${idx}`}
                        fill={entry.month === peakMonthName ? (isDark ? '#C8FF2E' : '#141418') : '#7C7CFF'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW 2: FULL YEAR CATEGORY MIX */}
      {activeView === 'categories' && (
        <div className="space-y-4">
          <div className="p-5 rounded-[24px] atelier-card">
            <h3 className="font-display text-sm font-extrabold text-[#141418] dark:text-[#F5F4F0] mb-1">
              {selectedYear} Category Allocation
            </h3>
            <p className="font-mono text-[10px] text-[#6B6A64] dark:text-[#8E8E98] mb-2">
              365-DAY SPEND DISTRIBUTION
            </p>

            {categories.length > 0 ? (
              <div className="relative h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {categories.map((entry, index) => {
                        const meta = getCategoryMeta(entry.name);
                        return <Cell key={`cell-${index}`} fill={meta.color} />;
                      })}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#8E8E98]">TOTAL</span>
                  <span className="font-mono text-sm font-extrabold text-[#141418] dark:text-[#F5F4F0] tabular-nums">
                    {formatINR(review.totalSpent)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center font-mono text-xs text-[#8E8E98]">NO DATA LOGGED FOR {selectedYear}</div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#6B6A64] dark:text-[#8E8E98] px-1">
              Ranked Slices
            </h4>
            {categories.map((cat, idx) => (
              <div key={cat.name} className="p-3.5 atelier-row rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold text-[#8E8E98] w-4">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <CategoryIcon category={cat.name} size={16} className="p-2 rounded-xl" />
                  <div>
                    <h5 className="font-display text-xs font-extrabold text-[#141418] dark:text-[#F5F4F0]">{cat.name}</h5>
                    <p className="font-mono text-[10px] text-[#6B6A64] dark:text-[#8E8E98]">{cat.percentage}% SHARE</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-extrabold text-[#141418] dark:text-[#F5F4F0] tabular-nums">
                  {formatINR(cat.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. VIEW 3: EDITORIAL COLLECTOR PASS ("WRAPPED") */}
      {activeView === 'wrapped' && (
        <div className="space-y-3.5">
          {/* Collector Ticket Pass */}
          <div className="rounded-[28px] overflow-hidden atelier-vault text-[#F5F4F0]">
            {/* Top Acid-Lime Header Band */}
            <div className="bg-[#C8FF2E] text-[#0A0A0C] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-widest">
                <Sparkles size={13} strokeWidth={2.6} />
                <span>PENNYWISE WRAPPED PASS</span>
              </div>
              <span className="font-mono text-[10px] font-extrabold">ED. {selectedYear}</span>
            </div>

            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FFB830]/15 border border-[#FFB830]/35 text-[#FFB830] flex items-center justify-center mx-auto mb-3">
                <Trophy size={24} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8E8E98] block">
                ANNUAL VOLUME MANAGED
              </span>
              <p className="font-display text-4xl font-extrabold text-[#F5F4F0] tabular-nums mt-1.5">
                {formatINR(review.totalSpent)}
              </p>
              <p className="font-mono text-[11px] text-[#A2A2AE] mt-2">
                ACROSS <strong className="text-[#C8FF2E]">{review.totalTransactions || 0}</strong> VERIFIED ENTRIES
              </p>
            </div>

            {/* Perforated Stub Section */}
            <div className="mx-5 pt-4 pb-5 ticket-divider">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase text-[#FF7A6E]">
                  <AlertTriangle size={13} />
                  <span>AVOIDABLE LEAK REPORT</span>
                </div>
                <span className="font-mono text-[10px] font-extrabold text-[#FF7A6E]">
                  {review.wastePercentage || 0}%
                </span>
              </div>
              <p className="font-mono text-2xl font-extrabold text-[#FF7A6E] tabular-nums">
                {formatINR(review.unnecessarySpent)}
              </p>

              <div className="mt-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E8E98] block">
                  IF INVESTED AT 12% INDEX RETURN
                </span>
                <span className="font-mono text-base font-extrabold text-[#C8FF2E] tabular-nums block mt-0.5">
                  {formatINR(review.potentialSavingsIfInvested)} POTENTIAL
                </span>
              </div>
            </div>
          </div>

          {/* Peak vs Economical Duel Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-4 rounded-2xl atelier-card border-t-[3px] border-t-[#FFB830] text-center">
              <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-[#9A6300] dark:text-[#FFB830] block mb-1">
                PEAK MONTH
              </span>
              <p className="font-display text-lg font-extrabold text-[#141418] dark:text-[#F5F4F0]">
                {review.highestMonth?.name || 'N/A'}
              </p>
              <p className="font-mono text-xs font-extrabold text-[#9A6300] dark:text-[#FFB830] tabular-nums mt-0.5">
                {review.highestMonth ? formatINR(review.highestMonth.amount) : '₹0'}
              </p>
            </div>

            <div className="p-4 rounded-2xl atelier-card border-t-[3px] border-t-[#22C55E] text-center">
              <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-[#16794B] dark:text-[#C8FF2E] block mb-1">
                MOST FRUGAL
              </span>
              <p className="font-display text-lg font-extrabold text-[#141418] dark:text-[#F5F4F0]">
                {review.lowestMonth?.name || 'N/A'}
              </p>
              <p className="font-mono text-xs font-extrabold text-[#16794B] dark:text-[#C8FF2E] tabular-nums mt-0.5">
                {review.lowestMonth ? formatINR(review.lowestMonth.amount) : '₹0'}
              </p>
            </div>
          </div>

          {/* Confetti Action Key */}
          <button
            onClick={triggerConfetti}
            className="w-full py-4 rounded-2xl shutter-key font-mono font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Sparkles size={16} strokeWidth={2.6} />
            <span>Celebrate {selectedYear} Milestone</span>
          </button>
        </div>
      )}
    </div>
  );
}
