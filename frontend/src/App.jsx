import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MonthOverview from './components/MonthOverview';
import WasteWatcher from './components/WasteWatcher';
import YearlyReview from './components/YearlyReview';
import HistoryView from './components/HistoryView';
import QuickAddModal from './components/QuickAddModal';
import SettingsModal from './components/SettingsModal';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

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
      await createExpense(data);
      if (data.isUnnecessary) {
        showToast('Expense saved and flagged as Extra Spend ⚠️');
      } else {
        showToast('Expense recorded successfully! ✅');
      }
      loadData();
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
      setIsSettingsOpen(false);
      loadData();
    } catch (err) {
      showToast('Failed to seed demo data');
    }
  };

  // Clear all data
  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to erase all expenses? This cannot be undone.')) {
      saveLocalExpenses([]);
      showToast('All local data cleared');
      setIsSettingsOpen(false);
      loadData();
    }
  };

  const wasteCount = expenses.filter(e => e.isUnnecessary).length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 glass-surface-active border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-2xl shadow-2xl text-xs font-black animate-fade-in flex items-center gap-2 backdrop-blur-2xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        dbStatus={dbStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSeedDemo={handleSeedDemo}
        hasExpenses={allExpenses.length > 0}
      />

      {/* Main Content Area (Mobile smartphone container) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 pb-8">
        {activeTab === 'overview' && (
          <MonthOverview
            analytics={monthlyAnalytics}
            expenses={expenses}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={(m) => setCurrentMonth(m)}
            onDeleteExpense={handleDeleteExpense}
            onOpenAdd={() => setIsAddOpen(true)}
          />
        )}

        {activeTab === 'waste' && (
          <WasteWatcher
            analytics={monthlyAnalytics}
            expenses={expenses}
            onDeleteExpense={handleDeleteExpense}
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
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            expenses={allExpenses}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAdd={() => setIsAddOpen(true)}
        wasteCount={wasteCount}
      />

      {/* Modals */}
      <QuickAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveExpense}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        dbStatus={dbStatus}
        onSeedDemo={handleSeedDemo}
        onClearData={handleClearData}
        hasExpenses={allExpenses.length > 0}
      />
    </div>
  );
}
