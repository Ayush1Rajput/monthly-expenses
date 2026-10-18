export const CATEGORIES = [
  { name: 'Food & Dining', icon: 'Utensils', color: '#F97316', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  { name: 'Groceries', icon: 'ShoppingBag', color: '#10B981', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  { name: 'Shopping & Clothing', icon: 'Shirt', color: '#EC4899', bg: 'bg-pink-500/10', text: 'text-pink-400' },
  { name: 'Entertainment & OTT', icon: 'Tv', color: '#8B5CF6', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  { name: 'Bills & Utilities', icon: 'Zap', color: '#EAB308', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  { name: 'Transport & Fuel', icon: 'Car', color: '#3B82F6', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  { name: 'Health & Medical', icon: 'HeartPulse', color: '#EF4444', bg: 'bg-red-500/10', text: 'text-red-400' },
  { name: 'Personal Care', icon: 'Sparkles', color: '#06B6D4', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  { name: 'Education', icon: 'GraduationCap', color: '#6366F1', bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  { name: 'Others', icon: 'MoreHorizontal', color: '#94A3B8', bg: 'bg-slate-500/10', text: 'text-slate-400' },
];

export const getCategoryMeta = (catName) => {
  return CATEGORIES.find(c => c.name === catName) || {
    name: catName || 'Others',
    icon: 'MoreHorizontal',
    color: '#94A3B8',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400'
  };
};

export const formatINR = (amt) => {
  return '₹' + Number(amt || 0).toLocaleString('en-IN');
};
