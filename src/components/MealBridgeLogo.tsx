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
        alt="MealBridge Logo"
        width={size}
        height={size}
        style={{ width: `${size}px`, height: 'auto', maxHeight: `${size}px`, imageRendering: 'auto' }}
        className="object-contain shrink-0"
        loading="eager"
        referrerPolicy="no-referrer"
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight leading-none text-[#112A46]">
            MealBridge
          </span>
          <span className="text-[#112A46] font-bold text-xs leading-tight mt-0.5">
            अन्नसेतु
          </span>
        </div>
      )}
    </div>
  );
};
