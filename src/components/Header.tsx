import React from 'react';
import { TabType } from '../types';
import {
  User,
  LogOut,
  Home,
  HandHeart,
  Clock,
  Inbox,
  Truck,
} from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenVolunteer: () => void;
  onOpenProfile: () => void;
  userRole?: string;
  onLogout?: () => void;
  pendingRequestsCount?: number;
  activePickupsCount?: number;
  myDonationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenProfile,
  userRole = 'volunteer',
  onLogout,
  pendingRequestsCount = 0,
  activePickupsCount = 0,
  myDonationsCount = 0,
}) => {
  const isNgo = userRole === 'ngo';
  const isDonor = userRole === 'donor';
  const roleLabel = isDonor ? 'Donor / दानदाता' : isNgo ? 'NGO Partner' : 'Volunteer';

  const donorNavItems: {
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

  const ngoNavItems: {
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

  const navItems = isNgo ? ngoNavItems : donorNavItems;

  return (
    <header className="sticky top-0 z-40 bg-[#112A46] text-white border-b border-[#ACC8E5]/30 px-4 sm:px-6 lg:px-8 py-3 w-full shadow-md">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Logo & Wordmark */}
        <div
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
            <img
              src="/assets/mealbridge-logo.png"
              alt="MealBridge Logo"
              className="w-full h-full object-contain shrink-0"
              style={{ imageRendering: 'auto' }}
              loading="eager"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold tracking-tight text-white text-base sm:text-lg">
                MealBridge
              </span>
              <span className="text-white/40 text-xs">/</span>
              <span className="font-bold text-[#FDFD96] text-xs sm:text-sm tracking-wide">
                अन्नसेतु
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-stone-300 font-normal leading-tight mt-0.5">
              Surplus Food Network - Vadodara
            </span>
          </div>
        </div>

        {/* Zone 2: Top Navigation Bar for Tablet & Laptop (Hidden on mobile < 640px) */}
        <nav className="hidden sm:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-[12px] text-xs lg:text-sm font-bold transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#FDFD96] text-[#112A46] shadow-xs'
                    : 'text-stone-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                <span className="whitespace-nowrap">{item.label}</span>
                <span
                  className={`text-[10px] font-normal hidden lg:inline ${
                    isActive ? 'text-[#112A46]/80' : 'text-stone-300'
                  }`}
                >
                  ({item.sublabel})
                </span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-[#112A46] text-[#FDFD96]'
                        : 'bg-[#FDFD96] text-[#112A46]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Role Badge & Profile / Logout Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={
              isNgo
                ? 'bg-[#FDFD96] text-black border border-[#D9D975] text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-[12px] uppercase tracking-wider'
                : 'bg-[#FDFD96] text-[#112A46] border border-[#D9D975] text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-[12px] uppercase tracking-wider'
            }
          >
            {roleLabel}
          </span>
          <button
            onClick={onOpenProfile}
            title="Profile / प्रोफ़ाइल"
            aria-label="User Profile"
            className="w-9 h-9 rounded-[12px] bg-white/10 hover:bg-white/20 border border-[#ACC8E5]/40 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <User size={18} />
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Logout / लॉगआउट"
              aria-label="Logout"
              className="w-9 h-9 rounded-[12px] bg-white/10 hover:bg-red-500/20 border border-[#ACC8E5]/40 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

