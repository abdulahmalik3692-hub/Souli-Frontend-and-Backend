import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/new_logo.png';

export default function Splash() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/home');
        }, 400); 
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex h-screen w-full items-center justify-center overflow-hidden font-['Inter'] bg-[#050505] relative">
            
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 0.4, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute top-[60%] w-[120%] h-[100%] rounded-[100%] blur-[80px] bg-[radial-gradient(ellipse_at_top,_#7EC8C8_0%,_transparent_60%)] mix-blend-screen"
                />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                
                {/* Minimalist Logo Reveal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mb-8"
                >
                    <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full scale-150" />
                    <img src={logo} alt="Soulify Logo" className="w-16 h-16 object-contain relative z-10 opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                </motion.div>

                {/* High-End Typography */}
                <motion.h1
                    className="text-xl md:text-2xl font-medium tracking-[0.3em] text-white/90 uppercase ml-[0.3em]"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                >
                    Soulify
                </motion.h1>

                <motion.p
                    className="mt-4 text-[11px] md:text-xs font-semibold tracking-[0.2em] text-white/30 uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    Embrace Your Inner Peace
                </motion.p>
            </div>

            <motion.div
                className="absolute bottom-16 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-white/[0.03] overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                <motion.div
                    className="h-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
                />
            </motion.div>
        </div>
    );
}
