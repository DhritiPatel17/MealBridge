import React from 'react';
import { TabType } from '../types';
import {
  Home,
  HandHeart,
  Clock,
  User,
  Inbox,
  Truck,
} from 'lucide-react';

interface BottomNavProps {
  role: 'donor' | 'ngo';
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingRequestsCount?: number;
  activePickupsCount?: number;
  myDonationsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  role,
  activeTab,
  onTabChange,
  pendingRequestsCount = 0,
  activePickupsCount = 0,
  myDonationsCount = 0,
}) => {
  const isNgo = role === 'ngo';

  const donorTabs: {
    id: TabType;
    label: string;
    sublabel: string;
    icon: React.FC<{ size?: number; className?: string }>;
    badge?: number;
  }[] = [
    { id: 'home', label: 'Home', sublabel: 'होम', icon: Home },
    { id: 'donate', label: 'Donate', sublabel: 'दान करें', icon: HandHeart },
    { id: 'my-donations', label: 'My Donations', sublabel: 'मेरे दान', icon: Clock, badge: myDonationsCount },
    { id: 'profile', label: 'Profile', sublabel: 'प्रोफ़ाइल', icon: User },
  ];

  const ngoTabs: {
    id: TabType;
    label: string;
    sublabel: string;
    icon: React.FC<{ size?: number; className?: string }>;
    badge?: number;
  }[] = [
    { id: 'home', label: 'Home', sublabel: 'होम', icon: Home },
    { id: 'new-requests', label: 'New Requests', sublabel: 'नए अनुरोध', icon: Inbox, badge: pendingRequestsCount },
    { id: 'my-pickups', label: 'My Pickups', sublabel: 'मेरे पिकअप', icon: Truck, badge: activePickupsCount },
    { id: 'profile', label: 'Profile', sublabel: 'प्रोफ़ाइल', icon: User },
  ];

  const currentTabs = isNgo ? ngoTabs : donorTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#112A46] text-white border-t border-[#ACC8E5]/30 py-2 px-4 shadow-[0_-4px_16px_rgba(17,42,70,0.15)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {currentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all relative cursor-pointer"
            >
              {/* Highlight background pill for active state */}
              <div
                className={`flex items-center justify-center w-12 h-8 rounded-[12px] transition-colors relative ${
                  isActive
                    ? 'bg-[#FDFD96] text-[#112A46] font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} />
                {tab.badge !== undefined && tab.badge > 0 && !isActive && (
                  <span className="absolute -top-1 -right-1 bg-[#FDFD96] text-[#112A46] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#112A46]/20">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-bold tracking-tight mt-1 leading-tight ${
                  isActive ? 'text-white' : 'text-stone-300'
                }`}
              >
                {tab.label}
              </span>
              <span
                className={`text-[9px] font-normal leading-none mt-0.5 ${
                  isActive ? 'text-[#FDFD96]' : 'text-stone-400'
                }`}
              >
                {tab.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
