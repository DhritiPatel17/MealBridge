import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface IntroSplashProps {
  onFinish: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onFinish }) => {
  const [stage, setStage] = useState<'hands' | 'glow' | 'logo' | 'exit'>('hands');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onFinish();
      return;
    }

    // Sequence stages
    const timer1 = setTimeout(() => setStage('glow'), 1000);
    const timer2 = setTimeout(() => setStage('logo'), 1800);
    const timer3 = setTimeout(() => {
      setStage('exit');
      setTimeout(() => {
        setIsDismissed(true);
        onFinish();
      }, 500);
    }, 3300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setStage('exit');
    setTimeout(() => {
      setIsDismissed(true);
      onFinish();
    }, 250);
  };

  if (isDismissed) return null;

  return (
    <div
      className={`fixed inset-0 z-500 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#112A46] via-[#153457] to-[#0B1C30] text-white transition-all duration-500 select-none overflow-hidden ${
        stage === 'exit' ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
      style={{
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top Header with Skip Button */}
      <div className="w-full max-w-4xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FDFD96] animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#ACC8E5]">
            Surplus Food Network • Vadodara
          </span>
        </div>
        <button
          onClick={handleSkip}
          className="btn-premium px-3.5 py-1.5 rounded-[12px] bg-white/10 hover:bg-white/20 border border-[#ACC8E5]/40 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <span>Skip / <span className="font-hindi">छोड़ें</span></span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Main Center Animation Stage */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg w-full px-4 text-center my-auto relative">
        {/* Subtle Ambient Background Aura */}
        <div className="absolute w-72 h-72 rounded-full bg-[#ACC8E5]/10 blur-3xl pointer-events-none" />

        {/* Phase 1 & 2: SVG Hand-to-Hand & Meal Passing Illustration */}
        <div
          className={`relative w-full max-w-[340px] sm:max-w-[380px] h-[220px] flex items-center justify-center transition-all duration-700 ${
            stage === 'logo' ? 'scale-90 opacity-40 -translate-y-4' : 'scale-100 opacity-100'
          }`}
        >
          <svg
            viewBox="0 0 400 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Box gradient */}
              <linearGradient id="foodBoxGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FDFD96" />
                <stop offset="100%" stopColor="#F5F27A" />
              </linearGradient>

              {/* Glow Radial Gradient */}
              <radialGradient id="meetingGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDFD96" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#ACC8E5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#112A46" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Pulsing Light Glow at Meeting Point */}
            {(stage === 'glow' || stage === 'logo') && (
              <g className="animate-pulse">
                <circle cx="200" cy="120" r="55" fill="url(#meetingGlow)" />
                <circle cx="200" cy="120" r="30" fill="#FDFD96" fillOpacity="0.4" />
              </g>
            )}

            {/* LEFT SIDE: Donor's Arm & Hand sliding in with the Food Box */}
            <g
              className="transition-transform duration-1000 ease-out"
              style={{
                transform: stage === 'hands' ? 'translateX(0px)' : 'translateX(10px)',
              }}
            >
              {/* Donor Arm */}
              <path
                d="M10 135 C60 135, 100 130, 140 125 L165 125 C175 125, 185 132, 190 142 L192 146"
                stroke="#ACC8E5"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Donor Fingers cradling bottom left of food box */}
              <path
                d="M145 125 C160 120, 175 118, 188 128"
                stroke="#ACC8E5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M140 135 C155 130, 170 132, 184 140"
                stroke="#ACC8E5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </g>

            {/* CENTER: The Warm Food Box Being Shared */}
            <g
              className="transition-all duration-700"
              style={{
                transform: stage === 'glow' ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: '200px 115px',
              }}
            >
              {/* Food Box Base Container */}
              <rect
                x="160"
                y="92"
                width="80"
                height="46"
                rx="8"
                fill="url(#foodBoxGrad)"
                stroke="#112A46"
                strokeWidth="2.5"
                filter="drop-shadow(0 6px 12px rgba(0,0,0,0.25))"
              />
              {/* Container Lid Line */}
              <path
                d="M156 94 L244 94"
                stroke="#112A46"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Warm Meal Symbol / Heart Ribbon */}
              <path
                d="M193 112 C193 108, 197 104, 200 107 C203 104, 207 108, 207 112 C207 117, 200 122, 200 122 C200 122, 193 117, 193 112 Z"
                fill="#112A46"
              />
              {/* Fresh Steam Lines */}
              <path
                d="M185 82 C185 75, 189 74, 189 67"
                stroke="#FDFD96"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="2 2"
                className="animate-pulse"
              />
              <path
                d="M200 80 C200 72, 204 71, 204 63"
                stroke="#FDFD96"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="2 2"
                className="animate-pulse"
              />
              <path
                d="M215 82 C215 75, 219 74, 219 67"
                stroke="#FDFD96"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="2 2"
                className="animate-pulse"
              />
            </g>

            {/* RIGHT SIDE: Child's Gentle Reaching Hand */}
            <g
              className="transition-transform duration-1000 ease-out"
              style={{
                transform: stage === 'hands' ? 'translateX(0px)' : 'translateX(-10px)',
              }}
            >
              {/* Child Arm */}
              <path
                d="M390 145 C345 145, 310 138, 275 132 L248 130 C238 130, 226 136, 218 145"
                stroke="#FDFD96"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Child Fingers reaching to hold box */}
              <path
                d="M260 130 C248 124, 232 122, 220 132"
                stroke="#FDFD96"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>

            {/* Child's Soft Smile & Joy Linework (revealed in glow stage) */}
            {(stage === 'glow' || stage === 'logo') && (
              <g className="transition-opacity duration-700 opacity-100">
                {/* Child Head Outline / Smile silhouette */}
                <path
                  d="M330 75 C345 75, 360 88, 360 105 C360 120, 348 132, 332 132"
                  stroke="#ACC8E5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="3 3"
                />
                {/* Gentle Smile Arc */}
                <path
                  d="M335 105 Q342 114, 350 106"
                  stroke="#FDFD96"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Happy Eye */}
                <path
                  d="M336 92 Q341 87, 346 92"
                  stroke="#ACC8E5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Sparkle of gratitude */}
                <circle cx="360" cy="75" r="2.5" fill="#FDFD96" className="animate-ping" />
              </g>
            )}
          </svg>
        </div>

        {/* Phase 3: Logo & Tagline Reveal */}
        <div
          className={`space-y-3 transition-all duration-700 ${
            stage === 'logo' || stage === 'exit'
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
          }`}
        >
          {/* Exact Logo with Light Rounded Badge for perfect visibility */}
          <div className="inline-flex items-center justify-center p-2 rounded-[18px] bg-white border border-[#ACC8E5]/70 shadow-lg mx-auto">
            <img
              src="/logo.jpg.png"
              alt="MealBridge Logo"
              className="h-16 sm:h-20 w-auto object-contain block"
              style={{ imageRendering: 'auto' }}
            />
          </div>

          <div className="space-y-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              MealBridge <span className="font-hindi text-[#FDFD96]">/ अन्नसेतु</span>
            </h1>
            <p className="font-hindi text-base sm:text-lg font-bold text-[#FDFD96] leading-snug drop-shadow-xs">
              "जहाँ खाना बचता है, वहाँ से ज़रूरतमंद तक पहुँचे।"
            </p>
            <p className="text-xs sm:text-sm text-[#ACC8E5] font-medium pt-0.5">
              Bridging commercial surplus food with verified relief chapters
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Indicator */}
      <div className="w-full max-w-xs flex flex-col items-center justify-center pb-2 text-center space-y-2">
        <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-[#ACC8E5] via-[#FDFD96] to-white h-1 rounded-full transition-all duration-3000 ease-linear"
            style={{
              width: stage === 'exit' ? '100%' : stage === 'logo' ? '85%' : stage === 'glow' ? '50%' : '20%',
            }}
          />
        </div>
        <span className="text-[11px] font-medium text-[#ACC8E5]/80">
          Vadodara Food Rescue Network • Connecting in Real Time
        </span>
      </div>
    </div>
  );
};
