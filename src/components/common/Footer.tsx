import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { LegalDocType } from '../legal/LegalModal';

interface FooterProps {
  onOpenLegal: (doc: LegalDocType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="w-full bg-[#112A46] text-white py-8 px-4 sm:px-6 lg:px-8 mt-12 mb-16 sm:mb-0 border-t border-[#ACC8E5]/30">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Left: Logo & Brand */}
        <div className="flex flex-col md:flex-row items-center gap-3.5">
          {/* Light badge for visibility on navy footer */}
          <div className="h-[48px] sm:h-[52px] px-2 py-1 rounded-[12px] bg-white border border-[#ACC8E5]/50 shadow-xs flex items-center justify-center shrink-0">
            <img
              src="/logo.jpg.png"
              alt="MealBridge Logo"
              className="h-full w-auto object-contain shrink-0"
              style={{ imageRendering: 'auto' }}
            />
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide text-white">MealBridge</span>
              <span className="text-[10px] text-stone-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                FSSAI Aligned
              </span>
            </div>
            <p className="text-[11px] text-stone-300 mt-0.5">
              Bridging surplus food to communities with care
            </p>
          </div>
        </div>

        {/* Middle: Legal Links */}
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

        {/* Right: Copyright & Email */}
        <div className="text-[11px] text-stone-400 space-y-0.5 md:text-right">
          <p>© {new Date().getFullYear()} MealBridge Platform. All rights reserved.</p>
          <p>Support / सहायता: support@mealbridge.org</p>
        </div>
      </div>
    </footer>
  );
};
