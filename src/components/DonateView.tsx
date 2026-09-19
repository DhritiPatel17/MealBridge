import React, { useState, useEffect } from 'react';
import { FoodCategory, PerishabilityState, DonationOrder } from '../types';
import { UserProfile } from './auth/AuthPortal';
import { FOOD_SAFETY_RULES, PACKING_OPTIONS } from '../config/foodSafetyConfig';
import {
  getCookedDateTime,
  getSafeUntilDateTime,
} from '../utils/timeValidation';
import { LocationPicker } from './common/LocationPicker';
import donorHeaderWebp from '../assets/donor-header.webp';

interface DonateViewProps {
  onPostSurplus: (order: Partial<DonationOrder>) => void;
  currentUser?: UserProfile | null;
}

export const DonateView: React.FC<DonateViewProps> = ({
  onPostSurplus,
  currentUser,
}) => {
  const [category, setCategory] = useState<FoodCategory>('pure-veg');
  const [perishability, setPerishability] = useState<PerishabilityState>('cooked');
  const [servings, setServings] = useState<number>(50);
  const [note, setNote] = useState<string>('');

  // Food storage condition (Required for Cooked Food and Dairy)
  const [foodStorage, setFoodStorage] = useState<string>('');
  const storageOptions = [
    'Hot / गरम',
    'Room temperature / सामान्य तापमान',
    'Fridge / फ्रिज में',
  ];

  // When cooked state (starts empty, no default current time)
  const [cookHour, setCookHour] = useState<number | ''>('');
  const [cookMinute, setCookMinute] = useState<string>('');
  const [cookAmPm, setCookAmPm] = useState<'AM' | 'PM' | ''>('');
  const [expiryDatePack, setExpiryDatePack] = useState<string>('');

  // Safe to eat for how long state
  const currentRule = FOOD_SAFETY_RULES[perishability] || FOOD_SAFETY_RULES.cooked;
  const [durationValue, setDurationValue] = useState<number>(currentRule.defaultDuration);
  const [durationUnit, setDurationUnit] = useState<'Minutes' | 'Hours' | 'Days'>(currentRule.defaultUnit);

  // Packing multi-select state
  const [selectedPackings, setSelectedPackings] = useState<string[]>(['Tiffin / Lunch box / टिफिन']);
  const [otherPackingText, setOtherPackingText] = useState<string>('');

  // Pickup Details state (starts completely empty, no auto-fill)
  const [contactPerson, setContactPerson] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [phoneTouched, setPhoneTouched] = useState<boolean>(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Confirmation checkbox
  const [confirmedSafe, setConfirmedSafe] = useState<boolean>(false);
  const [headerImgFailed, setHeaderImgFailed] = useState<boolean>(false);

  // Update defaults when perishability changes
  useEffect(() => {
    const rule = FOOD_SAFETY_RULES[perishability] || FOOD_SAFETY_RULES.cooked;
    setDurationUnit(rule.defaultUnit);
    setDurationValue(rule.defaultDuration);
  }, [perishability]);

  const totalKg = (isNaN(servings) || servings < 1 ? 1 : servings) * 0.35;
  const weightDisplay = totalKg >= 1000 
    ? `${(totalKg / 1000).toFixed(1)} tonnes` 
    : `${totalKg.toFixed(1)} kg`;

  const maxHoursAllowed = currentRule.maxHours;
  const getEnteredHours = () => {
    if (durationUnit === 'Minutes') return (durationValue || 0) / 60;
    if (durationUnit === 'Hours') return durationValue || 0;
    if (durationUnit === 'Days') return (durationValue || 0) * 24;
    return 0;
  };

  const enteredHours = getEnteredHours();
  const isExceedingLimit = perishability !== 'packaged' && enteredHours > maxHoursAllowed;
  const maxAllowedLabel = currentRule.maxHours >= 24 
    ? `${currentRule.maxHours / 24} days` 
    : `${currentRule.maxHours} hours`;

  // Cooked date evaluation (assumes today; rolls back to yesterday if in future)
  const cookedResult = getCookedDateTime(cookHour, cookMinute, cookAmPm);
  const cookedDateObj = cookedResult.date;
  const isCookedMoreThan12HoursAgo = cookedResult.isMoreThan12HoursAgo;

  const isCookedFilled = perishability === 'packaged' 
    ? !!expiryDatePack 
    : (cookHour !== '' && cookMinute !== '' && cookAmPm !== '');
  const isCookedValid = perishability === 'packaged' 
    ? !!expiryDatePack 
    : (isCookedFilled && !isCookedMoreThan12HoursAgo);

  // Safe-until date object
  const safeUntilD = getSafeUntilDateTime(
    perishability,
    cookedDateObj,
    durationValue,
    durationUnit,
    expiryDatePack
  );

  const isSafeTimeFilled = perishability === 'packaged' ? true : durationValue > 0;

  // Food safety check: block submit only if the safe time is already over
  const isSafeTimeOver = isCookedValid && isSafeTimeFilled && !isExceedingLimit && Date.now() >= safeUntilD.getTime();

  const getEatBeforeString = () => {
    if (perishability === 'packaged') {
      return `Use before expiry date: ${expiryDatePack} / एक्सपायरी तारीख तक`;
    }
    const timeStr = safeUntilD.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    return `Eat before: ${timeStr}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
  };

  const isPhoneFilledValid = phone.length === 10;
  const isPhoneLengthWrong = phone.length !== 10;
  const showPhoneError = (phoneTouched || hasAttemptedSubmit) && isPhoneLengthWrong;

  const isStorageValid = (perishability !== 'cooked' && perishability !== 'dairy') || !!foodStorage;
  const isLocationValid = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  const isFormValid = 
    contactPerson.trim() !== '' && 
    isPhoneFilledValid && 
    pickupAddress.trim() !== '' && 
    isLocationValid &&
    isStorageValid &&
    isCookedValid &&
    !isExceedingLimit &&
    !isSafeTimeOver &&
    confirmedSafe;

  const handleDecrement = () => {
    setServings((prev) => Math.max(1, (prev || 1) - 1));
  };

  const handleIncrement = () => {
    setServings((prev) => (prev || 0) + 1);
  };

  const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setServings('' as any);
      return;
    }
    const num = parseInt(val.replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
      setServings(num);
    }
  };

  const handleBlur = () => {
    if (!servings || servings < 1) {
      setServings(1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    if (!isFormValid) return;

    const finalServings = isNaN(servings) || servings < 1 ? 1 : servings;
    const cookedAtFormatted = perishability === 'packaged' 
      ? `Expires: ${expiryDatePack}` 
      : `${cookHour}:${cookMinute} ${cookAmPm}`;
    
    const packingListStr = selectedPackings.includes('Other / दूसरा') && otherPackingText.trim()
      ? selectedPackings.map(p => p.includes('Other') ? otherPackingText.trim() : p.split('/')[0].trim()).join(', ')
      : selectedPackings.map(p => p.split('/')[0].trim()).join(', ');

    const safeDateObj = safeUntilD;
    const safeUntilTimestamp = safeDateObj.getTime();
    const area = pickupAddress.split(',')[0].trim() || 'Central Delhi';
    const businessName = currentUser?.businessName || (contactPerson ? `${contactPerson}'s Kitchen` : 'Taj Caterers & Kitchen');

    onPostSurplus({
      category,
      perishability,
      servings: finalServings,
      netMassKg: parseFloat((finalServings * 0.35).toFixed(1)),
      packaging: 'containers',
      cookedAt: cookedAtFormatted,
      safeUntil: getEatBeforeString(),
      safeUntilTimestamp,
      packingTypes: selectedPackings.map(p => p.includes('Other') && otherPackingText ? otherPackingText : p),
      specialInstructions: `${note} | Storage: ${foodStorage} | Packing: ${packingListStr} ${landmark ? `| Landmark: ${landmark}` : ''}`,
      donorAddress: pickupAddress,
      donorPhone: `+91 ${phone}`,
      donorName: contactPerson,
      donorBusinessName: businessName,
      donorArea: area,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      landmark: landmark ? landmark.trim() : undefined,
      donorNote: note.trim() || undefined,
      status: 'reported',
      currentStep: 2,
      stepPercentage: 40,
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5 pb-16">
      {/* Top Header Panel with Background Image */}
      <div
        className={`relative rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs transition-colors min-h-[140px] flex flex-col justify-center ${
          headerImgFailed ? 'bg-[#132238]' : 'bg-[#132238]'
        }`}
      >
        {!headerImgFailed && (
          <>
            <img
              src={donorHeaderWebp}
              alt="Hands passing a bowl of food, with a steel pot on the left"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setHeaderImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: 'right center' }}
            />
            {/* White overlay for readability: soft gradient with white on left for text readability, photo clearly visible on the right */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/95 via-white/80 to-white/20 sm:to-transparent" />
          </>
        )}

        {/* Header Text Content */}
        <div className="relative z-10 px-5 sm:px-6 py-6 space-y-1 max-w-[85%] sm:max-w-[70%]">
          <div>
            <span
              className={`text-xs font-extrabold uppercase tracking-wider ${
                headerImgFailed ? 'text-[#ACC8E5]' : 'text-[#112A46]'
              }`}
            >
              Live Donor Hub
            </span>
          </div>
          <h1
            className={`text-2xl font-black tracking-tight ${
              headerImgFailed ? 'text-white' : 'text-[#112A46]'
            }`}
          >
            Daan Karein / दान करें
          </h1>
          <p
            className={`text-xs font-medium ${
              headerImgFailed ? 'text-stone-300' : 'text-stone-700'
            }`}
          >
            Share your extra food with NGOs near you.
          </p>
        </div>
      </div>

      {/* 1. Food Details / भोजन विवरण */}
      <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#112A46] tracking-wide">
              1. Food Details / भोजन विवरण
            </h2>
            <div className="w-10 h-1 bg-[#FDFD96] rounded-full mt-1" />
          </div>
          <span className="text-[11px] font-bold text-[#112A46]/70">
            Required *
          </span>
        </div>

        {/* Veg or Non-Veg */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
            VEG OR NON-VEG / शाकाहारी या मांसाहारी
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'pure-veg', label: 'Pure Veg', hi: 'शाकाहारी' },
              { id: 'non-veg', label: 'Non-Veg', hi: 'मांसाहारी' },
              { id: 'mixed', label: 'Mixed', hi: 'मिश्रित' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id as FoodCategory)}
                className={`p-3 rounded-[12px] flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  category === c.id
                    ? 'bg-[#FDFD96] text-black border border-[#E3E36B] font-bold shadow-xs'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200 font-medium'
                }`}
              >
                <span className="text-xs font-bold">{c.label}</span>
                <span className="text-[10px] opacity-80 font-medium">{c.hi}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Type of Food */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
            TYPE OF FOOD / खाने का प्रकार
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'cooked', label: 'Cooked Food / पका हुआ खाना' },
              { id: 'dairy', label: 'Dairy / दूध से बना' },
              { id: 'bakery', label: 'Bakery / बेकरी' },
              { id: 'packaged', label: 'Packed / पैकेट वाला' },
              { id: 'raw', label: 'Raw / कच्चा सामान' },
            ].map((state) => (
              <button
                key={state.id}
                type="button"
                onClick={() => setPerishability(state.id as PerishabilityState)}
                className={`text-xs px-3 py-1.5 rounded-[10px] transition-all cursor-pointer ${
                  perishability === state.id
                    ? 'bg-[#FDFD96] text-black border border-[#E3E36B] shadow-xs font-bold'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200 font-medium'
                }`}
              >
                {state.label}
              </button>
            ))}
          </div>
        </div>

        {/* How is the food kept now? (Required for Cooked and Dairy) */}
        {(perishability === 'cooked' || perishability === 'dairy') && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
                How is the food kept now?
              </span>
              <span className="text-[11px] text-stone-600 font-medium">
                खाना अभी कैसे रखा है?
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {storageOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFoodStorage(opt)}
                  className={`py-2 px-2 rounded-[10px] text-xs transition-all cursor-pointer text-center ${
                    foodStorage === opt
                      ? 'bg-[#FDFD96] text-black border border-[#E3E36B] shadow-xs font-bold'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200 font-medium'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* When was it cooked? / खाना कब बना था? */}
        {perishability === 'packaged' ? (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
                Expiry date on the pack
              </span>
              <span className="text-[11px] text-stone-600 font-medium">
                पैकेट पर एक्सपायरी तारीख
              </span>
            </div>
            <input
              type="date"
              required
              autoComplete="off"
              value={expiryDatePack}
              onChange={(e) => setExpiryDatePack(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-[10px] px-4 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#112A46]"
            />
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
                When was it cooked?
              </span>
              <span className="text-[11px] text-stone-600 font-medium">
                खाना कब बना था?
              </span>
            </div>
            
            <div className="bg-stone-50 border border-stone-200 rounded-[12px] p-3.5 space-y-3">
              {/* 3 Columns: Hour, Minute, AM/PM (starts empty, no default time) */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Hour (1-12)</label>
                  <select
                    value={cookHour}
                    onChange={(e) => setCookHour(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-[10px] px-2.5 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#112A46] cursor-pointer"
                  >
                    <option value="">Hour</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Minute (00-59)</label>
                  <select
                    value={cookMinute}
                    onChange={(e) => setCookMinute(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-[10px] px-2.5 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#112A46] cursor-pointer"
                  >
                    <option value="">Minute</option>
                    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">AM / PM</label>
                  <select
                    value={cookAmPm}
                    onChange={(e) => setCookAmPm(e.target.value as 'AM' | 'PM' | '')}
                    className="w-full bg-white border border-stone-200 rounded-[10px] px-2.5 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#112A46] cursor-pointer"
                  >
                    <option value="">AM/PM</option>
                    <option value="AM">AM / सुबह</option>
                    <option value="PM">PM / शाम</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error message if cooked more than 12 hours ago */}
            {isCookedFilled && isCookedMoreThan12HoursAgo && (
              <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-[10px]">
                Food cooked more than 12 hours ago can't be donated. / 12 घंटे से पुराना खाना दान नहीं किया जा सकता।
              </div>
            )}
          </div>
        )}

        {/* Safe to eat for how long? / कितनी देर तक खाने लायक रहेगा? */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
              Safe to eat for how long?
            </span>
            <span className="text-[11px] text-stone-600 font-medium">
              कितनी देर तक खाने लायक रहेगा?
            </span>
          </div>

          {perishability === 'packaged' ? (
            <div className="bg-stone-50 border border-stone-200 rounded-[12px] p-3.5 text-xs text-stone-700 font-medium">
              Packed food remains safe until the printed expiry date on the pack.
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-[12px] p-3.5 space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  autoComplete="off"
                  value={durationValue}
                  onChange={(e) => setDurationValue(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-white border border-stone-200 rounded-[10px] px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#112A46]"
                />
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as any)}
                  className="w-32 bg-white border border-stone-200 rounded-[10px] px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#112A46] cursor-pointer"
                >
                  {currentRule.unitChoices.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit === 'Minutes' && 'Minutes / मिनट'}
                      {unit === 'Hours' && 'Hours / घंटे'}
                      {unit === 'Days' && 'Days / दिन'}
                    </option>
                  ))}
                </select>
              </div>

              {isExceedingLimit && (
                <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-[10px]">
                  For this food type, the maximum allowed is {maxAllowedLabel}. Please enter {maxAllowedLabel} or less.
                </div>
              )}

              {isSafeTimeOver && (
                <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-[10px]">
                  This food is no longer safe to donate. / यह खाना अब दान करने लायक नहीं है।
                </div>
              )}
            </div>
          )}

          <p className="text-[10px] text-stone-600 italic px-1">
            Time limits are set by MealBridge for food safety / खाने की सुरक्षा के लिए समय सीमा MealBridge तय करती है.
          </p>
        </div>

        {/* How is it packed? / पैकिंग कैसी है? */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
              How is it packed? (Select all that apply)
            </span>
            <span className="text-[11px] text-stone-600 font-medium">
              पैकिंग कैसी है? (एक या अधिक चुनें)
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PACKING_OPTIONS.map((opt) => {
              const isSelected = selectedPackings.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      if (selectedPackings.length > 1) {
                        setSelectedPackings(selectedPackings.filter((p) => p !== opt));
                      }
                    } else {
                      setSelectedPackings([...selectedPackings, opt]);
                    }
                  }}
                  className={`text-xs px-3 py-1.5 rounded-[10px] transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#FDFD96] text-black border border-[#E3E36B] shadow-xs font-bold'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200 font-medium'
                  }`}
                >
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {selectedPackings.includes('Other / दूसरा') && (
            <input
              type="text"
              autoComplete="off"
              value={otherPackingText}
              onChange={(e) => setOtherPackingText(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-[10px] px-4 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#112A46] mt-2"
            />
          )}
        </div>

        {/* Note */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
              Anything NGO should know?
            </span>
            <span className="text-[11px] text-stone-600 font-medium text-right">
              NGO के लिए जरूरी बात (वैकल्पिक)
            </span>
          </div>
          <textarea
            rows={2}
            maxLength={200}
            autoComplete="off"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Contains peanuts, very spicy, contains milk / जैसे: मूंगफली है, बहुत तीखा है, दूध से बना है"
            className="w-full bg-stone-50 border border-stone-200 rounded-[10px] px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#112A46] resize-none"
          />
        </div>
      </div>

      {/* 2. Quantity / मात्रा */}
      <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#112A46] tracking-wide">
              2. Quantity / मात्रा
            </h2>
            <div className="w-10 h-1 bg-[#FDFD96] rounded-full mt-1" />
          </div>
          <span className="text-[11px] font-bold text-[#112A46]/70">
            Required *
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
              People
            </span>
            <span className="text-[11px] text-stone-600 font-medium">
              Number of people
            </span>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-[12px] p-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDecrement}
              className="w-10 h-10 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-700 transition-colors cursor-pointer active:scale-95 text-lg font-bold"
            >
              −
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={isNaN(servings) ? '' : servings}
                  onChange={handleServingsChange}
                  onBlur={handleBlur}
                  onFocus={(e) => e.target.select()}
                  className="w-24 text-center text-2xl font-black text-stone-900 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#112A46] rounded-lg"
                />
                <span className="text-base font-black text-stone-800">People</span>
              </div>
              <div className="text-xs text-stone-500 font-medium mt-0.5">
                लगभग {isNaN(servings) || servings < 1 ? 1 : servings} लोगों का आहार
              </div>
            </div>

            <button
              type="button"
              onClick={handleIncrement}
              className="w-10 h-10 rounded-full bg-[#112A46] hover:bg-[#0c1e33] flex items-center justify-center text-white transition-colors cursor-pointer active:scale-95 shadow-xs text-lg font-bold"
            >
              +
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-stone-600 px-1 pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <span>Approx. weight</span>
            </div>
            <span className="font-extrabold text-stone-900">
              ~{weightDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Pickup Details / पिकअप विवरण */}
      <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#112A46] tracking-wide">
              3. Pickup Details / पिकअप विवरण
            </h2>
            <div className="w-10 h-1 bg-[#FDFD96] rounded-full mt-1" />
          </div>
          {currentUser && (currentUser.fullName || currentUser.address) ? (
            <button
              type="button"
              onClick={() => {
                if (currentUser.fullName) setContactPerson(currentUser.fullName);
                if (currentUser.phone) {
                  const cleaned = currentUser.phone.replace(/\D/g, '');
                  const last10 = cleaned.slice(-10);
                  setPhone(last10);
                }
                if (currentUser.address) setPickupAddress(currentUser.address);
                if (typeof currentUser.latitude === 'number' && typeof currentUser.longitude === 'number') {
                  setLatitude(currentUser.latitude);
                  setLongitude(currentUser.longitude);
                }
              }}
              className="text-[11px] font-bold text-[#112A46] hover:bg-[#ACC8E5]/40 bg-[#ACC8E5]/20 border border-[#ACC8E5] px-2.5 py-1 rounded-[8px] transition-colors cursor-pointer"
            >
              Fill Profile Info / प्रोफ़ाइल से भरें
            </button>
          ) : (
            <span className="text-[11px] font-bold text-[#112A46]/70">
              Required *
            </span>
          )}
        </div>

        {/* Contact person name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
              Contact person name
            </span>
            <span className="text-[11px] text-stone-600 font-medium">
              संपर्क व्यक्ति का नाम
            </span>
          </div>
          <input
            type="text"
            required
            autoComplete="off"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-[10px] px-4 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#112A46]"
          />
        </div>

        {/* Phone number */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
              Phone number
            </span>
            <span className="text-[11px] text-stone-600 font-medium">
              फोन नंबर
            </span>
          </div>
          <div className="flex rounded-[10px] border border-stone-200 bg-stone-50 overflow-hidden focus-within:ring-2 focus-within:ring-[#112A46]">
            <span className="bg-stone-200 px-3.5 py-2.5 text-xs font-bold text-stone-700 flex items-center border-r border-stone-200">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              required
              autoComplete="off"
              maxLength={10}
              value={phone}
              onChange={handlePhoneChange}
              onBlur={() => setPhoneTouched(true)}
              className="flex-1 bg-transparent px-3 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none"
            />
          </div>
          {showPhoneError && (
            <p className="text-[10px] text-rose-600 font-medium">
              Please enter a 10-digit mobile number. / कृपया 10 अंकों का मोबाइल नंबर डालें।
            </p>
          )}
        </div>

        {/* Pickup address */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
              Pickup address
            </span>
            <span className="text-[11px] text-stone-600 font-medium">
              पिकअप का पूरा पता
            </span>
          </div>
          <input
            type="text"
            required
            autoComplete="off"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-[10px] px-4 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#112A46]"
          />
        </div>

        {/* Landmark or gate instructions (Optional) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
              Landmark or gate instructions (Optional)
            </span>
            <span className="text-[11px] text-stone-600 font-medium">
              पहचान या गेट की जानकारी
            </span>
          </div>
          <input
            type="text"
            autoComplete="off"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-[10px] px-4 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#112A46]"
          />
        </div>

        {/* OpenStreetMap Map Location Picker with Draggable Pin & Browser Geolocation */}
        <div className="pt-2 border-t border-stone-100">
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
            required={true}
            hasError={hasAttemptedSubmit && !isLocationValid}
          />
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 shadow-[0_4px_14px_rgba(17,42,70,0.08)] space-y-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmedSafe}
            onChange={(e) => setConfirmedSafe(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#112A46] focus:ring-[#112A46] cursor-pointer shrink-0"
          />
          <span className="text-xs text-black font-bold leading-relaxed">
            I confirm this food is freshly cooked, stored properly and safe to eat. <br />
            <span className="font-normal text-stone-600">
              मैं पुष्टि करता/करती हूँ कि यह खाना ताज़ा बना है, सही तरह रखा गया है और खाने लायक है।
            </span>
          </span>
        </label>
      </div>

      {/* Primary Submit Button */}
      <div className="space-y-2 pt-1">
        <button
          type="submit"
          onClick={() => {
            if (!isFormValid) {
              setHasAttemptedSubmit(true);
            }
          }}
          className={`w-full font-bold py-3.5 px-5 rounded-[12px] transition-all flex items-center justify-center gap-2 border ${
            !isFormValid
              ? 'bg-stone-200 text-stone-500 border-stone-300 cursor-not-allowed shadow-none'
              : 'bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white border-[#112A46] cursor-pointer shadow-[0_6px_16px_rgba(17,42,70,0.25)]'
          }`}
        >
          <span className="text-sm tracking-wide font-bold">
            Daan Karein / Post Surplus Food
          </span>
        </button>
        <p className="text-[11px] text-[#112A46]/80 text-center font-medium">
          Instant connection with verified NGOs near you • Zero Food Waste
        </p>
      </div>
    </form>
  );
};
