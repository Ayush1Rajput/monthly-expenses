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
  seedSampleData,
  saveLocalExpenses
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

      // Load expenses for current month
      const currentMonthExpenses = await fetchExpenses({ month: currentMonth, year: currentYear });
      setExpenses(currentMonthExpenses || []);

      // Load all expenses for history view
      const all = await fetchExpenses({});
      setAllExpenses(all || []);

      // Load monthly analytics
      const mAnalytics = await fetchMonthlyAnalytics(currentMonth, currentYear);
      setMonthlyAnalytics(mAnalytics);

      // Load yearly analytics
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
        showToast('Saved to MongoDB Atlas Cloud! ☁️✅');
      } else if (data.isUnnecessary) {
        showToast('Saved locally & flagged as Extra Spend ⚠️');
      } else {
        showToast('Expense recorded successfully! ✅');
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
      showToast('Expense removed 🗑️');
      loadData();
    }
  };

  // Seed sample demo data
  const handleSeedDemo = async () => {
    try {
      await seedSampleData();
      showToast('Loaded 12-Month Sample Data! Check out Yearly Review 🎉');
      loadData();
    } catch (err) {
      showToast('Failed to seed demo data');
    }
  };

  const wasteCount = expenses.filter(e => e.isUnnecessary).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 glass-surface-active border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-2xl shadow-2xl text-xs font-black animate-fade-in flex items-center gap-2 backdrop-blur-2xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header with Dark/Light Theme Toggle */}
      <Header
        dbStatus={dbStatus}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSeedDemo={handleSeedDemo}
        hasExpenses={allExpenses.length > 0}
      />

      {/* Main Content Area (Mobile smartphone container) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 pb-8">
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

      {/* Bottom Mobile Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAdd={() => setIsAddOpen(true)}
        wasteCount={wasteCount}
        theme={theme}
        viewMode={viewMode}
      />

      {/* Quick Add Bottom Sheet Modal */}
      <QuickAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveExpense}
        theme={theme}
      />
    </div>
  );
}
