import React, { useState, useEffect, useRef } from 'react';

export const HeroFoodShareSvg: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Main 8-second animation timeline loop (7s animated + 1s rest/transition)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const CYCLE_DURATION = 8000; // 8.0s total

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) % CYCLE_DURATION;
      const currentSeconds = elapsed / 1000;
      setTime(currentSeconds);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReducedMotion]);

  // Handle Desktop Mouse Tilt Parallax (3 to 5 degrees)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches || prefersReducedMotion) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const yRatio = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setMouseOffset({
      x: Math.max(-1, Math.min(1, xRatio)) * 4, // Max 4 degrees
      y: Math.max(-1, Math.min(1, yRatio)) * -4,
    });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Timeline Progress Calculations (using cubic ease approximations)
  const t = prefersReducedMotion ? 6.5 : time;

  // Helper bezier interpolator
  const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
  const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  // 1. Giver Arm X Position
  // 0-1s: -280 (offscreen)
  // 1-2.2s: slides in to 0 with slight ease overshoot
  // 2.2-3.5s: moves slightly forward to 20
  // 3.5-5.3s: releases & stays at 20
  // 5.3-6.4s: slides back out to -300
  // 6.4-8.0s: stays offscreen -300
  let giverX = -280;
  let giverOpacity = 0;
  if (t < 1.0) {
    giverX = -280;
    giverOpacity = 0;
  } else if (t >= 1.0 && t < 2.2) {
    const p = (t - 1.0) / 1.2;
    giverX = -280 + easeOutCubic(p) * 280;
    giverOpacity = Math.min(1, p * 2);
  } else if (t >= 2.2 && t < 3.5) {
    const p = (t - 2.2) / 1.3;
    giverX = 0 + easeInOutCubic(p) * 24;
    giverOpacity = 1;
  } else if (t >= 3.5 && t < 5.3) {
    giverX = 24;
    giverOpacity = 1;
  } else if (t >= 5.3 && t < 6.4) {
    const p = (t - 5.3) / 1.1;
    giverX = 24 - easeInOutCubic(p) * 320;
    giverOpacity = 1 - p;
  } else {
    giverX = -300;
    giverOpacity = 0;
  }

  // 2. Food Box Position & State
  // Follows Giver hand initially (1-3.5s), handoff at 3.5s (bobs down), then travels to child's chest (4.3-5.3s)
  let boxX = 0;
  let boxY = 0;
  let boxScale = 1;
  let boxRotation = 0;
  if (t < 1.0) {
    boxX = -280;
    boxY = 0;
  } else if (t >= 1.0 && t < 2.2) {
    boxX = giverX;
    boxY = Math.sin(t * 4) * 2;
  } else if (t >= 2.2 && t < 3.5) {
    // Moves to meeting point
    const p = (t - 2.2) / 1.3;
    boxX = giverX + p * 15;
    boxY = 0;
  } else if (t >= 3.5 && t < 4.3) {
    // Weight dip & settle
    const p = (t - 3.5) / 0.8;
    boxX = 39;
    boxY = Math.sin(p * Math.PI) * 6; // Bobs down 6px
  } else if (t >= 4.3 && t < 5.4) {
    // Child pulls to chest
    const p = (t - 4.3) / 1.1;
    boxX = 39 + easeInOutCubic(p) * 65;
    boxY = easeInOutCubic(p) * 12;
    boxScale = 1 + Math.sin(p * Math.PI) * 0.04;
  } else if (t >= 5.4 && t < 7.4) {
    // Held close to chest with subtle breathing
    boxX = 104;
    boxY = 12 + Math.sin(t * 3) * 2;
    boxScale = 1.02;
  } else {
    // Reset fade back to start
    const p = (t - 7.4) / 0.6;
    boxX = 104 - p * 380;
    boxY = 12;
  }

  // 3. Child Lean & Arms State
  // 0-1.5s: neutral
  // 1.5-2.5s: leans forward, hands reach out
  // 3.5-4.3s: hands grasp box
  // 4.3-5.3s: pulls arms & box to chest
  // 5.3-7.4s: holds box smiling with gentle breathing
  let childLeanX = 0;
  let childArmReach = 0; // 0 = rest, 1 = reach open, 2 = grasp, 3 = hug chest
  let childBlink = false;
  let childSmileState = 0; // 0 = closed calm, 1 = curious, 2 = wide joyful open smile

  if (t < 1.4) {
    childLeanX = 0;
    childArmReach = 0;
    childSmileState = 0;
    childBlink = false;
  } else if (t >= 1.4 && t < 2.5) {
    const p = (t - 1.4) / 1.1;
    childLeanX = -easeInOutCubic(p) * 14;
    childArmReach = p; // Reaching forward
    childBlink = t > 1.6 && t < 1.85; // Natural blink
    childSmileState = 0.5; // Slight curious smile
  } else if (t >= 2.5 && t < 3.5) {
    childLeanX = -14;
    childArmReach = 1;
    childSmileState = 0.8;
  } else if (t >= 3.5 && t < 4.3) {
    childLeanX = -12;
    childArmReach = 1.5; // Grasping
    childSmileState = 1.2;
  } else if (t >= 4.3 && t < 5.3) {
    const p = (t - 4.3) / 1.0;
    childLeanX = -12 + p * 16; // Leans back hugging meal
    childArmReach = 1.5 + p * 1.5; // Hugging chest (reach = 3)
    childSmileState = 1.2 + p * 0.8; // Wide joyful smile
    childBlink = t > 4.5 && t < 4.8; // Joyful squint/blink
  } else if (t >= 5.3 && t < 7.4) {
    // Happy breathing hold
    childLeanX = 4 + Math.sin(t * 2.5) * 2;
    childArmReach = 3;
    childSmileState = 2; // Full wide smile with happy cheek lift
  } else {
    // Resetting
    const p = (t - 7.4) / 0.6;
    childLeanX = 4 * (1 - p);
    childArmReach = 3 * (1 - p);
    childSmileState = 2 * (1 - p);
  }

  // 4. Glow Pulse & Meeting Sparkles
  const glowOpacity =
    t >= 2.2 && t <= 5.5
      ? Math.sin(((t - 2.2) / 3.3) * Math.PI) * 0.95
      : 0;

  const sparklesOpacity =
    t >= 4.2 && t <= 5.8
      ? Math.sin(((t - 4.2) / 1.6) * Math.PI)
      : 0;

  // 5. Floating Heart Particle (5.3s - 6.5s)
  const heartProgress = t >= 5.2 && t <= 6.5 ? (t - 5.2) / 1.3 : 0;
  const heartY = -heartProgress * 45;
  const heartOpacity =
    heartProgress > 0 ? Math.sin(heartProgress * Math.PI) * 0.95 : 0;
  const heartScale = 0.6 + heartProgress * 0.6;

  // 6. Steam wisps opacity & drift
  const steamOffset = (t * 20) % 30;

  // 7. Warm ambient radial pulse behind figures
  const warmGlowPulse = 0.7 + Math.sin(t * 1.5) * 0.2;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-[300px] sm:w-[360px] md:w-[420px] lg:w-[480px] xl:w-[520px] max-w-full aspect-square mx-auto flex items-center justify-center select-none"
      style={{
        background: 'transparent',
        transform: `perspective(1000px) rotateX(${mouseOffset.y * 0.5}deg) rotateY(${mouseOffset.x * 0.5}deg)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
      }}
    >
      {/* Gentle soft warm light-yellow radial glow behind the figures that slowly pulses */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          opacity: warmGlowPulse,
          background:
            'radial-gradient(circle at 50% 50%, rgba(253, 253, 150, 0.45) 0%, rgba(172, 200, 229, 0.18) 45%, rgba(255, 255, 255, 0) 72%)',
          filter: 'blur(20px)',
          transform: 'scale(0.95)',
        }}
      />

      {/* Main SVG Vector Canvas */}
      <svg
        viewBox="0 0 560 560"
        className="w-full h-full overflow-visible relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="giverSleeve" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0B1C30" />
            <stop offset="100%" stopColor="#1E4A7A" />
          </linearGradient>

          <linearGradient id="skinGiver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E8B98F" />
            <stop offset="100%" stopColor="#C98E63" />
          </linearGradient>

          <linearGradient id="skinChild" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F2C7A2" />
            <stop offset="100%" stopColor="#D4996F" />
          </linearGradient>

          <linearGradient id="tiffinLid" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FDFD96" />
            <stop offset="50%" stopColor="#FFFFA6" />
            <stop offset="100%" stopColor="#F5F27A" />
          </linearGradient>

          <linearGradient id="tiffinBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ACC8E5" />
            <stop offset="45%" stopColor="#D4E4F5" />
            <stop offset="100%" stopColor="#8EAFD0" />
          </linearGradient>

          <linearGradient id="childShirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ACC8E5" />
            <stop offset="100%" stopColor="#7DA4CC" />
          </linearGradient>

          <linearGradient id="childHair" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1B324D" />
            <stop offset="100%" stopColor="#0B1C30" />
          </linearGradient>

          {/* Radial Glow Meeting Gradient */}
          <radialGradient id="meetingAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDFD96" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#ACC8E5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#112A46" stopOpacity="0" />
          </radialGradient>

          {/* Drop Shadows */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0B1C30" floodOpacity="0.2" />
          </filter>
          <filter id="boxShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#0B1C30" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* 1. Soft Ground Depth Shadow under boy on light surface */}
        <ellipse
          cx="280"
          cy="485"
          rx="200"
          ry="16"
          fill="#112A46"
          opacity="0.12"
        />

        {/* 2. Meeting Glow Pulse (Radiates subtly between hand & child) */}
        <g
          style={{
            transform: `translate(${270 + childLeanX * 0.5}px, 290px) scale(${1 + glowOpacity * 0.2})`,
            transformOrigin: 'center',
            opacity: glowOpacity * 0.85,
            transition: 'opacity 0.3s ease-out',
          }}
        >
          <circle cx="0" cy="0" r="100" fill="url(#meetingAura)" />
          <circle cx="0" cy="0" r="40" fill="#FDFD96" opacity="0.25" />
        </g>

        {/* ========================================================================= */}
        {/* 4. CHILD GROUP (Right Side) */}
        {/* ========================================================================= */}
        <g
          style={{
            transform: `translateX(${childLeanX}px)`,
            transformOrigin: '420px 480px',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Child Torso & Shirt */}
          <g filter="url(#softShadow)">
            {/* Body Back Shadow */}
            <path
              d="M 370 380 C 370 340, 470 340, 470 380 L 490 510 L 350 510 Z"
              fill="url(#childShirt)"
            />
            {/* Shirt Collar & Details */}
            <path
              d="M 398 348 L 420 375 L 442 348 Z"
              fill="#112A46"
              opacity="0.85"
            />
            <path
              d="M 420 375 L 420 440"
              stroke="#112A46"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.4"
            />
          </g>

          {/* Child Left Arm (Behind / Supporting) */}
          <g>
            <path
              d={
                childArmReach < 1.2
                  ? 'M 450 360 C 430 380, 390 395, 360 400 L 340 395'
                  : childArmReach >= 1.2 && childArmReach < 2.5
                  ? 'M 450 360 C 420 370, 360 365, 315 350 L 290 340'
                  : 'M 450 360 C 430 370, 390 390, 350 400 L 330 390'
              }
              stroke="url(#skinChild)"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Child Head & Neck */}
          <g filter="url(#softShadow)">
            {/* Neck */}
            <rect
              x="406"
              y="320"
              width="28"
              height="35"
              rx="6"
              fill="url(#skinChild)"
            />
            {/* Neck shadow under chin */}
            <path
              d="M 406 332 Q 420 342 434 332 Z"
              fill="#C98E63"
              opacity="0.6"
            />

            {/* Head Contour (Friendly rounded child shape) */}
            <ellipse
              cx="420"
              cy="255"
              rx="56"
              ry="64"
              fill="url(#skinChild)"
            />

            {/* Cute Ears */}
            <ellipse cx="364" cy="260" rx="9" ry="14" fill="url(#skinChild)" />
            <ellipse cx="364" cy="260" rx="5" ry="8" fill="#C98E63" opacity="0.5" />
            <ellipse cx="476" cy="260" rx="9" ry="14" fill="url(#skinChild)" />
            <ellipse cx="476" cy="260" rx="5" ry="8" fill="#C98E63" opacity="0.5" />

            {/* Hair Back & Top (Short, modern, clean styled vector hair) */}
            <path
              d="M 360 250 C 355 210, 375 175, 420 175 C 465 175, 485 210, 480 250 C 480 220, 470 190, 440 185 C 410 180, 380 195, 360 250 Z"
              fill="url(#childHair)"
            />
            {/* Soft Front Hair Bangs */}
            <path
              d="M 370 215 Q 395 200 425 212 Q 450 198 475 220 C 465 190, 445 180, 420 180 C 395 180, 378 195, 370 215 Z"
              fill="#0B1C30"
            />
            <path
              d="M 390 205 Q 405 218 420 208"
              stroke="#ACC8E5"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Cheeks Glow / Blush */}
            <ellipse
              cx="386"
              cy="274"
              rx="12"
              ry="7"
              fill="#E89A7A"
              opacity={0.35 + childSmileState * 0.25}
            />
            <ellipse
              cx="454"
              cy="274"
              rx="12"
              ry="7"
              fill="#E89A7A"
              opacity={0.35 + childSmileState * 0.25}
            />

            {/* Eyebrows (Curious & lifted during handover) */}
            <path
              d={
                childSmileState >= 1.5
                  ? 'M 382 230 Q 394 222 406 230'
                  : 'M 382 232 Q 394 226 406 233'
              }
              stroke="#0B1C30"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d={
                childSmileState >= 1.5
                  ? 'M 434 230 Q 446 222 458 230'
                  : 'M 434 233 Q 446 226 458 232'
              }
              stroke="#0B1C30"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Eyes (Big friendly vector eyes + blink & happy squint state) */}
            {!childBlink && childSmileState < 1.5 ? (
              // Open curious friendly eyes
              <g>
                {/* Left Eye */}
                <ellipse cx="394" cy="248" rx="9" ry="11" fill="#FFFFFF" />
                <ellipse cx="395" cy="248" rx="6.5" ry="8.5" fill="#112A46" />
                <circle cx="393" cy="245" r="2.8" fill="#FFFFFF" />
                <circle cx="397" cy="251" r="1.2" fill="#FFFFFF" />

                {/* Right Eye */}
                <ellipse cx="446" cy="248" rx="9" ry="11" fill="#FFFFFF" />
                <ellipse cx="445" cy="248" rx="6.5" ry="8.5" fill="#112A46" />
                <circle cx="443" cy="245" r="2.8" fill="#FFFFFF" />
                <circle cx="447" cy="251" r="1.2" fill="#FFFFFF" />
              </g>
            ) : childSmileState >= 1.5 ? (
              // Joyful Crescent Squint Eyes (Smiling Eyes)
              <g>
                <path
                  d="M 384 249 Q 394 239 404 249"
                  stroke="#112A46"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 436 249 Q 446 239 456 249"
                  stroke="#112A46"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
            ) : (
              // Natural Blink Line
              <g>
                <path
                  d="M 385 249 L 403 249"
                  stroke="#112A46"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 437 249 L 455 249"
                  stroke="#112A46"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* Cute Child Button Nose */}
            <path
              d="M 416 262 Q 420 266 424 262"
              stroke="#C98E63"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Smile / Mouth (Transitions from gentle line to wide happy open smile) */}
            {childSmileState < 1.0 ? (
              // Calm gentle closed smile
              <path
                d="M 406 284 Q 420 292 434 284"
                stroke="#112A46"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            ) : (
              // Wide Joyful Open Smile with Teeth & Tongue
              <g>
                <path
                  d="M 402 281 Q 420 306 438 281 Z"
                  fill="#112A46"
                />
                {/* White upper teeth arc */}
                <path
                  d="M 406 282 Q 420 288 434 282 L 432 287 Q 420 292 408 287 Z"
                  fill="#FFFFFF"
                />
                {/* Cheerful pink tongue */}
                <path
                  d="M 412 298 Q 420 292 428 298 Q 420 305 412 298 Z"
                  fill="#E89A7A"
                />
              </g>
            )}
          </g>

          {/* Child Right Arm (Front / Reaching / Hugging) */}
          <g filter="url(#softShadow)">
            <path
              d={
                childArmReach < 1.2
                  ? 'M 380 375 C 360 395, 330 405, 305 405 L 290 400'
                  : childArmReach >= 1.2 && childArmReach < 2.5
                  ? 'M 380 375 C 350 370, 300 360, 260 340 L 235 328'
                  : 'M 380 375 C 340 375, 300 380, 275 365 L 260 350'
              }
              stroke="url(#skinChild)"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Child Palm & Fingers */}
            <g
              transform={
                childArmReach >= 2.5
                  ? 'translate(260, 350) rotate(-15)'
                  : childArmReach >= 1.2
                  ? 'translate(235, 328) rotate(-25)'
                  : 'translate(290, 400) rotate(5)'
              }
            >
              {/* Palm */}
              <ellipse cx="0" cy="0" rx="14" ry="12" fill="url(#skinChild)" />
              {/* Fingers wrapping around box */}
              <circle cx="-10" cy="-6" r="5" fill="url(#skinChild)" />
              <circle cx="-13" cy="2" r="5" fill="url(#skinChild)" />
              <circle cx="-10" cy="9" r="5" fill="url(#skinChild)" />
              <circle cx="-4" cy="14" r="4.5" fill="url(#skinChild)" />
              {/* Thumb */}
              <circle cx="2" cy="-10" r="5.5" fill="url(#skinChild)" />
            </g>
          </g>
        </g>

        {/* ========================================================================= */}
        {/* 5. GIVER GROUP (Left Side Arm & Hand) */}
        {/* ========================================================================= */}
        <g
          opacity={giverOpacity}
          style={{
            transform: `translateX(${giverX}px)`,
            transformOrigin: '0px 320px',
            transition: 'opacity 0.2s ease-out',
          }}
        >
          {/* Forearm with Navy Sleeve & Light-Blue Cuff */}
          <g filter="url(#softShadow)">
            {/* Arm Sleeve Base with soft light outline for light backgrounds */}
            <path
              d="M -30 250 L 140 280 L 135 350 L -30 380 Z"
              fill="url(#giverSleeve)"
              stroke="#ACC8E5"
              strokeWidth="1.5"
              strokeOpacity="0.45"
            />
            {/* Sleeve Creases / Texture */}
            <path
              d="M 40 270 Q 70 300 50 340"
              stroke="#0B1C30"
              strokeWidth="3"
              opacity="0.4"
              fill="none"
            />
            {/* Light-Blue Cuff */}
            <path
              d="M 130 278 L 152 282 L 146 352 L 125 348 Z"
              fill="#ACC8E5"
              stroke="#112A46"
              strokeWidth="2"
            />
            {/* Cuff accent line */}
            <line x1="140" y1="280" x2="135" y2="350" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />

            {/* Giver Wrist */}
            <path
              d="M 152 282 L 175 285 L 170 340 L 146 352 Z"
              fill="url(#skinGiver)"
            />

            {/* Giver Hand & Fingers holding the Steel Tiffin Handle */}
            <g transform="translate(175, 290)">
              {/* Back Palm */}
              <ellipse cx="14" cy="20" rx="16" ry="24" fill="url(#skinGiver)" />

              {/* 4 Fingers Wrapped Around Tiffin Handle */}
              {/* Index */}
              <path
                d="M 22 2 C 34 2, 42 10, 36 20 C 32 25, 22 22, 18 16"
                fill="url(#skinGiver)"
                stroke="#C98E63"
                strokeWidth="1.5"
              />
              {/* Middle */}
              <path
                d="M 24 14 C 36 14, 44 22, 38 32 C 34 37, 24 34, 20 28"
                fill="url(#skinGiver)"
                stroke="#C98E63"
                strokeWidth="1.5"
              />
              {/* Ring */}
              <path
                d="M 22 26 C 34 26, 42 34, 36 44 C 32 49, 22 46, 18 40"
                fill="url(#skinGiver)"
                stroke="#C98E63"
                strokeWidth="1.5"
              />
              {/* Pinky */}
              <path
                d="M 18 38 C 28 38, 36 44, 32 52 C 28 57, 18 54, 14 48"
                fill="url(#skinGiver)"
                stroke="#C98E63"
                strokeWidth="1.5"
              />

              {/* Thumb on top of lid/handle */}
              <path
                d="M 6 -4 C 16 -12, 28 -6, 26 8 C 24 16, 14 16, 6 6 Z"
                fill="url(#skinGiver)"
                stroke="#C98E63"
                strokeWidth="1.5"
              />
              <circle cx="22" cy="0" r="3" fill="#F2C7A2" opacity="0.6" />
            </g>
          </g>
        </g>

        {/* ========================================================================= */}
        {/* 6. FOOD BOX GROUP (Travels smoothly across the scene) */}
        {/* ========================================================================= */}
        <g
          filter="url(#boxShadow)"
          style={{
            transform: `translate(${210 + boxX}px, ${270 + boxY}px) scale(${boxScale})`,
            transformOrigin: '50px 45px',
            transition: 'transform 0.1s linear',
          }}
        >
          {/* Steam Wisps rising from food box */}
          <g opacity={t >= 1.5 && t <= 7.0 ? 0.75 : 0}>
            <path
              d={`M 35 ${-15 - steamOffset} Q 42 ${-28 - steamOffset} 36 ${-40 - steamOffset}`}
              stroke="#FDFD96"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="4 4"
            />
            <path
              d={`M 65 ${-18 - steamOffset * 0.8} Q 58 ${-32 - steamOffset * 0.8} 68 ${-48 - steamOffset * 0.8}`}
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="4 4"
            />
          </g>

          {/* Stainless Steel / Enamel Food Box Body */}
          <rect
            x="0"
            y="26"
            width="100"
            height="58"
            rx="12"
            fill="url(#tiffinBody)"
            stroke="#112A46"
            strokeWidth="2.5"
          />

          {/* Specular Light Reflection Streak on Container */}
          <rect
            x="8"
            y="32"
            width="84"
            height="6"
            rx="3"
            fill="#FFFFFF"
            opacity="0.55"
          />

          {/* Meal Container Rim / Tier Lock */}
          <line x1="0" y1="52" x2="100" y2="52" stroke="#112A46" strokeWidth="2" opacity="0.3" />
          <line x1="0" y1="54" x2="100" y2="54" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />

          {/* Light-Yellow Food Lid */}
          <rect
            x="-4"
            y="12"
            width="108"
            height="18"
            rx="8"
            fill="url(#tiffinLid)"
            stroke="#112A46"
            strokeWidth="2.5"
          />
          {/* Lid highlight */}
          <line x1="6" y1="17" x2="94" y2="17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

          {/* Steel Top Handle */}
          <path
            d="M 32 12 C 32 0, 68 0, 68 12"
            stroke="#112A46"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 36 10 C 36 3, 64 3, 64 10"
            stroke="#ACC8E5"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Warm Heart Emblem on Food Container */}
          <g transform="translate(50, 60) scale(0.9)">
            <path
              d="M 0 -7 C -4 -12 -12 -8 -12 0 C -12 8 0 16 0 16 C 0 16 12 8 12 0 C 12 -8 4 -12 0 -7 Z"
              fill="#112A46"
            />
            <path
              d="M 0 -5 C -3 -9 -9 -6 -9 0 C -9 6 0 13 0 13 C 0 13 9 6 9 0 C 9 -6 3 -9 0 -5 Z"
              fill="#FDFD96"
            />
          </g>
        </g>

        {/* ========================================================================= */}
        {/* 7. EXTRAS: Bursting Sparkles & Floating Heart Particle */}
        {/* ========================================================================= */}
        {/* Sparkle Dots Burst */}
        <g opacity={sparklesOpacity} className="transition-opacity duration-300">
          <path d="M 310 240 L 313 246 L 319 249 L 313 252 L 310 258 L 307 252 L 301 249 L 307 246 Z" fill="#FDFD96" />
          <path d="M 370 210 L 372 214 L 376 216 L 372 218 L 370 222 L 368 218 L 364 216 L 368 214 Z" fill="#FFFFFF" />
          <circle cx="280" cy="220" r="3.5" fill="#FDFD96" />
          <circle cx="345" cy="215" r="2.5" fill="#ACC8E5" />
          <circle cx="395" cy="290" r="3" fill="#FDFD96" />
          <circle cx="260" cy="310" r="2" fill="#FFFFFF" />
          <circle cx="360" cy="380" r="3" fill="#FDFD96" />
        </g>

        {/* Floating Heart of Gratitude */}
        <g
          opacity={heartOpacity}
          style={{
            transform: `translate(330px, ${310 + heartY}px) scale(${heartScale})`,
            transformOrigin: 'center',
          }}
        >
          <path
            d="M 0 -8 C -5 -14 -14 -9 -14 0 C -14 10 0 19 0 19 C 0 19 14 10 14 0 C 14 -9 5 -14 0 -8 Z"
            fill="#FDFD96"
            stroke="#112A46"
            strokeWidth="1.5"
            filter="drop-shadow(0 4px 8px rgba(253,253,150,0.5))"
          />
        </g>
      </svg>
    </div>
  );
};
