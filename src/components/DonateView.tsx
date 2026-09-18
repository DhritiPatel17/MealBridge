import React, { useState } from 'react';
import { FoodCategory, PerishabilityState, PackagingFormat, DonationOrder } from '../types';
import {
  RotateCcw,
  Utensils,
  Leaf,
  Fish,
  Sandwich,
  Minus,
  Plus,
  Scale,
  Sparkles,
  Clock,
  MapPin,
  Camera,
  Check,
  Building,
  UploadCloud,
} from 'lucide-react';

interface DonateViewProps {
  onPostSurplus: (order: Partial<DonationOrder>) => void;
  onOpenTemplateSelector: () => void;
  onChangePickupLocation: () => void;
  onChangeSafetyWindow: () => void;
  onRetakePhoto: () => void;
}

export const DonateView: React.FC<DonateViewProps> = ({
  onPostSurplus,
  onOpenTemplateSelector,
  onChangePickupLocation,
  onChangeSafetyWindow,
  onRetakePhoto,
}) => {
  const [category, setCategory] = useState<FoodCategory>('pure-veg');
  const [perishability, setPerishability] = useState<PerishabilityState>('cooked');
  const [servings, setServings] = useState<number>(85);
  const [packaging, setPackaging] = useState<PackagingFormat>('containers');
  const [cookedAtTime, setCookedAtTime] = useState<string>('6:45 PM (Today)');
  const [safeUntilTime, setSafeUntilTime] = useState<string>('11:30 PM Tonight (~3.5 hrs window)');
  const [instructions, setInstructions] = useState<string>(
    'Keep upright, 3 large stainless steel catering tubs. Loading bay accessible via Back Gate #2. Bring a trolley.'
  );
  const [saveAsTemplate, setSaveAsTemplate] = useState<boolean>(true);
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
  );
  const [photoName, setPhotoName] = useState<string>('dal_rice_batch4.jpg');

  // Dynamically calculate estimated net mass (~0.335 kg per serving)
  const netMass = (servings * 0.335).toFixed(1);

  const handleDecrement = () => {
    if (servings > 5) setServings((prev) => prev - 5);
  };

  const handleIncrement = () => {
    setServings((prev) => prev + 5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPostSurplus({
      category,
      perishability,
      servings,
      netMassKg: parseFloat(netMass),
      packaging,
      cookedAt: cookedAtTime,
      specialInstructions: instructions,
      photoUrl,
      photoFilename: photoName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-16">
      {/* Subheader with Status & Template button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping inline-block" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700">
            LIVE DONOR HUB
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenTemplateSelector}
          className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-full border border-stone-300 transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Load Template</span>
        </button>
      </div>

      {/* Screen Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Daan Karein / दान करें
        </h1>
        <p className="text-xs text-stone-600">
          Broadcast surplus fresh meals to verified relief kitchens within 8 km.
        </p>
      </div>

      {/* 1. Food Details / विवरण */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils size={18} className="text-stone-800" />
            <h2 className="text-sm font-black text-stone-900 tracking-wide">
              1. Food Details / विवरण
            </h2>
          </div>
          <span className="text-[11px] font-bold text-sky-800">
            Required *
          </span>
        </div>

        {/* Category: 3 Cards */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            CATEGORY / भोजन का प्रकार
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Pure Veg */}
            <button
              type="button"
              onClick={() => setCategory('pure-veg')}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                category === 'pure-veg'
                  ? 'bg-[#132238] text-white shadow-sm ring-2 ring-[#132238]'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Leaf
                size={22}
                className={category === 'pure-veg' ? 'text-amber-300 fill-amber-300' : 'text-stone-600'}
              />
              <span className="text-xs font-bold mt-1.5">Pure Veg</span>
              <span className="text-[10px] opacity-80 font-medium">शाकाहारी</span>
            </button>

            {/* Non-Veg */}
            <button
              type="button"
              onClick={() => setCategory('non-veg')}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                category === 'non-veg'
                  ? 'bg-[#132238] text-white shadow-sm ring-2 ring-[#132238]'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Fish
                size={22}
                className={category === 'non-veg' ? 'text-rose-400' : 'text-stone-600'}
              />
              <span className="text-xs font-bold mt-1.5">Non-Veg</span>
              <span className="text-[10px] opacity-80 font-medium">मांसाहारी</span>
            </button>

            {/* Mixed */}
            <button
              type="button"
              onClick={() => setCategory('mixed')}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                category === 'mixed'
                  ? 'bg-[#132238] text-white shadow-sm ring-2 ring-[#132238]'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Sandwich
                size={22}
                className={category === 'mixed' ? 'text-amber-300' : 'text-stone-600'}
              />
              <span className="text-xs font-bold mt-1.5">Mixed</span>
              <span className="text-[10px] opacity-80 font-medium">मिश्रित</span>
            </button>
          </div>
        </div>

        {/* Perishability State */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            PERISHABILITY STATE / भोजन की प्रकृति
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'cooked', label: 'Cooked Meals / पक्का खाना' },
              { id: 'dairy', label: 'Dairy / दुग्ध' },
              { id: 'bakery', label: 'Bakery / बेकरी' },
              { id: 'packaged', label: 'Packaged / पैकेट' },
              { id: 'raw', label: 'Raw Grain / अनाज' },
            ].map((state) => (
              <button
                key={state.id}
                type="button"
                onClick={() => setPerishability(state.id as PerishabilityState)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  perishability === state.id
                    ? 'bg-[#132238] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {state.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Quantity & Servings / मात्रा */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">👥</span>
            <h2 className="text-sm font-black text-stone-900 tracking-wide">
              2. Quantity & Servings / मात्रा
            </h2>
          </div>
          <span className="text-[11px] font-bold text-sky-800">
            Feeds How Many?
          </span>
        </div>

        {/* Servings Stepper */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDecrement}
            className="w-11 h-11 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-700 transition-colors cursor-pointer active:scale-95"
          >
            <Minus size={20} />
          </button>

          <div className="text-center">
            <div className="text-3xl font-black text-stone-900">
              {servings} <span className="text-lg font-bold text-stone-700">Persons</span>
            </div>
            <div className="text-xs text-stone-500 font-medium mt-0.5">
              लगभग {servings} व्यक्ति आहार
            </div>
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            className="w-11 h-11 rounded-full bg-[#132238] hover:bg-slate-800 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-95 shadow-xs"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Estimated Mass */}
        <div className="flex items-center justify-between text-xs text-stone-600 px-1">
          <div className="flex items-center gap-1.5 font-medium">
            <Scale size={15} className="text-stone-500" />
            <span>Estimated Net Mass:</span>
          </div>
          <span className="font-extrabold text-stone-900 text-sm">
            ~{netMass} kg
          </span>
        </div>
      </div>

      {/* 3. Consumption Window & Timing */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-stone-800" />
            <h2 className="text-sm font-black text-stone-900 tracking-wide">
              3. Consumption Window & Timing
            </h2>
          </div>
          <span className="text-[11px] font-bold text-sky-800">
            Quality Check
          </span>
        </div>

        {/* Gemini Safety Advisory Card */}
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sky-900">
              <Sparkles size={14} className="text-sky-700" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                GEMINI SAFETY ADVISORY
              </span>
            </div>
            <span className="text-[11px] font-bold text-stone-600">
              Ambient: 26°C
            </span>
          </div>

          <p className="text-xs font-bold text-sky-950 leading-relaxed">
            Recommended safe distribution until {safeUntilTime}.
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-sky-100/80">
            <span className="text-[11px] text-sky-700">
              Model tuned for cooked dal/steamed rice
            </span>
            <button
              type="button"
              onClick={onChangeSafetyWindow}
              className="text-[11px] font-extrabold text-sky-900 hover:underline cursor-pointer"
            >
              CHANGE WINDOW
            </button>
          </div>
        </div>

        {/* Packaging Format */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            PACKAGING FORMAT / पैकिंग
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPackaging('containers')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                packaging === 'containers'
                  ? 'bg-[#132238] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Containers / पैक
            </button>
            <button
              type="button"
              onClick={() => setPackaging('loose')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                packaging === 'loose'
                  ? 'bg-[#132238] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Loose / खुला कैटरिंग
            </button>
          </div>
        </div>

        {/* Cooked At */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            COOKED AT / पकाने का समय
          </span>
          <div className="relative">
            <input
              type="text"
              value={cookedAtTime}
              onChange={(e) => setCookedAtTime(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Clock size={16} className="absolute right-3.5 top-3 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Handover & Location */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-stone-800" />
            <h2 className="text-sm font-black text-stone-900 tracking-wide">
              4. Handover & Location
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Verified</span>
          </div>
        </div>

        {/* Special Instructions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            SPECIAL ACCESS INSTRUCTIONS
          </span>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g., Keep upright, 3 large stainless steel catering tubs. Loading bay accessible via Back Gate #2. Bring a trolley..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
          />
        </div>

        {/* Visual Proof */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              VISUAL PROOF / फोटो प्रमाण
            </span>
            <span className="text-[11px] font-bold text-stone-600">
              1 Photo Added
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-stone-200 group">
            <img
              src={photoUrl}
              alt="Food verification"
              referrerPolicy="no-referrer"
              className="w-full h-36 object-cover"
            />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px]">
              <div className="flex items-center gap-1.5 font-medium truncate max-w-[200px]">
                <UploadCloud size={14} className="shrink-0" />
                <span className="truncate">{photoName}</span>
              </div>
              <button
                type="button"
                onClick={onRetakePhoto}
                className="font-bold text-amber-300 hover:text-amber-200 uppercase tracking-wider cursor-pointer"
              >
                RETAKE
              </button>
            </div>
          </div>
        </div>

        {/* Pickup Point */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            PICKUP POINT / पिकअप स्थान
          </span>

          {/* Mini styled map */}
          <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-stone-200 bg-sky-100 flex items-center justify-center">
            {/* Map styling grid graphic */}
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute top-4 left-6 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Andheri West
            </div>
            <div className="absolute bottom-4 right-6 bg-sky-200/80 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Malad Corridor
            </div>

            {/* Center Pin */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-[#132238] text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
                <MapPin size={11} className="text-amber-300 fill-amber-300" />
                <span>Donation Hub</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#132238] mt-0.5" />
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="max-w-[75%]">
              <div className="font-extrabold text-xs text-stone-900 truncate">
                Royal Palace Banquet &amp; Cante...
              </div>
              <div className="text-[11px] text-stone-500 truncate mt-0.5">
                MG Road, Ward 12 • 19.0760° N, 72.877...
              </div>
            </div>
            <button
              type="button"
              onClick={onChangePickupLocation}
              className="text-[11px] font-extrabold text-stone-800 hover:text-black uppercase bg-stone-200/70 hover:bg-stone-300/70 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              CHANGE
            </button>
          </div>
        </div>
      </div>

      {/* Save as Daily Template Toggle */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div>
          <div className="text-xs font-bold text-stone-900">
            Save as Daily Template
          </div>
          <div className="text-[11px] text-stone-500">
            Fast dispatch auto-fill for tomorrow
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSaveAsTemplate(!saveAsTemplate)}
          className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
            saveAsTemplate ? 'bg-[#132238] text-white' : 'bg-stone-100 border border-stone-300'
          }`}
        >
          {saveAsTemplate && <Check size={16} strokeWidth={3} />}
        </button>
      </div>

      {/* Primary Submit Button */}
      <div className="space-y-2 pt-1">
        <button
          type="submit"
          className="w-full bg-[#132238] text-white font-extrabold py-3.5 px-5 rounded-2xl hover:bg-[#1a2d48] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer group"
        >
          <Sparkles size={18} className="text-amber-300 group-hover:rotate-12 transition-transform" />
          <span className="text-sm tracking-wide">
            Daan Karein / Post Surplus Food
          </span>
        </button>
        <p className="text-[11px] text-stone-500 text-center">
          Instant broadcast to 6 verified NGOs in 8 km corridor • Zero Food Waste
        </p>
      </div>
    </form>
  );
};
