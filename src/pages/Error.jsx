import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';

// Inline SVG 404 Robot Illustration
const Robot404 = () => (
    <svg
        viewBox="0 0 600 320"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '560px' }}
    >
        {/* Background 404 text — symmetrically around center (300) */}
        {/* Left 4 */}
        <text x="20" y="265" fontSize="210" fontFamily="Georgia, serif" fontWeight="bold" fill="#2C5B6B" opacity="0.12">4</text>
        {/* 0 — centered */}
        <text x="185" y="265" fontSize="210" fontFamily="Georgia, serif" fontWeight="bold" fill="#2C5B6B" opacity="0.06">0</text>
        {/* Right 4 */}
        <text x="375" y="265" fontSize="210" fontFamily="Georgia, serif" fontWeight="bold" fill="#2C5B6B" opacity="0.12">4</text>

        {/* Robot — centered at x=300 */}
        {/* Robot group: body width ~80px centered at group-local x=80, so translate = 300-80 = 220 */}
        <g transform="translate(220, 50)">
            {/* Antenna */}
            <line x1="80" y1="0" x2="80" y2="22" stroke="#2C5B6B" strokeWidth="3" strokeLinecap="round" />
            <circle cx="80" cy="0" r="6" fill="#4AA8B8" />

            {/* Head */}
            <rect x="48" y="22" width="64" height="52" rx="14" fill="#2C5B6B" />
            {/* Eyes */}
            <circle cx="67" cy="45" r="10" fill="#D1E0E1" />
            <circle cx="67" cy="45" r="5" fill="#4AA8B8" />
            <circle cx="93" cy="45" r="10" fill="#D1E0E1" />
            <circle cx="93" cy="45" r="5" fill="#4AA8B8" />
            {/* Smile */}
            <path d="M62 63 Q80 74 98 63" stroke="#4AA8B8" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Neck */}
            <rect x="70" y="74" width="20" height="12" rx="5" fill="#1E4D5C" />

            {/* Body */}
            <rect x="35" y="86" width="90" height="76" rx="18" fill="#2C5B6B" />
            <rect x="54" y="104" width="52" height="34" rx="10" fill="#1E4D5C" />
            <circle cx="80" cy="121" r="7" fill="#4AA8B8" />

            {/* Arms */}
            <rect x="2" y="92" width="30" height="18" rx="9" fill="#2C5B6B" />
            <circle cx="2" cy="101" r="9" fill="#1E4D5C" />
            <rect x="128" y="92" width="30" height="18" rx="9" fill="#2C5B6B" />
            <circle cx="158" cy="101" r="9" fill="#1E4D5C" />

            {/* Legs */}
            <rect x="52" y="162" width="24" height="34" rx="10" fill="#1E4D5C" />
            <rect x="84" y="162" width="24" height="34" rx="10" fill="#1E4D5C" />
            <ellipse cx="64" cy="196" rx="14" ry="7" fill="#2C5B6B" />
            <ellipse cx="96" cy="196" rx="14" ry="7" fill="#2C5B6B" />
        </g>

        {/* Floating spheres — symmetrically placed */}
        {/* Top-left: Chat */}
        <circle cx="110" cy="85" r="30" fill="#4AA8B8" opacity="0.85" />
        <rect x="96" y="73" width="28" height="18" rx="5" fill="white" opacity="0.9" />
        <circle cx="104" cy="82" r="2.5" fill="#2C5B6B" />
        <circle cx="110" cy="82" r="2.5" fill="#2C5B6B" />
        <circle cx="116" cy="82" r="2.5" fill="#2C5B6B" />
        <polygon points="96,91 105,91 96,102" fill="white" opacity="0.9" />

        {/* Top-right: Exclamation */}
        <circle cx="490" cy="85" r="30" fill="#4AA8B8" opacity="0.85" />
        <text x="482" y="100" fontSize="32" fontWeight="bold" fill="white" fontFamily="Arial">!</text>

        {/* Bottom-left: Gear */}
        <circle cx="88" cy="228" r="32" fill="#1E6878" opacity="0.85" />
        <circle cx="88" cy="228" r="16" fill="none" stroke="white" strokeWidth="4" opacity="0.9" />
        <circle cx="88" cy="228" r="6" fill="white" opacity="0.9" />
        <line x1="88" y1="196" x2="88" y2="208" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="88" y1="248" x2="88" y2="260" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="56" y1="228" x2="68" y2="228" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="108" y1="228" x2="120" y2="228" stroke="white" strokeWidth="4.5" strokeLinecap="round" />

        {/* Bottom-right: Wrench */}
        <circle cx="512" cy="228" r="32" fill="#1E6878" opacity="0.85" />
        <path d="M500 218 Q500 209 512 209 Q524 209 524 218 L524 225 L532 240 Q532 248 524 248 L500 248 Q492 248 492 240 Z"
            fill="white" opacity="0.9" transform="rotate(-45 512 228)" />
    </svg>
);

