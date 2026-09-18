import React from 'react';
import { TabType } from '../types';
import { Home, HandHeart, HeartHandshake, Navigation, TrendingUp } from 'lucide-react';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  claimCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  claimCount = 1,
}) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'donate', label: 'Donate', icon: HandHeart },
    { id: 'claim', label: 'Claim', icon: HeartHandshake },
    { id: 'tracking', label: 'Tracking', icon: Navigation },
    { id: 'impact', label: 'Impact', icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 py-1.5 px-3 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all relative cursor-pointer group`}
            >
              {/* Highlight background pill/circle for active state */}
              <div
                className={`flex items-center justify-center w-10 h-8 rounded-full transition-all duration-200 ${
                  isActive
                    ? tab.id === 'donate'
                      ? 'bg-[#132238] text-white shadow-xs'
                      : tab.id === 'claim'
                      ? 'bg-sky-100 text-sky-900 shadow-xs'
                      : 'bg-stone-100 text-stone-900 font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon
                  size={19}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                />
                {tab.id === 'claim' && claimCount > 0 && !isActive && (
                  <span className="absolute top-1 right-3.5 w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-stone-900 font-semibold' : 'text-stone-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
