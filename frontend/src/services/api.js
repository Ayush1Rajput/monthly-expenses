import userExpenses from './userExpenses.json';

const API_BASE = '/api';

// Local storage fallback key
const LOCAL_STORAGE_KEY = 'pennywise_expenses_local';
const LOCAL_BUDGET_KEY = 'pennywise_budgets_local';

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

// Robust fetch with reasonable mobile timeout (6s for mobile 4G/5G)
const safeFetch = async (url, options = {}, timeoutMs = 6000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

// Automatically sync any offline pending expenses to MongoDB Atlas
export const syncOfflineExpensesToAtlas = async () => {
  try {
    const local = getLocalExpenses();
    const pending = local.filter(e => e._id && String(e._id).startsWith('loc_'));
    if (pending.length === 0) return;

    for (const exp of pending) {
      try {
        const payload = {
          title: exp.title,
          amount: Number(exp.amount),
          category: exp.category,
          isUnnecessary: Boolean(exp.isUnnecessary),
          unnecessaryReason: exp.unnecessaryReason || '',
          date: exp.date,
          paymentMethod: exp.paymentMethod || 'UPI / Online'
        };

        const res = await safeFetch(`${API_BASE}/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }, 5000);

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            // Replace loc_ temporary id with permanent MongoDB Atlas _id
            exp._id = json.data._id;
          }
        }
      } catch (err) {
        // Will retry on next sync
      }
    }
    saveLocalExpenses(local);
  } catch (e) {
    console.error('Sync offline queue error:', e);
  }
};

// Check backend & MongoDB connection
export const checkHealth = async () => {
  try {
    const res = await safeFetch(`${API_BASE}/health`, {}, 5000);
    if (!res.ok) throw new Error('Backend error');
    const data = await res.json();
    
    // If connected to Atlas, automatically sync any pending offline items
    if (data.dbConnected) {
      syncOfflineExpensesToAtlas().catch(() => {});
    }
    return data;
  } catch (err) {
    return {
      status: 'offline',
      dbConnected: false,
      dbError: 'Running in Phone Offline Storage mode.'
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

  try {
    const res = await safeFetch(`${API_BASE}/expenses?${query.toString()}`, {}, 5000);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        // Update local storage cache with latest cloud data
        if (!params.category && params.isUnnecessary === undefined && !params.search) {
          saveLocalExpenses(data.data);
        }
        return data.data;
      }
    }
  } catch (err) {
    // Cloud unreachable, fall back to local storage
  }

  // Fallback to local storage
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

// Add new expense (Attempts Atlas first; falls back to phone storage with auto-sync)
export const createExpense = async (expenseData) => {
  let createdItem = null;

  try {
    const res = await safeFetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData)
    }, 6000);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        createdItem = data.data;
      }
    }
  } catch (err) {
    console.warn('Could not post directly to Atlas, saving locally for auto-sync:', err.message);
  }

  // If server responded, save real item to local storage
  if (createdItem) {
    const list = getLocalExpenses();
    list.unshift(createdItem);
    saveLocalExpenses(list);
    return { ...createdItem, synced: true };
  }

  // Otherwise save offline with temporary ID for later auto-sync
  const offlineExp = {
    ...expenseData,
    _id: 'loc_' + Date.now() + Math.random().toString(36).substr(2, 4),
    date: expenseData.date || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    synced: false
  };

  const list = getLocalExpenses();
  list.unshift(offlineExp);
  saveLocalExpenses(list);
  return offlineExp;
};

// Delete expense
export const deleteExpense = async (id) => {
  if (!String(id).startsWith('loc_')) {
    try {
      await safeFetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' }, 4000);
    } catch (err) {
      console.warn('Deleting on server failed:', err.message);
    }
  }

  const list = getLocalExpenses().filter(e => e._id !== id);
  saveLocalExpenses(list);
  return true;
};

// Monthly analytics
export const fetchMonthlyAnalytics = async (month, year) => {
  try {
    const res = await safeFetch(`${API_BASE}/analytics/monthly?month=${month}&year=${year}`, {}, 5000);
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json;
    }
  } catch (err) {}

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
  try {
    const res = await safeFetch(`${API_BASE}/analytics/yearly?year=${year}`, {}, 5000);
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json;
    }
  } catch (err) {}

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

export const seedSampleData = async () => {
  return { success: true };
};
