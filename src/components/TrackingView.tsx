import React, { useState } from 'react';
import {
  Store,
  Check,
  Truck,
  Phone,
  Camera,
  ClipboardCheck,
  ShieldCheck,
  Star,
  ArrowRight,
  Crosshair,
  MapPin,
} from 'lucide-react';
import { DonationOrder } from '../types';

interface TrackingViewProps {
  order: DonationOrder;
  onCallRider: (name: string, phone: string) => void;
  onUploadHandoverPhoto: () => void;
  onConfirmPortions: () => void;
  onSubmitRating: (stars: number, feedback: string) => void;
  onAdvanceTimelineStep: (step: number) => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  order,
  onCallRider,
  onUploadHandoverPhoto,
  onConfirmPortions,
  onSubmitRating,
  onAdvanceTimelineStep,
}) => {
  const [stars, setStars] = useState<number>(order.rating?.stars || 5);
  const [feedback, setFeedback] = useState<string>(
    order.rating?.feedback || 'Prompt arrival and hot food sealed well in stainless tubs.'
  );
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(order.rating?.submitted || false);
  const [mapCentered, setMapCentered] = useState<boolean>(true);

  // Count done checklist items
  const doneChecklistCount =
    (order.handoverChecklist.temperatureChecked ? 1 : 0) +
    (order.handoverChecklist.photoUploaded ? 1 : 0) +
    (order.handoverChecklist.portionsConfirmed ? 1 : 0);

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRatingSubmitted(true);
    onSubmitRating(stars, feedback);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* ORDER CARD */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider text-stone-500 uppercase">
              ORDER
            </span>
            <span className="font-extrabold text-xs text-stone-800">
              #{order.id}
            </span>
          </div>

          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            बचा हुआ खाना ट्रैकिंग
          </span>
        </div>

        <h1 className="text-xl font-black text-stone-900 tracking-tight">
          {order.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-stone-600">
          <Store size={15} className="text-stone-500 shrink-0" />
          <span className="font-medium truncate">{order.donorAddress}</span>
          <span className="text-stone-300">•</span>
          <span className="shrink-0">Picked up {order.pickupTime}</span>
        </div>
      </div>

      {/* REDISTRIBUTION TIMELINE */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-900">
            REDISTRIBUTION TIMELINE
          </h2>
          <span className="text-xs font-extrabold text-stone-700">
            Step {order.currentStep} of {order.totalSteps} ({order.stepPercentage}%)
          </span>
        </div>

        {/* 5-step visual timeline */}
        <div className="relative pt-1 pb-1">
          {/* Connector line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-stone-200 -z-0" />
          <div
            className="absolute top-4 left-6 h-0.5 bg-[#132238] transition-all duration-500 -z-0"
            style={{ width: `${((order.currentStep - 1) / (order.totalSteps - 1)) * 88}%` }}
          />

          <div className="flex items-center justify-between relative z-10">
            {/* Step 1: Reported */}
            <button
              onClick={() => onAdvanceTimelineStep(1)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  order.currentStep >= 1
                    ? 'bg-[#132238] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                <Check size={16} strokeWidth={3} />
              </div>
              <span className="text-[11px] font-extrabold text-stone-900 mt-2">
                Reported
              </span>
              <span className="text-[10px] text-stone-500">7:15 PM</span>
            </button>

            {/* Step 2: Matched */}
            <button
              onClick={() => onAdvanceTimelineStep(2)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  order.currentStep >= 2
                    ? 'bg-[#132238] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                <Check size={16} strokeWidth={3} />
              </div>
              <span className="text-[11px] font-extrabold text-stone-900 mt-2">
                Matched
              </span>
              <span className="text-[10px] text-stone-500">7:16 PM</span>
            </button>

            {/* Step 3: Accepted */}
            <button
              onClick={() => onAdvanceTimelineStep(3)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  order.currentStep >= 3
                    ? 'bg-[#132238] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                <Check size={16} strokeWidth={3} />
              </div>
              <span className="text-[11px] font-extrabold text-stone-900 mt-2">
                Accepted
              </span>
              <span className="text-[10px] text-stone-500">7:21 PM</span>
            </button>

            {/* Step 4: In Transit */}
            <button
              onClick={() => onAdvanceTimelineStep(4)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  order.currentStep >= 4
                    ? 'bg-[#132238] text-white shadow-xs ring-4 ring-sky-100'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                <Truck size={16} />
              </div>
              <span className="text-[11px] font-extrabold text-stone-900 mt-2">
                In Transit
              </span>
              <span className="text-[10px] text-stone-500">7:38 PM</span>
            </button>

            {/* Step 5: Delivered */}
            <button
              onClick={() => onAdvanceTimelineStep(5)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  order.currentStep >= 5
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white border-stone-300 text-stone-400'
                }`}
              >
                <Check size={15} strokeWidth={3} />
              </div>
              <span className="text-[11px] font-bold text-stone-500 mt-2">
                Delivered
              </span>
              <span className="text-[10px] text-stone-400">Est 8:05</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE MAP CONTAINER */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs">
        {/* Top Map Status Banner */}
        <div className="p-4 flex items-center justify-between border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-stone-900">
              {order.etaRemainingMinutes} min remaining • {order.distanceKm} km away
            </span>
          </div>

          <span className="bg-stone-100 text-stone-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            ETA {order.eta}
          </span>
        </div>

        {/* Vector Styled Map Canvas */}
        <div className="relative h-64 w-full bg-[#f1f4f8] overflow-hidden">
          {/* Map Grid Roads */}
          <div className="absolute inset-0">
            {/* Horizontal blocks */}
            <div className="absolute top-12 left-0 right-0 h-10 bg-white shadow-xs border-y border-stone-200/50" />
            <div className="absolute top-36 left-0 right-0 h-12 bg-white shadow-xs border-y border-stone-200/50" />

            {/* Vertical blocks */}
            <div className="absolute top-0 bottom-0 left-20 w-10 bg-white shadow-xs border-x border-stone-200/50" />
            <div className="absolute top-0 bottom-0 right-24 w-12 bg-white shadow-xs border-x border-stone-200/50" />

            {/* Park Green Space */}
            <div className="absolute top-16 right-32 w-14 h-14 bg-emerald-100/70 rounded-xl border border-emerald-200/60 flex items-center justify-center">
              <span className="text-[9px] font-bold text-emerald-800 tracking-wider">
                PARK
              </span>
            </div>

            {/* Street Labels */}
            <span className="absolute top-40 left-36 text-[9px] font-extrabold tracking-widest text-stone-400 uppercase">
              MAHATMA GANDHI RD
            </span>
          </div>

          {/* Svg Route Path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Completed route */}
            <polyline
              points="90,80 90,165 260,165"
              fill="none"
              stroke="#132238"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Remaining route with dashed line */}
            <polyline
              points="260,165 260,215 320,215"
              fill="none"
              stroke="#132238"
              strokeWidth="4"
              strokeDasharray="6,6"
              strokeLinecap="round"
            />
          </svg>

          {/* Pickup Pin: Swad Sagar */}
          <div className="absolute top-12 left-16 z-10 flex flex-col items-center">
            <div className="bg-[#132238] text-white p-1 rounded-full shadow-md">
              <MapPin size={12} />
            </div>
            <span className="bg-white/95 backdrop-blur-xs border border-stone-200 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs mt-1">
              Swad Sagar
            </span>
          </div>

          {/* Vehicle Marker: Van 03 */}
          <div className="absolute top-36 left-56 z-20 flex flex-col items-center -translate-x-1/2">
            {/* Pulsing GPS dot */}
            <div className="relative flex items-center justify-center mb-1">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping absolute" />
              <span className="h-2 w-2 rounded-full bg-emerald-500 relative z-10" />
            </div>

            {/* Van Icon Circle */}
            <div className="bg-[#132238] text-white p-1.5 rounded-full shadow-md border-2 border-white">
              <Truck size={14} />
            </div>

            <div className="bg-[#132238] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm mt-0.5">
              Van 03
            </div>
          </div>

          {/* Destination Pin: Shelter Ward 9 */}
          <div className="absolute bottom-6 right-8 z-10 flex flex-col items-center">
            <div className="bg-rose-600 text-white p-1.5 rounded-full shadow-md animate-bounce">
              <MapPin size={14} className="fill-white" />
            </div>
            <span className="bg-white/95 backdrop-blur-xs border border-stone-200 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs mt-0.5">
              Shelter Ward 9
            </span>
          </div>

          {/* Re-center GPS button */}
          <button
            onClick={() => setMapCentered(!mapCentered)}
            aria-label="Re-center GPS"
            className="absolute bottom-3 right-3 z-30 w-9 h-9 bg-white rounded-full shadow-md border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer"
          >
            <Crosshair size={18} className={mapCentered ? 'text-sky-700' : 'text-stone-500'} />
          </button>
        </div>
      </div>

      {/* DRIVER / VOLUNTEER CARD */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-black text-stone-800 text-sm">
            RK
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-base text-stone-900">
                {order.riderName}
              </h3>
              <Check size={16} className="text-stone-900 stroke-[3]" />
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
              <span className="font-medium text-stone-600">Roti Bank Relief</span>
              <span>•</span>
              <span className="font-bold text-stone-800">
                4.9 ★ ({order.riderRuns}+ runs)
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onCallRider(order.riderName, order.riderPhone)}
          className="flex items-center gap-1.5 bg-white hover:bg-stone-50 text-stone-900 text-xs font-extrabold px-4 py-2 rounded-full border border-stone-300 transition-colors shadow-2xs cursor-pointer"
        >
          <Phone size={14} />
          <span>Call</span>
        </button>
      </div>

      {/* HANDOVER CHECKLIST */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-900">
            HANDOVER CHECKLIST
          </h2>
          <span className="text-xs font-extrabold text-stone-700">
            {doneChecklistCount} of 3 Done
          </span>
        </div>

        <div className="space-y-3">
          {/* Item 1: Temperature */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check size={16} strokeWidth={3} />
              </div>
              <div>
                <div className="font-extrabold text-xs text-stone-900">
                  Food Temperature Checked
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {order.handoverChecklist.tempValue}
                </div>
              </div>
            </div>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
              Verified
            </span>
          </div>

          {/* Item 2: Handover Photo */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  order.handoverChecklist.photoUploaded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {order.handoverChecklist.photoUploaded ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <Camera size={16} />
                )}
              </div>
              <div>
                <div className="font-extrabold text-xs text-stone-900">
                  Final Handover Photo
                </div>
                <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                  {order.handoverChecklist.photoUploaded
                    ? 'Tamper-evident photo secured'
                    : 'Required for delivery unlock'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onUploadHandoverPhoto}
              className={`text-xs font-bold px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                order.handoverChecklist.photoUploaded
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-[#FFE68C] text-[#132238] hover:bg-amber-300'
              }`}
            >
              {order.handoverChecklist.photoUploaded ? 'Uploaded' : 'Upload'}
            </button>
          </div>

          {/* Item 3: Portion Count */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  order.handoverChecklist.portionsConfirmed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {order.handoverChecklist.portionsConfirmed ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <ClipboardCheck size={16} />
                )}
              </div>
              <div>
                <div className="font-extrabold text-xs text-stone-900">
                  Portion Count Verification
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {order.handoverChecklist.portionsRatio}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onConfirmPortions}
              className={`text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                order.handoverChecklist.portionsConfirmed
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              {order.handoverChecklist.portionsConfirmed ? 'Confirmed' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>

      {/* RATE MISSION / रेटिंग दें */}
      <form
        onSubmit={handleRatingSubmit}
        className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-stone-900 tracking-tight">
            Rate Mission / रेटिंग दें
          </h2>
          <ShieldCheck size={18} className="text-stone-700" />
        </div>

        <p className="text-xs text-stone-600 leading-relaxed font-normal">
          Rate Roti Bank Relief team for punctuality, food packaging, and hygiene handling.
        </p>

        {/* 5 Stars */}
        <div className="flex items-center justify-center gap-3 py-1">
          {[1, 2, 3, 4, 5].map((starIdx) => (
            <button
              key={starIdx}
              type="button"
              onClick={() => setStars(starIdx)}
              className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
            >
              <Star
                size={30}
                className={
                  starIdx <= stars
                    ? 'fill-amber-400 text-amber-400 stroke-1'
                    : 'text-stone-300'
                }
              />
            </button>
          ))}
        </div>

        {/* Praise / Note Input */}
        <div className="relative">
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Quick praise or handling note (e.g. Prompt arrival and sealed hot food)"
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Submit Rating Button */}
        <button
          type="submit"
          disabled={ratingSubmitted}
          className="w-full bg-[#132238] hover:bg-[#1c304d] text-white font-extrabold text-xs tracking-wider uppercase py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <span>
            {ratingSubmitted ? 'RATING SUBMITTED ✓ धन्यवाद' : 'SUBMIT RATING / रेटिंग सबमिट करें'}
          </span>
          <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
};
