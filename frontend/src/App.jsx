import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MonthOverview from './components/MonthOverview';
import WasteWatcher from './components/WasteWatcher';
import YearlyReview from './components/YearlyReview';
import HistoryView from './components/HistoryView';
import QuickAddModal from './components/QuickAddModal';
import {
  fetchExpenses,
  createExpense,
  deleteExpense,
  fetchMonthlyAnalytics,
  fetchYearlyAnalytics,
  checkHealth,
  seedSampleData
} from './services/api';

export default function App() {
  const today = new Date();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'waste' | 'yearly' | 'history'
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);
  const [yearlyAnalytics, setYearlyAnalytics] = useState(null);
  const [dbStatus, setDbStatus] = useState({ dbConnected: false, status: 'checking' });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Dark & Light Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pennywise_theme') || 'dark';
  });

  // Monthly vs Weekly View Mode State
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('pennywise_view_mode') || 'monthly';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('pennywise_view_mode', mode);
  };

  useEffect(() => {
    localStorage.setItem('pennywise_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0A0A0C' : '#F3EFE6');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check health and load data
  const loadData = async () => {
    try {
      const health = await checkHealth();
      setDbStatus(health);

      const currentMonthExpenses = await fetchExpenses({ month: currentMonth, year: currentYear });
      setExpenses(currentMonthExpenses || []);

      const all = await fetchExpenses({});
      setAllExpenses(all || []);

      const mAnalytics = await fetchMonthlyAnalytics(currentMonth, currentYear);
      setMonthlyAnalytics(mAnalytics);

      const yAnalytics = await fetchYearlyAnalytics(currentYear);
      setYearlyAnalytics(yAnalytics);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentMonth, currentYear]);

  // Handle adding expense
  const handleSaveExpense = async (data) => {
    try {
      const result = await createExpense(data);
      if (result && result.synced) {
        showToast('Synced to Atlas Cloud');
      } else if (data.isUnnecessary) {
        showToast('Logged & flagged as Avoidable Leak');
      } else {
        showToast('Expense logged to ledger');
      }
      await loadData();
    } catch (err) {
      showToast('Failed to save expense');
    }
  };

  // Handle deleting expense
  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
      showToast('Entry removed from ledger');
      loadData();
    }
  };

  // Seed sample demo data
  const handleSeedDemo = async () => {
    try {
      await seedSampleData();
      showToast('12-Month Sample Ledger Loaded');
      loadData();
    } catch (err) {
      showToast('Failed to seed demo data');
    }
  };

  const wasteCount = expenses.filter(e => e.isUnnecessary).length;

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#C8FF2E] selection:text-[#0A0A0C]">
      {/* Editorial Ticker Toast Notification */}
      {toastMessage && (
        <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-50 bg-[#141418] text-[#F5F4F0] border border-[#C8FF2E]/50 px-4 py-2 rounded-full shadow-2xl text-[11px] font-mono font-bold tracking-wide uppercase animate-fade-in flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#C8FF2E] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Atelier Header */}
      <Header
        dbStatus={dbStatus}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSeedDemo={handleSeedDemo}
        hasExpenses={allExpenses.length > 0}
      />

      {/* Main Content Area (Mobile-first focused column) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4 pb-10">
        {activeTab === 'overview' && (
          <MonthOverview
            analytics={monthlyAnalytics}
            expenses={expenses}
            allExpenses={allExpenses}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={(m) => setCurrentMonth(m)}
            onYearChange={(y) => setCurrentYear(y)}
            onDeleteExpense={handleDeleteExpense}
            onOpenAdd={() => setIsAddOpen(true)}
            theme={theme}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        )}

        {activeTab === 'waste' && (
          <WasteWatcher
            analytics={monthlyAnalytics}
            expenses={expenses}
            onDeleteExpense={handleDeleteExpense}
            theme={theme}
          />
        )}

        {activeTab === 'yearly' && (
          <YearlyReview
            yearlyData={yearlyAnalytics}
            selectedYear={currentYear}
            onYearChange={(y) => setCurrentYear(y)}
            onSelectMonth={(m) => {
              setCurrentMonth(m);
              setActiveTab('overview');
            }}
            theme={theme}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            expenses={allExpenses}
            onDeleteExpense={handleDeleteExpense}
            theme={theme}
          />
        )}
      </main>

      {/* Bottom Floating Hardware Dock */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAdd={() => setIsAddOpen(true)}
        wasteCount={wasteCount}
        theme={theme}
        viewMode={viewMode}
      />

      {/* Quick Add Expense Slip Modal */}
      <QuickAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveExpense}
        theme={theme}
      />
    </div>
  );
}
