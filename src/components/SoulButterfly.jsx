import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/*
  SoulButterfly
  ─────────────
  • Spawns on page load with a flutter-in animation
  • Follows a GSAP ScrollTrigger path as user scrolls down
  • Flaps wings continuously using CSS keyframes
  • Shrinks & floats when scrolling back to top
  • Glows with the Soulify teal palette
  • Tooltip shows section names as it reaches them
*/

const WAYPOINTS = [
  { progress: 0,    x: '80vw', y: '15vh', label: '' },
  { progress: 0.18, x: '75vw', y: '40vh', label: 'Our Stats' },
  { progress: 0.36, x: '15vw', y: '55vh', label: 'How It Works' },
  { progress: 0.54, x: '80vw', y: '60vh', label: 'Features' },
  { progress: 0.72, x: '12vw', y: '65vh', label: 'Stories' },
  { progress: 0.90, x: '60vw', y: '75vh', label: 'Begin Journey' },
];

export default function SoulButterfly() {
  const bfRef = useRef(null);
  const tooltipRef = useRef(null);
  const [label, setLabel] = useState('');
  const [showLabel, setShowLabel] = useState(false);
  const [scale, setScale] = useState(0);
  const posRef = useRef({ x: window.innerWidth * 0.8, y: window.innerHeight * 0.15 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const bf = bfRef.current;
    if (!bf) return;

    // ── Entry animation
    gsap.fromTo(bf,
      { scale: 0, opacity: 0, x: '50vw', y: '-10vh', rotation: -30 },
      { scale: 1, opacity: 1, x: WAYPOINTS[0].x, y: WAYPOINTS[0].y, rotation: 0,
        duration: 1.6, ease: 'back.out(1.4)', delay: 0.8,
        onComplete: () => setScale(1)
      }
    );

    // ── Continuous gentle float
    const floatTl = gsap.timeline({ repeat: -1, yoyo: true });
    floatTl.to(bf, { y: '+=14', rotation: 5, duration: 2.2, ease: 'sine.inOut' })
            .to(bf, { y: '-=8', rotation: -3, duration: 1.8, ease: 'sine.inOut' });

    // ── Scroll-driven position
    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      scrollRef.current = progress;

      // Find which segment we're in
      let fromWP = WAYPOINTS[0], toWP = WAYPOINTS[1];
      let segProgress = 0;
      for (let i = 0; i < WAYPOINTS.length - 1; i++) {
        if (progress >= WAYPOINTS[i].progress && progress <= WAYPOINTS[i + 1].progress) {
          fromWP = WAYPOINTS[i];
          toWP = WAYPOINTS[i + 1];
          segProgress = (progress - fromWP.progress) / (toWP.progress - fromWP.progress);

          // Show label near waypoint
          if (segProgress > 0.85 && toWP.label) {
            setLabel(toWP.label);
            setShowLabel(true);
          } else {
            setShowLabel(false);
          }
          break;
        }
      }

      // Parse vw/vh values
      const parsePos = (str) => {
        if (str.includes('vw')) return (parseFloat(str) / 100) * window.innerWidth;
        if (str.includes('vh')) return (parseFloat(str) / 100) * window.innerHeight;
        return parseFloat(str);
      };

      const targetX = parsePos(fromWP.x) + (parsePos(toWP.x) - parsePos(fromWP.x)) * segProgress;
      const targetY = parsePos(fromWP.y) + (parsePos(toWP.y) - parsePos(fromWP.y)) * segProgress;

      // Scale down when back near top
      const newScale = progress < 0.05
        ? Math.max(0.3, progress * 20)
        : 1;

      gsap.to(bf, {
        x: targetX,
        y: targetY,
        scale: newScale,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      floatTl.kill();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={bfRef}
      className="soul-butterfly"
      style={{ position: 'fixed', zIndex: 9999, pointerEvents: 'none', willChange: 'transform' }}
    >
      {/* Tooltip */}
      {showLabel && (
        <div className="bf-tooltip">{label}</div>
      )}

      {/* SVG Butterfly */}
      <svg
        width="64" height="50"
        viewBox="0 0 64 50"
        style={{ filter: 'drop-shadow(0 0 10px rgba(126,200,200,0.7)) drop-shadow(0 0 20px rgba(56,118,139,0.4))' }}
      >
        {/* Left wing top */}
        <path className="bf-wing bf-wing-left-top" d="M32,25 C28,15 10,5 4,12 C-2,19 8,32 32,25Z" fill="rgba(126,200,200,0.7)" stroke="rgba(56,118,139,0.5)" strokeWidth="0.5" />
        {/* Left wing bottom */}
        <path className="bf-wing bf-wing-left-bot" d="M32,25 C26,28 8,35 6,28 C4,21 18,20 32,25Z" fill="rgba(91,155,173,0.6)" stroke="rgba(56,118,139,0.5)" strokeWidth="0.5" />
        {/* Right wing top */}
        <path className="bf-wing bf-wing-right-top" d="M32,25 C36,15 54,5 60,12 C66,19 56,32 32,25Z" fill="rgba(126,200,200,0.7)" stroke="rgba(56,118,139,0.5)" strokeWidth="0.5" />
        {/* Right wing bottom */}
        <path className="bf-wing bf-wing-right-bot" d="M32,25 C38,28 56,35 58,28 C60,21 46,20 32,25Z" fill="rgba(91,155,173,0.6)" stroke="rgba(56,118,139,0.5)" strokeWidth="0.5" />
        {/* Wing shimmer dots */}
        <circle cx="18" cy="16" r="2.5" fill="rgba(255,255,255,0.35)" />
        <circle cx="46" cy="16" r="2.5" fill="rgba(255,255,255,0.35)" />
        <circle cx="14" cy="28" r="1.5" fill="rgba(255,255,255,0.25)" />
        <circle cx="50" cy="28" r="1.5" fill="rgba(255,255,255,0.25)" />
        {/* Body */}
        <ellipse cx="32" cy="25" rx="2" ry="8" fill="rgba(47,93,110,0.9)" />
        {/* Antennae */}
        <path d="M31,17 Q26,10 24,6" stroke="rgba(126,200,200,0.7)" strokeWidth="0.8" fill="none" />
        <path d="M33,17 Q38,10 40,6" stroke="rgba(126,200,200,0.7)" strokeWidth="0.8" fill="none" />
        <circle cx="24" cy="6" r="1.2" fill="rgba(126,200,200,0.8)" />
        <circle cx="40" cy="6" r="1.2" fill="rgba(126,200,200,0.8)" />
      </svg>
    </div>
  );
}
