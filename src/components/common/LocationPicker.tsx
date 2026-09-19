import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number, lng: number) => void;
  required?: boolean;
  hasError?: boolean;
  defaultCenter?: [number, number];
}

// Custom SVG Pin Icon matching MealBridge brand colors (#112A46 & #FDFD96)
const createPinIcon = () => {
  return L.divIcon({
    className: 'mealbridge-map-pin',
    html: `
      <div style="position: relative; width: 34px; height: 42px; transform: translate(-50%, -100%); filter: drop-shadow(0 3px 6px rgba(17,42,70,0.35)); cursor: grab;">
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61116 0 0 7.61116 0 17C0 28.5 15.2 41.1 16.3 41.9C16.5 42.1 16.7 42.1 17 42.1C17.3 42.1 17.5 42.1 17.7 41.9C18.8 41.1 34 28.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="#112A46" stroke="#ACC8E5" stroke-width="2"/>
          <circle cx="17" cy="16" r="6" fill="#FDFD96" stroke="#112A46" stroke-width="1.5"/>
        </svg>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
  });
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onChange,
  required = true,
  hasError = false,
  defaultCenter = [22.3072, 73.1812], // Vadodara default
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [geoMessageType, setGeoMessageType] = useState<'success' | 'warning' | 'info'>('info');

  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialLat = hasCoordinates ? (latitude as number) : defaultCenter[0];
    const initialLng = hasCoordinates ? (longitude as number) : defaultCenter[1];
    const initialZoom = hasCoordinates ? 16 : 13;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: false,
    });

    // OpenStreetMap standard tile layer (no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    // If initial coordinates exist, place draggable marker
    if (hasCoordinates) {
      const marker = L.marker([latitude as number, longitude as number], {
        icon: createPinIcon(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
        setGeoMessage('Pin location adjusted / पिन की जगह बदली गई');
        setGeoMessageType('success');
      });

      markerRef.current = marker;
    }

    // Tap/Click on map to place or move pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onChange(pos.lat, pos.lng);
          setGeoMessage('Pin location adjusted / पिन की जगह बदली गई');
          setGeoMessageType('success');
        });

        markerRef.current = marker;
      }
      onChange(lat, lng);
      setGeoMessage('Pin set on map / पिन मैप पर सेट कर दी गई');
      setGeoMessageType('success');
    });

    mapInstanceRef.current = map;

    // Trigger invalidateSize after container renders
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position when external latitude/longitude change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (hasCoordinates) {
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude as number, longitude as number]);
      } else {
        const marker = L.marker([latitude as number, longitude as number], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onChange(pos.lat, pos.lng);
          setGeoMessage('Pin location adjusted / पिन की जगह बदली गई');
          setGeoMessageType('success');
        });

        markerRef.current = marker;
      }
    }
  }, [latitude, longitude]);

  // Use current browser location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Geolocation is not supported by your browser. Please tap on the map to place the pin.');
      setGeoMessageType('warning');
      return;
    }

    setGeoLoading(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        onChange(lat, lng);
        setGeoMessage('Current location detected! You can drag the pin to fine-tune. / लोकेशन मिल गई! आप पिन को हिला भी सकते हैं।');
        setGeoMessageType('success');

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          map.setView([lat, lng], 16, { animate: true });

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            const marker = L.marker([lat, lng], {
              icon: createPinIcon(),
              draggable: true,
            }).addTo(map);

            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              onChange(pos.lat, pos.lng);
              setGeoMessage('Pin location adjusted / पिन की जगह बदली गई');
              setGeoMessageType('success');
            });

            markerRef.current = marker;
          }
        }
      },
      (error) => {
        setGeoLoading(false);
        let errorMsg = 'Location permission denied or unavailable. Tap anywhere on the map to place your pin. / कृपया मैप पर टैप करके पिन सेट करें।';
        if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please tap anywhere on the map to place your pin.';
        }
        setGeoMessage(errorMsg);
        setGeoMessageType('warning');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  return (
    <div className="space-y-2.5 pt-1">
      {/* Label and GPS Button Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#112A46]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/80">
              Pin Exact Location on Map / मैप पर सटीक पिन लगाएं
            </span>
            {required && <span className="text-rose-500 font-bold text-xs">*</span>}
          </div>
          <span className="text-[10px] text-stone-600 block">
            Tap map or drag pin to adjust exact pickup spot / मैप पर टैप करें या पिन खींचें
          </span>
        </div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="inline-flex items-center justify-center gap-1.5 bg-[#112A46] hover:bg-[#0c1e33] active:scale-[0.98] text-white text-xs font-bold px-3 py-2 rounded-[10px] transition-all shadow-xs cursor-pointer disabled:opacity-60 shrink-0"
        >
          <Navigation size={13} className={geoLoading ? 'animate-spin' : ''} />
          <span>
            {geoLoading
              ? 'Finding location...'
              : 'Use my current location / मेरी लोकेशन इस्तेमाल करें'}
          </span>
        </button>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div
        className={`relative w-full h-52 sm:h-60 rounded-[12px] overflow-hidden border transition-all ${
          hasError && !hasCoordinates
            ? 'border-rose-500 ring-2 ring-rose-200'
            : hasCoordinates
            ? 'border-[#112A46]'
            : 'border-[#ACC8E5]'
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating status badge on top of map */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-[1000] pointer-events-none flex items-center justify-between gap-2">
          {hasCoordinates ? (
            <div className="bg-white/95 backdrop-blur-xs border border-[#ACC8E5] text-[#112A46] text-[10px] font-bold px-2.5 py-1 rounded-[8px] shadow-xs flex items-center gap-1.5 pointer-events-auto">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span>
                Pin set: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
              </span>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-xs border border-amber-300 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-[8px] shadow-xs flex items-center gap-1.5 pointer-events-auto">
              <AlertCircle size={12} className="text-amber-600" />
              <span>Pin required: Tap on map to set spot</span>
            </div>
          )}
        </div>
      </div>

      {/* Geolocation feedback message */}
      {geoMessage && (
        <div
          className={`text-[11px] p-2.5 rounded-[10px] flex items-start gap-1.5 ${
            geoMessageType === 'warning'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : geoMessageType === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-blue-50 text-blue-900 border border-blue-200'
          }`}
        >
          {geoMessageType === 'warning' ? (
            <AlertCircle size={13} className="shrink-0 mt-0.5 text-amber-600" />
          ) : (
            <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-600" />
          )}
          <span className="leading-snug">{geoMessage}</span>
        </div>
      )}

      {/* Validation Error Message */}
      {hasError && !hasCoordinates && (
        <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
          <AlertCircle size={12} />
          <span>
            Please set a location pin on the map. / कृपया मैप पर पिन लगाएं (अनिवार्य)।
          </span>
        </p>
      )}
    </div>
  );
};
