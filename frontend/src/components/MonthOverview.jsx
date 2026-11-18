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
  X,
  SlidersHorizontal
} from 'lucide-react';
import { formatINR, CATEGORIES } from '../utils/categories';
import CategoryIcon from './CategoryIcon';

// Calculate actual calendar weeks for any month
function getActualCalendarWeeks(year, month, startDayPreference = 'monday') {
  const totalDays = new Date(year, month, 0).getDate();
  const weeks = [];
  let currentStart = 1;
  const isMondayStart = startDayPreference === 'monday';

  while (currentStart <= totalDays) {
    const startDate = new Date(year, month - 1, currentStart);
    const dayOfWeek = startDate.getDay();

    let daysRemainingInWeek;
    if (isMondayStart) {
      daysRemainingInWeek = dayOfWeek === 0 ? 0 : (7 - dayOfWeek);
    } else {
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

// Signature 24-segment hardware equalizer meter
function SegmentedRatioMeter({ wastePercentage = 0, hasSpend = false }) {
  const totalSegments = 24;
  const wasteSegments = hasSpend ? Math.round((wastePercentage / 100) * totalSegments) : 0;
  const essentialSegments = hasSpend ? totalSegments - wasteSegments : 0;

  return (
    <div className="flex items-center gap-[3px] h-3.5 w-full" aria-label={`Essential ${100 - wastePercentage}%, Extra ${wastePercentage}%`}>
      {Array.from({ length: totalSegments }).map((_, idx) => {
        let colorClass = 'bg-white/[0.1]';
        if (hasSpend) {
          if (idx < essentialSegments) {
            colorClass = 'bg-[#C8FF2E]';
          } else {
            colorClass = 'bg-[#FF4D3D]';
          }
        }
        return (
          <span
            key={idx}
            className={`flex-1 h-full rounded-[3px] transition-all duration-300 ${colorClass}`}
          />
        );
      })}
    </div>
  );
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
  const [selectedDay, setSelectedDay] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [weekStartPref, setWeekStartPref] = useState(() => {
    return localStorage.getItem('pennywise_week_start') || 'monday';
  });

  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 1) {
      if (onYearChange) onYearChange(currentYear - 1);
      onMonthChange(12);
    } else {
      onMonthChange(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
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
    setSelectedDay(null);
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

  const calendarWeeks = getActualCalendarWeeks(currentYear, currentMonth, weekStartPref);

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

  useEffect(() => {
    setSelectedDay(null);
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

  const activeWeekData = typeof selectedWeek === 'number'
    ? (weeksData.find(w => w.weekNum === selectedWeek) || weeksData[0])
    : null;

  const prevWeekData = activeWeekData && activeWeekData.weekNum > 1
    ? weeksData.find(w => w.weekNum === activeWeekData.weekNum - 1)
    : null;

  const weekOverWeekDiff = (activeWeekData && prevWeekData && prevWeekData.totalSpent > 0)
    ? Math.round(((activeWeekData.totalSpent - prevWeekData.totalSpent) / prevWeekData.totalSpent) * 100)
    : null;

  const maxDaySpend = activeWeekData
    ? Math.max(...activeWeekData.dayBreakdown.map(d => d.amount), 1)
    : 1;

  const maxWeekSpend = Math.max(...weeksData.map(w => w.totalSpent), 1);

  let baseExpenses = [];
  if (viewMode === 'monthly' || selectedWeek === 'all') {
    baseExpenses = expenses;
  } else if (activeWeekData) {
    baseExpenses = selectedDay
      ? activeWeekData.items.filter(e => new Date(e.date).getDate() === selectedDay)
      : activeWeekData.items;
  }

  const filteredExpenses = baseExpenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const elapsedDays = isCurrentMonthAndYear ? Math.max(todayDay, 1) : daysInMonth;
  const monthlyDailyPace = Math.round((summary.totalSpent || 0) / elapsedDays);

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* 1. Hardware Segmented View Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#E7E1D3] dark:bg-[#131317] border border-[#141418]/12 dark:border-white/[0.08]">
        <button
          onClick={() => {
            setSelectedDay(null);
            if (onViewModeChange) onViewModeChange('monthly');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] ${
            viewMode === 'monthly'
              ? 'bg-[#141418] text-[#C8FF2E] dark:bg-[#C8FF2E] dark:text-[#0A0A0C] shadow-sm'
              : 'text-[#6B6A64] dark:text-[#8E8E98] hover:text-[#141418] dark:hover:text-[#F5F4F0]'
          }`}
        >
          <Calendar size={13} strokeWidth={2.5} />
          <span>Monthly</span>
        </button>

        <button
          onClick={() => {
            setSelectedDay(null);
            if (onViewModeChange) onViewModeChange('weekly');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] ${
            viewMode === 'weekly'
              ? 'bg-[#141418] text-[#C8FF2E] dark:bg-[#C8FF2E] dark:text-[#0A0A0C] shadow-sm'
              : 'text-[#6B6A64] dark:text-[#8E8E98] hover:text-[#141418] dark:hover:text-[#F5F4F0]'
          }`}
        >
          <BarChart3 size={13} strokeWidth={2.5} />
          <span>Weekly</span>
        </button>
      </div>

      {/* 2. Swiss Split-Flap Month Navigator */}
      <div className="relative flex flex-col items-center">
        <div className="flex items-center justify-between w-full px-2 py-1.5 atelier-card rounded-2xl">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#141418] dark:text-[#F5F4F0] hover:bg-[#E7E1D3] dark:hover:bg-white/[0.08] active:scale-90 transition-all"
            title="Previous Month"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => setShowMonthPicker(prev => !prev)}
            className="flex items-center gap-2 px-3 py-1 rounded-xl hover:bg-[#E7E1D3]/70 dark:hover:bg-white/[0.06] active:scale-95 transition-all"
            title="Click to jump to month"
          >
            <span className="font-display text-sm font-extrabold tracking-tight text-[#141418] dark:text-[#F5F4F0]">
              {fullMonthNames[currentMonth - 1]}
            </span>
            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded-md bg-[#E7E1D3] dark:bg-white/[0.08] text-[#55544E] dark:text-[#C8FF2E]">
              {currentYear}
            </span>
            <ChevronDown size={14} className={`text-[#8E8E98] transition-transform duration-200 ${showMonthPicker ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#141418] dark:text-[#F5F4F0] hover:bg-[#E7E1D3] dark:hover:bg-white/[0.08] active:scale-90 transition-all"
            title="Next Month"
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Month Picker Popover */}
        {showMonthPicker && (
          <div className="absolute top-14 z-30 w-full p-3.5 rounded-2xl bg-[#FFFDF8] dark:bg-[#19191F] border-2 border-[#141418] dark:border-white/[0.16] shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-dashed border-[#141418]/15 dark:border-white/[0.1]">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#6B6A64] dark:text-[#8E8E98]">
                Jump To Month // {currentYear}
              </span>
              <button
                onClick={() => setShowMonthPicker(false)}
                className="text-[#8E8E98] hover:text-[#141418] dark:hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {monthsList.map((m) => {
                const isSelected = currentMonth === m.num;
                return (
                  <button
                    key={m.num}
                    onClick={() => {
                      onMonthChange(m.num);
                      setShowMonthPicker(false);
                    }}
                    className={`py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#C8FF2E] text-[#0A0A0C] border border-[#0A0A0C] font-extrabold'
                        : 'bg-[#F3EFE6] dark:bg-white/[0.05] text-[#141418] dark:text-[#D4D4DC] hover:bg-[#E7E1D3] dark:hover:bg-white/[0.1]'
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

      {/* 3. Weekly Calendar Week Selector Strip */}
      {viewMode === 'weekly' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#6B6A64] dark:text-[#8E8E98]">
              {monthShortName} {currentYear} // Calendar Weeks
            </span>
            <button
              onClick={toggleWeekStartPref}
              className="font-mono text-[10px] font-bold uppercase text-[#141418] dark:text-[#D4D4DC] bg-[#FFFDF8] dark:bg-[#19191F] hover:border-[#C8FF2E] px-2.5 py-1 rounded-lg border border-[#141418]/15 dark:border-white/[0.1] transition-all flex items-center gap-1.5 active:scale-95"
              title="Toggle week start (Monday vs Sunday)"
            >
              <span>{weekStartPref === 'monday' ? 'MON–SUN' : 'SUN–SAT'}</span>
              <SlidersHorizontal size={10} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5 -mx-1 px-1">
            <button
              onClick={() => {
                setSelectedWeek('all');
                setSelectedDay(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 border ${
                selectedWeek === 'all'
                  ? 'bg-[#C8FF2E] text-[#0A0A0C] border-[#0A0A0C] font-extrabold'
                  : 'bg-[#FFFDF8] dark:bg-[#131317] text-[#55544E] dark:text-[#8E8E98] border-[#141418]/12 dark:border-white/[0.08]'
              }`}
            >
              <BarChart3 size={12} />
              <span>All</span>
            </button>

            {weeksData.map((w) => {
              const isSelected = selectedWeek === w.weekNum;
              return (
                <button
                  key={w.weekNum}
                  onClick={() => {
                    setSelectedWeek(w.weekNum);
                    setSelectedDay(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 border ${
                    isSelected
                      ? 'bg-[#141418] text-[#C8FF2E] dark:bg-[#C8FF2E] dark:text-[#0A0A0C] border-[#141418] font-extrabold'
                      : 'bg-[#FFFDF8] dark:bg-[#131317] text-[#55544E] dark:text-[#8E8E98] border-[#141418]/12 dark:border-white/[0.08]'
                  }`}
                >
                  <span>W{w.weekNum}</span>
                  <span className="text-[10px] opacity-75">
                    {w.startDay}–{w.endDay}
                  </span>
                  {w.isCurrentWeek && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" title="Current Week" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4A. MONTHLY VIEW HERO VAULT PLATE */}
      {viewMode === 'monthly' && (
        <div className="relative overflow-hidden rounded-[26px] p-5 atelier-vault text-[#F5F4F0]">
          {/* Subtle corner registration brackets */}
          <span className="absolute top-3 left-3 w-2.5 h-2.5 border-t-2 border-l-2 border-[#C8FF2E]/40 rounded-tl-sm pointer-events-none" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 border-t-2 border-r-2 border-[#C8FF2E]/40 rounded-tr-sm pointer-events-none" />
          <span className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b-2 border-l-2 border-white/15 rounded-bl-sm pointer-events-none" />
          <span className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b-2 border-r-2 border-white/15 rounded-br-sm pointer-events-none" />

          <div className="relative z-10">
            {/* Top telemetry strip */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C8FF2E] animate-pulse" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#A2A2AE]">
                  {monthsList[currentMonth - 1]?.name} {currentYear} // TOTAL OUTFLOW
                </span>
              </div>

              {summary.unnecessarySpent > 0 ? (
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FF4D3D]/20 text-[#FF7A6E] border border-[#FF4D3D]/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D3D]" />
                  {summary.wastePercentage}% LEAK
                </span>
              ) : (
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C8FF2E]/15 text-[#C8FF2E] border border-[#C8FF2E]/35">
                  ZERO LEAKS
                </span>
              )}
            </div>

            {/* Hero Spend Figure */}
            <div className="flex items-end justify-between gap-2 mt-1">
              <h2 className="font-display text-[42px] leading-none font-extrabold tracking-tight text-[#F5F4F0] tabular-nums flex items-baseline">
                <span className="text-[#C8FF2E] text-2xl mr-1.5 font-mono font-extrabold">₹</span>
                <span>{Number(summary.totalSpent || 0).toLocaleString('en-IN')}</span>
              </h2>
              <div className="text-right pb-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E8E98] block">DAILY PACE</span>
                <span className="font-mono text-xs font-bold text-[#C8FF2E] tabular-nums">
                  {formatINR(monthlyDailyPace)}/d
                </span>
              </div>
            </div>

            {/* Signature 24-Segment Equalizer Ratio Meter */}
            <div className="mt-5">
              <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest mb-1.5">
                <span className="text-[#C8FF2E]">ESSENTIAL {summary.totalSpent > 0 ? 100 - summary.wastePercentage : 0}%</span>
                <span className="text-[#FF7A6E]">AVOIDABLE {summary.wastePercentage}%</span>
              </div>
              <SegmentedRatioMeter
                wastePercentage={summary.wastePercentage}
                hasSpend={summary.totalSpent > 0}
              />
            </div>

            {/* Perforated Ledger Split */}
            <div className="mt-5 pt-4 ticket-divider grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#C8FF2E]">
                  <span className="w-2 h-2 rounded-[3px] bg-[#C8FF2E]" />
                  <span>Essential</span>
                </div>
                <p className="font-mono text-lg font-extrabold text-[#F5F4F0] tabular-nums mt-1">
                  {formatINR(summary.necessarySpent)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FF4D3D]/[0.08] border border-[#FF4D3D]/25">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#FF7A6E]">
                  <span className="w-2 h-2 rounded-[3px] bg-[#FF4D3D]" />
                  <span>Avoidable</span>
                </div>
                <p className="font-mono text-lg font-extrabold text-[#FF7A6E] tabular-nums mt-1">
                  {formatINR(summary.unnecessarySpent)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4B. WEEKLY VIEW — SPECIFIC WEEK VAULT PLATE */}
      {viewMode === 'weekly' && activeWeekData && (
        <div className="relative overflow-hidden rounded-[26px] p-5 atelier-vault text-[#F5F4F0]">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-[#C8FF2E] animate-pulse" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A2A2AE]">
                  WEEK {activeWeekData.weekNum} • {activeWeekData.startDay} {activeWeekData.startDayName} – {activeWeekData.endDay} {activeWeekData.endDayName}
                </span>
                {activeWeekData.isCurrentWeek && (
                  <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#C8FF2E] text-[#0A0A0C]">
                    NOW
                  </span>
                )}
              </div>

              {activeWeekData.unnecessarySpent > 0 ? (
                <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FF4D3D]/20 text-[#FF7A6E] border border-[#FF4D3D]/40">
                  {activeWeekData.wastePercentage}% LEAK
                </span>
              ) : (
                <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#C8FF2E]/15 text-[#C8FF2E] border border-[#C8FF2E]/35">
                  CLEAN
                </span>
              )}
            </div>

            <div className="mt-1 flex items-end justify-between">
              <div>
                <h2 className="font-display text-[38px] leading-none font-extrabold text-[#F5F4F0] tracking-tight tabular-nums flex items-baseline">
                  <span className="text-[#C8FF2E] text-2xl mr-1.5 font-mono">₹</span>
                  <span>{activeWeekData.totalSpent.toLocaleString('en-IN')}</span>
                </h2>
                <span className="font-mono text-[10px] text-[#8E8E98] block mt-1.5">
                  PACE ~{formatINR(activeWeekData.dailyAverage)}/DAY • {activeWeekData.daysCount} DAYS
                </span>
              </div>

              {weekOverWeekDiff !== null && (
                <div
                  className={`text-right px-2.5 py-1.5 rounded-xl border font-mono text-[10px] font-bold ${
                    weekOverWeekDiff <= 0
                      ? 'bg-[#C8FF2E]/10 border-[#C8FF2E]/30 text-[#C8FF2E]'
                      : 'bg-[#FFB830]/10 border-[#FFB830]/35 text-[#FFB830]'
                  }`}
                >
                  <div className="flex items-center gap-1 justify-end">
                    {weekOverWeekDiff <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                    <span>{Math.abs(weekOverWeekDiff)}%</span>
                  </div>
                  <span className="text-[9px] opacity-75 block">VS W{activeWeekData.weekNum - 1}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#C8FF2E] font-bold block">Essential</span>
                <span className="font-mono text-sm font-extrabold text-[#F5F4F0] tabular-nums">
                  {formatINR(activeWeekData.necessarySpent)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FF4D3D]/[0.08] border border-[#FF4D3D]/25">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#FF7A6E] font-bold block">Avoidable</span>
                <span className="font-mono text-sm font-extrabold text-[#FF7A6E] tabular-nums">
                  {formatINR(activeWeekData.unnecessarySpent)}
                </span>
              </div>
            </div>

            {/* Interactive Daily Equalizer Bars */}
            <div className="mt-5 pt-4 ticket-divider">
              <div className="flex items-center justify-between font-mono text-[10px] mb-2">
                <span className="font-bold uppercase tracking-wider text-[#A2A2AE]">
                  {activeWeekData.daysCount}-DAY PULSE (TAP BAR TO FILTER)
                </span>
                {selectedDay && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="text-[#C8FF2E] underline font-bold"
                  >
                    CLEAR DAY {selectedDay}
                  </button>
                )}
              </div>

              <div className="grid grid-flow-col auto-cols-fr gap-1.5 items-end h-28 pt-4 pb-1">
                {activeWeekData.dayBreakdown.map((d) => {
                  const heightPercent = d.amount > 0 ? Math.max(16, Math.round((d.amount / maxDaySpend) * 100)) : 8;
                  const isDaySelected = selectedDay === d.day;

                  return (
                    <button
                      type="button"
                      key={d.day}
                      onClick={() => setSelectedDay(prev => (prev === d.day ? null : d.day))}
                      className={`flex flex-col items-center justify-end h-full relative rounded-xl transition-all active:scale-95 ${
                        isDaySelected ? 'ring-1 ring-[#C8FF2E] bg-white/[0.06] py-0.5' : ''
                      }`}
                    >
                      {d.amount > 0 && (
                        <span className="font-mono text-[8px] font-bold text-[#A2A2AE] mb-1 truncate max-w-full">
                          {d.amount >= 1000 ? `${(d.amount / 1000).toFixed(1)}k` : d.amount}
                        </span>
                      )}

                      <div className="w-full max-w-[26px] h-16 flex items-end justify-center rounded-lg overflow-hidden bg-white/[0.06] p-0.5">
                        <div
                          className={`w-full rounded-[5px] transition-all duration-300 ${
                            d.unnecessaryAmount > 0
                              ? 'bg-gradient-to-t from-[#FF4D3D] to-[#FFB830]'
                              : d.amount > 0
                              ? 'bg-[#C8FF2E]'
                              : 'bg-transparent'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      <div className="mt-1.5 text-center leading-tight">
                        <span className={`font-mono text-[9px] font-bold block ${
                          d.isToday || isDaySelected ? 'text-[#C8FF2E]' : 'text-[#8E8E98]'
                        }`}>
                          {d.dayName.slice(0, 2).toUpperCase()}
                        </span>
                        <span className={`font-mono text-[9px] block ${
                          d.isToday || isDaySelected ? 'font-extrabold text-[#F5F4F0]' : 'text-[#6B6A74]'
                        }`}>
                          {d.day}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4C. WEEKLY VIEW — ALL WEEKS COMPARISON */}
      {viewMode === 'weekly' && selectedWeek === 'all' && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-[26px] p-5 atelier-vault-cobalt text-[#F5F4F0]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#B3B3FF]">
                {monthShortName} // WEEKLY MATRIX
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#7C7CFF]/20 text-[#C6C6FF] font-bold border border-[#7C7CFF]/35">
                {weeksData.length} WEEKS
              </span>
            </div>

            <div className="mt-1">
              <h2 className="font-display text-4xl font-extrabold text-[#F5F4F0] tracking-tight tabular-nums flex items-baseline">
                <span className="text-[#C8FF2E] text-2xl mr-1.5 font-mono">₹</span>
                <span>{Number(summary.totalSpent || 0).toLocaleString('en-IN')}</span>
              </h2>
              <span className="font-mono text-[10px] text-[#A2A2AE] block mt-1">
                AVG ~{formatINR(Math.round(summary.totalSpent / (weeksData.length || 1)))} / WEEK
              </span>
            </div>

            <div className="mt-5 pt-4 ticket-divider">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A2A2AE] block mb-3">
                TAP ANY BAR TO INSPECT WEEK
              </span>

              <div className="grid grid-flow-col auto-cols-fr gap-2 items-end h-32 pt-3">
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
                      <span className="font-mono text-[9px] font-bold text-[#A2A2AE] mb-1 truncate">
                        ₹{w.totalSpent >= 1000 ? `${(w.totalSpent / 1000).toFixed(1)}k` : w.totalSpent}
                      </span>

                      <div className="w-full rounded-xl bg-white/[0.06] h-20 p-1 flex items-end justify-center">
                        <div
                          className={`w-full rounded-lg transition-all duration-300 ${
                            w.isCurrentWeek
                              ? 'bg-[#C8FF2E]'
                              : 'bg-[#7C7CFF] group-hover:bg-[#C8FF2E]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      <div className="mt-1.5 text-center leading-tight">
                        <span className="font-mono text-[10px] font-extrabold text-[#F5F4F0] block">W{w.weekNum}</span>
                        <span className="font-mono text-[8px] text-[#8E8E98] block">{w.startDay}–{w.endDay}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#6B6A64] dark:text-[#8E8E98] px-1 block">
              Calendar Weeks Breakdown
            </span>

            {weeksData.map((w) => (
              <div
                key={w.weekNum}
                onClick={() => {
                  setSelectedWeek(w.weekNum);
                  setSelectedDay(null);
                }}
                className="p-3.5 atelier-row rounded-2xl flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#E7E1D3] dark:bg-white/[0.08] text-[#141418] dark:text-[#C8FF2E]">
                      W0{w.weekNum}
                    </span>
                    <h4 className="font-display text-xs font-extrabold text-[#141418] dark:text-[#F5F4F0]">
                      {w.startDay} {w.startDayName} – {w.endDay} {w.endDayName}
                    </h4>
                    {w.isCurrentWeek && (
                      <span className="font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#C8FF2E] text-[#0A0A0C]">
                        NOW
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-[#6B6A64] dark:text-[#8E8E98] mt-1">
                    {w.items.length} entries • {formatINR(w.dailyAverage)}/day
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-mono text-sm font-extrabold text-[#141418] dark:text-[#F5F4F0] tabular-nums">
                      {formatINR(w.totalSpent)}
                    </span>
                    {w.unnecessarySpent > 0 && (
                      <span className="font-mono text-[10px] font-bold text-[#E03424] dark:text-[#FF7A6E] block">
                        ₹{w.unnecessarySpent} leak
                      </span>
                    )}
                  </div>
                  <ChevronRight size={15} className="text-[#8E8E98] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Budget Alerts */}
      {viewMode === 'monthly' && budgetAlerts.length > 0 && (
        <div className="space-y-2">
          {budgetAlerts.map((alert) => (
            <div
              key={alert.category}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                alert.isExceeded
                  ? 'bg-[#FF4D3D]/10 border-[#FF4D3D]/35 text-[#E03424] dark:text-[#FF7A6E] hazard-stripe'
                  : 'bg-[#FFB830]/10 border-[#FFB830]/35 text-[#9A6300] dark:text-[#FFB830]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${alert.isExceeded ? 'bg-[#FF4D3D]/20' : 'bg-[#FFB830]/20'}`}>
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-[#141418] dark:text-[#F5F4F0]">{alert.category} Cap Alert</h4>
                  <p className="font-mono text-[10px]">
                    {formatINR(alert.spent)} / {formatINR(alert.limit)} ({alert.percent}%)
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
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#6B6A64] dark:text-[#8E8E98]">
            {viewMode === 'weekly' && selectedWeek !== 'all' ? `Week ${selectedWeek} Filter` : 'Category Filter'}
          </span>
          <span className="font-mono text-[10px] font-bold text-[#8E8E98]">{filteredExpenses.length} ITEMS</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5 -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 border ${
              selectedCategory === 'All'
                ? 'bg-[#141418] text-[#C8FF2E] dark:bg-[#C8FF2E] dark:text-[#0A0A0C] border-[#141418] font-extrabold'
                : 'bg-[#FFFDF8] dark:bg-[#131317] text-[#55544E] dark:text-[#8E8E98] border-[#141418]/12 dark:border-white/[0.08]'
            }`}
          >
            ALL
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 border ${
                selectedCategory === c.name
                  ? 'bg-[#141418] text-[#F5F4F0] dark:bg-[#F5F4F0] dark:text-[#0A0A0C] border-[#141418] font-extrabold'
                  : 'bg-[#FFFDF8] dark:bg-[#131317] text-[#55544E] dark:text-[#A2A2AE] border-[#141418]/12 dark:border-white/[0.08]'
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Search Input */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-3.5 text-[#8E8E98]" />
        <input
          type="text"
          placeholder={
            viewMode === 'weekly' && selectedWeek !== 'all'
              ? `Search Week ${selectedWeek} entries...`
              : "Search ledger entries..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#FFFDF8] dark:bg-[#131317] border border-[#141418]/14 dark:border-white/[0.09] rounded-2xl text-xs font-medium text-[#141418] dark:text-[#F5F4F0] placeholder-[#8E8E98] focus:outline-none focus:border-[#141418] dark:focus:border-[#C8FF2E] transition-all"
        />
      </div>

      {/* 8. Receipt-Style Transactions Ledger */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[#6B6A64] dark:text-[#8E8E98] font-bold px-1">
          <span>
            {viewMode === 'weekly' && selectedWeek !== 'all'
              ? selectedDay
                ? `Day ${selectedDay} ${monthShortName} (${filteredExpenses.length})`
                : `Week ${selectedWeek} Ledger (${filteredExpenses.length})`
              : `Monthly Ledger (${filteredExpenses.length})`}
          </span>
          <span>INR</span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center atelier-card rounded-[24px]">
            <div className="w-12 h-12 rounded-2xl bg-[#C8FF2E]/15 border border-[#C8FF2E]/40 text-[#16794B] dark:text-[#C8FF2E] flex items-center justify-center mx-auto mb-3">
              <Wallet size={22} />
            </div>
            <p className="font-display text-sm font-extrabold text-[#141418] dark:text-[#F5F4F0]">
              {viewMode === 'weekly' && selectedWeek !== 'all'
                ? `Nothing logged for ${selectedDay ? `Day ${selectedDay}` : `Week ${selectedWeek}`}`
                : 'Ledger is clean this month'}
            </p>
            <p className="text-xs text-[#6B6A64] dark:text-[#8E8E98] mt-1 max-w-[230px] mx-auto">
              Hit the lime + key below to stamp your first expense.
            </p>
            <button
              onClick={onOpenAdd}
              className="mt-4 px-4 py-2.5 rounded-xl shutter-key font-mono font-extrabold text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Log Expense</span>
            </button>
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp._id}
              className={`p-3.5 atelier-row rounded-2xl flex items-center justify-between group ${
                exp.isUnnecessary ? 'border-l-[3px] border-l-[#FF4D3D]' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon category={exp.category} size={17} className="p-2.5 rounded-xl flex-shrink-0" />
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-display text-[13px] font-bold text-[#141418] dark:text-[#F5F4F0] truncate">
                      {exp.title}
                    </h4>
                    {exp.isUnnecessary && (
                      <span className="font-mono text-[8px] font-extrabold uppercase tracking-wider bg-[#FF4D3D]/15 text-[#E03424] dark:text-[#FF7A6E] border border-[#FF4D3D]/35 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                        LEAK
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px] text-[#6B6A64] dark:text-[#8E8E98]">
                    <span>
                      {new Date(exp.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
                    </span>
                    <span className="opacity-40">/</span>
                    <span className="truncate">{exp.paymentMethod || 'UPI'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
                <span
                  className={`font-mono text-[13px] font-extrabold tabular-nums ${
                    exp.isUnnecessary ? 'text-[#E03424] dark:text-[#FF7A6E]' : 'text-[#141418] dark:text-[#F5F4F0]'
                  }`}
                >
                  {formatINR(exp.amount)}
                </span>
                <button
                  onClick={() => onDeleteExpense(exp._id)}
                  className="p-1.5 rounded-lg text-[#8E8E98] hover:text-[#FF4D3D] hover:bg-[#FF4D3D]/10 active:scale-90 transition-all"
                  title="Delete entry"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
