const API_BASE = '/api';

// Local storage fallback key
const LOCAL_STORAGE_KEY = 'pennywise_expenses_local';
const LOCAL_BUDGET_KEY = 'pennywise_budgets_local';

import userExpenses from './userExpenses.json';

export const getLocalExpenses = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.length > 0) return parsed;
    }
    // Default to user's real 3.5 months expenses
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userExpenses));
    return userExpenses;
  } catch (e) {
    return userExpenses || [];
  }
};

export const saveLocalExpenses = (expenses) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
};

export const getLocalBudgets = () => {
  try {
    const raw = localStorage.getItem(LOCAL_BUDGET_KEY);
    return raw ? JSON.parse(raw) : [
      { category: 'Food & Dining', monthlyLimit: 6000 },
      { category: 'Groceries', monthlyLimit: 8000 },
      { category: 'Shopping & Clothing', monthlyLimit: 4000 },
      { category: 'Entertainment & OTT', monthlyLimit: 2000 },
      { category: 'Bills & Utilities', monthlyLimit: 4500 },
      { category: 'Transport & Fuel', monthlyLimit: 3000 },
    ];
  } catch (e) {
    return [];
  }
};

export const saveLocalBudgets = (budgets) => {
  try {
    localStorage.setItem(LOCAL_BUDGET_KEY, JSON.stringify(budgets));
  } catch (e) {
    console.error('Failed to save budgets', e);
  }
};

let isServerReachable = true;

const fastFetch = async (url, options = {}, timeoutMs = 800) => {
  if (!isServerReachable && !url.includes('/health')) {
    throw new Error('Server known to be offline');
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    isServerReachable = true;
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    isServerReachable = false;
    throw err;
  }
};

// Check backend & MongoDB connection
export const checkHealth = async () => {
  try {
    const res = await fastFetch(`${API_BASE}/health`, {}, 1000);
    if (!res.ok) throw new Error('Backend error');
    const data = await res.json();
    isServerReachable = true;
    return data;
  } catch (err) {
    isServerReachable = false;
    return {
      status: 'offline',
      dbConnected: false,
      dbError: 'Laptop server is off. Running in 100% Phone Offline Storage mode.'
    };
  }
};

// Get expenses with filtering
export const fetchExpenses = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.month) query.set('month', params.month);
  if (params.year) query.set('year', params.year);
  if (params.category && params.category !== 'All') query.set('category', params.category);
  if (params.isUnnecessary !== undefined) query.set('isUnnecessary', params.isUnnecessary);
  if (params.search) query.set('search', params.search);

  if (isServerReachable) {
    try {
      const res = await fastFetch(`${API_BASE}/expenses?${query.toString()}`, {}, 800);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) return data.data;
      }
    } catch (err) {
      // Laptop server unreachable, fall back instantly to local storage
    }
  }

  // Fallback to local storage (instant 0ms)
  let items = getLocalExpenses();
  if (params.category && params.category !== 'All') {
    items = items.filter(i => i.category === params.category);
  }
  if (params.isUnnecessary !== undefined) {
    items = items.filter(i => String(i.isUnnecessary) === String(params.isUnnecessary));
  }
  if (params.year) {
    items = items.filter(i => {
      const d = new Date(i.date);
      if (params.month) {
        return d.getFullYear() === Number(params.year) && (d.getMonth() + 1) === Number(params.month);
      }
      return d.getFullYear() === Number(params.year);
    });
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    items = items.filter(i => i.title.toLowerCase().includes(s));
  }
  return items.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Add new expense (Instant save to local storage, syncs if server is up)
export const createExpense = async (expenseData) => {
  // Always create local object first so nothing is ever lost
  const newExp = {
    ...expenseData,
    _id: 'loc_' + Date.now() + Math.random().toString(36).substr(2, 4),
    date: expenseData.date || new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  const list = getLocalExpenses();
  list.unshift(newExp);
  saveLocalExpenses(list);

  // Try to sync to backend if server is reachable
  if (isServerReachable) {
    try {
      fastFetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      }, 1000).catch(() => {});
    } catch (e) {}
  }

  return newExp;
};

// Delete expense
export const deleteExpense = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Deleting locally:', err.message);
  }

  const list = getLocalExpenses().filter(e => e._id !== id);
  saveLocalExpenses(list);
  return true;
};

