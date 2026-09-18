import React from 'react';
import { TabType, ImpactStats } from '../types';
import { MealBridgeLogo } from './MealBridgeLogo';
import {
  HeartHandshake,
  Building2,
  Bike,
  ChevronRight,
  ShieldCheck,
  PhoneCall,
  Flame,
  Award,
  Users,
} from 'lucide-react';

interface HomeViewProps {
  stats: ImpactStats;
  onSelectTab: (tab: TabType) => void;
  onOpenVolunteer: () => void;
  onOpenRescueHotline: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  onSelectTab,
  onOpenVolunteer,
  onOpenRescueHotline,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Initiative Badge & Title */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="bg-sky-100 text-sky-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            SURPLUS RESCUE INITIATIVE
          </span>
          <img
            src="/assets/mealbridge-logo.png"
            alt="MealBridge अन्नसेतु Logo"
            className="h-14 w-auto object-contain shrink-0"
            loading="eager"
          />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#132238]">
          MEALBRIDGE
        </h1>
        <p className="text-lg font-bold text-stone-700">
          अन्नसेतु महा-अभियान
        </p>
      </div>

      {/* Dark Mandate Hero Card */}
      <div className="bg-[#132238] rounded-3xl p-5 text-white shadow-md relative overflow-hidden space-y-4">
        {/* Mandate Pill */}
        <div className="flex items-center gap-2">
          <span className="bg-[#FFE68C] text-[#132238] text-[11px] font-extrabold px-2.5 py-0.5 rounded-sm uppercase tracking-wide">
            MANDATE
          </span>
          <span className="text-[12px] font-bold tracking-wider text-stone-200 uppercase">
            FROM EXCESS TO ACCESS
          </span>
        </div>

        {/* Hindi Slogan */}
        <p className="text-lg md:text-xl font-bold leading-snug text-white">
          "जहाँ अन्न बचता है, वहाँ ज़रूरत तक पहुँचता है।"
        </p>

        {/* Subtext */}
        <p className="text-xs text-stone-300 leading-relaxed font-normal">
          Real-time surplus logistics bridging banquet halls, caterers, and canteens with verified shelters and local dispatchers.
        </p>

        {/* Hero Image Container */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 mt-3 shadow-inner group">
          <img
            src="/assets/community-meal.jpg"
            alt="Surplus Food Relief and Community Feeding"
            referrerPolicy="no-referrer"
            className="w-full h-48 object-cover object-center group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex justify-center">
            <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              ZERO FOOD WASTE • शत-प्रतिशत सदुपयोग
            </span>
          </div>
        </div>
      </div>

      {/* SELECT PORTAL / द्वार चुनें */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-800">
            SELECT PORTAL / द्वार चुनें
          </h2>
          <span className="text-[11px] font-bold text-stone-500 tracking-wider uppercase">
            3 PORTALS
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Portal 1: Donate */}
          <button
            onClick={() => onSelectTab('donate')}
            className="w-full bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-stone-300 hover:bg-stone-50 transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#FFE68C] flex items-center justify-center text-[#132238] shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Flame size={24} className="fill-[#132238]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-stone-900">
                    Donate / दान करें
                  </span>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    DONOR
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Post surplus food from kitchens, weddings & canteens
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Portal 2: Claim */}
          <button
            onClick={() => onSelectTab('claim')}
            className="w-full bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-stone-300 hover:bg-stone-50 transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-800 shrink-0 group-hover:scale-105 transition-transform">
                <Building2 size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-stone-900">
                    NGO / Claim Meals
                  </span>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Shelters & orphanages claim available meal batches
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Portal 3: Volunteer */}
          <button
            onClick={onOpenVolunteer}
            className="w-full bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-stone-300 hover:bg-stone-50 transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 shrink-0 group-hover:scale-105 transition-transform">
                <Bike size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-stone-900">
                    Volunteer Portal
                  </span>
                  <span className="bg-stone-100 text-stone-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    SEVAK
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Accept pickup runs & manage last-mile transport
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* LIVE PULSE / ताजा स्थिति */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-800">
              LIVE PULSE / ताजा स्थिति
            </h2>
          </div>
          <span className="text-[11px] font-bold text-sky-700 tracking-wider uppercase bg-sky-50 px-2 py-0.5 rounded">
            REAL-TIME
          </span>
        </div>

