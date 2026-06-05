import React, { useEffect, useRef } from 'react';

const css = `
  /* Hide real cursor globally */
  *, *::before, *::after { cursor: none !important; }

  #butterfly-cursor {
    position: fixed;
    top: 0; left: 0;
    pointer-events: none;
    z-index: 999999;
    transform: translate(-50%, -50%);
    will-change: transform;
  }

  /* Left wing flap */
  @keyframes flapLeft {
    0%, 100% { transform: rotateY(0deg) scaleX(1); }
    50%       { transform: rotateY(60deg) scaleX(0.35); }
  }
  /* Right wing flap (mirror) */
  @keyframes flapRight {
    0%, 100% { transform: rotateY(0deg) scaleX(1); }
    50%       { transform: rotateY(-60deg) scaleX(0.35); }
  }

  .b-wing-left {
    transform-origin: 28px 22px;
    animation: flapLeft 3.2s ease-in-out infinite;
  }
  .b-wing-right {
    transform-origin: 28px 22px;
    animation: flapRight 3.2s ease-in-out infinite;
  }

  /* Speed up flap while moving */
  #butterfly-cursor.moving .b-wing-left,
  #butterfly-cursor.moving .b-wing-right {
    animation-duration: 1.6s;
  }

  /* Trail sparkles */
  .b-trail {
    position: fixed;
    pointer-events: none;
    z-index: 999998;
    border-radius: 50%;
    background: radial-gradient(circle, #a7f3d0, #2F5D6E00);
    animation: trailFade 0.7s ease forwards;
  }
  @keyframes trailFade {
    0%   { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(0.1); opacity: 0; }
  }
`;

export default function ButterflyCursor() {
  const elRef = useRef(null);
  const pos = useRef({ x: -200, y: -200 });
  const cur = useRef({ x: -200, y: -200 });
  const movingTimer = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const el = elRef.current;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };

      // Mark as moving (speeds up flap)
      el.classList.add('moving');
      clearTimeout(movingTimer.current);
      movingTimer.current = setTimeout(() => el.classList.remove('moving'), 150);

      // Spawn trail sparkle
      spawnTrail(e.clientX, e.clientY);
    };

    const spawnTrail = (x, y) => {
      const dot = document.createElement('div');
      dot.className = 'b-trail';
      const size = Math.random() * 8 + 4;
      dot.style.cssText = `
        left: ${x - size / 2}px;
        top:  ${y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
      `;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 700);
    };

    const tick = () => {
      // Smooth lerp towards real cursor
      cur.current.x += (pos.current.x - cur.current.x) * 0.14;
      cur.current.y += (pos.current.y - cur.current.y) * 0.14;
      el.style.transform = `translate(calc(${cur.current.x}px - 50%), calc(${cur.current.y}px - 50%))`;
      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId.current);
      style.remove();
    };
  }, []);

  return (
    <div id="butterfly-cursor" ref={elRef}>
      <svg
        width="56" height="44"
        viewBox="0 0 56 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 8px #A7F3D0) drop-shadow(0 0 18px #2F5D6E)' }}
      >
        {/* LEFT WING */}
        <g className="b-wing-left">
          {/* Outer lobe */}
          <ellipse cx="16" cy="16" rx="14" ry="11" fill="url(#wL1)" opacity="0.9" />
          {/* Inner lobe */}
          <ellipse cx="18" cy="29" rx="9" ry="7" fill="url(#wL2)" opacity="0.8" />
          {/* Wing veins */}
          <path d="M27 22 Q18 12 6 10" stroke="#A7F3D0" strokeWidth="0.6" opacity="0.5" />
          <path d="M27 22 Q16 20 5 22" stroke="#A7F3D0" strokeWidth="0.5" opacity="0.4" />
          <path d="M27 22 Q20 28 10 34" stroke="#A7F3D0" strokeWidth="0.5" opacity="0.4" />
        </g>

        {/* RIGHT WING */}
        <g className="b-wing-right">
          {/* Outer lobe */}
          <ellipse cx="40" cy="16" rx="14" ry="11" fill="url(#wR1)" opacity="0.9" />
          {/* Inner lobe */}
          <ellipse cx="38" cy="29" rx="9" ry="7" fill="url(#wR2)" opacity="0.8" />
          {/* Wing veins */}
          <path d="M29 22 Q38 12 50 10" stroke="#A7F3D0" strokeWidth="0.6" opacity="0.5" />
          <path d="M29 22 Q40 20 51 22" stroke="#A7F3D0" strokeWidth="0.5" opacity="0.4" />
          <path d="M29 22 Q36 28 46 34" stroke="#A7F3D0" strokeWidth="0.5" opacity="0.4" />
        </g>

        {/* BODY */}
        <ellipse cx="28" cy="22" rx="2" ry="10" fill="#E0F7F4" opacity="0.95" />
        {/* Head */}
        <circle cx="28" cy="12" r="2.5" fill="#A7F3D0" opacity="0.95" />
        {/* Antennae */}
        <path d="M27 10 Q23 4 20 2" stroke="#A7F3D0" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
        <path d="M29 10 Q33 4 36 2" stroke="#A7F3D0" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
        <circle cx="20" cy="2" r="1.2" fill="#A7F3D0" opacity="0.8" />
        <circle cx="36" cy="2" r="1.2" fill="#A7F3D0" opacity="0.8" />

        {/* Gradient defs */}
        <defs>
          <radialGradient id="wL1" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#E0FFF9" stopOpacity="0.95" />
            <stop offset="60%"  stopColor="#5EEAD4" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#2F5D6E" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient id="wL2" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#CCFBF1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0F766E" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient id="wR1" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#E0FFF9" stopOpacity="0.95" />
            <stop offset="60%"  stopColor="#5EEAD4" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#2F5D6E" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient id="wR2" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#CCFBF1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0F766E" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
