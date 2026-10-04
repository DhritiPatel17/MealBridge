import React, { useRef, useState, useEffect } from 'react';
import { DonationRecord, donationStore } from '../../services/donationStore';
import { UserProfile } from '../auth/AuthPortal';
import { ThankYouModal } from '../modals/ThankYouModal';
import {
  generateRoutePoints,
  calculateDistanceKm,
  calculateEtaMinutes,
  VADODARA_CENTRAL,
  VADODARA_COMMUNITY_SHELTER,
  LatLng,
} from '../../utils/geoTracking';
import {
  Phone,
  MapPin,
  ExternalLink,
  Camera,
  Check,
  Clock,
  Package,
  CheckCircle2,
  Navigation,
  Play,
  Square,
  Radio,
  Building2,
  Sparkles,
} from 'lucide-react';

interface MyPickupsViewProps {
  pickups: DonationRecord[];
  currentUser: UserProfile | null;
  onStartTrip?: (id: string) => void;
  onReachedPickup?: (id: string) => void;
  onMarkPickedUp?: (id: string, photoUrl?: string) => void;
  onStartDelivery?: (id: string) => void;
  onMarkDelivered?: (id: string, photoUrl?: string) => void;
  onUploadPhoto?: (id: string, photoUrl: string) => void;
  onNgoDone?: (id: string) => void;
  onCallDonor?: (name: string, phone: string) => void;
  onGoToProfile?: () => void;
}

