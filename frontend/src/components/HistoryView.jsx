import React, { useState } from 'react';
import { Search, Download, Trash2, Flame, Receipt } from 'lucide-react';
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

  const filteredSum = filtered.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

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
      {/* Top Archive Header & CSV Export */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#6B6A64] dark:text-[#8E8E98] block">
            MASTER LEDGER
          </span>
          <h2 className="font-display text-xl font-extrabold text-[#141418] dark:text-[#F5F4F0] leading-tight">
            Transaction Archive
          </h2>
        </div>

        <button
          onClick={exportCSV}
          disabled={expenses.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141418] text-[#C8FF2E] dark:bg-[#C8FF2E] dark:text-[#0A0A0C] border border-[#141418] font-mono text-[10px] font-extrabold uppercase tracking-wider active:scale-95 transition-all disabled:opacity-40"
        >
          <Download size={13} strokeWidth={2.5} />
          <span>CSV</span>
        </button>
      </div>

      {/* Live Filtered Summary Strip */}
      <div className="px-4 py-3 rounded-2xl atelier-vault text-[#F5F4F0] flex items-center justify-between">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#8E8E98] block">MATCHING ENTRIES</span>
          <span className="font-mono text-sm font-extrabold text-[#C8FF2E] tabular-nums">{filtered.length} RECORDS</span>
        </div>
        <div className="text-right">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#8E8E98] block">FILTERED SUBTOTAL</span>
          <span className="font-mono text-base font-extrabold text-[#F5F4F0] tabular-nums">{formatINR(filteredSum)}</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-3.5 text-[#8E8E98]" />
          <input
            type="text"
            placeholder="Search by merchant, item or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#FFFDF8] dark:bg-[#131317] border border-[#141418]/14 dark:border-white/[0.09] rounded-2xl text-xs font-medium text-[#141418] dark:text-[#F5F4F0] placeholder-[#8E8E98] focus:outline-none focus:border-[#141418] dark:focus:border-[#C8FF2E] transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-[#FFFDF8] dark:bg-[#131317] border border-[#141418]/14 dark:border-white/[0.09] rounded-xl font-mono text-[11px] text-[#141418] dark:text-[#D4D4DC] font-bold focus:outline-none focus:border-[#141418] dark:focus:border-[#C8FF2E]"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={() => setOnlyUnnecessary(!onlyUnnecessary)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-mono text-[10px] font-extrabold uppercase tracking-wider border transition-all active:scale-95 ${
              onlyUnnecessary
                ? 'bg-[#FF4D3D] text-white border-[#FF4D3D] shadow-md'
                : 'bg-[#FFFDF8] dark:bg-[#131317] text-[#6B6A64] dark:text-[#8E8E98] border-[#141418]/14 dark:border-white/[0.09] hover:text-[#141418] dark:hover:text-white'
            }`}
          >
            <Flame size={12} />
            <span>Leaks Only</span>
          </button>
        </div>
      </div>

      {/* Transactions Ledger List */}
      <div className="space-y-2 pt-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center atelier-card rounded-[24px]">
            <Receipt size={30} className="mx-auto text-[#8E8E98] mb-2" />
            <p className="font-mono text-xs font-bold uppercase text-[#6B6A64] dark:text-[#8E8E98]">
              No matching records found
            </p>
          </div>
        ) : (
          filtered.map((exp) => (
            <div
              key={exp._id}
              className={`p-3.5 atelier-row rounded-2xl flex items-center justify-between ${
                exp.isUnnecessary ? 'border-l-[3px] border-l-[#FF4D3D]' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon category={exp.category} size={16} className="p-2 rounded-xl flex-shrink-0" />
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-display text-xs font-extrabold text-[#141418] dark:text-[#F5F4F0] truncate">
                      {exp.title}
                    </h4>
                    {exp.isUnnecessary && (
                      <span className="font-mono text-[8px] font-extrabold uppercase bg-[#FF4D3D]/15 text-[#E03424] dark:text-[#FF7A6E] border border-[#FF4D3D]/35 px-1.5 py-0.5 rounded-md">
                        LEAK
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px] text-[#6B6A64] dark:text-[#8E8E98]">
                    <span>
                      {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                    </span>
                    <span className="opacity-40">/</span>
                    <span className="truncate">{exp.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
                <span className={`font-mono text-xs font-extrabold tabular-nums ${exp.isUnnecessary ? 'text-[#E03424] dark:text-[#FF7A6E]' : 'text-[#141418] dark:text-[#F5F4F0]'}`}>
                  {formatINR(exp.amount)}
                </span>
                <button
                  onClick={() => onDeleteExpense(exp._id)}
                  className="p-1.5 rounded-lg text-[#8E8E98] hover:text-[#FF4D3D] hover:bg-[#FF4D3D]/10 active:scale-90 transition-all"
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
