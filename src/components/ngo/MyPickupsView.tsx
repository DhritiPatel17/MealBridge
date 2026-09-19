import React, { useRef, useState, useEffect } from 'react';
import { DonationRecord } from '../../services/donationStore';
import { UserProfile } from '../auth/AuthPortal';
import { ThankYouModal } from '../modals/ThankYouModal';
import {
  Phone,
  MapPin,
  ExternalLink,
  Camera,
  Check,
  Clock,
  Package,
  Utensils,
  CheckCircle2,
} from 'lucide-react';

interface MyPickupsViewProps {
  pickups: DonationRecord[];
  currentUser: UserProfile | null;
  onMarkPickedUp: (id: string) => void;
  onMarkDelivered: (id: string) => void;
  onUploadPhoto: (id: string, photoUrl: string) => void;
  onNgoDone: (id: string) => void;
  onCallDonor?: (name: string, phone: string) => void;
  onGoToProfile?: () => void;
}

export const MyPickupsView: React.FC<MyPickupsViewProps> = ({
  pickups,
  currentUser,
  onMarkPickedUp,
  onMarkDelivered,
  onUploadPhoto,
  onNgoDone,
  onCallDonor,
  onGoToProfile,
}) => {
  const [activePhotoUploadId, setActivePhotoUploadId] = useState<string | null>(null);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update live clock every 10 seconds for countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activePhotoUploadId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUploadPhoto(activePhotoUploadId, reader.result as string);
        setActivePhotoUploadId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (id: string) => {
    setActivePhotoUploadId(id);
    fileInputRef.current?.click();
  };

  const handleDoneStep = (id: string) => {
    onNgoDone(id);
    // Check if thank-you popup already shown for this order
    const hasSeen = localStorage.getItem(`mealbridge_ngo_thanked_${id}`);
    if (!hasSeen) {
      localStorage.setItem(`mealbridge_ngo_thanked_${id}`, 'true');
      setShowThankYouModal(true);
    }
  };

  const hasAddress = Boolean(currentUser?.address && currentUser.address.trim().length > 0);
  const ngoMapUrl = currentUser?.latitude && currentUser?.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${currentUser.latitude},${currentUser.longitude}`
    : hasAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentUser!.address!)}`
    : null;

  // Active pickups: accepted or picked_up or delivered but not yet marked ngoDone
  const activePickups = pickups.filter(
    (p) => !p.ngoDone && p.status !== 'cancelled' && (p.status === 'accepted' || p.status === 'picked_up' || p.status === 'delivered')
  );

  // Completed pickups: marked ngoDone or delivered & done
  const completedPickups = pickups.filter(
    (p) => p.ngoDone || (p.status === 'delivered' && p.ngoDone)
  );

  // Helper to format countdown
  const getSafeCountdown = (item: DonationRecord) => {
    if (item.safeUntilTimestamp) {
      const diffMs = item.safeUntilTimestamp - now;
      if (diffMs <= 0) return 'Expired / समय समाप्त';
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) {
        return `${hours} hr ${mins} min left (until ${item.safeUntil})`;
      }
      return `${mins} min left (until ${item.safeUntil})`;
    }
    return `Safe until ${item.safeUntil}`;
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Hidden File Input for Proof Photos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={showThankYouModal}
        onClose={() => setShowThankYouModal(false)}
        type="ngo"
      />

      {/* Photo Header Panel */}
      <div className="relative rounded-[16px] overflow-hidden border border-[#ACC8E5] min-h-[135px] flex flex-col justify-center shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
        <img
          src="/ngo-header.webp"
          alt="Boxes of packed food"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: 'center' }}
        />
        {/* White fade overlay: soft left-to-right gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.72) 45%, rgba(255, 255, 255, 0.55) 100%)',
          }}
        />

        {/* Header Text Content */}
        <div className="relative z-10 px-5 py-5 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black">
              NGO HUB / NGO पोर्टल
            </span>
            <span className="bg-[#ACC8E5] text-black text-xs font-bold px-2.5 py-0.5 rounded-[12px] border border-[#112A46]/20">
              {activePickups.length} Active Pickups
            </span>
          </div>
          <h1 className="text-xl font-bold text-black tracking-tight">
            My Pickups / मेरे पिकअप
          </h1>
          <p className="text-xs text-black font-normal">
            Orders you have accepted and their step-by-step progress.
          </p>
        </div>
      </div>

      {/* Our address / हमारा पता box */}
      <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-4 flex items-start justify-between gap-2 text-xs shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-black shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-black">Our address / हमारा पता: </span>
            {hasAddress ? (
              <span className="text-black font-normal">{currentUser!.address}</span>
            ) : (
              <span className="text-black font-normal">
                Not set yet.{' '}
                {onGoToProfile && (
                  <button
                    onClick={onGoToProfile}
                    className="underline font-bold text-[#112A46] cursor-pointer"
                  >
                    Add in Profile / प्रोफ़ाइल में दर्ज करें
                  </button>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Show Google Maps button ONLY when an address exists */}
        {hasAddress && ngoMapUrl && (
          <a
            href={ngoMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-[#112A46] text-[#112A46] text-[11px] font-bold px-2.5 py-1 rounded-[12px] flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Google Maps</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      {/* Active Pickups or Empty State */}
      {activePickups.length === 0 && completedPickups.length === 0 ? (
        <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-8 text-center space-y-3 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
          <div className="space-y-1">
            <h2 className="font-bold text-black text-base">
              No active pickups / कोई सक्रिय पिकअप नहीं है
            </h2>
            <p className="text-xs text-black/80 max-w-xs mx-auto">
              You have not accepted any orders yet. Go to "New Requests" to accept food donations in your area.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {activePickups.map((item) => {
            const donorMapUrl = typeof item.latitude === 'number' && typeof item.longitude === 'number'
              ? `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`
              : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.donorAddress)}`;
            const businessName =
              item.donorBusinessName ||
              (item.donorName ? `${item.donorName}'s Kitchen` : 'Food Donor Kitchen');

            return (
              <div key={item.id} className="space-y-3">
                {/* ---------------- CARD 1: ORDER DETAILS (Always Visible) ---------------- */}
                <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 space-y-4 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
                  {/* Header: Business name & Order ID */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#ACC8E5] pb-3">
                    <div>
                      <h2 className="text-base font-bold text-black tracking-tight">
                        {businessName}
                      </h2>
                      <p className="text-[11px] text-black font-normal mt-0.5">
                        Order ID: <span className="font-bold text-black">{item.id}</span>
                      </p>
                    </div>

                    <span className="text-[11px] bg-[#ACC8E5] text-black px-2.5 py-0.5 rounded-[12px] font-bold border border-[#112A46]/20">
                      {item.category === 'pure-veg'
                        ? 'Pure Veg / शाकाहारी'
                        : item.category === 'non-veg'
                        ? 'Non-Veg / मांसाहारी'
                        : 'Mixed / मिश्रित'}
                    </span>
                  </div>

                  {/* Donor Contact & Address */}
                  <div className="space-y-3 text-xs">
                    {/* Contact Person & Call Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                          Contact Person / संपर्क व्यक्ति
                        </span>
                        <span className="text-sm font-bold text-black">
                          {item.donorName}
                        </span>
                        {item.donorPhone && (
                          <span className="text-xs text-black block mt-0.5 font-normal">
                            {item.donorPhone}
                          </span>
                        )}
                      </div>

                      {item.donorPhone && (
                        <button
                          onClick={() => {
                            if (onCallDonor) {
                              onCallDonor(item.donorName, item.donorPhone);
                            } else {
                              window.location.href = `tel:${item.donorPhone}`;
                            }
                          }}
                          className="bg-[#112A46] text-white text-xs font-bold px-3.5 py-2 rounded-[12px] flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                        >
                          <Phone size={13} />
                          <span>Call / कॉल करें</span>
                        </button>
                      )}
                    </div>

                    {/* Full Address & Landmark */}
                    <div className="border-t border-[#ACC8E5] pt-2.5 space-y-1.5">
                      <div className="flex items-start gap-1.5">
                        <MapPin size={15} className="text-black shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-bold text-black">Full Pickup Address: </span>
                          <span className="text-black font-normal">{item.donorAddress}</span>
                          {item.landmark && (
                            <div className="text-black mt-0.5">
                              <span className="font-bold text-black">Landmark: </span>
                              <span className="font-normal">{item.landmark}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Open in Google Maps Link */}
                      <div className="pt-1">
                        <a
                          href={donorMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#112A46] bg-white border border-[#112A46] px-3 py-1.5 rounded-[12px] cursor-pointer"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Food Overview: Quantity, Cooked Time, Packing */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#ACC8E5]">
                    <div className="p-2.5 bg-white rounded-[12px] border border-[#ACC8E5]">
                      <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                        Quantity / मात्रा
                      </span>
                      <span className="font-bold text-black text-xs mt-0.5 block">
                        {item.servings} people (~{item.netMassKg} kg)
                      </span>
                      <span className="text-[11px] text-black font-normal capitalize block mt-0.5">
                        {item.perishability} • {item.packingTypes?.join(', ') || item.packaging}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-[12px] border border-[#ACC8E5]">
                      <span className="text-[10px] font-bold text-black uppercase tracking-wider block">
                        Food Safe For / सुरक्षित समय
                      </span>
                      <span className="font-bold text-black text-xs mt-0.5 block flex items-center gap-1">
                        <Clock size={12} className="text-black shrink-0" />
                        <span>{getSafeCountdown(item)}</span>
                      </span>
                      {item.cookedAt && (
                        <span className="text-[11px] text-black font-normal block mt-0.5">
                          Cooked at: {item.cookedAt}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Donor's Note */}
                  {item.donorNote && (
                    <div className="p-2.5 bg-[#FDFD96] rounded-[12px] border border-[#D9D975] text-xs text-black">
                      <span className="font-bold text-black">Donor's Note: </span>
                      <span className="font-normal">{item.donorNote}</span>
                    </div>
                  )}
                </div>

                {/* ---------------- CARD 2: STATUS TRACKER (Accepted → Picked up → Delivered) ---------------- */}
                <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-4 space-y-2.5 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-black">
                    Status Tracker / स्थिति ट्रैकर
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {/* Step 1: Accepted */}
                    <div
                      className={`p-2.5 rounded-[12px] border flex flex-col items-center justify-between ${
                        item.status === 'accepted'
                          ? 'bg-[#FDFD96] border-[#D9D975] text-black font-bold'
                          : 'bg-[#ACC8E5]/30 border-[#ACC8E5] text-black'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mb-1 bg-white border border-[#112A46]/20">
                        {item.status === 'picked_up' || item.status === 'delivered' ? (
                          <Check size={12} className="text-black font-black" />
                        ) : (
                          '1'
                        )}
                      </div>
                      <span className="text-[11px] font-bold">Accepted</span>
                      <span className="text-[10px] text-stone-600 font-normal mt-0.5">
                        {item.acceptedAt || 'Done'}
                      </span>
                    </div>

                    {/* Step 2: Picked up */}
                    <div
                      className={`p-2.5 rounded-[12px] border flex flex-col items-center justify-between ${
                        item.status === 'picked_up'
                          ? 'bg-[#FDFD96] border-[#D9D975] text-black font-bold'
                          : item.status === 'delivered'
                          ? 'bg-[#ACC8E5]/30 border-[#ACC8E5] text-black'
                          : 'bg-stone-50 border-stone-200 text-stone-400'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mb-1 border ${
                          item.status === 'delivered'
                            ? 'bg-white border-[#112A46]/20 text-black'
                            : item.status === 'picked_up'
                            ? 'bg-white border-[#112A46] text-black'
                            : 'bg-stone-100 border-stone-300 text-stone-400'
                        }`}
                      >
                        {item.status === 'delivered' ? (
                          <Check size={12} className="text-black font-black" />
                        ) : (
                          '2'
                        )}
                      </div>
                      <span className="text-[11px] font-bold">Picked up</span>
                      <span className="text-[10px] font-normal mt-0.5">
                        {item.pickedUpAt || '—'}
                      </span>
                    </div>

                    {/* Step 3: Delivered */}
                    <div
                      className={`p-2.5 rounded-[12px] border flex flex-col items-center justify-between ${
                        item.status === 'delivered'
                          ? 'bg-[#FDFD96] border-[#D9D975] text-black font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-400'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mb-1 border ${
                          item.status === 'delivered'
                            ? 'bg-white border-[#112A46] text-black'
                            : 'bg-stone-100 border-stone-300 text-stone-400'
                        }`}
                      >
                        {item.status === 'delivered' ? (
                          <Check size={12} className="text-black font-black" />
                        ) : (
                          '3'
                        )}
                      </div>
                      <span className="text-[11px] font-bold">Delivered</span>
                      <span className="text-[10px] font-normal mt-0.5">
                        {item.deliveredAt || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ---------------- CARD 3: ACTION CARD (One step at a time) ---------------- */}
                <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 space-y-3 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-black">
                    Action Step / अगला चरण
                  </div>

                  {/* Step A: After accepting (Status = 'accepted') */}
                  {item.status === 'accepted' && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-black">
                        Have you picked up the order? / क्या आपने ऑर्डर उठा लिया?
                      </p>
                      <button
                        onClick={() => onMarkPickedUp(item.id)}
                        className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-bold text-xs py-3.5 px-4 rounded-[12px] transition-all cursor-pointer text-center shadow-[0_6px_16px_rgba(17,42,70,0.25)]"
                      >
                        Yes, Picked Up / हाँ, उठा लिया
                      </button>
                    </div>
                  )}

                  {/* Step B: After picking up (Status = 'picked_up') */}
                  {item.status === 'picked_up' && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-black">
                        Have you delivered the food? / क्या आपने खाना बाँट दिया?
                      </p>
                      <button
                        onClick={() => onMarkDelivered(item.id)}
                        className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-bold text-xs py-3.5 px-4 rounded-[12px] transition-all cursor-pointer text-center shadow-[0_6px_16px_rgba(17,42,70,0.25)]"
                      >
                        Yes, Delivered / हाँ, बाँट दिया
                      </button>
                    </div>
                  )}

                  {/* Step C: After delivering (Status = 'delivered' and not ngoDone) */}
                  {item.status === 'delivered' && (
                    <div className="space-y-3.5">
                      <p className="text-xs font-bold text-black">
                        Upload a photo (optional) / फोटो डालें (वैकल्पिक)
                      </p>

                      {/* Photo preview if uploaded */}
                      {item.deliveryProofPhoto ? (
                        <div className="space-y-2">
                          <img
                            src={item.deliveryProofPhoto}
                            alt="Delivery Proof"
                            className="w-full h-44 object-cover rounded-[12px] border border-[#ACC8E5]"
                          />
                          <button
                            onClick={() => triggerUpload(item.id)}
                            className="w-full bg-white border border-[#112A46] text-[#112A46] font-bold text-xs py-2 px-3 rounded-[12px] flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Camera size={13} />
                            <span>Change Photo / फोटो बदलें</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => triggerUpload(item.id)}
                          className="w-full bg-white border border-[#112A46] text-[#112A46] font-bold text-xs py-3 px-4 rounded-[12px] flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Camera size={14} />
                          <span>Upload photo / फोटो डालें</span>
                        </button>
                      )}

                      {/* Done button */}
                      <button
                        onClick={() => handleDoneStep(item.id)}
                        className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-bold text-xs py-3.5 px-4 rounded-[12px] transition-all cursor-pointer text-center shadow-[0_6px_16px_rgba(17,42,70,0.25)]"
                      >
                        Done / पूरा हुआ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* ---------------- COMPLETED PICKUPS SECTION ---------------- */}
          {completedPickups.length > 0 && (
            <div className="pt-4 space-y-3">
              <div>
                <h2 className="text-sm font-bold text-[#112A46]">
                  Completed Pickups / पूरे हुए पिकअप ({completedPickups.length})
                </h2>
                <div className="w-10 h-1 bg-[#FDFD96] rounded-full mt-1.5" />
              </div>

              <div className="space-y-3">
                {completedPickups.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#ACC8E5] rounded-[16px] p-4 space-y-3 shadow-[0_4px_14px_rgba(17,42,70,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-[#ACC8E5] pb-2.5">
                      <div>
                        <h3 className="text-sm font-bold text-black">
                          {item.donorBusinessName || item.donorName}
                        </h3>
                        <p className="text-[11px] text-stone-600 font-normal mt-0.5">
                          Order ID: <span className="font-bold text-black">{item.id}</span>
                          {item.deliveredAt && <span> • Delivered at {item.deliveredAt}</span>}
                        </p>
                      </div>
                      <span className="bg-[#ACC8E5] text-black text-[11px] font-bold px-2.5 py-0.5 rounded-[12px] border border-[#112A46]/20 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Completed
                      </span>
                    </div>

                    <div className="text-xs text-black space-y-1">
                      <div>
                        <span className="font-bold">Quantity: </span>
                        <span>{item.servings} people ({item.netMassKg} kg)</span>
                      </div>
                      <div>
                        <span className="font-bold">Address: </span>
                        <span>{item.donorAddress}</span>
                      </div>
                    </div>

                    {item.deliveryProofPhoto ? (
                      <div className="pt-2 border-t border-[#ACC8E5]">
                        <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-1">
                          Uploaded Delivery Photo:
                        </span>
                        <img
                          src={item.deliveryProofPhoto}
                          alt="Delivery Proof"
                          className="w-full h-36 object-cover rounded-[12px] border border-[#ACC8E5]"
                        />
                      </div>
                    ) : (
                      <div className="pt-1 text-[11px] text-stone-500 italic">
                        No photo uploaded for this delivery.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
