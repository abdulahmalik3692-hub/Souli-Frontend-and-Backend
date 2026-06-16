import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import logo from '../assets/new_logo.png';

export default function Loading() {
    const logoRef = useRef(null);
    const barFillRef = useRef(null);
    const subtitleRef = useRef(null);
    const ring1Ref = useRef(null);
    const ring2Ref = useRef(null);
    const containerRef = useRef(null);

    const [progress, setProgress] = useState(0);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Logo entrance
            tl.from(logoRef.current, {
                scale: 0,
                opacity: 0,
                duration: 1.2,
                ease: 'back.out(1.5)',
            });

            // Subtitle fade
            tl.from(
                subtitleRef.current,
                {
                    y: 20,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out',
                },
                '-=0.6'
            );

            // Logo breathing animation
            gsap.to(logoRef.current, {
                scale: 1.08,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 1.2,
            });

            // Rotating rings
            gsap.to(ring1Ref.current, {
                rotation: 360,
                duration: 8,
                repeat: -1,
                ease: 'none',
                transformOrigin: 'center center',
            });

            gsap.to(ring2Ref.current, {
                rotation: -360,
                duration: 12,
                repeat: -1,
                ease: 'none',
                transformOrigin: 'center center',
            });

            // Progress animation
            gsap.to(barFillRef.current, {
                width: '100%',
                duration: 3.5,
                ease: 'power1.inOut',
                onUpdate: function () {
                    const value = Math.round(this.progress() * 100);
                    setProgress(value);
                },
            });

            // Floating background orbs
            gsap.to('.float-circle', {
                y: -30,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: 0.8,
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 flex flex-col items-center justify-center bg-[#D1E0E1] overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* Floating background orbs */}
            <div className="float-circle absolute w-96 h-96 rounded-full bg-[#2C5B6B]/5 -top-24 -left-24 blur-3xl" />
            <div className="float-circle absolute w-80 h-80 rounded-full bg-[#2C5B6B]/8 -bottom-20 -right-20 blur-3xl" />
            <div className="float-circle absolute w-64 h-64 rounded-full bg-white/40 top-1/4 right-1/4 blur-2xl" />

            {/* Center Content */}
            <div className="relative flex flex-col items-center gap-10 z-10">

                {/* Logo + Rings */}
                <div className="relative w-48 h-48 flex items-center justify-center">

                    {/* Outer Ring */}
                    <div
                        ref={ring1Ref}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-[#2C5B6B]/20"
                    />

                    {/* Inner Ring */}
                    <div
                        ref={ring2Ref}
                        className="absolute inset-6 rounded-full border border-[#2C5B6B]/15"
                        style={{ borderStyle: 'dotted' }}
                    >
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#2C5B6B]/40" />
                    </div>

                    {/* Logo */}
                    <div ref={logoRef} className="relative z-10 w-20 h-20">
                        <img
                            src={logo}
                            alt="Soulify Logo"
                            width="80"
                            height="80"
                            className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </div>
                </div>

                {/* Brand Section */}
                <div ref={subtitleRef} className="text-center">
                    <h1
                        className="text-4xl font-['Playfair_Display'] font-bold tracking-[0.15em] mb-2"
                        style={{ color: '#1C6B7A' }}
                    >
                        SOULIFY
                    </h1>
                    <p className="text-sm font-medium tracking-[0.4em] text-[#2C5B6B]/60 uppercase">
                        Preparing your journey
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-72 flex flex-col gap-3">
                    <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/40 shadow-inner">
                        <div
                            ref={barFillRef}
                            className="h-full rounded-full bg-gradient-to-r from-[#2C5B6B] to-[#4A8FA0]"
                            style={{ width: '0%' }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-xs text-[#2C5B6B]/50 font-medium tracking-widest">
                        <span>LOADING</span>
                        <span>{progress}%</span>
                    </div>
                </div>
            </div>

            {/* Bottom Tagline */}
            <div className="absolute bottom-12 text-center">
                <p className="text-xs tracking-[0.5em] text-[#2C5B6B]/30 uppercase font-medium">
                    Emotionally Aware · Soulfully Connected
                </p>
            </div>
        </div>
    );
}