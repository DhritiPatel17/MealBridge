import React from 'react';
import { TabType } from '../types';
import { UserRole } from './auth/AuthPortal';
import {
  Home,
  HandHeart,
  Clock,
  User,
  Inbox,
  Truck,
} from 'lucide-react';

interface BottomNavProps {
  role: UserRole;
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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-[#112A46]/95 text-white border-t border-[#ACC8E5]/30 py-2 px-3 shadow-[0_-4px_20px_rgba(17,42,70,0.2)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {currentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 px-1 transition-transform active:scale-95 cursor-pointer select-none"
            >
              {/* Highlight background pill for active state */}
              <div
                className={`flex items-center justify-center w-12 h-8 rounded-[12px] transition-all duration-200 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FDFD96] to-[#F5F27A] text-[#112A46] font-black shadow-sm scale-105'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#112A46]' : 'text-stone-300'} />
                {tab.badge !== undefined && tab.badge > 0 && !isActive && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#FDFD96] to-[#F5F27A] text-[#112A46] text-[10px] font-black px-1.5 py-0.2 rounded-full border border-[#112A46]/20 shadow-2xs">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-heading font-extrabold tracking-tight mt-1 leading-tight ${
                  isActive ? 'text-white' : 'text-stone-300'
                }`}
              >
                {tab.label}
              </span>
              <span
                className={`text-[10px] font-hindi font-bold leading-none mt-0.5 ${
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
