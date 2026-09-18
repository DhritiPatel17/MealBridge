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

interface ImpactViewProps {
  stats: ImpactStats;
  onDownload80G: () => void;
}

export const ImpactView: React.FC<ImpactViewProps> = ({ stats, onDownload80G }) => {
  const [activeRange, setActiveRange] = useState<'month' | 'year' | 'all'>('all');

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            NATIONAL IMPACT LEDGER
          </span>
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Surplus Rescue Matrix
        </h1>
        <p className="text-xs text-stone-600">
          Transparent, verifiable food redistribution footprint across verified relief chapters.
        </p>
      </div>

      {/* Main Impact Hero Card */}
      <div className="bg-[#132238] text-white rounded-3xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
            CUMULATIVE RESCUE
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
            +342 Today
          </span>
        </div>

        <div>
          <div className="text-4xl font-black tracking-tight text-white">
            {stats.mealsSaved.toLocaleString()}
          </div>
          <div className="text-xs text-stone-300 mt-0.5">
            Wholesome meals served to vulnerable citizens
          </div>
        </div>

        {/* Environmental & Economic Equivalencies */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-2.5 text-center">
            <TreePine size={16} className="text-emerald-400 mx-auto mb-1" />
            <div className="font-extrabold text-sm text-white">19.4 T</div>
            <div className="text-[10px] text-stone-400">CO2 Abated</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-2.5 text-center">
            <Droplet size={16} className="text-sky-400 mx-auto mb-1" />
            <div className="font-extrabold text-sm text-white">4.2 M L</div>
            <div className="text-[10px] text-stone-400">Water Saved</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-2.5 text-center">
            <IndianRupee size={16} className="text-amber-400 mx-auto mb-1" />
            <div className="font-extrabold text-sm text-white">₹38.6 L</div>
            <div className="text-[10px] text-stone-400">Value Saved</div>
          </div>
        </div>
      </div>

      {/* Top Donor Chapters & Leaderboard */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-900">
            METRO CORRIDOR DISPATCHES
          </h2>
          <span className="text-[11px] font-bold text-stone-500">Live Grid</span>
        </div>

        <div className="space-y-2.5">
          {[
            { city: 'Mumbai Ward 12 & Suburbs', count: '18,420 meals', pct: 85, color: 'bg-emerald-600' },
            { city: 'Delhi NCR South Corridor', count: '14,100 meals', pct: 72, color: 'bg-sky-600' },
            { city: 'Bengaluru Tech Park Belt', count: '9,250 meals', pct: 60, color: 'bg-amber-600' },
            { city: 'Hyderabad Cyberabad Hub', count: '6,552 meals', pct: 45, color: 'bg-purple-600' },
          ].map((corridor, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">{corridor.city}</span>
                <span className="font-extrabold text-stone-900">{corridor.count}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div className={`${corridor.color} h-2 rounded-full`} style={{ width: `${corridor.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 80G Tax Exemption & Digital Audit Receipt */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-stone-800" />
          <h2 className="text-sm font-black text-stone-900">
            FSSAI &amp; 80G Tax Certification
          </h2>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed font-normal">
          All surplus donations routed through MealBridge carry an FSSAI-compliant digital temperature audit and an eligible Income Tax 80G CSR receipt.
        </p>

        <button
          onClick={onDownload80G}
          className="w-full bg-white hover:bg-stone-100 border border-stone-300 text-stone-900 font-extrabold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <Download size={15} />
          <span>Download 80G Compliance Certificate</span>
        </button>
      </div>

      {/* Network Partners */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
            VERIFIED RESCUE ALLIANCES
          </h3>
          <ShieldCheck size={16} className="text-emerald-600" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="font-bold text-stone-900">Feeding India</div>
            <div className="text-[11px] text-stone-500 mt-0.5">34 Active Vehicles</div>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="font-bold text-stone-900">Robin Hood Army</div>
            <div className="text-[11px] text-stone-500 mt-0.5">180+ Green Sevaks</div>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="font-bold text-stone-900">Roti Bank Network</div>
            <div className="text-[11px] text-stone-500 mt-0.5">42 Distribution Centers</div>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="font-bold text-stone-900">Local Nagar Nigams</div>
            <div className="text-[11px] text-stone-500 mt-0.5">Municipal Sanitization</div>
          </div>
        </div>
      </div>
    </div>
  );
};
