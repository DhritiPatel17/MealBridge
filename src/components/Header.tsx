import React from 'react';
import { TabType } from '../types';
import { User, LogOut } from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  onOpenVolunteer: () => void;
  onOpenProfile: () => void;
  userRole?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfile,
  userRole = 'volunteer',
  onLogout,
}) => {
  const isNgo = userRole === 'ngo';
  const roleLabel = userRole === 'donor' ? 'Donor / दानदाता' : isNgo ? 'NGO Partner' : 'Volunteer';

  return (
    <header className="sticky top-0 z-40 bg-[#112A46] text-white border-b border-[#ACC8E5]/30 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: Clean Logo in 12px white rounded tile & Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
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
              <span className="font-bold tracking-tight text-white text-base">
                MealBridge
              </span>
              <span className="text-white/40 text-xs">/</span>
              <span className="font-bold text-[#FDFD96] text-xs tracking-wide">
                अन्नसेतु
              </span>
            </div>
            <span className="text-[10px] text-stone-300 font-normal leading-tight mt-0.5">
              Surplus Food Network - Vadodara
            </span>
          </div>
        </div>

        {/* Right: Role Badge & Profile Icon */}
        <div className="flex items-center gap-2">
          <span
            className={
              isNgo
                ? 'bg-[#FDFD96] text-black border border-[#D9D975] text-[11px] font-bold px-2.5 py-1 rounded-[12px] uppercase tracking-wider'
                : 'bg-[#FDFD96] text-[#112A46] border border-[#D9D975] text-[11px] font-bold px-2.5 py-1 rounded-[12px] uppercase tracking-wider'
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
