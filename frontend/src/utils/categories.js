export const CATEGORIES = [
  { name: 'Food & Dining', icon: 'Utensils', color: '#FF7A2F', bg: 'bg-[#FF7A2F]/15', text: 'text-[#FF7A2F]' },
  { name: 'Groceries', icon: 'ShoppingBag', color: '#22C55E', bg: 'bg-[#22C55E]/15', text: 'text-[#22C55E]' },
  { name: 'Shopping & Clothing', icon: 'Shirt', color: '#F45B9A', bg: 'bg-[#F45B9A]/15', text: 'text-[#F45B9A]' },
  { name: 'Entertainment & OTT', icon: 'Tv', color: '#9D7BFF', bg: 'bg-[#9D7BFF]/15', text: 'text-[#9D7BFF]' },
  { name: 'Bills & Utilities', icon: 'Zap', color: '#FFB830', bg: 'bg-[#FFB830]/15', text: 'text-[#FFB830]' },
  { name: 'Transport & Fuel', icon: 'Car', color: '#38BDF8', bg: 'bg-[#38BDF8]/15', text: 'text-[#38BDF8]' },
  { name: 'Health & Medical', icon: 'HeartPulse', color: '#FF4D3D', bg: 'bg-[#FF4D3D]/15', text: 'text-[#FF4D3D]' },
  { name: 'Personal Care', icon: 'Sparkles', color: '#2DD4BF', bg: 'bg-[#2DD4BF]/15', text: 'text-[#2DD4BF]' },
  { name: 'Education', icon: 'GraduationCap', color: '#7C7CFF', bg: 'bg-[#7C7CFF]/15', text: 'text-[#7C7CFF]' },
  { name: 'Others', icon: 'MoreHorizontal', color: '#94A3B8', bg: 'bg-slate-400/15', text: 'text-slate-400' },
];

export const getCategoryMeta = (catName) => {
  return CATEGORIES.find(c => c.name === catName) || {
    name: catName || 'Others',
    icon: 'MoreHorizontal',
    color: '#94A3B8',
    bg: 'bg-slate-400/15',
    text: 'text-slate-400'
  };
};

export const formatINR = (amt) => {
  return '₹' + Number(amt || 0).toLocaleString('en-IN');
};
