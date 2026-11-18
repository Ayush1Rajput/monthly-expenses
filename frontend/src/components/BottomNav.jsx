import React from 'react';
import { LayoutGrid, Flame, Plus, BarChart2, ScrollText } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, onOpenAdd, wasteCount = 0, viewMode = 'monthly' }) {
  const tabs = [
    { id: 'overview', label: viewMode === 'weekly' ? 'Weekly' : 'Ledger', icon: LayoutGrid },
    { id: 'waste', label: 'Leaks', icon: Flame, badge: wasteCount },
    { id: 'add_action', isAction: true },
    { id: 'yearly', label: '1-Year', icon: BarChart2 },
    { id: 'history', label: 'Archive', icon: ScrollText },
  ];

  return (
    <div className="fixed bottom-3.5 left-0 right-0 z-40 px-4 pointer-events-none">
      <nav className="max-w-md mx-auto atelier-dock rounded-[24px] px-2 py-1.5 flex items-center justify-around pointer-events-auto">
        {tabs.map((tab) => {
          if (tab.isAction) {
            return (
              <div key="add" className="relative -top-4 flex items-center justify-center px-1.5">
                <button
                  onClick={onOpenAdd}
                  className="w-14 h-14 rounded-2xl shutter-key flex items-center justify-center"
                  aria-label="Add Expense"
                >
                  <Plus size={28} strokeWidth={3} />
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
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center rounded-2xl relative transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-[#C8FF2E]'
                  : 'text-[#8E8E98] hover:text-[#F5F4F0]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
                {Boolean(tab.badge) && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-3 px-1 min-w-[16px] h-4 font-mono text-[9px] font-extrabold text-white bg-[#FF4D3D] rounded-full flex items-center justify-center border border-[#141418]">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${
                  isActive ? 'text-[#C8FF2E] font-extrabold' : 'text-[#8E8E98] font-semibold'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-4 h-[2.5px] rounded-full bg-[#C8FF2E] mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
