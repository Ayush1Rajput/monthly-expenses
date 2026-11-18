import React, { useState } from 'react';
import { X, Check, Flame, Calendar, CreditCard } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm transition-all">
      <div className="w-full max-w-md bg-[#FFFDF8] dark:bg-[#131317] border-t-2 border-x-2 border-[#141418] dark:border-white/[0.15] rounded-t-[30px] p-5 shadow-2xl max-h-[92vh] overflow-y-auto hide-scrollbar animate-sheet">
        {/* Grabber Pill */}
        <div className="w-12 h-1.5 bg-[#141418]/20 dark:bg-white/20 rounded-full mx-auto mb-4" />

        {/* Slip Header */}
        <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#141418]/15 dark:border-white/[0.1]">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                isUnnecessary ? 'bg-[#FF4D3D]' : 'bg-[#C8FF2E]'
              }`}
            />
            <div>
              <h2 className="font-display text-base font-extrabold text-[#141418] dark:text-[#F5F4F0] leading-none">
                New Expense Slip
              </h2>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#8E8E98]">
                {isUnnecessary ? 'FLAGGED AS AVOIDABLE LEAK' : 'STANDARD LEDGER ENTRY'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#E7E1D3] dark:bg-white/[0.08] flex items-center justify-center text-[#141418] dark:text-[#D4D4DC] hover:bg-[#141418] hover:text-white active:scale-90 transition-all"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Obsidian Amount Terminal */}
          <div className="text-center py-4 px-3 rounded-2xl atelier-vault text-[#F5F4F0]">
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#8E8E98] uppercase block mb-1.5">
              ENTER AMOUNT (INR)
            </span>
            <div className="flex items-center justify-center">
              <span className={`font-mono text-3xl font-extrabold mr-1.5 ${isUnnecessary ? 'text-[#FF4D3D]' : 'text-[#C8FF2E]'}`}>
                ₹
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-48 font-display text-4xl font-extrabold text-[#F5F4F0] tabular-nums bg-transparent border-none text-center focus:outline-none placeholder-white/20"
              />
            </div>

            {/* Quick Increment Keys */}
            <div className="flex items-center justify-center gap-1.5 mt-3.5 pt-3 ticket-divider">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleAddQuickAmount(val)}
                  className="px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold bg-white/[0.07] text-[#F5F4F0] hover:bg-[#C8FF2E] hover:text-[#0A0A0C] border border-white/[0.1] active:scale-90 transition-all"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#6B6A64] dark:text-[#8E8E98] block mb-1.5">
              Description / Merchant
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy Lunch, Petrol, Movie Ticket, Groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#F3EFE6] dark:bg-[#19191F] border border-[#141418]/15 dark:border-white/[0.1] rounded-xl text-[#141418] dark:text-[#F5F4F0] text-xs font-semibold placeholder-[#8E8E98] focus:outline-none focus:border-[#141418] dark:focus:border-[#C8FF2E] transition-all"
            />
          </div>

          {/* Tactile Leak Detector Toggle Card */}
          <div
            className={`p-4 rounded-2xl border transition-all duration-200 ${
              isUnnecessary
                ? 'bg-[#FF4D3D]/10 border-[#FF4D3D] hazard-stripe'
                : 'bg-[#F3EFE6] dark:bg-[#19191F] border-[#141418]/12 dark:border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isUnnecessary
                      ? 'bg-[#FF4D3D] text-white'
                      : 'bg-[#E7E1D3] dark:bg-white/[0.07] text-[#6B6A64] dark:text-[#8E8E98]'
                  }`}
                >
                  <Flame size={19} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-display text-xs font-extrabold text-[#141418] dark:text-[#F5F4F0] flex items-center gap-1.5">
                    Avoidable / Impulse Leak?
                    {isUnnecessary && (
                      <span className="font-mono text-[8px] bg-[#FF4D3D] text-white px-1.5 py-0.5 rounded-md font-extrabold">
                        FLAGGED
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-[#6B6A64] dark:text-[#8E8E98] font-medium">
                    Craving, impulse, or skip-worthy spend?
                  </p>
                </div>
              </div>

              {/* Hardware Toggle Switch */}
              <button
                type="button"
                onClick={() => setIsUnnecessary(!isUnnecessary)}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-[#141418] transition-colors duration-200 focus:outline-none ${
                  isUnnecessary ? 'bg-[#FF4D3D]' : 'bg-[#D6CEBC] dark:bg-[#2A2A35]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 mt-[2px] transform rounded-full bg-[#FFFDF8] shadow-md transition duration-200 ${
                    isUnnecessary ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {isUnnecessary && (
              <div className="mt-3.5 pt-3 border-t border-dashed border-[#FF4D3D]/35 animate-fade-in">
                <label className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#E03424] dark:text-[#FF7A6E] block mb-2">
                  Select Leak Trigger
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {UNNECESSARY_REASONS.map((reason) => (
                    <button
                      type="button"
                      key={reason}
                      onClick={() => setUnnecessaryReason(reason)}
                      className={`font-mono text-[10px] px-2.5 py-1.5 rounded-lg border font-bold transition-all active:scale-95 ${
                        unnecessaryReason === reason
                          ? 'bg-[#FF4D3D] text-white border-[#141418]'
                          : 'bg-[#FFFDF8] dark:bg-[#131317] text-[#E03424] dark:text-[#FF7A6E] border-[#FF4D3D]/35'
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
            <label className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#6B6A64] dark:text-[#8E8E98] block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-0.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-left border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#141418] text-[#C8FF2E] dark:bg-[#C8FF2E] dark:text-[#0A0A0C] font-extrabold border-[#141418]'
                        : 'bg-[#F3EFE6] dark:bg-[#19191F] border-[#141418]/10 dark:border-white/[0.07] text-[#141418] dark:text-[#D4D4DC]'
                    }`}
                  >
                    <CategoryIcon category={cat.name} size={14} className="p-1.5 rounded-lg flex-shrink-0" />
                    <span className="text-[11px] font-bold truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Mode */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#6B6A64] dark:text-[#8E8E98] flex items-center gap-1 mb-1">
                <Calendar size={11} /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F3EFE6] dark:bg-[#19191F] border border-[#141418]/14 dark:border-white/[0.09] rounded-xl font-mono text-xs font-bold text-[#141418] dark:text-[#F5F4F0] focus:outline-none focus:border-[#141418] dark:focus:border-[#C8FF2E]"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#6B6A64] dark:text-[#8E8E98] flex items-center gap-1 mb-1">
                <CreditCard size={11} /> Mode
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F3EFE6] dark:bg-[#19191F] border border-[#141418]/14 dark:border-white/[0.09] rounded-xl font-mono text-xs font-bold text-[#141418] dark:text-[#F5F4F0] focus:outline-none focus:border-[#141418] dark:focus:border-[#C8FF2E]"
              >
                <option value="UPI / Online">UPI / GPay / PhonePe</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          {/* Tactile Submit Shutter Key */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !amount || !title}
              className={`w-full py-4 rounded-2xl font-mono font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isUnnecessary
                  ? 'bg-[#FF4D3D] text-white border-2 border-[#141418] shadow-[0_4px_0_#991B1B] active:translate-y-[3px]'
                  : 'shutter-key'
              }`}
            >
              <Check size={17} strokeWidth={3} />
              <span>{isSubmitting ? 'STAMPING...' : isUnnecessary ? 'LOG AS LEAK' : 'STAMP TO LEDGER'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
