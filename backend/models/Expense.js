import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an expense title'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative'],
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Food & Dining',
      'Groceries',
      'Shopping & Clothing',
      'Entertainment & OTT',
      'Bills & Utilities',
      'Transport & Fuel',
      'Health & Medical',
      'Education',
      'Personal Care',
      'Others'
    ],
    default: 'Others',
  },
  isUnnecessary: {
    type: Boolean,
    default: false,
    index: true,
  },
  unnecessaryReason: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  paymentMethod: {
    type: String,
    enum: ['UPI / Online', 'Cash', 'Credit Card', 'Debit Card', 'Net Banking'],
    default: 'UPI / Online',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  }
}, {
  timestamps: true
});

const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
export default Expense;