export default function ErrorPage() {
    const containerRef = useRef(null);
    const illustrationRef = useRef(null);
    const sphere1Ref = useRef(null);
    const sphere2Ref = useRef(null);
    const sphere3Ref = useRef(null);
    const sphere4Ref = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Illustration entrance
            gsap.from(illustrationRef.current, {
                y: 30,
                opacity: 0,
                duration: 1.2,
                ease: 'power3.out',
            });

            // Robot floating
            gsap.to(illustrationRef.current, {
                y: -15,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 1,
            });

            // Content entrance
            gsap.from('.error-text', {
                y: 30,
                opacity: 0,
                duration: 1,
                delay: 0.5,
                stagger: 0.15,
                ease: 'power3.out',
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden relative"
            style={{ background: '#D1E0E1', fontFamily: "'Inter', sans-serif" }}
        >
            {/* Blurred background orbs */}
            <div className="absolute w-96 h-96 rounded-full -top-20 -left-20 blur-3xl pointer-events-none" style={{ background: 'rgba(44,91,107,0.06)' }} />
            <div className="absolute w-80 h-80 rounded-full -bottom-10 -right-10 blur-3xl pointer-events-none" style={{ background: 'rgba(255,255,255,0.5)' }} />

            <div className="flex flex-col items-center gap-8 z-10 max-w-2xl w-full">

                {/* Illustration */}
                <div ref={illustrationRef} className="w-full">
                    <Robot404 />
                </div>

                {/* Text */}
                <div className="error-text text-center">
                    <h1 className="text-3xl font-['Playfair_Display'] font-bold mb-3" style={{ color: '#1E2E35' }}>
                        Lost in the Silence
                    </h1>
                    <p className="text-lg font-light" style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto', lineHeight: 1.7 }}>
                        This page doesn't exist or has moved. Let Souli guide you back to where you belong.
                    </p>
                </div>

                {/* Buttons */}
                <div className="error-text flex flex-col sm:flex-row gap-4">
                    <Link to="/home">
                        <button className="flex items-center gap-3 px-8 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs text-white transition-all duration-300 hover:-translate-y-1"
                            style={{ background: '#2C5B6B', boxShadow: '0 10px 40px rgba(44,91,107,0.25)' }}>
                            <Home className="w-4 h-4" />
                            Return Home
                        </button>
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-3 px-8 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs border transition-all duration-300 hover:-translate-y-1"
                        style={{ background: 'rgba(255,255,255,0.6)', color: '#2C5B6B', borderColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>

            {/* Bottom tagline */}
            <p className="absolute bottom-10 text-xs uppercase tracking-[0.5em] font-medium" style={{ color: 'rgba(44,91,107,0.3)' }}>
                Emotionally Aware · Soulfully Connected
            </p>
        </div>
    );
}