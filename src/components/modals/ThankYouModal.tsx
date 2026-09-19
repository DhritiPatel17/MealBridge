import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ngo' | 'donor';
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  isOpen,
  onClose,
  type,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  const isNgo = type === 'ngo';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Container: 320px wide, centered */}
      <div className="w-full max-w-[320px] relative animate-in zoom-in-95 duration-200 flex flex-col items-center">
        {/* Photo Card on Top - cropped via CSS to hide bottom-left label without editing */}
        <div className="w-full h-52 rounded-t-[12px] overflow-hidden relative shadow-lg bg-[#ACC8E5] flex items-center justify-center">
          {!imageError ? (
            <img
              src="/thankyou-popup.jpg"
              alt="Smiling girl with meal"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
              style={{
                transform: 'scale(1.15)',
                transformOrigin: 'top center',
              }}
            />
          ) : (
            <div className="w-full h-full bg-[#ACC8E5]" />
          )}

          {/* Close button at top-right of photo */}
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 z-20 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Sticky-Note Strip in #FDFD96 with -1deg tilt and slight 16px overlap */}
        <div
          className="w-full -mt-4 z-10 bg-[#FDFD96] rounded-[6px] p-4 shadow-md border border-[#E8E872] relative flex flex-col justify-between"
          style={{
            transform: 'rotate(-1deg)',
            transformOrigin: 'top center',
          }}
        >
          {/* Subtle tiny corner fold at bottom-right */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-stone-300/40 pointer-events-none"
            style={{
              clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
              borderTopLeftRadius: '2px',
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#EBEB83] pointer-events-none"
            style={{
              clipPath: 'polygon(0 0, 0 100%, 100% 0)',
            }}
          />

          {/* Content inside Sticky Note */}
          <div className="space-y-2.5">
            {/* Title: bold, #112A46, 16px */}
            <h3 className="text-[16px] font-bold text-[#112A46] leading-tight tracking-tight">
              {isNgo ? 'Thank you for this seva' : 'Thank you for sharing'}
            </h3>

            {/* Message: black, 14px, maximum 3 lines */}
            <p className="text-[14px] text-black font-normal leading-snug">
              {isNgo
                ? 'Someone had a full meal because of you. You are the bridge that made it happen. Keep going. - MealBridge'
                : "Your extra food became someone's meal today. Thank you for choosing to share. - MealBridge"}
            </p>

            {/* Small Close Button: #112A46 background, white text */}
            <div className="pt-1.5">
              <button
                onClick={onClose}
                className="w-full bg-[#112A46] hover:bg-[#0c1e33] text-white font-bold text-xs py-2 px-3 rounded-[8px] transition-colors cursor-pointer text-center shadow-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


