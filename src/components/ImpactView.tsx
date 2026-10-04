import React, { useState } from 'react';
import { ImpactStats } from '../types';
import {
  TrendingUp,
  Award,
  Download,
  ShieldCheck,
  Building,
  HeartHandshake,
  CheckCircle2,
  FileText,
  Sparkles,
  TreePine,
  Droplet,
  IndianRupee,
} from 'lucide-react';
import { CountUp } from './common/CountUp';

interface ImpactViewProps {
  stats: ImpactStats;
  onDownload80G: () => void;
}

export const ImpactView: React.FC<ImpactViewProps> = ({ stats, onDownload80G }) => {
  const [activeRange, setActiveRange] = useState<'month' | 'year' | 'all'>('all');

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="space-y-1.5 pt-1 animate-fade-up">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#E6F0FA] to-[#ACC8E5] text-[#112A46] text-xs font-extrabold px-3 py-1 rounded-[8px] uppercase tracking-wider inline-block border border-[#ACC8E5]/50 shadow-2xs">
            COMMUNITY IMPACT LEDGER
          </span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
          <span className="text-gradient-navy">Surplus Food Rescue Matrix</span>
        </h1>
        <p className="text-sm text-[#0B1C30]/80 font-normal leading-relaxed">
          Transparent, verifiable surplus food redistribution footprint across verified relief chapters in Vadodara.
        </p>
      </div>

      {/* Main Impact Hero Card */}
      <div className="bg-gradient-navy text-white rounded-[20px] p-6 sm:p-7 shadow-lg border border-[#ACC8E5]/40 space-y-5 animate-fade-up delay-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#ACC8E5] uppercase tracking-wider">
            CUMULATIVE RESCUE
          </span>
          <span className="bg-gradient-to-r from-[#FDFD96] to-[#F5F27A] text-[#112A46] font-black text-[11px] px-2.5 py-0.5 rounded-[8px] shadow-2xs">
            +342 Today
          </span>
        </div>

        <div>
          <div className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-white">
            <CountUp end={stats.mealsSaved} duration={1400} />
          </div>
          <div className="text-sm text-[#ACC8E5] font-medium mt-1">
            Wholesome meals served to vulnerable citizens across Vadodara
          </div>
        </div>

        {/* Environmental & Economic Equivalencies */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/15">
          <div className="bg-white/10 rounded-[14px] p-3 text-center border border-white/10 backdrop-blur-xs">
            <TreePine size={18} className="text-[#FDFD96] mx-auto mb-1.5" />
            <div className="font-heading font-extrabold text-sm sm:text-base text-white">19.4 T</div>
            <div className="text-[11px] text-[#ACC8E5] font-medium">CO2 Abated</div>
          </div>

          <div className="bg-white/10 rounded-[14px] p-3 text-center border border-white/10 backdrop-blur-xs">
            <Droplet size={18} className="text-[#ACC8E5] mx-auto mb-1.5" />
            <div className="font-heading font-extrabold text-sm sm:text-base text-white">4.2 M L</div>
            <div className="text-[11px] text-[#ACC8E5] font-medium">Water Saved</div>
          </div>

          <div className="bg-white/10 rounded-[14px] p-3 text-center border border-white/10 backdrop-blur-xs">
            <IndianRupee size={18} className="text-[#FDFD96] mx-auto mb-1.5" />
            <div className="font-heading font-extrabold text-sm sm:text-base text-white">₹38.6 L</div>
            <div className="text-[11px] text-[#ACC8E5] font-medium">Value Saved</div>
          </div>
        </div>
      </div>

      {/* Top Donor Chapters & Leaderboard */}
      <div className="premium-card p-6 space-y-4 animate-fade-up delay-200">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-extrabold uppercase tracking-wider text-[#112A46]">
            VADODARA CORRIDOR DISPATCHES
          </h2>
          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-[6px] bg-[#E6F0FA] text-[#112A46]">
            Live Grid
          </span>
        </div>

        <div className="space-y-3">
          {[
            { city: 'Alkapuri & Old Padra Corridor', count: '18,420 meals', pct: 85 },
            { city: 'Fatehgunj & Sayajigunj Belt', count: '14,100 meals', pct: 72 },
            { city: 'Manjalpur & Makarpura Zone', count: '9,250 meals', pct: 60 },
            { city: 'Gorwa & Subhanpura Hub', count: '6,552 meals', pct: 45 },
          ].map((corridor, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-[#112A46]">{corridor.city}</span>
                <span className="font-extrabold text-[#112A46]">{corridor.count}</span>
              </div>
              <div className="w-full bg-[#E6F0FA] rounded-full h-2.5 overflow-hidden border border-[#ACC8E5]/40">
                <div
                  className="bg-gradient-to-r from-[#112A46] to-[#1E4A7A] h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${corridor.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 80G Tax Exemption & Digital Audit Receipt */}
      <div className="bg-white rounded-[20px] border border-[#ACC8E5]/60 p-6 shadow-[0_4px_20px_rgba(17,42,70,0.06)] space-y-3.5 animate-fade-up delay-300">
        <div className="flex items-center gap-2.5">
          <FileText size={20} className="text-[#112A46]" />
          <h2 className="font-heading text-base font-extrabold text-[#112A46]">
            FSSAI &amp; 80G Tax Certification
          </h2>
        </div>

        <p className="text-sm text-[#0B1C30]/85 leading-relaxed font-normal">
          All surplus food donations routed through MealBridge follow safe food recovery guidelines and carry an eligible Income Tax 80G CSR receipt.
        </p>

        <button
          onClick={onDownload80G}
          className="btn-premium w-full bg-gradient-to-r from-[#112A46] to-[#1E4A7A] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm border border-[#112A46]"
        >
          <Download size={16} />
          <span>Download 80G Compliance Certificate</span>
        </button>
      </div>
    </div>
  );
};
