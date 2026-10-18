import React, { useState } from 'react';
import { X, Check, AlertCircle, Sparkles, Calendar, Tag, CreditCard, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../utils/categories';
import CategoryIcon from './CategoryIcon';

const UNNECESSARY_REASONS = [
  'Impulse Buy',
  'Late night craving',
  'Could have avoided',
  'Online sale / FOMO',
  'Costly restaurant',
  'Unused subscription',
  'Cab instead of transit',
  'Snacking habit'
];

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000];

export default function QuickAddModal({ isOpen, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [isUnnecessary, setIsUnnecessary] = useState(false);
  const [unnecessaryReason, setUnnecessaryReason] = useState('Impulse Buy');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI / Online');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddQuickAmount = (val) => {
    const current = Number(amount) || 0;
    setAmount(String(current + val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        amount: Number(amount),
        category,
        isUnnecessary,
        unnecessaryReason: isUnnecessary ? unnecessaryReason : '',
        date: new Date(date).toISOString(),
        paymentMethod,
      });

      setAmount('');
      setTitle('');
      setIsUnnecessary(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md transition-all">
      <div className="w-full max-w-md bg-slate-900 border-t border-x border-white/[0.12] rounded-t-[36px] p-5 shadow-2xl max-h-[92vh] overflow-y-auto hide-scrollbar animate-sheet">
        {/* Drawer Grabber Bar */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-extrabold text-white">Record Daily Expense</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Big Amount Field */}
          <div className="text-center py-4 px-3 bg-white/[0.03] rounded-3xl border border-white/[0.08]">
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase block mb-1">
              Enter Amount
            </span>
            <div className="flex items-center justify-center">
              <span className="text-3xl font-black text-emerald-400 mr-1.5">₹</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-48 text-4xl font-black text-white bg-transparent border-none text-center focus:outline-none placeholder-slate-700"
              />
            </div>

            {/* Quick Increment Chips */}
            <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-white/[0.05]">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleAddQuickAmount(val)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/[0.05] text-slate-300 hover:text-white border border-white/[0.06] active:scale-90 transition-all"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-extrabold text-slate-300 block mb-1.5">Expense Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy Lunch, Fuel, Movie Ticket, Groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-white/[0.06] transition-all"
            />
          </div>

          {/* TACTILE UNNECESSARY SPEND TOGGLE */}
          <div
            className={`p-4 rounded-[26px] border transition-all duration-300 ${
              isUnnecessary
                ? 'bg-rose-950/40 border-rose-500/50 shadow-xl shadow-rose-950/30'
                : 'bg-white/[0.03] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                    isUnnecessary ? 'bg-rose-500 text-white' : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  <AlertCircle size={20} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    Avoidable / Impulse Spend?
                    {isUnnecessary && (
                      <span className="text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                        LEAK FLAGGED
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">Was this an impulse, craving, or extra expense?</p>
                </div>
              </div>

              {/* Native-feel switch */}
              <button
                type="button"
                onClick={() => setIsUnnecessary(!isUnnecessary)}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isUnnecessary ? 'bg-rose-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isUnnecessary ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Quick Reason selector */}
            {isUnnecessary && (
              <div className="mt-3.5 pt-3 border-t border-rose-500/20 animate-fade-in">
                <label className="text-[11px] font-bold text-rose-300 block mb-2">Why was this unnecessary?</label>
                <div className="flex flex-wrap gap-1.5">
                  {UNNECESSARY_REASONS.map((reason) => (
                    <button
                      type="button"
                      key={reason}
                      onClick={() => setUnnecessaryReason(reason)}
                      className={`text-[11px] px-3 py-1.5 rounded-xl border font-bold transition-all active:scale-95 ${
                        unnecessaryReason === reason
                          ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                          : 'bg-rose-950/30 text-rose-300 border-rose-500/20'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Picker Grid */}
          <div>
            <label className="text-xs font-extrabold text-slate-300 block mb-1.5">Category</label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl text-left border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-white text-slate-950 font-black border-white shadow-lg'
                        : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <CategoryIcon category={cat.name} size={15} className="p-1.5 rounded-xl" />
                    <span className="text-xs truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Mode */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                <Calendar size={12} /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                <CreditCard size={12} /> Mode
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/[0.08] rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="UPI / Online">UPI / GPay / PhonePe</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !amount || !title}
              className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-slate-950 shadow-xl transition-all active:scale-[0.97] ${
                isUnnecessary
                  ? 'bg-gradient-to-r from-rose-500 to-red-400 shadow-rose-500/25 text-white'
                  : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 shadow-emerald-500/25'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Check size={18} strokeWidth={3} />
              <span>{isSubmitting ? 'Recording...' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
