import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  Phone,
  Check,
  Sparkles,
  Utensils,
  MapPin,
  Moon,
  Camera,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { initialClaimItem, activeDeliverySecondary } from '../data/mockData';

interface ClaimViewProps {
  onAcceptDonation: () => void;
  onPassDonation: () => void;
  onCallDonor: (name: string, phone: string) => void;
  onUploadDeliveryProof: (rescueId: string) => void;
}

export const ClaimView: React.FC<ClaimViewProps> = ({
  onAcceptDonation,
  onPassDonation,
  onCallDonor,
  onUploadDeliveryProof,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialClaimItem.timeRemainingSeconds);
  const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const [isPassed, setIsPassed] = useState<boolean>(false);

  // Live timer decrement
  useEffect(() => {
    if (isAccepted || isPassed) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isAccepted, isPassed]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    setIsAccepted(true);
    setTimeout(() => {
      onAcceptDonation();
    }, 400);
  };

  const handlePass = () => {
    setIsPassed(true);
    onPassDonation();
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Verified Distribution Hub Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-stone-900 font-extrabold text-xs uppercase tracking-wider">
            <ShieldCheck size={16} className="text-stone-800" />
            <span>VERIFIED DISTRIBUTION HUB</span>
          </div>
          <span className="bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            24/7 ACTIVE
          </span>
        </div>

        <div>
          <h1 className="text-xl font-black text-stone-900 tracking-tight">
            Roti Bank Chapter #4
          </h1>
        </div>

        {/* Daily Capacity Progress Bar */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-stone-500 uppercase tracking-wider text-[11px]">
              DAILY CAPACITY
            </span>
            <span className="text-stone-900">
              120 / 300 Meals <span className="text-stone-500">(40%)</span>
            </span>
          </div>

          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-200/80">
            <div
              className="bg-[#132238] h-2.5 rounded-full transition-all duration-500"
              style={{ width: '40%' }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>180 open meal slots remaining</span>
            <span>Max Capacity: 300</span>
          </div>
        </div>
      </div>

      {/* URGENT MATCHING FEED */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-900">
              URGENT MATCHING FEED
            </h2>
          </div>

          <div className="bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-stone-800 text-xs font-mono font-bold shadow-2xs">
            <Clock size={13} className="text-rose-600" />
            <span>Accept within {formatTimer(secondsRemaining)}</span>
          </div>
        </div>

        {!isPassed ? (
          /* Match Card */
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {initialClaimItem.categoryLabel}
              </span>
              <span className="bg-stone-100 text-stone-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {initialClaimItem.packagingLabel}
              </span>
              <span className="bg-stone-100 text-stone-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {initialClaimItem.freshnessLabel}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h3 className="text-xl font-black text-stone-900 tracking-tight leading-snug">
                {initialClaimItem.title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                {initialClaimItem.subtitle}
              </p>
            </div>

            {/* Food Image with Verified Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-200">
              <img
                src={initialClaimItem.imageUrl}
                alt="Donation Food Trays"
                referrerPolicy="no-referrer"
                className="w-full h-44 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-2.5">
                <span className="bg-[#132238]/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  {initialClaimItem.safeUntilText}
                </span>
              </div>
            </div>

            {/* Donor Info Row */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200/80 flex items-center justify-center text-stone-700 shrink-0">
                  <Utensils size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900">
                    {initialClaimItem.donorName}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                    <span className="flex items-center gap-0.5 font-medium text-rose-600">
                      <MapPin size={11} />
                      {initialClaimItem.donorDistance}
                    </span>
                    <span>•</span>
                    <span>{initialClaimItem.donorStats}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onCallDonor(initialClaimItem.donorName, initialClaimItem.donorPhone)}
                className="flex items-center gap-1.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-stone-300 transition-colors cursor-pointer shadow-2xs"
              >
                <Phone size={13} />
                <span>Call</span>
              </button>
            </div>

            {/* Gemini Matching Rationale */}
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-sky-900 font-extrabold text-[11px] uppercase tracking-wider">
                <Sparkles size={14} className="text-sky-700" />
                <span>GEMINI MATCHING RATIONALE</span>
              </div>
              <p className="text-xs text-sky-950 font-normal leading-relaxed">
                {initialClaimItem.rationale}
              </p>
            </div>

            {/* Accept / Pass Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleAccept}
                disabled={isAccepted}
                className="w-full bg-[#132238] hover:bg-[#1c304d] text-white font-extrabold text-xs tracking-wider uppercase py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <Check size={16} strokeWidth={3} />
                <span>{isAccepted ? 'ACCEPTING & DISPATCHING...' : 'ACCEPT DONATION / स्वीकार करें'}</span>
              </button>

              <button
                type="button"
                onClick={handlePass}
                className="w-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-extrabold text-xs tracking-wider uppercase py-3 px-4 rounded-2xl transition-colors text-center cursor-pointer"
              >
                PASS TO NEXT NGO / अस्वीकार
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 text-center space-y-2">
            <p className="text-xs font-bold text-stone-600">
              Batch forwarded to next shelter on waitlist.
            </p>
            <button
              onClick={() => setIsPassed(false)}
              className="text-xs font-bold text-sky-800 hover:underline"
            >
              Undo &amp; Review again
            </button>
          </div>
        )}
      </div>

      {/* Standby Night Volunteers Callout */}
      <div className="bg-stone-200/60 border border-stone-300/70 rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#132238] text-white flex items-center justify-center shrink-0">
          <Moon size={18} className="text-amber-300" />
        </div>
        <div>
          <div className="font-extrabold text-xs text-stone-900">
            🌙 14 Active Night Volunteers (स्वयंसेवक) on Standby
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5">
            Auto-dispatches bike riders if NGO response...
          </p>
        </div>
      </div>

      {/* ONGOING OPERATIONS: Active Deliveries */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-stone-800">
            ONGOING OPERATIONS
          </h2>
          <span className="bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
            1 IN TRANSIT
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">
                Rescue #{activeDeliverySecondary.id}
              </span>
              <h3 className="font-extrabold text-base text-stone-900 mt-0.5">
                {activeDeliverySecondary.route}
              </h3>
            </div>
            <div className="text-right">
              <span className="font-black text-sm text-stone-900 block">
                {activeDeliverySecondary.title}
              </span>
              <span className="text-[11px] text-stone-500">
                {activeDeliverySecondary.foodType}
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-600 font-medium">
            Rider: {activeDeliverySecondary.rider} • ETA: {activeDeliverySecondary.eta}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
            <div
              className="bg-[#132238] h-2 rounded-full"
              style={{ width: `${activeDeliverySecondary.progressPercent}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => onUploadDeliveryProof(activeDeliverySecondary.id)}
            className="w-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <Camera size={15} />
            <span>Upload Proof &amp; Verify Delivery</span>
          </button>
        </div>
      </div>

      {/* Two bottom summary cards */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-white border border-stone-200 rounded-3xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
            BATCHES TODAY
          </span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            3 Completed
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            All verified
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
            REDISTRIBUTED
          </span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            210 Meals
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            Zero waste
          </span>
        </div>
      </div>
    </div>
  );
};
