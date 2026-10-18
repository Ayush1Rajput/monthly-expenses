import React, { useState } from 'react';
import { Search, Download, Trash2, AlertCircle, Filter, Calendar, Receipt } from 'lucide-react';
import { formatINR, CATEGORIES } from '../utils/categories';
import CategoryIcon from './CategoryIcon';

export default function HistoryView({ expenses, onDeleteExpense }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [onlyUnnecessary, setOnlyUnnecessary] = useState(false);

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || e.category === category;
    const matchesUnnecessary = !onlyUnnecessary || e.isUnnecessary;
    return matchesSearch && matchesCat && matchesUnnecessary;
  });

  const exportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Date', 'Title', 'Category', 'Amount (INR)', 'Is Unnecessary', 'Reason', 'Payment Method'];
    const rows = expenses.map(e => [
      new Date(e.date).toISOString().split('T')[0],
      `"${e.title.replace(/"/g, '""')}"`,
      e.category,
      e.amount,
      e.isUnnecessary ? 'YES' : 'NO',
      `"${(e.unnecessaryReason || '').replace(/"/g, '""')}"`,
      e.paymentMethod || 'UPI'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PennyWise_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-extrabold text-white">Transaction Ledger</h2>
          <p className="text-xs text-slate-400 font-medium">Search, filter, and export all history</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={expenses.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-black text-emerald-400 active:scale-95 transition-all disabled:opacity-40"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, merchant or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-2xl text-xs text-slate-300 font-semibold focus:outline-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={() => setOnlyUnnecessary(!onlyUnnecessary)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-all active:scale-95 ${
              onlyUnnecessary
                ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
            }`}
          >
            <AlertCircle size={13} />
            <span>Extra Spend Only</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2 pt-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center glass-card-interactive rounded-[28px] border border-white/[0.06]">
            <Receipt size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-400">No matching transactions found.</p>
          </div>
        ) : (
          filtered.map((exp) => (
            <div
              key={exp._id}
              className="p-3.5 glass-card-interactive rounded-[22px] border border-white/[0.06] flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon category={exp.category} size={16} className="p-2 rounded-xl" />
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-white truncate">{exp.title}</h4>
                    {exp.isUnnecessary && (
                      <span className="text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-full">
                        Waste
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-medium">
                    <span>{new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className="truncate">{exp.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-black ${exp.isUnnecessary ? 'text-rose-400' : 'text-white'}`}>
                  {formatINR(exp.amount)}
                </span>
                <button
                  onClick={() => onDeleteExpense(exp._id)}
                  className="p-1.5 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
