import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, ShieldCheck, User } from 'lucide-react';

interface CallModalProps {
  isOpen: boolean;
  contactName: string;
  contactPhone: string;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  contactName,
  contactPhone,
  onClose,
}) => {
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#132238] text-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-6">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">
            SECURE MEALBRIDGE DISPATCH
          </span>
          <h3 className="text-xl font-black text-white">{contactName}</h3>
          <p className="text-xs text-stone-300">{contactPhone}</p>
        </div>

        {/* Pulse avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <User size={40} className="text-stone-300" />
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
            {formatTime(callDuration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 pt-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isMuted ? 'bg-white text-stone-900' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={onClose}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-lg cursor-pointer active:scale-95 transition-transform"
          >
            <PhoneOff size={26} />
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isSpeaker ? 'bg-white text-stone-900' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Volume2 size={20} />
          </button>
        </div>

        <p className="text-[11px] text-stone-400">
          Direct line encrypted under MealBridge Priority Logistics
        </p>
      </div>
    </div>
  );
};
