import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import expenseRoutes from './routes/expenseRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let isDbConnected = false;
let dbError = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.log('⚠️ MongoDB URI not configured yet in backend/.env.');
    dbError = 'MongoDB URI not set or has placeholders in backend/.env';
    return;
  }

  try {
    await mongoose.connect(uri);
    isDbConnected = true;
    dbError = null;
    console.log('✅ Connected successfully to MongoDB Atlas!');
  } catch (err) {
    isDbConnected = false;
    dbError = err.message;
    console.error('❌ MongoDB Atlas connection error:', err.message);
  }
};

connectDB();

// API Health & MongoDB status check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    dbConnected: isDbConnected && mongoose.connection.readyState === 1,
    dbReadyState: mongoose.connection.readyState,
    dbError: dbError,
    timestamp: new Date().toISOString()
  });
});

// Seed endpoint for quick demo testing if user wants sample year data
app.post('/api/seed-demo', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'Database is not connected yet.' });
  }

  try {
    const Expense = (await import('./models/Expense.js')).default;
    // Clear existing
    await Expense.deleteMany({});

    const categories = [
      'Food & Dining', 'Groceries', 'Shopping & Clothing',
      'Entertainment & OTT', 'Bills & Utilities', 'Transport & Fuel',
      'Health & Medical', 'Personal Care', 'Others'
    ];

    const sampleExpenses = [];
    const currentYear = new Date().getFullYear();

    // Generate realistic expenses across all 12 months
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
      { title: 'Online streaming bundle', amount: 499, category: 'Entertainment & OTT', isUnnecessary: false },
      { title: 'Vegetable market', amount: 850, category: 'Groceries', isUnnecessary: false },
      { title: 'Cab ride instead of metro', amount: 420, category: 'Transport & Fuel', isUnnecessary: true, unnecessaryReason: 'Woke up late' },
    ];

    for (let m = 0; m < 12; m++) {
      sampleItems.forEach((item, idx) => {
        // Vary dates through the month
        const day = Math.min(28, (idx * 2) + 2);
        const expenseDate = new Date(currentYear, m, day, 14, 30);
        // Slightly randomize amounts to look organic
        const variance = 1 + (Math.sin(m + idx) * 0.15);
        sampleExpenses.push({
          title: item.title,
          amount: Math.round(item.amount * variance),
          category: item.category,
          isUnnecessary: item.isUnnecessary,
          unnecessaryReason: item.unnecessaryReason || '',
          date: expenseDate,
          paymentMethod: 'UPI / Online'
        });
      });
    }

    await Expense.insertMany(sampleExpenses);
    res.json({ success: true, message: `Created ${sampleExpenses.length} sample expenses across 12 months for year ${currentYear}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budgets', budgetRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Expense Tracker Backend running at http://localhost:${PORT}`);
});

export default app;
