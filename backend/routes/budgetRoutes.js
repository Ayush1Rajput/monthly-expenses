import express from 'express';
import Budget from '../models/Budget.js';

const router = express.Router();

// GET budgets for a given month and year
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    const month = parseInt(req.query.month) || (today.getMonth() + 1);
    const year = parseInt(req.query.year) || today.getFullYear();

    const budgets = await Budget.find({ month, year });
    res.json({ success: true, data: budgets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SET or update a category budget
router.post('/', async (req, res) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;
    if (!category || monthlyLimit === undefined || !month || !year) {
      return res.status(400).json({ success: false, message: 'category, monthlyLimit, month, year are required' });
    }

    const budget = await Budget.findOneAndUpdate(
      { category, month, year },
      { monthlyLimit: Number(monthlyLimit) },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE a budget
router.delete('/:id', async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
