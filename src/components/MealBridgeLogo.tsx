import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const MealBridgeLogo: React.FC<LogoProps> = ({
  className = '',
  size = 40,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 select-none ${className}`}>
      <img
        src="/assets/mealbridge-logo.png"
        alt="MealBridge अन्नसेतु Logo"
        width={size}
        height={size}
        style={{ width: `${size}px`, height: 'auto', maxHeight: `${size}px` }}
        className="object-contain shrink-0"
        loading="eager"
        referrerPolicy="no-referrer"
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight leading-none text-stone-900">
            MEALBRIDGE
          </span>
          <span className="text-emerald-700 font-bold text-xs leading-tight mt-0.5">
            अन्नसेतु
          </span>
        </div>
      )}
    </div>
  );
};
