import express from 'express';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

const router = express.Router();

// GET /api/analytics/monthly?month=10&year=2026
router.get('/monthly', async (req, res) => {
  try {
    const today = new Date();
    const month = parseInt(req.query.month) || (today.getMonth() + 1);
    const year = parseInt(req.query.year) || today.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch all expenses for this month
    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    let totalSpent = 0;
    let necessarySpent = 0;
    let unnecessarySpent = 0;
    const categoryMap = {};
    const dailyMap = {};
    const unnecessaryByCategory = {};

    expenses.forEach(exp => {
      const amt = Number(exp.amount) || 0;
      totalSpent += amt;

      if (exp.isUnnecessary) {
        unnecessarySpent += amt;
        unnecessaryByCategory[exp.category] = (unnecessaryByCategory[exp.category] || 0) + amt;
      } else {
        necessarySpent += amt;
      }

      // Category breakdown
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + amt;

      // Daily breakdown
      const dayNum = new Date(exp.date).getDate();
      dailyMap[dayNum] = (dailyMap[dayNum] || 0) + amt;
    });

    // Budgets for this month
    const budgets = await Budget.find({ month, year });
    const budgetAlerts = [];

    budgets.forEach(b => {
      const spent = categoryMap[b.category] || 0;
      const percent = Math.round((spent / b.monthlyLimit) * 100);
      if (percent >= 80) {
        budgetAlerts.push({
          category: b.category,
          limit: b.monthlyLimit,
          spent,
          percent,
          isExceeded: percent >= 100
        });
      }
    });

    const categoryList = Object.keys(categoryMap).map(cat => ({
      name: cat,
      amount: categoryMap[cat],
      percentage: totalSpent > 0 ? Math.round((categoryMap[cat] / totalSpent) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    const unnecessaryList = Object.keys(unnecessaryByCategory).map(cat => ({
      name: cat,
      amount: unnecessaryByCategory[cat],
      percentage: unnecessarySpent > 0 ? Math.round((unnecessaryByCategory[cat] / unnecessarySpent) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    const wastePercentage = totalSpent > 0 ? Math.round((unnecessarySpent / totalSpent) * 100) : 0;

    // Smart tips based on unnecessary spending
    const smartTips = [];
    if (wastePercentage > 30) {
      smartTips.push(`⚠️ Unnecessary expenses make up ${wastePercentage}% of your spending this month. Aim to keep this below 15%!`);
    }
    if (unnecessaryList.length > 0) {
      smartTips.push(`💡 Your biggest unnecessary spending is in "${unnecessaryList[0].name}" (₹${unnecessaryList[0].amount.toLocaleString('en-IN')}). Try a 48-hour pause rule before buying.`);
    }
    if (unnecessarySpent > 0) {
      // 1 year compounding at 12% annual return
      const yearlyPotential = Math.round(unnecessarySpent * 12 * 1.06);
      smartTips.push(`💰 If you saved your monthly extra ₹${unnecessarySpent.toLocaleString('en-IN')}, you could have ~₹${yearlyPotential.toLocaleString('en-IN')} in 1 year!`);
    }

    res.json({
      success: true,
      month,
      year,
      summary: {
        totalSpent,
        necessarySpent,
        unnecessarySpent,
        wastePercentage,
        expenseCount: expenses.length
      },
      categoryBreakdown: categoryList,
      unnecessaryBreakdown: unnecessaryList,
      budgetAlerts,
      smartTips,
      recentExpenses: expenses.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/yearly?year=2026 (Dynamic whole year expenses and visual data)
router.get('/yearly', async (req, res) => {
  try {
    const today = new Date();
    const year = parseInt(req.query.year) || today.getFullYear();

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Initialize 12 months
    const monthlyData = monthNames.map((name, index) => ({
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
    const categoryTotals = {};
    const unnecessaryByCategory = {};

    expenses.forEach(exp => {
      const d = new Date(exp.date);
      const mIdx = d.getMonth();
      const amt = Number(exp.amount) || 0;

      yearlyTotal += amt;
      monthlyData[mIdx].total += amt;
      monthlyData[mIdx].count += 1;

      if (exp.isUnnecessary) {
        yearlyUnnecessary += amt;
        monthlyData[mIdx].unnecessary += amt;
        unnecessaryByCategory[exp.category] = (unnecessaryByCategory[exp.category] || 0) + amt;
      } else {
        yearlyNecessary += amt;
        monthlyData[mIdx].necessary += amt;
      }

      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amt;
    });

    // Find highest & lowest spending months (among months with expenses)
    const activeMonths = monthlyData.filter(m => m.total > 0);
    let highestMonth = null;
    let lowestMonth = null;

    if (activeMonths.length > 0) {
      highestMonth = [...activeMonths].sort((a, b) => b.total - a.total)[0];
      lowestMonth = [...activeMonths].sort((a, b) => a.total - b.total)[0];
    }

    // Top categories
    const topCategories = Object.keys(categoryTotals).map(cat => ({
      name: cat,
      amount: categoryTotals[cat],
      percentage: yearlyTotal > 0 ? Math.round((categoryTotals[cat] / yearlyTotal) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    // Top unnecessary categories
    const topUnnecessaryCategories = Object.keys(unnecessaryByCategory).map(cat => ({
      name: cat,
      amount: unnecessaryByCategory[cat],
      percentage: yearlyUnnecessary > 0 ? Math.round((unnecessaryByCategory[cat] / yearlyUnnecessary) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    const yearlyWastePercentage = yearlyTotal > 0 ? Math.round((yearlyUnnecessary / yearlyTotal) * 100) : 0;

    // Monthly average
    const monthsRecorded = activeMonths.length || 1;
    const monthlyAverage = Math.round(yearlyTotal / monthsRecorded);
    const unnecessaryMonthlyAverage = Math.round(yearlyUnnecessary / monthsRecorded);

    // Dynamic "Year in Review" milestones & highlights
    const yearInReview = {
      year,
      totalSpent: yearlyTotal,
      unnecessarySpent: yearlyUnnecessary,
      wastePercentage: yearlyWastePercentage,
      totalTransactions: expenses.length,
      monthlyAverage,
      unnecessaryMonthlyAverage,
      highestMonth: highestMonth ? { name: highestMonth.month, amount: highestMonth.total } : null,
      lowestMonth: lowestMonth ? { name: lowestMonth.month, amount: lowestMonth.total } : null,
      topCategory: topCategories[0] || null,
      topUnnecessaryCategory: topUnnecessaryCategories[0] || null,
      // What if you saved the unnecessary spend?
      potentialSavingsIfInvested: Math.round(yearlyUnnecessary * 1.12), // 12% annual index return
    };

    res.json({
      success: true,
      year,
      monthlyTrends: monthlyData,
      categoryDistribution: topCategories,
      unnecessaryDistribution: topUnnecessaryCategories,
      yearInReview
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
