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
  Cell
} from 'recharts';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  Calendar,
  AlertTriangle,
  TrendingUp,
  PieChart as PieIcon,
  Flame,
  Award,
  ChevronRight,
  TrendingDown,
  Percent
} from 'lucide-react';
import { formatINR, getCategoryMeta } from '../utils/categories';
import CategoryIcon from './CategoryIcon';

export default function YearlyReview({ yearlyData, selectedYear, onYearChange, onSelectMonth }) {
  const [activeView, setActiveView] = useState('trends'); // 'trends' | 'categories' | 'wrapped'
  
  const trends = yearlyData?.monthlyTrends || [];
  const categories = yearlyData?.categoryDistribution || [];
  const review = yearlyData?.yearInReview || {};

  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/[0.1] p-3 rounded-2xl shadow-2xl backdrop-blur-xl text-xs">
          <p className="font-extrabold text-slate-900 dark:text-white mb-1.5">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-black text-slate-900 dark:text-white">{formatINR(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* 1. Year Selector & Segmented View Switcher */}
      <div className="flex items-center justify-between gap-2">
        {/* Year Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-1 rounded-2xl">
          {yearOptions.map((y) => (
            <button
              key={y}
              onClick={() => onYearChange(y)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                selectedYear === y
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-1 rounded-2xl">
          <button
            onClick={() => setActiveView('trends')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
              activeView === 'trends'
                ? 'bg-white text-slate-950 shadow-md font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp size={13} />
            <span>Trend</span>
          </button>
          <button
            onClick={() => setActiveView('categories')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
              activeView === 'categories'
                ? 'bg-white text-slate-950 shadow-md font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieIcon size={13} />
            <span>Pies</span>
          </button>
          <button
            onClick={() => {
              setActiveView('wrapped');
              triggerConfetti();
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
              activeView === 'wrapped'
                ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            <span>Story</span>
          </button>
        </div>
      </div>

      {/* 2. Flagship Annual Card */}
      <div className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-br from-indigo-50 dark:from-indigo-950 via-white dark:via-slate-950 to-indigo-50/30 dark:to-slate-950 border border-indigo-200 dark:border-indigo-500/30 shadow-xl dark:shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-950/30">
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
              {selectedYear} Annual Financial Story
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold">
              {review.totalTransactions || 0} Transactions
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Total Spent</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {formatINR(review.totalSpent)}
              </h2>
            </div>
            <div>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block">Wasted in {selectedYear}</span>
              <h2 className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-0.5">
                {formatINR(review.unnecessarySpent)}
              </h2>
              <span className="text-[10px] text-rose-600/80 dark:text-rose-300/80 font-bold block mt-0.5">
                ({review.wastePercentage}% of total money)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Monthly Average</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">{formatINR(review.monthlyAverage)}/mo</span>
            </div>
            {review.highestMonth && (
              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Peak Month</span>
                <span className="font-black text-amber-600 dark:text-amber-400">
                  {review.highestMonth.name} ({formatINR(review.highestMonth.amount)})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. VIEW 1: DYNAMIC 12-MONTH VISUAL TRENDS */}
      {activeView === 'trends' && (
        <div className="space-y-4">
          {/* 12-Month Area Chart */}
          <div className="p-5 rounded-[28px] glass-card-interactive border border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  12-Month Spending Flow
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Essential vs Unnecessary monthly curve</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" /> Essential
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400" /> Waste
                </span>
              </div>
            </div>

            <div className="h-60 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="necessary"
                    name="Essential"
                    stroke="#10B981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="unnecessary"
                    name="Unnecessary"
                    stroke="#F43F5E"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorWaste)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Month Comparison Bar Chart */}
          <div className="p-5 rounded-[28px] glass-card-interactive border border-slate-200 dark:border-white/[0.08]">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Monthly Comparison (Tap to Drill Down)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Tap any month bar to jump to that month's details</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="total"
                    name="Total Spend"
                    fill="#6366F1"
                    radius={[8, 8, 2, 2]}
                    onClick={(data) => {
                      if (data && data.monthIndex && onSelectMonth) {
                        onSelectMonth(data.monthIndex);
                      }
                    }}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW 2: FULL YEAR CATEGORIES */}
      {activeView === 'categories' && (
        <div className="space-y-4">
          <div className="p-5 rounded-[28px] glass-card-interactive border border-slate-200 dark:border-white/[0.08]">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              All Categories in {selectedYear}
            </h3>

            {categories.length > 0 ? (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {categories.map((entry, index) => {
                        const meta = getCategoryMeta(entry.name);
                        return <Cell key={`cell-${index}`} fill={meta.color} />;
                      })}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">No expenses recorded for this year.</div>
            )}
          </div>

          {/* Category List */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Top Spending Slices
            </h4>
            {categories.map((cat) => (
              <div key={cat.name} className="p-3.5 glass-card-interactive rounded-2xl border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CategoryIcon category={cat.name} size={18} className="p-2.5 rounded-2xl" />
                  <div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white">{cat.name}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{cat.percentage}% of whole year</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{formatINR(cat.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. VIEW 3: "YEAR IN REVIEW / STORY WRAPPED" */}
      {activeView === 'wrapped' && (
        <div className="space-y-3.5">
          <div className="text-center py-2">
            <span className="text-[11px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Sparkles size={14} /> Annual Financial Wrapped <Sparkles size={14} />
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">The {selectedYear} Retrospective</h3>
          </div>

          {/* Wrapped Card 1: Total Volume */}
          <div className="p-6 rounded-[32px] bg-gradient-to-tr from-purple-100 dark:from-purple-900/60 via-purple-50 dark:via-slate-900 to-indigo-100 dark:to-indigo-900/40 border border-purple-200 dark:border-purple-500/30 text-center relative overflow-hidden">
            <Trophy size={36} className="mx-auto text-amber-500 dark:text-amber-300 mb-2" />
            <h4 className="text-xs font-bold text-purple-700 dark:text-purple-200 uppercase tracking-wider">Total Managed</h4>
            <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">{formatINR(review.totalSpent)}</p>
            <p className="text-xs text-purple-900/80 dark:text-purple-200/80 mt-2 font-medium">
              Over <strong className="text-slate-900 dark:text-white font-bold">{review.totalTransactions}</strong> expenses tracked conscientiously.
            </p>
          </div>

          {/* Wrapped Card 2: Unnecessary Spending Badge */}
          <div className="p-6 rounded-[32px] bg-gradient-to-tr from-rose-50 dark:from-rose-950 via-white dark:via-slate-900 to-rose-50/50 dark:to-slate-950 border border-rose-200 dark:border-rose-500/30 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <AlertTriangle size={18} />
              </div>
              <h4 className="text-xs font-extrabold text-rose-600 dark:text-rose-300 uppercase tracking-wider">The Waste Leak</h4>
            </div>

            <div className="mt-2">
              <p className="text-3xl font-black text-rose-600 dark:text-rose-400">{formatINR(review.unnecessarySpent)}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-medium">
                You spent <span className="font-black text-rose-600 dark:text-rose-300">{review.wastePercentage}%</span> on avoidable impulse or extra purchases.
              </p>
            </div>

            {/* Compounding wealth insight */}
            <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-rose-200 dark:border-rose-500/20 text-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">If you invested this at 12% mutual funds:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                You would have {formatINR(review.potentialSavingsIfInvested)}!
              </span>
            </div>
          </div>

          {/* Wrapped Card 3: Champions - Peak & Lowest Month */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-4 rounded-2xl glass-card-interactive border border-amber-300 dark:border-amber-500/25 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-1">Peak Spend Month</span>
              <p className="text-base font-black text-slate-900 dark:text-white">{review.highestMonth?.name || 'N/A'}</p>
              <p className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {review.highestMonth ? formatINR(review.highestMonth.amount) : '₹0'}
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-card-interactive border border-emerald-300 dark:border-emerald-500/25 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Most Economical</span>
              <p className="text-base font-black text-slate-900 dark:text-white">{review.lowestMonth?.name || 'N/A'}</p>
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {review.lowestMonth ? formatINR(review.lowestMonth.amount) : '₹0'}
              </p>
            </div>
          </div>

          {/* Celebrate Button */}
          <button
            onClick={triggerConfetti}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={18} strokeWidth={2.5} />
            <span>Celebrate Financial Milestones 🎉</span>
          </button>
        </div>
      )}
    </div>
  );
}