export const MyPickupsView: React.FC<MyPickupsViewProps> = ({
  pickups,
  currentUser,
  onStartTrip,
  onReachedPickup,
  onMarkPickedUp,
  onStartDelivery,
  onMarkDelivered,
  onUploadPhoto,
  onNgoDone,
  onCallDonor,
  onGoToProfile,
}) => {
  const [activePhotoUpload, setActivePhotoUpload] = useState<{
    id: string;
    type: 'pickup' | 'delivery';
  } | null>(null);

  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  const [simulatingIds, setSimulatingIds] = useState<Record<string, boolean>>({});
  const [simulationProgress, setSimulationProgress] = useState<Record<string, number>>({});
  const [liveGpsActive, setLiveGpsActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const simulationTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const watchPositionIdRef = useRef<number | null>(null);

  // Update live clock every 10 seconds for countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Active pickups
  const activePickups = pickups.filter(
    (p) =>
      !p.ngoDone &&
      p.status !== 'cancelled' &&
      [
        'accepted',
        'on_the_way_pickup',
        'reached_donor',
        'picked_up',
        'on_the_way_delivery',
        'delivered',
      ].includes(p.status)
  );

  // Completed pickups
  const completedPickups = pickups.filter(
    (p) => p.ngoDone || (p.status === 'delivered' && p.ngoDone)
  );

  // Real Browser Geolocation Tracking while trip is active
  useEffect(() => {
    const hasActiveTrip = activePickups.some((p) =>
      ['accepted', 'on_the_way_pickup', 'on_the_way_delivery'].includes(p.status)
    );

    if (hasActiveTrip && 'geolocation' in navigator) {
      setLiveGpsActive(true);
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          activePickups.forEach((item) => {
            if (['accepted', 'on_the_way_pickup', 'on_the_way_delivery'].includes(item.status)) {
              const targetLat =
                item.status === 'on_the_way_delivery'
                  ? VADODARA_COMMUNITY_SHELTER.lat
                  : item.latitude || VADODARA_CENTRAL.lat;
              const targetLng =
                item.status === 'on_the_way_delivery'
                  ? VADODARA_COMMUNITY_SHELTER.lng
                  : item.longitude || VADODARA_CENTRAL.lng;

              const dist = calculateDistanceKm(
                { lat: latitude, lng: longitude },
                { lat: targetLat, lng: targetLng }
              );
              const eta = calculateEtaMinutes(dist);

              donationStore.updateLiveLocation(item.id, latitude, longitude, dist, eta);
            }
          });
        },
        (err) => {
          console.warn('Geolocation access warning:', err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );
      watchPositionIdRef.current = watchId;
    } else {
      setLiveGpsActive(false);
      if (watchPositionIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
        watchPositionIdRef.current = null;
      }
    }

    return () => {
      if (watchPositionIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
        watchPositionIdRef.current = null;
      }
    };
  }, [activePickups.length]);

  // Clean up any running simulation intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(simulationTimersRef.current).forEach((t) => clearInterval(t));
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activePhotoUpload) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        if (activePhotoUpload.type === 'pickup') {
          donationStore.updatePickupProofPhoto(activePhotoUpload.id, photoUrl);
        } else {
          donationStore.updateDeliveryProofPhoto(activePhotoUpload.id, photoUrl);
        }
        if (onUploadPhoto) {
          onUploadPhoto(activePhotoUpload.id, photoUrl);
        }
        setActivePhotoUpload(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (id: string, type: 'pickup' | 'delivery') => {
    setActivePhotoUpload({ id, type });
    fileInputRef.current?.click();
  };

  // Step 1: Start Trip (NGO begins driving to donor location)
  const handleStartTrip = (id: string) => {
    if (onStartTrip) {
      onStartTrip(id);
    } else {
      donationStore.startTrip(id);
    }
  };

  // Step 2: Reached Pickup (NGO reached donor spot)
  const handleReachedPickup = (id: string) => {
    // Stop simulation if running
    stopSimulation(id);
    if (onReachedPickup) {
      onReachedPickup(id);
    } else {
      donationStore.markReachedDonor(id);
    }
  };

  // Step 3: Food Picked Up (requires/uploads pickup photo)
  const handleMarkPickedUp = (item: DonationRecord) => {
    if (!item.pickupProofPhoto) {
      triggerUpload(item.id, 'pickup');
      return;
    }
    if (onMarkPickedUp) {
      onMarkPickedUp(item.id, item.pickupProofPhoto);
    } else {
      donationStore.markPickedUp(item.id, item.pickupProofPhoto);
    }
  };

  // Step 4: Start Delivery (NGO begins driving to community shelter)
  const handleStartDelivery = (id: string) => {
    if (onStartDelivery) {
      onStartDelivery(id);
    } else {
      donationStore.startDelivery(id);
    }
  };

  // Step 5: Delivered (requires/uploads delivery photo)
  const handleMarkDelivered = (item: DonationRecord) => {
    // Stop simulation if running
    stopSimulation(item.id);
    if (!item.deliveryProofPhoto) {
      triggerUpload(item.id, 'delivery');
      return;
    }
    if (onMarkDelivered) {
      onMarkDelivered(item.id, item.deliveryProofPhoto);
    } else {
      donationStore.markDelivered(item.id, item.deliveryProofPhoto);
    }
  };

  // Step 6: Mark Done
  const handleDoneStep = (id: string) => {
    stopSimulation(id);
    if (onNgoDone) {
      onNgoDone(id);
    } else {
      donationStore.markNgoDone(id);
    }
    const hasSeen = localStorage.getItem(`mealbridge_ngo_thanked_${id}`);
    if (!hasSeen) {
      localStorage.setItem(`mealbridge_ngo_thanked_${id}`, 'true');
      setShowThankYouModal(true);
    }
  };

  // Simulate movement along the route for jury demo
  const startSimulation = (item: DonationRecord) => {
    if (simulatingIds[item.id]) {
      stopSimulation(item.id);
      return;
    }

    const isDeliveryTrip = item.status === 'on_the_way_delivery';
    const startPoint: LatLng = {
      lat: item.liveNgoLat || (isDeliveryTrip ? (item.latitude || VADODARA_CENTRAL.lat) : (item.latitude || VADODARA_CENTRAL.lat) + 0.02),
      lng: item.liveNgoLng || (isDeliveryTrip ? (item.longitude || VADODARA_CENTRAL.lng) : (item.longitude || VADODARA_CENTRAL.lng) - 0.015),
    };

    const targetPoint: LatLng = isDeliveryTrip
      ? VADODARA_COMMUNITY_SHELTER
      : { lat: item.latitude || VADODARA_CENTRAL.lat, lng: item.longitude || VADODARA_CENTRAL.lng };

    const waypoints = generateRoutePoints(startPoint, targetPoint, 30);
    let currentIdx = 0;

    setSimulatingIds((prev) => ({ ...prev, [item.id]: true }));
    donationStore.setSimulatingMovement(item.id, true);

    const timer = setInterval(() => {
      if (currentIdx >= waypoints.length) {
        clearInterval(timer);
        delete simulationTimersRef.current[item.id];
        setSimulatingIds((prev) => ({ ...prev, [item.id]: false }));
        donationStore.setSimulatingMovement(item.id, false);

        // If completed pickup route, auto trigger reached
        if (item.status === 'on_the_way_pickup') {
          handleReachedPickup(item.id);
        }
        return;
      }

      const point = waypoints[currentIdx];
      const dist = calculateDistanceKm(point, targetPoint);
      const eta = calculateEtaMinutes(dist);

      donationStore.updateLiveLocation(item.id, point.lat, point.lng, dist, eta);
      setSimulationProgress((prev) => ({
        ...prev,
        [item.id]: Math.round((currentIdx / (waypoints.length - 1)) * 100),
      }));

      currentIdx++;
    }, 700); // 700ms step for smooth realistic demo movement

    simulationTimersRef.current[item.id] = timer;
  };

  const stopSimulation = (id: string) => {
    if (simulationTimersRef.current[id]) {
      clearInterval(simulationTimersRef.current[id]);
      delete simulationTimersRef.current[id];
    }
    setSimulatingIds((prev) => ({ ...prev, [id]: false }));
    donationStore.setSimulatingMovement(id, false);
  };

  const hasAddress = Boolean(currentUser?.address && currentUser.address.trim().length > 0);
  const ngoMapUrl = currentUser?.latitude && currentUser?.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${currentUser.latitude},${currentUser.longitude}`
    : hasAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentUser!.address!)}`
    : null;

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

  // Helper to render the 6 status steps in Card 2
  const renderStatusStepper = (item: DonationRecord) => {
    const steps = [
      { key: 'accepted', label: 'Accepted', hindi: 'स्वीकृत', time: item.acceptedAt },
      { key: 'on_the_way_pickup', label: 'On Way', hindi: 'रास्ते में', time: item.onTheWayPickupAt },
      { key: 'reached_donor', label: 'Reached', hindi: 'पहुंचे', time: item.reachedDonorAt },
      { key: 'picked_up', label: 'Picked Up', hindi: 'उठा लिया', time: item.pickedUpAt },
      { key: 'on_the_way_delivery', label: 'Delivering', hindi: 'वितरण जारी', time: item.onTheWayDeliveryAt },
      { key: 'delivered', label: 'Delivered', hindi: 'वितरित', time: item.deliveredAt },
    ];

    const stepKeys = ['accepted', 'on_the_way_pickup', 'reached_donor', 'picked_up', 'on_the_way_delivery', 'delivered'];
    const currentIdx = stepKeys.indexOf(item.status);

    return (
      <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-4 space-y-2.5 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#112A46]">
            TRIP STATUS / यात्रा स्थिति
          </span>
          {simulatingIds[item.id] && (
            <span className="text-[10px] bg-[#FDFD96] border border-[#D9D975] text-[#112A46] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              Simulation Active ({simulationProgress[item.id] || 0}%)
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-xs">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx || (idx === currentIdx && item.status === 'delivered');
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={step.key}
                className={`p-2 rounded-[10px] border flex flex-col items-center justify-between min-h-[64px] ${
                  isCurrent
                    ? 'bg-[#FDFD96] border-[#D9D975] text-black font-bold'
                    : isCompleted
                    ? 'bg-[#ACC8E5]/30 border-[#ACC8E5] text-black'
                    : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 border ${
                    isCompleted
                      ? 'bg-white border-[#112A46]/20 text-black'
                      : isCurrent
                      ? 'bg-white border-[#112A46] text-black'
                      : 'bg-stone-100 border-stone-300 text-stone-400'
                  }`}
                >
                  {isCompleted ? <Check size={11} className="text-black font-black" /> : idx + 1}
                </div>
                <span className="text-[10px] font-bold leading-tight truncate w-full">{step.label}</span>
                <span className="text-[8.5px] text-stone-600 font-normal truncate w-full mt-0.5">
                  {step.time || '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
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
        {/* White fade overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.75) 45%, rgba(255, 255, 255, 0.58) 100%)',
          }}
        />

        {/* Header Text Content */}
        <div className="relative z-10 px-5 py-5 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black">
              NGO HUB / NGO पोर्टल
            </span>
            <div className="flex items-center gap-2">
              {liveGpsActive && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Live GPS Sharing
                </span>
              )}
              <span className="bg-[#ACC8E5] text-black text-xs font-bold px-2.5 py-0.5 rounded-[12px] border border-[#112A46]/20">
                {activePickups.length} Active Pickups
              </span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-black tracking-tight">
            My Pickups / मेरे पिकअप
          </h1>
          <p className="text-xs text-black font-normal">
            Orders you have accepted with live GPS tracking and photo proof verification.
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
            const donorMapUrl =
              typeof item.latitude === 'number' && typeof item.longitude === 'number'
                ? `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`
                : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.donorAddress)}`;
            const businessName =
              item.donorBusinessName ||
              (item.donorName ? `${item.donorName}'s Kitchen` : 'Food Donor Kitchen');

            const isSimulating = Boolean(simulatingIds[item.id]);

            return (
              <div
                key={item.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start bg-stone-50/50 p-2 sm:p-4 rounded-[20px] border border-[#ACC8E5]/40"
              >
                {/* ---------------- LEFT COLUMN: ORDER DETAILS (lg:col-span-7) ---------------- */}
                <div className="lg:col-span-7 bg-white border border-[#ACC8E5] rounded-[16px] p-5 space-y-4 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
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

                  {/* Jury Demo Simulation Control */}
                  {['accepted', 'on_the_way_pickup', 'on_the_way_delivery'].includes(item.status) && (
                    <div className="p-3 bg-[#FAF9DE] rounded-[12px] border border-[#D9D975] flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#112A46]">
                          <Navigation size={13} className="text-[#112A46]" />
                          <span>Jury Live Demo / लाइव डेमो</span>
                        </div>
                        <p className="text-[10px] text-stone-600">
                          Auto-move vehicle along the route in real-time
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => startSimulation(item)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-[10px] flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isSimulating
                            ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                            : 'bg-[#112A46] text-white border-[#112A46] hover:bg-[#0c1e33]'
                        }`}
                      >
                        {isSimulating ? (
                          <>
                            <Square size={12} className="fill-rose-800" />
                            <span>Stop Simulation</span>
                          </>
                        ) : (
                          <>
                            <Play size={12} className="fill-white" />
                            <span>Simulate Movement</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* ---------------- RIGHT COLUMN: STATUS & SINGLE DYNAMIC BIG BUTTON (lg:col-span-5) ---------------- */}
                <div className="lg:col-span-5 space-y-3">
                  {/* CARD 2: 6-STEP STATUS TRACKER */}
                  {renderStatusStepper(item)}

                  {/* CARD 3: NGO SINGLE DYNAMIC BIG ACTION BUTTON */}
                  <div className="bg-white border border-[#ACC8E5] rounded-[16px] p-5 space-y-4 shadow-[0_4px_14px_rgba(17,42,70,0.08)]">
                    <div className="flex items-center justify-between border-b border-[#ACC8E5]/40 pb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-black">
                        ACTION STEP / अगला चरण
                      </span>
                      <span className="text-xs font-bold text-[#112A46]">
                        {item.status === 'accepted' && 'Step 1 of 5'}
                        {item.status === 'on_the_way_pickup' && 'Step 2 of 5'}
                        {item.status === 'reached_donor' && 'Step 3 of 5'}
                        {item.status === 'picked_up' && 'Step 4 of 5'}
                        {item.status === 'on_the_way_delivery' && 'Step 5 of 5'}
                        {item.status === 'delivered' && 'Delivered ✓'}
                      </span>
                    </div>

                    {/* Step 1: Status === 'accepted' -> 'Start Trip' */}
                    {item.status === 'accepted' && (
                      <div className="space-y-3">
                        <p className="text-xs text-stone-700">
                          Ready to pick up? Start your trip so the donor can track your vehicle on the live map.
                        </p>
                        <button
                          onClick={() => handleStartTrip(item.id)}
                          className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-extrabold text-sm py-4 px-4 rounded-[12px] transition-all cursor-pointer text-center shadow-[0_6px_16px_rgba(17,42,70,0.25)] flex items-center justify-center gap-2"
                        >
                          <Navigation size={16} />
                          <span>Start Trip / यात्रा शुरू करें</span>
                        </button>
                      </div>
                    )}

                    {/* Step 2: Status === 'on_the_way_pickup' -> 'Reached Pickup' */}
                    {item.status === 'on_the_way_pickup' && (
                      <div className="space-y-3">
                        <p className="text-xs text-stone-700">
                          Vehicle in transit to {item.donorName}. Click when you have arrived at the pickup location.
                        </p>
                        <button
                          onClick={() => handleReachedPickup(item.id)}
                          className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-extrabold text-sm py-4 px-4 rounded-[12px] transition-all cursor-pointer text-center shadow-[0_6px_16px_rgba(17,42,70,0.25)] flex items-center justify-center gap-2"
                        >
                          <MapPin size={16} />
                          <span>Reached Pickup / पिकअप स्थान पर पहुंचे</span>
                        </button>
                      </div>
                    )}

                    {/* Step 3: Status === 'reached_donor' -> 'Picked Up' (Required Photo Proof) */}
                    {item.status === 'reached_donor' && (
                      <div className="space-y-3.5">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-black">
                            Take photo proof and confirm pickup:
                          </p>
                          <p className="text-[11px] text-stone-600">
                            A photo of packed food packages is required before departing.
                          </p>
                        </div>

                        {/* Pickup Photo Upload / Preview */}
                        {item.pickupProofPhoto ? (
                          <div className="space-y-2">
                            <div className="relative rounded-[12px] overflow-hidden border border-[#ACC8E5] h-36">
                              <img
                                src={item.pickupProofPhoto}
                                alt="Pickup proof"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check size={11} /> Photo Verified
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => triggerUpload(item.id, 'pickup')}
                              className="w-full bg-white border border-[#112A46] text-[#112A46] font-bold text-xs py-2 px-3 rounded-[12px] flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Camera size={13} />
                              <span>Change Photo / फोटो बदलें</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => triggerUpload(item.id, 'pickup')}
                            className="w-full bg-[#FAF9DE] border-2 border-dashed border-[#D9D975] text-[#112A46] font-bold text-xs py-4 px-4 rounded-[12px] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#FDFD96]/40"
                          >
                            <Camera size={16} />
                            <span>Take / Upload Pickup Photo (Required) *</span>
                          </button>
                        )}

                        {/* Big Picked Up Button */}
                        <button
                          onClick={() => handleMarkPickedUp(item)}
                          className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-extrabold text-sm py-4 px-4 rounded-[12px] transition-all cursor-pointer text-center shadow-[0_6px_16px_rgba(17,42,70,0.25)] flex items-center justify-center gap-2"
                        >
                          <Package size={16} />
                          <span>Picked Up / उठा लिया</span>
                        </button>
                      </div>
                    )}

                    {/* Step 4: Status === 'picked_up' -> 'Start Delivery' */}
                    {item.status === 'picked_up' && (
                      <div className="space-y-3">
                        <p className="text-xs text-stone-700">
                          Food is loaded safely in vehicle. Ready to distribute to community shelter?
                        </p>
                        <button
                          onClick={() => handleStartDelivery(item.id)}
                          className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-extrabold text-sm py-4 px-4 rounded-[12px] transition-all cursor-pointer text-center shadow-[0_6px_16px_rgba(17,42,70,0.25)] flex items-center justify-center gap-2"
                        >
                          <Navigation size={16} />
                          <span>Start Delivery / वितरण के लिए निकलें</span>
                        </button>
                      </div>
                    )}

                    {/* Step 5: Status === 'on_the_way_delivery' -> 'Delivered' (Required Photo Proof) */}
                    {item.status === 'on_the_way_delivery' && (
                      <div className="space-y-3.5">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-black">
                            Deliver food and upload distribution photo:
                          </p>
                          <p className="text-[11px] text-stone-600">
                            Take a photo of food distribution at the shelter or community.
                          </p>
                        </div>

                        {/* Delivery Photo Upload / Preview */}
                        {item.deliveryProofPhoto ? (
                          <div className="space-y-2">
                            <div className="relative rounded-[12px] overflow-hidden border border-[#ACC8E5] h-36">
                              <img
                                src={item.deliveryProofPhoto}
                                alt="Delivery proof"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check size={11} /> Photo Verified
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => triggerUpload(item.id, 'delivery')}
                              className="w-full bg-white border border-[#112A46] text-[#112A46] font-bold text-xs py-2 px-3 rounded-[12px] flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Camera size={13} />
                              <span>Change Photo / फोटो बदलें</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => triggerUpload(item.id, 'delivery')}
                            className="w-full bg-[#FAF9DE] border-2 border-dashed border-[#D9D975] text-[#112A46] font-bold text-xs py-4 px-4 rounded-[12px] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#FDFD96]/40"
                          >
                            <Camera size={16} />
                            <span>Upload Delivery Photo (Required) *</span>
                          </button>
                        )}

                        {/* Big Delivered Button */}
                        <button
                          onClick={() => handleMarkDelivered(item)}
                          className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-extrabold text-sm py-4 px-4 rounded-[12px] transition-all cursor-pointer text-center shadow-[0_6px_16px_rgba(17,42,70,0.25)] flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          <span>Delivered / वितरित कर दिया</span>
                        </button>
                      </div>
                    )}

                    {/* Step 6: Status === 'delivered' and not ngoDone */}
                    {item.status === 'delivered' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-[12px] text-center space-y-1">
                          <p className="text-xs font-bold text-emerald-900">
                            Food Delivered Successfully! ✓
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            Live tracking concluded. Donor has been notified.
                          </p>
                        </div>

                        {/* Done Button */}
                        <button
                          onClick={() => handleDoneStep(item.id)}
                          className="w-full bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.99] text-white font-bold text-xs py-3.5 px-4 rounded-[12px] transition-all cursor-pointer text-center shadow-[0_6px_16px_rgba(17,42,70,0.25)]"
                        >
                          Complete Order / कार्य पूरा हुआ
                        </button>
                      </div>
                    )}
                  </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedPickups.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#ACC8E5] rounded-[16px] p-4 space-y-3 shadow-[0_4px_14px_rgba(17,42,70,0.08)] flex flex-col justify-between"
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
