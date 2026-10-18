import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  monthlyLimit: {
    type: Number,
    required: true,
    min: 0,
  },
  month: {
    type: Number, // 1 to 12
    required: true,
  },
  year: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true
});

budgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
export default Budget;
