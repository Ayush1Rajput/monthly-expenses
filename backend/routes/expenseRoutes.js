import express from 'express';
import Expense from '../models/Expense.js';

const router = express.Router();

// GET all expenses with optional filtering (month, year, category, isUnnecessary)
router.get('/', async (req, res) => {
  try {
    const { month, year, category, isUnnecessary, search, limit = 100, page = 1 } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (isUnnecessary !== undefined && isUnnecessary !== '') {
      filter.isUnnecessary = isUnnecessary === 'true';
    }

    if (year) {
      const y = parseInt(year);
      if (month) {
        const m = parseInt(month) - 1; // 0-indexed in JS Date
        const startDate = new Date(y, m, 1);
        const endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);
        filter.date = { $gte: startDate, $lte: endDate };
      } else {
        const startDate = new Date(y, 0, 1);
        const endDate = new Date(y, 11, 31, 23, 59, 59, 999);
        filter.date = { $gte: startDate, $lte: endDate };
      }
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalCount = await Expense.countDocuments(filter);

    res.json({ success: true, count: totalCount, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new expense
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, isUnnecessary, unnecessaryReason, date, paymentMethod, notes } = req.body;
    
    if (!title || amount === undefined || amount === null) {
      return res.status(400).json({ success: false, message: 'Title and amount are required' });
    }

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category: category || 'Others',
      isUnnecessary: Boolean(isUnnecessary),
      unnecessaryReason: unnecessaryReason || '',
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'UPI / Online',
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
