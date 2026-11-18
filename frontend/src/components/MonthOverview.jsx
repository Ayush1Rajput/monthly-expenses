import React, { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  Plus,
  Trash2,
  Wallet,
  Calendar,
  BarChart3,
  TrendingDown,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Clock,
  Sparkles,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { formatINR, CATEGORIES } from '../utils/categories';
import CategoryIcon from './CategoryIcon';

// Helper function to calculate actual calendar weeks for any month
function getActualCalendarWeeks(year, month, startDayPreference = 'monday') {
  const totalDays = new Date(year, month, 0).getDate();
  const weeks = [];
  let currentStart = 1;
  const isMondayStart = startDayPreference === 'monday';

  while (currentStart <= totalDays) {
    const startDate = new Date(year, month - 1, currentStart);
    const dayOfWeek = startDate.getDay(); // 0 is Sun, 1 is Mon, ..., 6 is Sat

    let daysRemainingInWeek;
    if (isMondayStart) {
      // Week ends on Sunday (day 0)
      daysRemainingInWeek = dayOfWeek === 0 ? 0 : (7 - dayOfWeek);
    } else {
      // Week ends on Saturday (day 6)
      daysRemainingInWeek = 6 - dayOfWeek;
    }

    const currentEnd = Math.min(totalDays, currentStart + daysRemainingInWeek);
    const endDate = new Date(year, month - 1, currentEnd);

    weeks.push({
      weekNum: weeks.length + 1,
      startDay: currentStart,
      endDay: currentEnd,
      daysCount: currentEnd - currentStart + 1,
      startDayName: startDate.toLocaleDateString('en-US', { weekday: 'short' }),
      endDayName: endDate.toLocaleDateString('en-US', { weekday: 'short' })
    });

    currentStart = currentEnd + 1;
  }
  return weeks;
}

export default function MonthOverview({
  analytics,
  expenses,
  allExpenses = [],
  currentMonth,
  currentYear,
  onMonthChange,
  onYearChange,
  onDeleteExpense,
  onOpenAdd,
  theme,
  viewMode = 'monthly',
  onViewModeChange
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWeek, setSelectedWeek] = useState('all');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [weekStartPref, setWeekStartPref] = useState(() => {
    return localStorage.getItem('pennywise_week_start') || 'monday';
  });

  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      if (onYearChange) onYearChange(currentYear - 1);
      onMonthChange(12);
    } else {
      onMonthChange(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      if (onYearChange) onYearChange(currentYear + 1);
      onMonthChange(1);
    } else {
      onMonthChange(currentMonth + 1);
    }
  };

  const toggleWeekStartPref = () => {
    const next = weekStartPref === 'monday' ? 'sunday' : 'monday';
    setWeekStartPref(next);
    localStorage.setItem('pennywise_week_start', next);
  };

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

  const monthShortName = monthsList[currentMonth - 1]?.name || '';

  const today = new Date();
  const isCurrentMonthAndYear = (today.getMonth() + 1 === currentMonth) && (today.getFullYear() === currentYear);
  const todayDay = today.getDate();

  // Compute actual calendar weeks for this month based on user's week-start preference (Monday or Sunday)
  const calendarWeeks = getActualCalendarWeeks(currentYear, currentMonth, weekStartPref);

  // Compute Weekly breakdown data using actual calendar week boundaries
  const weeksData = calendarWeeks.map((w) => {
    const isCurrentWeek = isCurrentMonthAndYear && todayDay >= w.startDay && todayDay <= w.endDay;

    const weekItems = expenses.filter(e => {
      const d = new Date(e.date);
      const day = d.getDate();
      return day >= w.startDay && day <= w.endDay;
    });

    let total = 0;
    let necessary = 0;
    let unnecessary = 0;
    const dayBreakdown = [];

    // Initialize breakdown for each day of this actual week
    for (let d = w.startDay; d <= w.endDay; d++) {
      const dateObj = new Date(currentYear, currentMonth - 1, d);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const isThisDayToday = isCurrentMonthAndYear && d === todayDay;
      dayBreakdown.push({
        day: d,
        dayName,
        isToday: isThisDayToday,
        amount: 0,
        unnecessaryAmount: 0,
        count: 0
      });
    }

    weekItems.forEach(e => {
      const amt = Number(e.amount) || 0;
      total += amt;
      if (e.isUnnecessary) {
        unnecessary += amt;
      } else {
        necessary += amt;
      }

      const d = new Date(e.date).getDate();
      const dayEntry = dayBreakdown.find(entry => entry.day === d);
      if (dayEntry) {
        dayEntry.amount += amt;
        if (e.isUnnecessary) {
          dayEntry.unnecessaryAmount += amt;
        }
        dayEntry.count += 1;
      }
    });

    const wastePercent = total > 0 ? Math.round((unnecessary / total) * 100) : 0;
    const dailyAvg = Math.round(total / (w.daysCount || 1));

    return {
      ...w,
      label: `Week ${w.weekNum} (${w.startDay}–${w.endDay} ${monthShortName})`,
      shortLabel: `Week ${w.weekNum}`,
      dateRange: `${w.startDay} ${w.startDayName} – ${w.endDay} ${w.endDayName} ${monthShortName}`,
      isCurrentWeek,
      items: weekItems,
      totalSpent: total,
      necessarySpent: necessary,
      unnecessarySpent: unnecessary,
      wastePercentage: wastePercent,
      dailyAverage: dailyAvg,
      dayBreakdown
    };
  });

  // Automatically select current week when in current month, or select Week 1 / All
  useEffect(() => {
    if (isCurrentMonthAndYear) {
      const currentWeekObj = weeksData.find(w => todayDay >= w.startDay && todayDay <= w.endDay);
      if (currentWeekObj) {
        setSelectedWeek(currentWeekObj.weekNum);
      } else {
        setSelectedWeek('all');
      }
    } else {
      setSelectedWeek('all');
    }
  }, [currentMonth, currentYear, weekStartPref]);

  // Active week data when a specific week is chosen
  const activeWeekData = typeof selectedWeek === 'number'
    ? (weeksData.find(w => w.weekNum === selectedWeek) || weeksData[0])
    : null;

  // Comparison to previous week (if applicable)
  const prevWeekData = activeWeekData && activeWeekData.weekNum > 1
    ? weeksData.find(w => w.weekNum === activeWeekData.weekNum - 1)
    : null;

  const weekOverWeekDiff = (activeWeekData && prevWeekData && prevWeekData.totalSpent > 0)
    ? Math.round(((activeWeekData.totalSpent - prevWeekData.totalSpent) / prevWeekData.totalSpent) * 100)
    : null;

  // Max calculations for charts
  const maxDaySpend = activeWeekData
    ? Math.max(...activeWeekData.dayBreakdown.map(d => d.amount), 1)
    : 1;

  const maxWeekSpend = Math.max(...weeksData.map(w => w.totalSpent), 1);
  const peakWeek = weeksData.reduce((prev, curr) => (curr.totalSpent > prev.totalSpent ? curr : prev), weeksData[0]);

  // Determine base list of expenses depending on View Mode and selected week
  let baseExpenses = [];
  if (viewMode === 'monthly' || selectedWeek === 'all') {
    baseExpenses = expenses;
  } else if (activeWeekData) {
    baseExpenses = activeWeekData.items;
  }

  const filteredExpenses = baseExpenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* 1. Monthly vs Weekly View Mode Switcher */}
      <div className="flex items-center justify-between gap-1.5 p-1 bg-slate-200/90 dark:bg-white/[0.05] rounded-2xl border border-slate-300/80 dark:border-white/[0.08] shadow-sm">
        <button
          onClick={() => {
            if (onViewModeChange) onViewModeChange('monthly');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
            viewMode === 'monthly'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Calendar size={15} className={viewMode === 'monthly' ? 'text-emerald-500' : ''} />
          <span>Monthly Expenses</span>
        </button>

        <button
          onClick={() => {
            if (onViewModeChange) onViewModeChange('weekly');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
            viewMode === 'weekly'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <BarChart3 size={15} />
          <span>Weekly Expenses</span>
        </button>
      </div>

      {/* 2. Month Navigator: < October 2026 > */}
      <div className="relative flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-[290px] px-2.5 py-1.5 bg-slate-200/80 dark:bg-white/[0.05] rounded-2xl border border-slate-300/80 dark:border-white/[0.08] shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-white/[0.08] active:scale-90 transition-all"
            title="Previous Month"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => setShowMonthPicker(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-black text-slate-900 dark:text-white hover:bg-slate-300/60 dark:hover:bg-white/[0.06] active:scale-95 transition-all"
            title="Click to select month"
          >
            <span>{fullMonthNames[currentMonth - 1]} {currentYear}</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showMonthPicker ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-white/[0.08] active:scale-90 transition-all"
            title="Next Month"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Dropdown Popover if user wants to jump directly to any month */}
        {showMonthPicker && (
          <div className="absolute top-12 z-30 w-full max-w-[310px] p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.12] shadow-2xl animate-fade-in backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100 dark:border-white/[0.06]">
              <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Select Month</span>
              <button
                onClick={() => setShowMonthPicker(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {monthsList.map((m) => {
                const isSelected = currentMonth === m.num;
                return (
                  <button
                    key={m.num}
                    onClick={() => {
                      onMonthChange(m.num);
                      setShowMonthPicker(false);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. If in WEEKLY mode, show the Actual Week Selector Pills + Week Start Switch */}
      {viewMode === 'weekly' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {monthShortName} {currentYear} • Calendar Weeks
            </span>

            {/* Week Start Preference Toggle (Mon-Sun vs Sun-Sat) */}
            <button
              onClick={toggleWeekStartPref}
              className="text-[10px] font-black text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.1] px-2 py-0.5 rounded-lg border border-slate-300 dark:border-white/[0.08] transition-all flex items-center gap-1 active:scale-95"
              title="Click to toggle week start (Monday vs Sunday)"
            >
              <span>{weekStartPref === 'monday' ? 'Mon–Sun' : 'Sun–Sat'}</span>
              <SlidersHorizontal size={10} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1 -mx-1 px-1">
            {/* All Weeks Overview Pill */}
            <button
              onClick={() => setSelectedWeek('all')}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                selectedWeek === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/25'
                  : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white border border-slate-300/80 dark:border-white/[0.06]'
              }`}
            >
              <BarChart3 size={13} />
              <span>All Weeks</span>
            </button>

            {/* Individual Actual Calendar Week Pills */}
            {weeksData.map((w) => {
              const isSelected = selectedWeek === w.weekNum;
              return (
                <button
                  key={w.weekNum}
                  onClick={() => setSelectedWeek(w.weekNum)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-black shadow-md shadow-emerald-500/25'
                      : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white border border-slate-300/80 dark:border-white/[0.06]'
                  }`}
                >
                  <span>Week {w.weekNum}</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    ({w.startDay}–{w.endDay} {monthShortName})
                  </span>
                  {w.isCurrentWeek && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Current Week" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MAIN HERO CARDS */}

      {/* 4A. MONTHLY VIEW HERO CARD */}
      {viewMode === 'monthly' && (
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
      )}

      {/* 4B. WEEKLY VIEW - SPECIFIC ACTUAL WEEK HERO CARD */}
      {viewMode === 'weekly' && activeWeekData && (
        <div className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/40 border border-slate-200/90 dark:border-white/[0.1] shadow-xl dark:shadow-2xl transition-colors duration-200">
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header tags with exact calendar dates */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Week {activeWeekData.weekNum} • {activeWeekData.startDay} {activeWeekData.startDayName} – {activeWeekData.endDay} {activeWeekData.endDayName}
                </span>
                {activeWeekData.isCurrentWeek && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-sm animate-pulse">
                    CURRENT WEEK
                  </span>
                )}
              </div>

              {activeWeekData.unnecessarySpent > 0 ? (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                  {activeWeekData.wastePercentage}% Extra
                </span>
              ) : (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  100% Essential
                </span>
              )}
            </div>

            {/* Big Weekly Total Amount */}
            <div className="mt-1 flex items-baseline justify-between">
              <div>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-baseline">
                  <span className="text-emerald-600 dark:text-emerald-400 text-3xl mr-1 font-black">₹</span>
                  <span>{activeWeekData.totalSpent.toLocaleString('en-IN')}</span>
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">
                  Daily Pace: ~{formatINR(activeWeekData.dailyAverage)} / day ({activeWeekData.daysCount} calendar days)
                </span>
              </div>

              {/* Week-over-week Trend Badge */}
              {weekOverWeekDiff !== null && (
                <div
                  className={`text-right px-2.5 py-1.5 rounded-xl border text-[11px] font-bold ${
                    weekOverWeekDiff <= 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-1 justify-end">
                    {weekOverWeekDiff <= 0 ? (
                      <TrendingDown size={14} className="text-emerald-500" />
                    ) : (
                      <TrendingUp size={14} className="text-amber-500" />
                    )}
                    <span>{Math.abs(weekOverWeekDiff)}%</span>
                  </div>
                  <span className="text-[9px] opacity-80 block">vs Week {activeWeekData.weekNum - 1}</span>
                </div>
              )}
            </div>

            {/* Essential vs Avoidable for this week */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                  Essential
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {formatINR(activeWeekData.necessarySpent)}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block">
                  Extra / Avoidable
                </span>
                <span className="text-base font-black text-rose-600 dark:text-rose-400">
                  {formatINR(activeWeekData.unnecessarySpent)}
                </span>
              </div>
            </div>

            {/* ACTUAL CALENDAR DAYS BAR CHART */}
            <div className="mt-5 pt-4 border-t border-slate-200/90 dark:border-white/[0.08]">
              <div className="flex items-center justify-between text-[11px] mb-2 px-0.5">
                <span className="font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {activeWeekData.daysCount}-Day Daily Breakdown
                </span>
                <span className="text-[10px] text-slate-400">
                  {activeWeekData.startDayName} to {activeWeekData.endDayName}
                </span>
              </div>

              <div className="grid grid-flow-col auto-cols-fr gap-1.5 items-end h-28 pt-4 pb-1">
                {activeWeekData.dayBreakdown.map((d) => {
                  const heightPercent = d.amount > 0 ? Math.max(16, Math.round((d.amount / maxDaySpend) * 100)) : 8;

                  return (
                    <div
                      key={d.day}
                      className="flex flex-col items-center justify-end h-full relative"
                    >
                      {/* Tooltip / Amount text on top */}
                      {d.amount > 0 && (
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1 truncate max-w-full">
                          ₹{d.amount >= 1000 ? `${(d.amount / 1000).toFixed(1)}k` : d.amount}
                        </span>
                      )}

                      {/* Bar Pillar */}
                      <div className="w-full max-w-[28px] h-16 flex items-end justify-center rounded-xl overflow-hidden bg-slate-200/80 dark:bg-white/[0.05] p-0.5">
                        <div
                          className={`w-full rounded-lg transition-all duration-300 ${
                            d.unnecessaryAmount > 0
                              ? 'bg-gradient-to-t from-rose-500 to-amber-400'
                              : d.amount > 0
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                              : 'bg-transparent'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Weekday & Date Label */}
                      <div className="mt-1.5 text-center leading-tight">
                        <span className={`text-[10px] font-bold block ${
                          d.isToday
                            ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {d.dayName}
                        </span>
                        <span className={`text-[9px] block ${
                          d.isToday ? 'font-black text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        }`}>
                          {d.day}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4C. WEEKLY VIEW - ALL WEEKS COMPARISON HERO CARD */}
      {viewMode === 'weekly' && selectedWeek === 'all' && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-br from-white via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40 border border-slate-200/90 dark:border-white/[0.1] shadow-xl dark:shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                {monthShortName} Calendar Weeks Comparison
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/30">
                {weeksData.length} Calendar Weeks
              </span>
            </div>

            <div className="mt-1">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-baseline">
                <span className="text-indigo-600 dark:text-indigo-400 text-2xl mr-1 font-black">₹</span>
                <span>{Number(summary.totalSpent || 0).toLocaleString('en-IN')}</span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                Weekly Average: ~{formatINR(Math.round(summary.totalSpent / (weeksData.length || 1)))} / week
              </span>
            </div>

            {/* Weekly Side-by-Side Comparative Bar Chart */}
            <div className="mt-6 pt-4 border-t border-slate-200/90 dark:border-white/[0.08]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
                Weekly Flow Comparison (Tap any week to inspect)
              </span>

              <div className="grid grid-flow-col auto-cols-fr gap-2 items-end h-32 pt-4">
                {weeksData.map((w) => {
                  const heightPercent = w.totalSpent > 0 ? Math.max(16, Math.round((w.totalSpent / maxWeekSpend) * 100)) : 8;

                  return (
                    <button
                      key={w.weekNum}
                      type="button"
                      onClick={() => {
                        setSelectedWeek(w.weekNum);
                        setSelectedDay(null);
                      }}
                      className="flex flex-col items-center justify-end h-full group transition-all active:scale-95"
                    >
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1 truncate">
                        ₹{w.totalSpent >= 1000 ? `${(w.totalSpent / 1000).toFixed(1)}k` : w.totalSpent}
                      </span>

                      <div className="w-full rounded-2xl bg-slate-200/80 dark:bg-white/[0.05] h-20 p-1 flex items-end justify-center">
                        <div
                          className={`w-full rounded-xl transition-all duration-500 ${
                            w.isCurrentWeek
                              ? 'bg-gradient-to-t from-emerald-500 to-teal-400 ring-2 ring-emerald-400'
                              : 'bg-gradient-to-t from-indigo-500 to-purple-400 group-hover:from-emerald-500 group-hover:to-teal-400'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      <div className="mt-1.5 text-center leading-tight">
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white block">
                          W{w.weekNum}
                        </span>
                        <span className="text-[8px] text-slate-400 block">
                          {w.startDay}–{w.endDay}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cards for each calendar week */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 block">
              Actual Calendar Weeks
            </span>

            {weeksData.map((w) => (
              <div
                key={w.weekNum}
                onClick={() => {
                  setSelectedWeek(w.weekNum);
                  setSelectedDay(null);
                }}
                className="p-3.5 glass-card-interactive rounded-[22px] border border-slate-200/90 dark:border-white/[0.06] flex items-center justify-between cursor-pointer group active:scale-[0.98] transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Week {w.weekNum} ({w.startDay} {w.startDayName} – {w.endDay} {w.endDayName})
                    </h4>
                    {w.isCurrentWeek && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {w.items.length} expenses • {formatINR(w.dailyAverage)}/day
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {formatINR(w.totalSpent)}
                    </span>
                    {w.unnecessarySpent > 0 && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">
                        ₹{w.unnecessarySpent} extra
                      </span>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Budget Warnings (if any) */}
      {viewMode === 'monthly' && budgetAlerts.length > 0 && (
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

      {/* 6. Category Quick Filter Chips */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {viewMode === 'weekly' && selectedWeek !== 'all' ? `Week ${selectedWeek} Categories` : 'Categories'}
          </span>
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

      {/* 7. Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder={
            viewMode === 'weekly' && selectedWeek !== 'all'
              ? `Search Week ${selectedWeek} expenses...`
              : "Search this month's expenses..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 shadow-sm transition-all"
        />
      </div>

      {/* 8. Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
          <span>
            {viewMode === 'weekly' && selectedWeek !== 'all'
              ? `Week ${selectedWeek} Activity (${filteredExpenses.length})`
              : `Monthly Activity (${filteredExpenses.length})`}
          </span>
          <span>Amount</span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center glass-card-interactive rounded-[28px] border border-slate-200 dark:border-white/[0.06]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Wallet size={24} />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {viewMode === 'weekly' && selectedWeek !== 'all'
                ? `No expenses logged for Week ${selectedWeek}`
                : 'No expenses recorded for this month'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px] mx-auto">
              Tap the green plus button below to add your daily expense!
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
                      {new Date(exp.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
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