// Monthly analytics
export const fetchMonthlyAnalytics = async (month, year) => {
  if (isServerReachable) {
    try {
      const res = await fastFetch(`${API_BASE}/analytics/monthly?month=${month}&year=${year}`, {}, 800);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch (err) {}
  }

  // Local calculation
  const all = getLocalExpenses().filter(i => {
    const d = new Date(i.date);
    return d.getFullYear() === Number(year) && (d.getMonth() + 1) === Number(month);
  });

  let totalSpent = 0;
  let necessarySpent = 0;
  let unnecessarySpent = 0;
  const categoryMap = {};
  const unnecessaryMap = {};

  all.forEach(exp => {
    const amt = Number(exp.amount) || 0;
    totalSpent += amt;
    if (exp.isUnnecessary) {
      unnecessarySpent += amt;
      unnecessaryMap[exp.category] = (unnecessaryMap[exp.category] || 0) + amt;
    } else {
      necessarySpent += amt;
    }
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + amt;
  });

  const categoryBreakdown = Object.keys(categoryMap).map(c => ({
    name: c,
    amount: categoryMap[c],
    percentage: totalSpent > 0 ? Math.round((categoryMap[c] / totalSpent) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  const unnecessaryBreakdown = Object.keys(unnecessaryMap).map(c => ({
    name: c,
    amount: unnecessaryMap[c],
    percentage: unnecessarySpent > 0 ? Math.round((unnecessaryMap[c] / unnecessarySpent) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  const wastePercentage = totalSpent > 0 ? Math.round((unnecessarySpent / totalSpent) * 100) : 0;

  const smartTips = [];
  if (wastePercentage > 25) {
    smartTips.push(`⚠️ ${wastePercentage}% of your spending this month was unnecessary. You could save ₹${unnecessarySpent.toLocaleString('en-IN')}!`);
  }
  if (unnecessaryBreakdown.length > 0) {
    smartTips.push(`💡 Most extra spend is on "${unnecessaryBreakdown[0].name}" (₹${unnecessaryBreakdown[0].amount.toLocaleString('en-IN')}). Consider setting a strict weekly cap.`);
  }

  return {
    success: true,
    month,
    year,
    summary: {
      totalSpent,
      necessarySpent,
      unnecessarySpent,
      wastePercentage,
      expenseCount: all.length
    },
    categoryBreakdown,
    unnecessaryBreakdown,
    budgetAlerts: [],
    smartTips,
    recentExpenses: all.slice(0, 10)
  };
};

// Yearly analytics
export const fetchYearlyAnalytics = async (year) => {
  if (isServerReachable) {
    try {
      const res = await fastFetch(`${API_BASE}/analytics/yearly?year=${year}`, {}, 800);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch (err) {}
  }

  // Local calculation
  const all = getLocalExpenses().filter(i => {
    const d = new Date(i.date);
    return d.getFullYear() === Number(year);
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrends = monthNames.map((name, index) => ({
    monthIndex: index + 1,
    month: name,
    total: 0,
    necessary: 0,
    unnecessary: 0,
    count: 0
  }));

  let yearlyTotal = 0;
  let yearlyNecessary = 0;
  let yearlyUnnecessary = 0;
  const catMap = {};
  const unnecMap = {};

  all.forEach(exp => {
    const d = new Date(exp.date);
    const m = d.getMonth();
    const amt = Number(exp.amount) || 0;
    yearlyTotal += amt;
    monthlyTrends[m].total += amt;
    monthlyTrends[m].count += 1;

    if (exp.isUnnecessary) {
      yearlyUnnecessary += amt;
      monthlyTrends[m].unnecessary += amt;
      unnecMap[exp.category] = (unnecMap[exp.category] || 0) + amt;
    } else {
      yearlyNecessary += amt;
      monthlyTrends[m].necessary += amt;
    }
    catMap[exp.category] = (catMap[exp.category] || 0) + amt;
  });

  const categoryDistribution = Object.keys(catMap).map(c => ({
    name: c,
    amount: catMap[c],
    percentage: yearlyTotal > 0 ? Math.round((catMap[c] / yearlyTotal) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  const unnecessaryDistribution = Object.keys(unnecMap).map(c => ({
    name: c,
    amount: unnecMap[c],
    percentage: yearlyUnnecessary > 0 ? Math.round((unnecMap[c] / yearlyUnnecessary) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  const activeMonths = monthlyTrends.filter(m => m.total > 0);
  const highestMonth = activeMonths.length > 0 ? [...activeMonths].sort((a, b) => b.total - a.total)[0] : null;
  const lowestMonth = activeMonths.length > 0 ? [...activeMonths].sort((a, b) => a.total - b.total)[0] : null;

  return {
    success: true,
    year,
    monthlyTrends,
    categoryDistribution,
    unnecessaryDistribution,
    yearInReview: {
      year,
      totalSpent: yearlyTotal,
      unnecessarySpent: yearlyUnnecessary,
      wastePercentage: yearlyTotal > 0 ? Math.round((yearlyUnnecessary / yearlyTotal) * 100) : 0,
      totalTransactions: all.length,
      monthlyAverage: activeMonths.length > 0 ? Math.round(yearlyTotal / activeMonths.length) : 0,
      highestMonth: highestMonth ? { name: highestMonth.month, amount: highestMonth.total } : null,
      lowestMonth: lowestMonth ? { name: lowestMonth.month, amount: lowestMonth.total } : null,
      topCategory: categoryDistribution[0] || null,
      topUnnecessaryCategory: unnecessaryDistribution[0] || null,
      potentialSavingsIfInvested: Math.round(yearlyUnnecessary * 1.12),
    }
  };
};

// Seed sample data for user to test immediately
export const seedSampleData = async () => {
  try {
    const res = await fetch(`${API_BASE}/seed-demo`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (err) {}

  // Local seed
  const currentYear = new Date().getFullYear();
  const sampleItems = [
    { title: 'Supermarket monthly groceries', amount: 4800, category: 'Groceries', isUnnecessary: false },
    { title: 'Electricity & Water bill', amount: 1650, category: 'Bills & Utilities', isUnnecessary: false },
    { title: 'Late night fast food delivery', amount: 620, category: 'Food & Dining', isUnnecessary: true, unnecessaryReason: 'Late night craving' },
    { title: 'Fuel for vehicle', amount: 2200, category: 'Transport & Fuel', isUnnecessary: false },
    { title: 'Impulse clothing sale buy', amount: 2499, category: 'Shopping & Clothing', isUnnecessary: true, unnecessaryReason: 'Flash sale impulse' },
    { title: 'Weekend restaurant dinner', amount: 1450, category: 'Food & Dining', isUnnecessary: true, unnecessaryReason: 'Could eat at home' },
    { title: 'Pharmacy & vitamins', amount: 780, category: 'Health & Medical', isUnnecessary: false },
    { title: 'Unused Gym subscription', amount: 1200, category: 'Entertainment & OTT', isUnnecessary: true, unnecessaryReason: 'Did not visit gym' },
    { title: 'Mobile recharge & Wi-Fi', amount: 999, category: 'Bills & Utilities', isUnnecessary: false },
    { title: 'Cafe premium iced coffee', amount: 350, category: 'Food & Dining', isUnnecessary: true, unnecessaryReason: 'Expensive coffee habit' },
    { title: 'Vegetable market', amount: 850, category: 'Groceries', isUnnecessary: false },
    { title: 'Cab ride instead of metro', amount: 420, category: 'Transport & Fuel', isUnnecessary: true, unnecessaryReason: 'Woke up late' },
  ];

  const generated = [];
  for (let m = 0; m < 12; m++) {
    sampleItems.forEach((item, idx) => {
      const day = Math.min(28, (idx * 2) + 2);
      const expenseDate = new Date(currentYear, m, day, 14, 30);
      const variance = 1 + (Math.sin(m + idx) * 0.15);
      generated.push({
        _id: 'seed_' + m + '_' + idx,
        title: item.title,
        amount: Math.round(item.amount * variance),
        category: item.category,
        isUnnecessary: item.isUnnecessary,
        unnecessaryReason: item.unnecessaryReason || '',
        date: expenseDate.toISOString(),
        paymentMethod: 'UPI / Online'
      });
    });
  }

  saveLocalExpenses(generated);
  return { success: true, message: `Loaded ${generated.length} sample expenses for ${currentYear}` };
};
