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
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#112A46]/95 text-white border-b border-[#ACC8E5]/30 px-4 sm:px-6 lg:px-12 py-2.5 sm:py-3 w-full shadow-lg transition-all duration-300">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Logo & Wordmark */}
        <div
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 sm:gap-3.5 cursor-pointer select-none shrink-0 group transition-transform duration-200 hover:scale-[1.02]"
        >
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-heading font-bold text-[#FDFD96] text-lg sm:text-xl tracking-tight">
                MealBridge
              </span>
              <span className="text-white/40 text-sm">/</span>
              <span className="font-hindi font-bold text-[#FDFD96] text-sm sm:text-base tracking-wide">
                अन्नसेतु
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-[#ACC8E5] font-medium leading-tight mt-1">
              Surplus Food Network • Vadodara
            </span>
          </div>
        </div>

        {/* Zone 2: Top Navigation Bar for Tablet & Laptop (Hidden on mobile < 640px) */}
        <nav className="hidden sm:flex items-center gap-1.5 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`btn-premium flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-[14px] text-xs lg:text-sm font-bold transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FDFD96] to-[#F5F27A] text-[#112A46] shadow-sm font-extrabold'
                    : 'text-stone-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#112A46]' : 'text-stone-200'} />
                <span className="whitespace-nowrap">{item.label}</span>
                <span
                  className={`text-[10px] font-semibold font-hindi hidden lg:inline ${
                    isActive ? 'text-[#112A46]' : 'text-stone-300'
                  }`}
                >
                  ({item.sublabel})
                </span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
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
                ? 'bg-gradient-to-r from-[#FDFD96] to-[#F5F27A] text-[#112A46] border border-[#D9D975] text-[10px] sm:text-[11px] font-extrabold px-3 py-1.5 rounded-[12px] uppercase tracking-wider shadow-2xs'
                : 'bg-gradient-to-r from-[#FDFD96] to-[#F5F27A] text-[#112A46] border border-[#D9D975] text-[10px] sm:text-[11px] font-extrabold px-3 py-1.5 rounded-[12px] uppercase tracking-wider shadow-2xs'
            }
          >
            {roleLabel}
          </span>
          <button
            onClick={onOpenProfile}
            title="Profile / प्रोफ़ाइल"
            aria-label="User Profile"
            className="btn-premium w-9 h-9 rounded-[12px] bg-white/10 hover:bg-white/20 border border-[#ACC8E5]/40 flex items-center justify-center text-white transition-colors cursor-pointer shadow-2xs"
          >
            <User size={18} />
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Logout / लॉगआउट"
              aria-label="Logout"
              className="btn-premium w-9 h-9 rounded-[12px] bg-white/10 hover:bg-red-500/20 border border-[#ACC8E5]/40 flex items-center justify-center text-white transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

