import React, { useState } from 'react';
import { X, Bike, Check, ShieldCheck, MapPin, Navigation, Clock } from 'lucide-react';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptRun: () => void;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({
  isOpen,
  onClose,
  onAcceptRun,
}) => {
  const [vehicle, setVehicle] = useState<'bike' | 'erickshaw' | 'van'>('erickshaw');
  const [isReady, setIsReady] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
            <div className="w-7 h-7 rounded-full bg-[#132238] text-white flex items-center justify-center">
              <Bike size={16} />
            </div>
            <span>Sevak / Volunteer Dispatch</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
              URGENT RESCUE RUN AVAILABLE
            </span>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              4.2 km loop
            </span>
          </div>
          <div className="font-extrabold text-sm text-stone-900">
            Grand Imperial Caterers → Roti Bank Chapter #4
          </div>
          <p className="text-xs text-stone-600">
            85 meals packed in foil trays. Hot insulated transport needed within 25 mins.
          </p>
        </div>

        {/* Vehicle Selection */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Your Transport Mode
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'bike', label: 'Motorbike / Scooter' },
              { id: 'erickshaw', label: 'E-Rickshaw' },
              { id: 'van', label: 'Cargo Van' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVehicle(v.id as any)}
                className={`py-2 px-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                  vehicle === v.id
                    ? 'bg-[#132238] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setIsReady(true);
            setTimeout(() => {
              onAcceptRun();
              onClose();
            }, 500);
          }}
          className="w-full bg-[#132238] hover:bg-[#1a2d48] text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
        >
          <Navigation size={16} />
          <span>{isReady ? 'CONNECTING DISPATCH...' : 'ACCEPT RUN & OPEN GPS NAVIGATION'}</span>
        </button>
      </div>
    </div>
  );
};
