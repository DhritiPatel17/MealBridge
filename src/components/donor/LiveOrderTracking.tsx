import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DonationRecord, donationStore } from '../../services/donationStore';
import {
  calculateDistanceKm,
  calculateEtaMinutes,
  generateRoutePoints,
  VADODARA_CENTRAL,
  VADODARA_COMMUNITY_SHELTER,
  LatLng,
} from '../../utils/geoTracking';
import {
  ArrowLeft,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Truck,
  Building2,
  Camera,
  Star,
  Compass,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface LiveOrderTrackingProps {
  donationId: string;
  onBack: () => void;
  onCallNgo?: (name: string, phone: string) => void;
  onRateDonation?: (id: string, stars: number, comment?: string) => void;
}

// Marker Icons
const createDonorIcon = () => {
  return L.divIcon({
    className: 'donor-location-pin',
    html: `
      <div style="position: relative; width: 36px; height: 44px; transform: translate(-50%, -100%); filter: drop-shadow(0 4px 8px rgba(17,42,70,0.35));">
        <svg width="36" height="44" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61116 0 0 7.61116 0 17C0 28.5 15.2 41.1 16.3 41.9C16.5 42.1 16.7 42.1 17 42.1C17.3 42.1 17.5 42.1 17.7 41.9C18.8 41.1 34 28.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="#112A46" stroke="#ACC8E5" stroke-width="2"/>
          <circle cx="17" cy="16" r="6" fill="#FDFD96" stroke="#112A46" stroke-width="1.5"/>
        </svg>
        <span style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); background: #112A46; color: #FFFFFF; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px; white-space: nowrap; border: 1px solid #ACC8E5;">Kitchen</span>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
  });
};

const createNgoVehicleIcon = (ngoName = 'NGO Vehicle') => {
  return L.divIcon({
    className: 'ngo-vehicle-pin',
    html: `
      <div style="position: relative; width: 44px; height: 44px; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 34px; height: 34px; border-radius: 50%; background: #112A46; border: 2.5px solid #FDFD96; display: flex; align-items: center; justify-content: center; color: #FFFFFF; box-shadow: 0 4px 10px rgba(17,42,70,0.4); z-index: 2;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FDFD96" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
        <span style="position: absolute; top: 38px; background: #FDFD96; color: #112A46; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; white-space: nowrap; border: 1px solid #D9D975; box-shadow: 0 2px 4px rgba(0,0,0,0.15); z-index: 3;">
          ${ngoName.length > 12 ? ngoName.substring(0, 10) + '..' : ngoName}
        </span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

const createDeliveryHubIcon = () => {
  return L.divIcon({
    className: 'delivery-hub-pin',
    html: `
      <div style="position: relative; width: 34px; height: 42px; transform: translate(-50%, -100%); filter: drop-shadow(0 4px 8px rgba(16,185,129,0.35));">
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61116 0 0 7.61116 0 17C0 28.5 15.2 41.1 16.3 41.9C16.5 42.1 16.7 42.1 17 42.1C17.3 42.1 17.5 42.1 17.7 41.9C18.8 41.1 34 28.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="#047857" stroke="#A7F3D0" stroke-width="2"/>
          <circle cx="17" cy="16" r="6" fill="#FDFD96" stroke="#047857" stroke-width="1.5"/>
        </svg>
        <span style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); background: #047857; color: #FFFFFF; font-size: 9px; font-weight: bold; padding: 2px 5px; border-radius: 5px; white-space: nowrap;">Community</span>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
  });
};

export const LiveOrderTracking: React.FC<LiveOrderTrackingProps> = ({
  donationId,
  onBack,
  onCallNgo,
  onRateDonation,
}) => {
  const [order, setOrder] = useState<DonationRecord | null>(() => {
    const list = donationStore.getDonations();
    return list.find((d) => d.id === donationId) || null;
  });

  const [ratingStars, setRatingStars] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const [photoModal, setPhotoModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const donorMarkerRef = useRef<L.Marker | null>(null);
  const ngoMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Subscribe to live store updates across tabs & storage events
  useEffect(() => {
    const sync = () => {
      const list = donationStore.getDonations();
      const updated = list.find((d) => d.id === donationId);
      if (updated) {
        setOrder(updated);
      }
    };

    const unsubscribe = donationStore.subscribe(sync);
    const interval = setInterval(sync, 1500); // 1.5s active sync for live tracking

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [donationId]);

  // Determine locations
  const donorPos: LatLng = {
    lat: order?.latitude || VADODARA_CENTRAL.lat,
    lng: order?.longitude || VADODARA_CENTRAL.lng,
  };

  const isDeliveringPhase = order?.status === 'on_the_way_delivery' || order?.status === 'delivered';

  const defaultNgoOrigin: LatLng = {
    lat: order?.ngoLatitude || (donorPos.lat + 0.022),
    lng: order?.ngoLongitude || (donorPos.lng - 0.018),
  };

  const currentNgoPos: LatLng = {
    lat: order?.liveNgoLat || (order?.status === 'reached_donor' || order?.status === 'picked_up' ? donorPos.lat : defaultNgoOrigin.lat),
    lng: order?.liveNgoLng || (order?.status === 'reached_donor' || order?.status === 'picked_up' ? donorPos.lng : defaultNgoOrigin.lng),
  };

  const destPos: LatLng = VADODARA_COMMUNITY_SHELTER;

  // Active target for remaining route
  const currentTargetPos = isDeliveringPhase ? destPos : donorPos;

  // Calculate live remaining distance & ETA if not already calculated
  const liveDist = order?.remainingDistanceKm !== undefined
    ? order.remainingDistanceKm
    : calculateDistanceKm(currentNgoPos, currentTargetPos);

  const liveEta = order?.remainingEtaMinutes !== undefined
    ? order.remainingEtaMinutes
    : calculateEtaMinutes(liveDist);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [donorPos.lat, donorPos.lng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Donor pin
      donorMarkerRef.current = L.marker([donorPos.lat, donorPos.lng], {
        icon: createDonorIcon(),
      }).addTo(map);

      // NGO Vehicle Pin
      ngoMarkerRef.current = L.marker([currentNgoPos.lat, currentNgoPos.lng], {
        icon: createNgoVehicleIcon(order?.ngoName || 'NGO Partner'),
      }).addTo(map);

      // Delivery destination pin
      if (isDeliveringPhase) {
        destMarkerRef.current = L.marker([destPos.lat, destPos.lng], {
          icon: createDeliveryHubIcon(),
        }).addTo(map);
      }

      // Initial route line
      const routePoints = generateRoutePoints(currentNgoPos, currentTargetPos, 25);
      const latLngTuples: [number, number][] = routePoints.map((p) => [p.lat, p.lng]);
      routeLineRef.current = L.polyline(
        latLngTuples,
        {
          color: '#112A46',
          weight: 4,
          opacity: 0.85,
          dashArray: order?.status === 'reached_donor' || order?.status === 'picked_up' ? undefined : '6, 8',
          lineCap: 'round',
        }
      ).addTo(map);

      // Fit bounds to show both pins comfortably
      const group = L.featureGroup([
        donorMarkerRef.current,
        ngoMarkerRef.current,
        ...(destMarkerRef.current ? [destMarkerRef.current] : []),
      ]);
      map.fitBounds(group.getBounds().pad(0.3));

      mapInstanceRef.current = map;
    } else {
      const map = mapInstanceRef.current;

      // Update NGO vehicle position
      if (ngoMarkerRef.current) {
        ngoMarkerRef.current.setLatLng([currentNgoPos.lat, currentNgoPos.lng]);
        ngoMarkerRef.current.setIcon(createNgoVehicleIcon(order?.ngoName || 'NGO Partner'));
      }

      // Update donor pin position
      if (donorMarkerRef.current) {
        donorMarkerRef.current.setLatLng([donorPos.lat, donorPos.lng]);
      }

      // Add or update destination pin if delivery phase
      if (isDeliveringPhase) {
        if (!destMarkerRef.current) {
          destMarkerRef.current = L.marker([destPos.lat, destPos.lng], {
            icon: createDeliveryHubIcon(),
          }).addTo(map);
        } else {
          destMarkerRef.current.setLatLng([destPos.lat, destPos.lng]);
        }
      }

      // Update route line
      if (routeLineRef.current) {
        const routePoints = generateRoutePoints(currentNgoPos, currentTargetPos, 25);
        const updateTuples: [number, number][] = routePoints.map((p) => [p.lat, p.lng]);
        routeLineRef.current.setLatLngs(updateTuples);
      }
    }

    // Refresh size on layout transitions
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [order?.status, order?.liveNgoLat, order?.liveNgoLng]);

  // Recenter map helper
  const handleRecenterMap = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (ngoMarkerRef.current && donorMarkerRef.current) {
      const group = L.featureGroup([
        ngoMarkerRef.current,
        donorMarkerRef.current,
        ...(destMarkerRef.current ? [destMarkerRef.current] : []),
      ]);
      map.fitBounds(group.getBounds().pad(0.3), { animate: true });
    }
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || ratingStars === 0) return;
    if (onRateDonation) {
      onRateDonation(order.id, ratingStars, ratingComment);
    } else {
      donationStore.rateDonation(order.id, ratingStars, ratingComment);
    }
    setRatingSubmitted(true);
  };

  if (!order) {
    return (
      <div className="bg-white rounded-[16px] p-8 text-center space-y-4 border border-[#ACC8E5] shadow-xs">
        <AlertCircle size={32} className="text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-stone-900">Donation Request Not Found</h2>
        <p className="text-xs text-stone-600">The requested order tracking session is not available.</p>
        <button
          onClick={onBack}
          className="bg-[#112A46] text-white text-xs font-bold px-4 py-2.5 rounded-[12px] cursor-pointer"
        >
          Return to My Donations
        </button>
      </div>
    );
  }

  // 6 Status Timeline Definition
  const statusSteps = [
    {
      id: 1,
      key: 'accepted',
      titleEn: 'Accepted',
      titleHi: 'स्वीकार किया गया',
      descEn: 'NGO accepted the donation request',
      descHi: 'NGO ने दान स्वीकार कर लिया है',
      time: order.acceptedAt,
      isDone: Boolean(order.acceptedAt) || order.status !== 'waiting',
      isCurrent: order.status === 'accepted',
    },
    {
      id: 2,
      key: 'on_the_way_pickup',
      titleEn: 'On the way to pickup',
      titleHi: 'पिकअप के लिए निकले',
      descEn: 'NGO vehicle has started journey to your location',
      descHi: 'NGO की गाड़ी आपके पते के लिए निकल चुकी है',
      time: order.onTheWayPickupAt,
      isDone: Boolean(order.onTheWayPickupAt) || ['reached_donor', 'picked_up', 'on_the_way_delivery', 'delivered'].includes(order.status),
      isCurrent: order.status === 'on_the_way_pickup',
    },
    {
      id: 3,
      key: 'reached_donor',
      titleEn: 'Reached donor location',
      titleHi: 'दानदाता के पास पहुंचे',
      descEn: 'NGO partner arrived at pickup address',
      descHi: 'NGO साथी आपके पिकअप पते पर पहुंच चुके हैं',
      time: order.reachedDonorAt,
      isDone: Boolean(order.reachedDonorAt) || ['picked_up', 'on_the_way_delivery', 'delivered'].includes(order.status),
      isCurrent: order.status === 'reached_donor',
    },
    {
      id: 4,
      key: 'picked_up',
      titleEn: 'Food picked up',
      titleHi: 'खाना उठा लिया गया',
      descEn: 'Food inspected and safely loaded with proof photo',
      descHi: 'खाना चेक करके सुरक्षित गाड़ी में रख लिया गया',
      time: order.pickedUpAt,
      isDone: Boolean(order.pickedUpAt) || ['on_the_way_delivery', 'delivered'].includes(order.status),
      isCurrent: order.status === 'picked_up',
      photo: order.pickupProofPhoto,
    },
    {
      id: 5,
      key: 'on_the_way_delivery',
      titleEn: 'On the way to deliver',
      titleHi: 'वितरण के लिए निकले',
      descEn: 'Food in transit to community distribution center',
      descHi: 'खाना वितरण केंद्र/बस्ती की तरफ ले जाया जा रहा है',
      time: order.onTheWayDeliveryAt,
      isDone: Boolean(order.onTheWayDeliveryAt) || order.status === 'delivered',
      isCurrent: order.status === 'on_the_way_delivery',
    },
    {
      id: 6,
      key: 'delivered',
      titleEn: 'Delivered',
      titleHi: 'वितरित कर दिया गया',
      descEn: 'Surplus meals safely served to people in need',
      descHi: 'ज़रूरतमंद लोगों तक खाना पहुँचा दिया गया',
      time: order.deliveredAt,
      isDone: order.status === 'delivered',
      isCurrent: order.status === 'delivered',
      photo: order.deliveryProofPhoto,
    },
  ];

  // Current active step text
  const currentActiveStepObj = statusSteps.find((s) => s.isCurrent) || statusSteps[0];

  return (
    <div className="space-y-5 pb-20 max-w-4xl mx-auto">
      {/* Top Header Navigation Bar */}
      <div className="bg-gradient-navy text-white rounded-[20px] p-4 sm:p-5 flex items-center justify-between gap-3 shadow-lg border border-[#ACC8E5]/40 animate-fade-up">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="btn-premium w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-white/10 hover:bg-white/20 border border-[#ACC8E5]/40 flex items-center justify-center text-white transition-colors cursor-pointer shadow-xs"
            title="Back to Donations"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-extrabold text-[#FDFD96] uppercase tracking-wider">
                Live Tracking / <span className="font-hindi font-bold">लाइव ट्रैकिंग</span>
              </span>
              <span className="bg-white/10 text-[#ACC8E5] text-[10px] font-bold px-2 py-0.5 rounded-[6px] border border-white/10">
                Order #{order.id}
              </span>
            </div>
            <h1 className="font-heading text-base sm:text-lg lg:text-xl font-extrabold text-white tracking-tight mt-0.5">
              {order.donorBusinessName || order.donorName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.ngoPhone && (
            <button
              onClick={() => {
                if (onCallNgo) {
                  onCallNgo(order.ngoName || 'NGO Partner', order.ngoPhone || '');
                } else {
                  window.location.href = `tel:${order.ngoPhone}`;
                }
              }}
              className="btn-premium bg-gradient-to-r from-[#FDFD96] to-[#F5F27A] text-[#112A46] font-extrabold text-xs px-3.5 py-2 rounded-[12px] flex items-center gap-1.5 shadow-xs cursor-pointer border border-[#D9D975]"
            >
              <Phone size={14} />
              <span className="hidden sm:inline">Call NGO / <span className="font-hindi font-bold">कॉल करें</span></span>
              <span className="sm:hidden font-bold">Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Map + ETA, Right Stepper Timeline & Proof Photos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols): Live Interactive Leaflet Map & Live ETA Status Card */}
        <div className="lg:col-span-7 space-y-4 animate-fade-up delay-100">
          {/* Live ETA Card */}
          <div className="premium-card p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#112A46]">
                  {order.status === 'delivered' ? 'DELIVERY COMPLETED' : 'LIVE VEHICLE STATUS'}
                </span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-[#112A46] tracking-tight">
                {order.status === 'delivered'
                  ? 'Delivered Successfully / पूरा हुआ'
                  : order.status === 'reached_donor'
                  ? 'Arrived at your location'
                  : `${liveEta} mins (${liveDist} km away)`}
              </h2>
              <p className="text-xs text-[#0B1C30]/80 font-medium">
                {currentActiveStepObj.titleEn} • <span className="font-hindi font-bold">{currentActiveStepObj.titleHi}</span>
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="bg-gradient-to-r from-[#E6F0FA] to-[#ACC8E5] border border-[#ACC8E5] text-[#112A46] text-xs font-extrabold px-3 py-1.5 rounded-[12px] flex items-center gap-1.5 shadow-2xs">
                <Truck size={14} />
                <span>{order.servings} Servings</span>
              </div>
              <span className="text-[11px] text-[#0B1C30]/70 font-semibold block mt-1">
                {order.category === 'pure-veg' ? 'Pure Veg' : order.category === 'non-veg' ? 'Non-Veg' : 'Food'}
              </span>
            </div>
          </div>

          {/* Interactive Live Leaflet Map Container */}
          <div className="relative rounded-[20px] overflow-hidden border border-[#112A46]/70 shadow-[0_8px_24px_rgba(17,42,70,0.12)] bg-[#f1f4f8] h-72 sm:h-96 w-full">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Map Top Floating Overlay Info */}
            <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none flex items-center justify-between gap-2">
              <div className="bg-white/95 backdrop-blur-md border border-[#ACC8E5] text-[#112A46] text-xs font-extrabold px-3 py-1.5 rounded-[12px] shadow-sm flex items-center gap-2 pointer-events-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="truncate max-w-[180px] sm:max-w-xs">
                  {order.ngoName || 'NGO Partner'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRecenterMap}
                title="Recenter Map View"
                className="btn-premium bg-white text-[#112A46] border border-[#ACC8E5] px-3 py-1.5 rounded-[12px] shadow-sm pointer-events-auto cursor-pointer flex items-center gap-1.5 text-xs font-extrabold"
              >
                <Compass size={15} />
                <span className="hidden sm:inline">Recenter</span>
              </button>
            </div>

            {/* Map Bottom Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-[#ACC8E5] px-3 py-1.5 rounded-[10px] text-[10px] font-extrabold text-[#112A46] flex items-center gap-3 shadow-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#112A46] border border-[#FDFD96]" />
                <span>Kitchen</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>NGO Partner</span>
              </span>
              {isDeliveringPhase && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                  <span>Community</span>
                </span>
              )}
            </div>
          </div>

          {/* NGO Partner Info Box */}
          <div className="premium-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#112A46]">
                <Building2 size={16} className="text-[#112A46]" />
                <span>Assigned NGO Partner / <span className="font-hindi font-bold">ज़िम्मेदार संस्था</span></span>
              </div>
              {order.isNgoVerified && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-[8px] flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Verified Partner
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {order.ngoName || 'Annapurna Seva Trust'}
                </h3>
                {order.ngoPhone && (
                  <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-1">
                    <Phone size={12} className="text-stone-400" />
                    <span>{order.ngoPhone}</span>
                  </p>
                )}
                <p className="text-[11px] text-stone-500 mt-1">
                  Pickup Destination: <span className="font-semibold text-stone-800">{order.donorAddress}</span>
                </p>
              </div>

              {order.ngoPhone && (
                <button
                  onClick={() => {
                    if (onCallNgo) {
                      onCallNgo(order.ngoName || 'NGO Partner', order.ngoPhone || '');
                    } else {
                      window.location.href = `tel:${order.ngoPhone}`;
                    }
                  }}
                  className="bg-[#112A46] hover:bg-[#0c1e33] text-white p-3 rounded-[12px] transition-all shadow-xs cursor-pointer"
                  title="Call NGO Partner"
                >
                  <Phone size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): 6-Step Vertical Stepper Timeline, Proof Photos & Thank You / Rating */}
        <div className="lg:col-span-5 space-y-4 animate-fade-up delay-200">
          {/* Vertical Stepper Timeline */}
          <div className="premium-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ACC8E5]/50 pb-3.5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#112A46] block">
                  ORDER JOURNEY / <span className="font-hindi font-bold">ऑर्डर प्रगति</span>
                </span>
                <h3 className="font-heading text-sm sm:text-base font-extrabold text-[#112A46] mt-0.5">
                  Live Status Stepper
                </h3>
              </div>
              <span className="bg-gradient-to-r from-[#FDFD96] to-[#F5F27A] border border-[#D9D975] text-[#112A46] text-[11px] font-black px-3 py-1 rounded-[10px] shadow-2xs">
                {order.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>

            {/* Stepper List (Top to Bottom) */}
            <div className="relative pl-6 space-y-5">
              {/* Connecting vertical line */}
              <div className="absolute top-3 bottom-3 left-2.5 w-0.5 bg-[#ACC8E5]/40" />

              {statusSteps.map((step, idx) => {
                return (
                  <div key={step.id} className="relative flex items-start gap-3.5">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300 ${
                        step.isDone
                          ? 'bg-gradient-to-br from-[#112A46] to-[#1E4A7A] text-white border-[#112A46] shadow-xs'
                          : step.isCurrent
                          ? 'bg-gradient-to-r from-[#FDFD96] to-[#F5F27A] text-[#112A46] border-[#112A46] ring-3 ring-[#ACC8E5]/60 animate-pulse'
                          : 'bg-white text-stone-400 border-stone-300'
                      }`}
                    >
                      {step.isDone ? <CheckCircle2 size={13} className="text-white" /> : step.id}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`font-heading text-xs font-bold ${
                            step.isDone || step.isCurrent ? 'text-[#112A46]' : 'text-stone-400'
                          }`}
                        >
                          {step.titleEn} <span className="font-hindi font-bold text-stone-500">/ {step.titleHi}</span>
                        </h4>
                        {step.time && (
                          <span className="text-[10px] font-bold text-[#112A46] bg-[#E6F0FA] px-2 py-0.5 rounded-[6px] border border-[#ACC8E5]/50">
                            {step.time}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#0B1C30]/80 leading-snug font-normal">
                        {step.descEn}
                      </p>

                      {/* If proof photo exists for this step */}
                      {step.photo && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPhotoModal({
                                isOpen: true,
                                url: step.photo!,
                                title: `${step.titleEn} Photo Proof`,
                              })
                            }
                            className="btn-premium inline-flex items-center gap-1.5 text-xs font-extrabold text-[#112A46] bg-gradient-to-r from-[#E6F0FA] to-[#ACC8E5] hover:opacity-95 border border-[#ACC8E5] px-3 py-1.5 rounded-[10px] shadow-2xs cursor-pointer"
                          >
                            <Camera size={13} />
                            <span>View {step.titleEn} Photo / <span className="font-hindi font-bold">फोटो देखें</span></span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Proof Photos Gallery Card (when photos are available) */}
          {(order.pickupProofPhoto || order.deliveryProofPhoto) && (
            <div className="premium-card p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#112A46] block">
                  VERIFIED PROOF PHOTOS / <span className="font-hindi font-bold">प्रमाणित फोटो</span>
                </span>
                <span className="text-xs text-[#112A46]/70 font-bold">Uploaded by NGO</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                {order.pickupProofPhoto && (
                  <div
                    onClick={() =>
                      setPhotoModal({
                        isOpen: true,
                        url: order.pickupProofPhoto!,
                        title: 'Food Pickup Proof Photo',
                      })
                    }
                    className="group relative rounded-[14px] overflow-hidden border border-[#ACC8E5] cursor-pointer bg-stone-100 aspect-4/3 shadow-xs"
                  >
                    <img
                      src={order.pickupProofPhoto}
                      alt="Pickup proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#112A46]/90 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[11px] font-extrabold text-white">Food Picked Up</span>
                    </div>
                  </div>
                )}
                {order.deliveryProofPhoto && (
                  <div
                    onClick={() =>
                      setPhotoModal({
                        isOpen: true,
                        url: order.deliveryProofPhoto!,
                        title: 'Food Delivery Proof Photo',
                      })
                    }
                    className="group relative rounded-[14px] overflow-hidden border border-[#ACC8E5] cursor-pointer bg-stone-100 aspect-4/3 shadow-xs"
                  >
                    <img
                      src={order.deliveryProofPhoto}
                      alt="Delivery proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#112A46]/90 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[11px] font-extrabold text-white">Food Delivered</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivered State: Thank You Screen & Rating Card */}
          {order.status === 'delivered' && (
            <div className="bg-gradient-navy text-white border-2 border-[#FDFD96] rounded-[20px] p-5 sm:p-6 space-y-4 shadow-[0_8px_28px_rgba(17,42,70,0.3)]">
              <div className="text-center space-y-1.5">
                <span className="bg-gradient-to-r from-[#FDFD96] to-[#F5F27A] text-[#112A46] text-[10px] font-black px-3 py-1 rounded-[8px] uppercase tracking-wider inline-block shadow-2xs">
                  MISSION ACCOMPLISHED
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-black text-white">
                  Thank You for Sharing Meals! / <span className="font-hindi font-bold">धन्यवाद!</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#ACC8E5] font-medium">
                  Your surplus food safely reached {order.servings} people with zero waste.
                </p>
              </div>

              {/* Delivery Photo Highlight */}
              {order.deliveryProofPhoto && (
                <div className="rounded-[14px] overflow-hidden border border-[#ACC8E5]/40 shadow-sm">
                  <img
                    src={order.deliveryProofPhoto}
                    alt="Delivered meals"
                    className="w-full h-44 object-cover"
                  />
                  <div className="bg-[#112A46]/90 p-2.5 text-center text-xs text-[#ACC8E5] font-semibold">
                    Verified delivery distribution by {order.ngoName || 'NGO Partner'}
                  </div>
                </div>
              )}

              {/* Rating Section */}
              {!ratingSubmitted && !order.rating ? (
                <form onSubmit={handleRatingSubmit} className="space-y-3 pt-2 border-t border-white/10">
                  <label className="block text-xs font-bold text-white text-center">
                    Rate your experience with {order.ngoName || 'the NGO'}:
                  </label>

                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingStars(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-115"
                      >
                        <Star
                          size={24}
                          className={
                            star <= ratingStars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-white/30 hover:text-amber-300'
                          }
                        />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Add a thank you note or comment (optional)..."
                    className="w-full bg-white/10 border border-white/20 rounded-[10px] px-3 py-2 text-xs text-white placeholder-stone-400 focus:outline-none focus:bg-white/20"
                  />

                  <button
                    type="submit"
                    className="w-full bg-[#FDFD96] hover:bg-[#FAF9DE] text-[#112A46] font-extrabold text-xs py-2.5 px-4 rounded-[10px] transition-colors cursor-pointer"
                  >
                    Submit Rating / रेटिंग दर्ज करें
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-white/10 rounded-[10px] text-center space-y-1">
                  <p className="text-xs font-bold text-[#FDFD96]">
                    Rating Submitted: {ratingStars} / 5 Stars ✓
                  </p>
                  <p className="text-[11px] text-stone-300">
                    Thank you for supporting community food rescue in Vadodara!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Size Photo Modal */}
      {photoModal.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPhotoModal({ isOpen: false, url: '', title: '' })}
        >
          <div
            className="bg-white rounded-[16px] max-w-lg w-full overflow-hidden shadow-2xl space-y-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-[#112A46]">{photoModal.title}</h4>
              <button
                onClick={() => setPhotoModal({ isOpen: false, url: '', title: '' })}
                className="text-stone-500 hover:text-black font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>
            <img
              src={photoModal.url}
              alt={photoModal.title}
              className="w-full h-auto max-h-[70vh] object-contain rounded-[10px] border border-stone-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
