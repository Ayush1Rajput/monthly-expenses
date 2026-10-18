import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import expenseRoutes from '../backend/routes/expenseRoutes.js';
import analyticsRoutes from '../backend/routes/analyticsRoutes.js';
import budgetRoutes from '../backend/routes/budgetRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let isDbConnected = false;
let dbError = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isDbConnected = true;
    dbError = null;
    return;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    dbError = 'MONGODB_URI environment variable not set on Vercel';
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    isDbConnected = true;
    dbError = null;
  } catch (err) {
    dbError = err.message;
  }
};

app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  next();
});

app.get('/api/health', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  res.json({
    status: 'online',
    dbConnected: mongoose.connection.readyState === 1,
    dbReadyState: mongoose.connection.readyState,
    dbError: dbError,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budgets', budgetRoutes);

export default app;
