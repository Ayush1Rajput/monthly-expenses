import React from 'react';
import { LayoutDashboard, AlertOctagon, Plus, CalendarRange, ReceiptText } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, onOpenAdd, wasteCount = 0 }) {
  const tabs = [
    { id: 'overview', label: 'Monthly', icon: LayoutDashboard },
    { id: 'waste', label: 'Waste', icon: AlertOctagon, badge: wasteCount },
    { id: 'add_action', isAction: true },
    { id: 'yearly', label: '1-Year', icon: CalendarRange },
    { id: 'history', label: 'History', icon: ReceiptText },
  ];

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 px-4 pointer-events-none">
      <nav className="max-w-md mx-auto glass-surface-active rounded-[28px] border border-white/[0.12] shadow-2xl shadow-black/80 px-2 py-1.5 flex items-center justify-around pointer-events-auto backdrop-blur-2xl">
        {tabs.map((tab) => {
          if (tab.isAction) {
            return (
              <div key="add" className="relative -top-5 flex items-center justify-center px-1">
                <button
                  onClick={onOpenAdd}
                  className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60 active:scale-90 transition-all transform duration-150 border-2 border-slate-950"
                  aria-label="Add Expense"
                >
                  <Plus size={26} strokeWidth={3} />
                </button>
              </div>
            );
          }

          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-1 px-1 flex flex-col items-center justify-center rounded-2xl relative transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon size={20} strokeWidth={isActive ? 2.6 : 1.8} />
                {Boolean(tab.badge) && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 px-1 py-0.2 min-w-[15px] h-3.5 text-[9px] font-black text-white bg-rose-500 rounded-full flex items-center justify-center shadow-md shadow-rose-500/40">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
