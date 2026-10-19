import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  Plus,
  Trash2,
  Wallet
} from 'lucide-react';
import { formatINR, CATEGORIES } from '../utils/categories';
import CategoryIcon from './CategoryIcon';

export default function MonthOverview({
  analytics,
  expenses,
  currentMonth,
  currentYear,
  onMonthChange,
  onDeleteExpense,
  onOpenAdd
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const summary = analytics?.summary || { totalSpent: 0, necessarySpent: 0, unnecessarySpent: 0, wastePercentage: 0 };
  const budgetAlerts = analytics?.budgetAlerts || [];

  const monthsList = [
    { num: 1, name: 'Jan' },
    { num: 2, name: 'Feb' },
    { num: 3, name: 'Mar' },
    { num: 4, name: 'Apr' },
    { num: 5, name: 'May' },
    { num: 6, name: 'Jun' },
    { num: 7, name: 'Jul' },
    { num: 8, name: 'Aug' },
    { num: 9, name: 'Sep' },
    { num: 10, name: 'Oct' },
    { num: 11, name: 'Nov' },
    { num: 12, name: 'Dec' },
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* 1. Mobile Month Segment Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1 -mx-1 px-1">
        {monthsList.map((m) => {
          const isSelected = currentMonth === m.num;
          return (
            <button
              key={m.num}
              onClick={() => onMonthChange(m.num)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/25 scale-[1.03]'
                  : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white border border-slate-300/80 dark:border-white/[0.06]'
              }`}
            >
              {m.name}
            </button>
          );
        })}
      </div>

      {/* 2. Flagship Mobile Hero Card */}
      <div className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/40 border border-slate-200/90 dark:border-white/[0.1] shadow-xl dark:shadow-2xl transition-colors duration-200">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {monthsList[currentMonth - 1]?.name} {currentYear} Spending
              </span>
            </div>

            {summary.unnecessarySpent > 0 ? (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {summary.wastePercentage}% Waste
              </span>
            ) : (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                100% Essential
              </span>
            )}
          </div>

          {/* Big Currency Number */}
          <div className="mt-1">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-baseline">
              <span className="text-emerald-600 dark:text-emerald-400 text-3xl mr-1 font-black">₹</span>
              <span>{Number(summary.totalSpent || 0).toLocaleString('en-IN')}</span>
            </h2>
          </div>

          {/* Two-pill Essential vs Waste comparison */}
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Essential Needs</span>
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {formatINR(summary.necessarySpent)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {100 - summary.wastePercentage}% of monthly
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Extra / Avoidable</span>
              </div>
              <p className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1">
                {formatINR(summary.unnecessarySpent)}
              </p>
              <p className="text-[10px] text-rose-600/80 dark:text-rose-300/80 font-semibold mt-0.5">
                {summary.wastePercentage}% avoidable spend
              </p>
            </div>
          </div>

          {/* Visual Progress bar */}
          <div className="mt-4">
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden flex border border-slate-200 dark:border-white/[0.05]">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
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

      {/* 3. Budget Warnings (if any) */}
      {budgetAlerts.length > 0 && (
        <div className="space-y-2">
          {budgetAlerts.map((alert) => (
            <div
              key={alert.category}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs backdrop-blur-md ${
                alert.isExceeded
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-200'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-xl ${alert.isExceeded ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{alert.category} Budget Alert</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Spent {formatINR(alert.spent)} of {formatINR(alert.limit)} ({alert.percent}%)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Category Quick Filter Chips Carousel */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Categories</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{filteredExpenses.length} entries</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-0.5 -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white border border-slate-300 dark:border-white/[0.06]'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 ${
                selectedCategory === c.name
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white border border-slate-300 dark:border-white/[0.06]'
              }`}
            >
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search this month's expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 shadow-sm transition-all"
        />
      </div>

      {/* 6. Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
          <span>Recent Activity</span>
          <span>Amount</span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center glass-card-interactive rounded-[28px] border border-slate-200 dark:border-white/[0.06]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Wallet size={24} />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">No expenses recorded for this month</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px] mx-auto">
              Tap the green plus button below to add your first daily expense!
            </p>
            <button
              onClick={onOpenAdd}
              className="mt-4 px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Add Expense</span>
            </button>
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp._id}
              className="p-3.5 glass-card-interactive rounded-[22px] border border-slate-200/90 dark:border-white/[0.06] flex items-center justify-between group transition-colors duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon category={exp.category} size={18} className="p-2.5 rounded-2xl shadow-sm" />
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{exp.title}</h4>
                    {exp.isUnnecessary && (
                      <span className="text-[9px] font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-full whitespace-nowrap">
                        Extra Spend
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>
                      {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span>•</span>
                    <span className="truncate">{exp.paymentMethod || 'UPI'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-sm font-extrabold tracking-tight ${
                    exp.isUnnecessary ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {formatINR(exp.amount)}
                </span>
                <button
                  onClick={() => onDeleteExpense(exp._id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 active:scale-90 transition-all"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
