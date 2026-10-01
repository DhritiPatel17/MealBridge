import React, { useState, useEffect } from 'react';
import { DonationRecord, donationStore } from '../../services/donationStore';
import { UserProfile } from '../auth/AuthPortal';
import { MapPin, Clock } from 'lucide-react';

interface NewRequestsViewProps {
  requests: DonationRecord[];
  currentUser: UserProfile | null;
  onAcceptRequest: (id: string) => void;
  onCallDonor?: (name: string, phone: string) => void;
}

export const NewRequestsView: React.FC<NewRequestsViewProps> = ({
  requests,
  currentUser,
  onAcceptRequest,
}) => {
  const [now, setNow] = useState<number>(Date.now());
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (currentUser?.id) {
      return donationStore.getDismissedForNgo(currentUser.id);
    }
    return [];
  });

  // Keep countdown updated in real time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update dismissed IDs when currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      setDismissedIds(donationStore.getDismissedForNgo(currentUser.id));
    }
  }, [currentUser?.id]);

  const handleDismiss = (donationId: string) => {
    if (currentUser?.id) {
      donationStore.dismissForNgo(currentUser.id, donationId);
      setDismissedIds(donationStore.getDismissedForNgo(currentUser.id));
    }
  };

  // Filter out:
  // 1. Dismissed by this NGO via "Not Now"
  // 2. Already timed out (> 10 mins without accept)
  // 3. Food safety expired
  const activeRequests = requests.filter((r) => {
    if (dismissedIds.includes(r.id)) return false;
    if (r.status !== 'waiting') return false;
    if (r.expiresAt && now >= r.expiresAt) return false;
    if (r.safeUntilTimestamp && now >= r.safeUntilTimestamp) return false;
    return true;
  });

  const formatCountdown = (expiresAt: number): string => {
    const diffMs = Math.max(0, expiresAt - now);
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatFoodSafe = (req: DonationRecord): string => {
    if (req.safeUntilTimestamp) {
      const diffMs = req.safeUntilTimestamp - now;
      if (diffMs <= 0) return 'Expired / समय समाप्त';
      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      if (hours > 0) {
        return `${hours} hrs ${mins} min left`;
      }
      return `${mins} min left`;
    }
    return req.safeUntil;
  };

  const getFoodTypeDisplay = (perishability: string): string => {
    switch (perishability) {
      case 'cooked':
        return 'Cooked / पका हुआ';
      case 'dairy':
        return 'Dairy / डेयरी';
      case 'packaged':
        return 'Packaged / डिब्बाबंद';
      case 'raw':
        return 'Raw Ingredients / कच्चा राशन';
      default:
        return perishability;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Photo Header Panel */}
      <div className="relative rounded-[16px] overflow-hidden border border-[#ACC8E5] min-h-[135px] flex flex-col justify-center shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
        <img
          src="/ngo-header.webp"
          alt="Boxes of packed food"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: 'center' }}
        />
        {/* White fade overlay: soft left-to-right gradient with ~85% white on left where text is and ~55% on right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.72) 45%, rgba(255, 255, 255, 0.55) 100%)',
          }}
        />

        {/* Header Text Content */}
        <div className="relative z-10 px-5 py-5 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black">
              NGO HUB / NGO पोर्टल
            </span>
            <span className="bg-[#ACC8E5] text-black text-xs font-bold px-2.5 py-0.5 rounded-[12px] border border-[#112A46]/20">
              {activeRequests.length} Requests
            </span>
          </div>
          <h1 className="text-xl font-bold text-black tracking-tight">
            New Requests / नए अनुरोध
          </h1>
          <p className="text-xs text-black font-normal">
            Available surplus food requests near you awaiting pickup.
          </p>
        </div>
      </div>

      {/* Empty State when no requests waiting */}
      {activeRequests.length === 0 ? (
        <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-8 text-center space-y-3 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
          <div className="space-y-1">
            <h2 className="font-bold text-black text-base">
              No requests right now / अभी कोई अनुरोध नहीं है
            </h2>
            <p className="text-xs text-black/80 max-w-xs mx-auto">
              New donation requests from nearby kitchens, banquets, and caterers will appear here as soon as they are posted.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {activeRequests.map((req) => {
            const businessName =
              req.donorBusinessName ||
              (req.donorName ? `${req.donorName}'s Kitchen` : 'Taj Caterers & Kitchen');
            const countdownTime = formatCountdown(req.expiresAt);
            const foodSafeTime = formatFoodSafe(req);
            const areaName = req.donorArea || req.donorAddress.split(',')[0].trim() || 'Central Delhi';
            const distance = req.distanceKm ? `${req.distanceKm} km away` : '1.4 km away';
            const packingText =
              req.packingTypes && req.packingTypes.length > 0
                ? req.packingTypes.join(', ')
                : req.packaging || 'Tiffin, Aluminium foil';

            return (
              <div
                key={req.id}
                className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 space-y-4 shadow-[0_4px_14px_rgba(17,42,70,0.08)] flex flex-col justify-between"
              >
                {/* TOP: Donor business name (large) & Timer badge */}
                <div className="flex items-start justify-between gap-3 border-b border-[#ACC8E5] pb-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-black tracking-tight leading-snug">
                      {businessName}
                    </h2>
                    <p className="text-[11px] text-black font-normal mt-0.5">
                      Order ID: <span className="font-bold text-black">{req.id}</span>
                    </p>
                  </div>

                  {/* Timer badge: #FDFD96 background, black text, thin darker-yellow border */}
                  <div className="shrink-0">
                    <span className="bg-[#FDFD96] border border-[#D9D975] text-black text-xs font-bold px-3 py-1.5 rounded-[12px] flex items-center gap-1.5">
                      <Clock size={13} className="text-black" />
                      <span>Accept within {countdownTime}</span>
                    </span>
                  </div>
                </div>

                {/* FOOD DETAILS */}
                <div className="space-y-2 text-xs">
                  {/* Veg / Non-veg tag and food type */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#ACC8E5] text-black border border-[#112A46]/20 text-[11px] font-bold px-2.5 py-1 rounded-[12px]">
                      {req.category === 'pure-veg'
                        ? 'Pure Veg / शुद्ध शाकाहारी'
                        : req.category === 'non-veg'
                        ? 'Non-Veg / मांसाहारी'
                        : 'Egg / अंडा'}
                    </span>

                    <span className="bg-[#ACC8E5] text-black border border-[#112A46]/20 text-[11px] font-bold px-2.5 py-1 rounded-[12px]">
                      {getFoodTypeDisplay(req.perishability)}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="p-3 bg-white rounded-[12px] border border-[#ACC8E5] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                        Quantity / मात्रा
                      </span>
                      <span className="text-sm font-bold text-black">
                        {req.servings} people (~{req.netMassKg} kg)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                        Cooked At / पकाने का समय
                      </span>
                      <span className="text-xs font-bold text-black">
                        {req.cookedAt}
                      </span>
                    </div>
                  </div>

                  {/* Food safe for & Packing */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-[12px] border border-[#ACC8E5]">
                      <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                        Food safe for / सुरक्षित समय
                      </span>
                      <span className="font-bold text-black text-xs mt-0.5 block">
                        {foodSafeTime}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-[12px] border border-[#ACC8E5]">
                      <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                        Packing / पैकिंग
                      </span>
                      <span className="font-bold text-black text-xs mt-0.5 block truncate" title={packingText}>
                        {packingText}
                      </span>
                    </div>
                  </div>

                  {/* Note from donor (only if written) */}
                  {req.donorNote && (
                    <div className="p-2.5 bg-[#FDFD96] border border-[#D9D975] rounded-[12px] text-black text-xs">
                      <span className="font-bold text-black">Note from donor: </span>
                      <span>{req.donorNote}</span>
                    </div>
                  )}
                </div>

                {/* PICKUP DETAILS */}
                <div className="space-y-2 border-t border-[#ACC8E5] pt-3 text-xs">
                  <div className="flex items-center justify-between bg-white p-3 rounded-[12px] border border-[#ACC8E5]">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-black shrink-0" />
                      <div>
                        <span className="font-bold text-black text-xs block">
                          {areaName} ({distance})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Full address, landmark, contact person and phone number hidden notice */}
                  <div className="bg-[#FDFD96] border border-[#D9D975] rounded-[12px] p-2.5 text-center">
                    <span className="text-xs font-bold text-black">
                      Full address, landmark, and contact:
                    </span>{' '}
                    <span className="text-xs font-bold text-black block sm:inline">
                      Shown after you accept / स्वीकार करने के बाद दिखेगा
                    </span>
                  </div>
                </div>

                {/* BOTTOM OF THE CARD */}
                <div className="space-y-3 pt-1 border-t border-[#ACC8E5]">
                  <p className="text-[11px] text-black font-normal leading-relaxed">
                    Accept this order? If no NGO accepts in 10 minutes, this request will be cancelled. / क्या आप यह ऑर्डर स्वीकार करेंगे? 10 मिनट में कोई स्वीकार नहीं करेगा तो यह अनुरोध रद्द हो जाएगा।
                  </p>

                  <div className="flex items-center gap-2.5">
                    {/* Main button: Accept Order (#112A46 background, white text) */}
                    <button
                      onClick={() => onAcceptRequest(req.id)}
                      className="flex-1 bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-bold text-xs py-3 px-4 rounded-[12px] transition-all cursor-pointer text-center shadow-[0_6px_16px_rgba(17,42,70,0.25)]"
                    >
                      <span>Accept Order / ऑर्डर स्वीकार करें</span>
                    </button>

                    {/* Secondary button: Not Now (white background, #112A46 border and text) */}
                    <button
                      onClick={() => handleDismiss(req.id)}
                      className="bg-white hover:bg-[#ACC8E5]/10 border border-[#112A46] text-[#112A46] font-bold text-xs py-3 px-4 rounded-[12px] transition-colors cursor-pointer text-center"
                    >
                      <span>Not Now / अभी नहीं</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
