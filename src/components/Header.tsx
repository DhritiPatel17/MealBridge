import React from 'react';
import { TabType } from '../types';
import { User, ShieldCheck } from 'lucide-react';
import { MealBridgeLogo } from './MealBridgeLogo';

interface HeaderProps {
  currentTab: TabType;
  onOpenVolunteer: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenVolunteer,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#132238] text-white border-b border-white/10 px-4 py-2.5 transition-all shadow-md">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left branding: Exact imported logo displayed clearly */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-0.5 shrink-0">
            <img
              src="/assets/mealbridge-logo.png"
              alt="MealBridge अन्नसेतु Logo"
              className="h-9.5 w-auto max-h-[38px] object-contain shrink-0"
              loading="eager"
            />
          </div>

          {currentTab === 'home' && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base">
                  MEALBRIDGE
                </span>
                <span className="text-white/40 text-sm">/</span>
                <span className="font-bold text-stone-200 text-sm">
                  अन्नसेतु
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-medium leading-none mt-0.5">
                National Surplus Food Network
              </p>
            </div>
          )}

          {currentTab === 'donate' && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 inline-block animate-pulse" />
                <span className="font-extrabold tracking-tight text-white text-sm">
                  MEALBRIDGE
                </span>
                <span className="text-white/40 text-xs">/</span>
                <span className="font-bold text-stone-200 text-xs">
                  अन्नसेतु
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  EXCESS TO ACCESS
                </span>
                <span className="text-[10px] text-stone-300 font-medium">
                  Post Food &amp; Donor Hub
                </span>
              </div>
            </div>
          )}

          {currentTab === 'claim' && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 inline-block animate-pulse" />
                <span className="font-extrabold tracking-tight text-white text-sm">
                  MEALBRIDGE
                </span>
                <span className="text-white/40 text-xs">/</span>
                <span className="font-bold text-stone-200 text-xs">
                  अन्नसेतु
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="bg-sky-400/20 text-sky-300 border border-sky-400/30 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  EXCESS TO ACCESS
                </span>
                <span className="text-[10px] text-stone-300 font-medium">
                  Ngo Live Match &amp; Accept Feed
                </span>
              </div>
            </div>
          )}

          {(currentTab === 'tracking' || currentTab === 'impact') && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base">
                  MEALBRIDGE
                </span>
                <span className="text-white/40 text-sm">/</span>
                <span className="font-bold text-stone-200 text-sm">
                  अन्नसेतु
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-medium leading-none mt-0.5">
                {currentTab === 'tracking' ? 'Live Redistribution Tracking' : 'National Impact Pulse'}
              </p>
            </div>
          )}
        </div>

        {/* Right action badges */}
        <div className="flex items-center gap-2">
          {currentTab === 'home' && (
            <>
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full text-xs font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>ACTIVE GRID</span>
              </div>
              <button
                onClick={onOpenProfile}
                aria-label="Profile"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <User size={16} />
              </button>
            </>
          )}

          {(currentTab === 'donate' || currentTab === 'claim') && (
            <>
              <button
                onClick={onOpenVolunteer}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <span className="h-2 w-2 rounded-full bg-white" />
                <span>VOLUNTEER</span>
              </button>
              <button
                onClick={onOpenProfile}
                aria-label="User Profile"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <User size={16} />
              </button>
            </>
          )}

          {(currentTab === 'tracking' || currentTab === 'impact') && (
            <>
              <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live 19:42 IST</span>
              </div>
              <button
                onClick={onOpenProfile}
                className="w-8 h-8 rounded-full bg-white/15 border border-white/25 font-bold text-xs text-white flex items-center justify-center hover:bg-white/25 transition-colors cursor-pointer"
              >
                MB
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
