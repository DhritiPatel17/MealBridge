import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, User } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white border border-[#ACC8E5] text-black w-full max-w-sm rounded-[12px] p-6 flex flex-col items-center text-center space-y-5">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-black uppercase tracking-wider bg-[#ACC8E5] px-2.5 py-0.5 rounded-[12px]">
            MealBridge Call
          </span>
          <h3 className="text-lg font-bold text-black pt-1">{contactName}</h3>
          <p className="text-xs text-black font-normal">{contactPhone}</p>
        </div>

        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-[12px] bg-[#ACC8E5] flex items-center justify-center border border-[#112A46]/20">
            <User size={36} className="text-[#112A46]" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FDFD96] border border-[#D9D975] text-black text-[10px] font-bold px-2 py-0.5 rounded-[12px]">
            {formatTime(callDuration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors cursor-pointer border ${
              isMuted
                ? 'bg-[#112A46] text-white border-[#112A46]'
                : 'bg-white text-black border-[#ACC8E5] hover:bg-[#ACC8E5]/20'
            }`}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <button
            onClick={onClose}
            className="h-10 px-5 rounded-[12px] bg-[#112A46] hover:opacity-90 flex items-center justify-center text-white text-xs font-bold cursor-pointer"
          >
            <PhoneOff size={16} className="mr-1.5" />
            <span>End Call / कॉल समाप्त</span>
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors cursor-pointer border ${
              isSpeaker
                ? 'bg-[#112A46] text-white border-[#112A46]'
                : 'bg-white text-black border-[#ACC8E5] hover:bg-[#ACC8E5]/20'
            }`}
          >
            <Volume2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
