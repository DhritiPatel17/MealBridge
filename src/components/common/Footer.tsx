import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { LegalDocType } from '../legal/LegalModal';

interface FooterProps {
  onOpenLegal: (doc: LegalDocType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="w-full bg-[#112A46] text-white py-6 px-4 mt-8 mb-20 sm:mb-12 border-t border-[#ACC8E5]/30">
      <div className="max-w-xl mx-auto space-y-4 text-center">
        {/* Brand line */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-[12px] bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
            <img
              src="/assets/mealbridge-logo.png"
              alt="MealBridge Logo"
              className="w-full h-full object-contain shrink-0"
              style={{ imageRendering: 'auto' }}
            />
          </div>
          <span className="font-extrabold text-sm tracking-wide">MealBridge</span>
          <span className="text-[10px] text-stone-300 bg-white/10 px-2 py-0.5 rounded-full">
            FSSAI Aligned
          </span>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs font-semibold text-stone-300">
          <button
            type="button"
            onClick={() => onOpenLegal('terms')}
            className="hover:text-white underline transition-colors cursor-pointer"
          >
            Terms of Use / नियम
          </button>
          <span className="text-stone-500">•</span>
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-white underline transition-colors cursor-pointer"
          >
            Privacy Policy / गोपनीयता
          </button>
          <span className="text-stone-500">•</span>
          <button
            type="button"
            onClick={() => onOpenLegal('disclaimer')}
            className="hover:text-white underline transition-colors cursor-pointer"
          >
            Disclaimer / अस्वीकरण
          </button>
        </div>

        {/* Tagline */}
        <p className="text-[11px] text-stone-400 font-normal flex items-center justify-center gap-1">
          <span>Bridging surplus food to communities with care</span>
          <Heart size={12} className="text-rose-400 fill-rose-400 inline" />
        </p>

        {/* Copyright & Email */}
        <div className="text-[10px] text-stone-400 space-y-0.5">
          <p>© {new Date().getFullYear()} MealBridge Platform. All rights reserved.</p>
          <p>Support / सहायता: support@mealbridge.org</p>
        </div>
      </div>
    </footer>
  );
};
