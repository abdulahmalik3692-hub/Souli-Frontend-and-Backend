import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import mascotImg from '../assets/mascot.png';

const css = `
  /* Robot Mascot animations */
  @keyframes mascotSlideIn {
    0% { transform: translateY(150px) scale(0.6); opacity: 0; }
    70% { transform: translateY(-10px) scale(1.05); opacity: 1; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes bubblePop {
    0% { transform: scale(0) translate(20px, 20px); opacity: 0; }
    90% { transform: scale(1.05) translate(-2px, -2px); opacity: 1; }
    100% { transform: scale(1) translate(0, 0); opacity: 1; }
  }
  .mascot-container {
    animation: mascotSlideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .bubble-container {
    animation: bubblePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .mascot-hover {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .mascot-hover:hover {
    transform: translateY(-8px) scale(1.05);
  }
`;

export default function MascotWidget() {
  const [showMascot, setShowMascot] = useState(false);
  const [showMascotBubble, setShowMascotBubble] = useState(false);

  useEffect(() => {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const mascotTimer = setTimeout(() => {
      setShowMascot(true);
      const bubbleTimer = setTimeout(() => {
        setShowMascotBubble(true);
      }, 1000);
      return () => clearTimeout(bubbleTimer);
    }, 800);

    return () => {
      clearTimeout(mascotTimer);
      style.remove();
    };
  }, []);

  if (!showMascot) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-end gap-3 pointer-events-auto mascot-container">
      {/* Speech Bubble */}
      {showMascotBubble && (
        <div className="bubble-container bg-white text-[#1E2E35] px-5 py-3 rounded-2xl rounded-br-none shadow-xl border border-[#2F5D6E]/10 max-w-xs relative mb-12 mr-1">
          <button
            onClick={() => setShowMascotBubble(false)}
            aria-label="Close welcome message"
            className="absolute -top-2 -right-2 w-7 h-7 min-w-[44px] min-h-[44px] bg-[#F2F5F7] hover:bg-[#2F5D6E] hover:text-white rounded-full flex items-center justify-center text-gray-400 text-[10px] shadow transition-colors p-2"
          >
            <X size={12} />
          </button>
          <p className="text-sm font-semibold leading-relaxed">
            Welcome to Soulify!
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            I'm Souli, your emotional guide. Tap me to chat!
          </p>
          {/* Speech bubble arrow tail */}
          <div className="absolute right-0 bottom-[-6px] w-0 h-0 border-t-[6px] border-t-white border-l-[8px] border-l-transparent" />
        </div>
      )}

      {/* Mascot Character */}
      <div className="relative group cursor-pointer mascot-hover">
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-emerald-300/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Mascot Image */}
        <Link to="/chat" className="block relative z-10 w-24 h-24 md:w-28 md:h-28 overflow-hidden rounded-full border-4 border-white shadow-2xl bg-gradient-to-b from-[#A7C4BC]/40 to-[#2F5D6E]/40 hover:scale-105 transition-transform duration-300">
          <img
            src={mascotImg}
            alt="Souli Mascot"
            loading="lazy"
            width="112"
            height="112"
            className="w-full h-full object-cover scale-110 translate-y-1"
          />
        </Link>
      </div>
    </div>
  );
}