        {/* 4 stadium oval stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-stone-200 rounded-3xl p-4 text-center shadow-xs flex flex-col justify-center min-h-[105px]">
            <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">
              MEALS SAVED
            </span>
            <div className="text-2xl font-black text-stone-900 mt-0.5">
              {stats.mealsSaved.toLocaleString()}+
            </div>
            <span className="text-xs text-stone-500 font-medium">
              अन्न बचाया
            </span>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-4 text-center shadow-xs flex flex-col justify-center min-h-[105px]">
            <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">
              ACTIVE NGOS
            </span>
            <div className="text-2xl font-black text-stone-900 mt-0.5">
              {stats.activeNgos}
            </div>
            <span className="text-xs text-stone-500 font-medium">
              सक्रिय संस्थाएं
            </span>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-4 text-center shadow-xs flex flex-col justify-center min-h-[105px]">
            <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">
              AVG MATCH
            </span>
            <div className="text-2xl font-black text-stone-900 mt-0.5">
              {stats.avgMatchMinutes} min
            </div>
            <span className="text-xs text-stone-500 font-medium">
              औसत मिलान
            </span>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-4 text-center shadow-xs flex flex-col justify-center min-h-[105px]">
            <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">
              SAFE DELIVERY
            </span>
            <div className="text-2xl font-black text-stone-900 mt-0.5">
              {stats.safeDeliveryPercent}%
            </div>
            <span className="text-xs text-stone-500 font-medium">
              गुणवत्ता दर
            </span>
          </div>
        </div>

        {/* Motivating Quote */}
        <p className="text-center text-xs text-stone-600 italic pt-1">
          "हर थाली जो बची, किसी की मुस्कान बनी • Har Thali Jo Bachi, Kisi Ki Muskaan Bani"
        </p>
      </div>

      {/* HOW IT WORKS / कैसे काम करता है */}
      <div className="space-y-3 pt-2">
        <div className="space-y-1">
          <span className="bg-stone-200/70 text-stone-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
            3 SIMPLE STEPS
          </span>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-800">
            HOW IT WORKS / कैसे काम करता है
          </h2>
        </div>

        <div className="space-y-3">
          {/* Step 01 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-[#132238] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              01
            </div>
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-900">
                POST SURPLUS FOOD
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Kitchen manager logs surplus meal count in under 30 seconds with automated freshness windows.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-[#132238] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              02
            </div>
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-900">
                AI SMART RADIUS MATCH
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Algorithm notifies the nearest verified NGO shelters and verifies real-time headcount demand.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-[#132238] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              03
            </div>
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-900">
                HANDOVER & PHOTO PROOF
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Volunteer completes pickup and delivery with tamper inspection and geotagged digital proof.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TRUSTED ALLIANCES / प्रमुख सहयोगी */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
            TRUSTED ALLIANCES / प्रमुख सहयोगी
          </span>
          <ShieldCheck size={14} className="text-stone-500" />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-xs">
            <HeartHandshake size={14} className="text-rose-600" />
            Feeding India
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-xs">
            <ShieldCheck size={14} className="text-emerald-600" />
            Robin Hood Army
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-xs">
            <Award size={14} className="text-amber-600" />
            Roti Bank Network
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-xs">
            <Users size={14} className="text-sky-600" />
            Local Nagar Nigams
          </span>
        </div>
      </div>

      {/* NIGHT RESCUE STANDBY */}
      <div className="bg-stone-200/60 rounded-3xl p-4.5 space-y-3 border border-stone-300/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-stone-800 text-white flex items-center justify-center">
              <PhoneCall size={13} />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
              NIGHT RESCUE STANDBY
            </span>
          </div>
          <span className="text-[11px] font-bold text-stone-600">
            22:00 - 04:00 IST
          </span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          Large bulk donation (&gt;100 meals) from wedding halls? Hotline dispatch handles high-capacity logistics directly.
        </p>

        <button
          onClick={onOpenRescueHotline}
          className="w-full bg-white text-stone-900 font-bold text-xs py-2.5 px-4 rounded-full border border-stone-300 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <PhoneCall size={14} className="text-emerald-600" />
          <span>TOLL-FREE RESCUE: 1800-ANN-SETU</span>
        </button>
      </div>

      {/* Footer Branding with exact uploaded logo image */}
      <div className="text-center pt-6 pb-6 space-y-3 border-t border-stone-200">
        <div className="flex justify-center">
          <img
            src="/assets/mealbridge-logo.png"
            alt="MealBridge अन्नसेतु Logo"
            className="h-12 w-auto object-contain mx-auto"
            loading="lazy"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-extrabold text-stone-800 tracking-wide">
            MEALBRIDGE / अन्नसेतु • अन्न ही जीवन है
          </p>
          <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
            FSSAI Surplus Food Guidelines Compliant • Geotagged Chain of Custody
          </p>
        </div>
      </div>
    </div>
  );
};
