import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Heart, Brain, Shield, Sparkles, Users, Activity, Lock, Cpu, ArrowRight } from 'lucide-react';

const team = [
  { name: 'Aria Chen', role: 'CEO & Co-Founder', avatarImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop', color: '#38768B', bio: 'Neuroscience + AI background. Passionate about emotional accessibility.' },
  { name: 'Marcus Webb', role: 'CTO & Co-Founder', avatarImg: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=400&auto=format&fit=crop', color: '#7B52CC', bio: 'Built ML systems at scale. Believes tech should heal, not harm.' },
  { name: 'Leila Raza', role: 'Head of Wellness', avatarImg: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop', color: '#EC4899', bio: 'Licensed therapist turned product thinker. 10 years in mental health.' },
  { name: 'James Osei', role: 'Lead AI Engineer', avatarImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop', color: '#10B981', bio: 'Specializes in NLP and emotion recognition models at 28-label depth.' },
];

function Interactive3DHero() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-screen h-screen min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-[#0a1c24]" 
    >
      {/* Animated Emotion Montage Background */}
      <div className="absolute inset-0 z-[1] opacity-70">
        <div className="absolute inset-0 bg-cover bg-center animate-kenburns-1" style={{ backgroundImage: 'url(/src/assets/human_happy_1780583191369.png)' }} />
        <div className="absolute inset-0 bg-cover bg-center animate-kenburns-2" style={{ backgroundImage: 'url(/src/assets/human_sad_1780583203693.png)' }} />
        <div className="absolute inset-0 bg-cover bg-center animate-kenburns-3" style={{ backgroundImage: 'url(/src/assets/human_calm_1780583260451.png)' }} />
        <div className="absolute inset-0 bg-cover bg-center animate-kenburns-4" style={{ backgroundImage: 'url(/src/assets/human_excited_1780583232842.png)' }} />
      </div>

      <style>{`
        @keyframes fade-slide {
          0% { opacity: 0; transform: scale(1.05); }
          10% { opacity: 1; transform: scale(1.03); }
          25% { opacity: 1; transform: scale(1); }
          35% { opacity: 0; transform: scale(0.98); }
          100% { opacity: 0; transform: scale(0.98); }
        }
        .animate-kenburns-1 { animation: fade-slide 16s infinite 0s; opacity: 0; }
        .animate-kenburns-2 { animation: fade-slide 16s infinite 4s; opacity: 0; }
        .animate-kenburns-3 { animation: fade-slide 16s infinite 8s; opacity: 0; }
        .animate-kenburns-4 { animation: fade-slide 16s infinite 12s; opacity: 0; }
      `}</style>

      {/* Deep Teal Brand Gradient Overlay */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#0a1c24] via-[#0a1c24]/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-[2] bg-[#38768B]/10 mix-blend-color pointer-events-none" />

      {/* Grain Texture */}
      <div className="absolute inset-0 z-[1] opacity-[0.035] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />

      {/* Ambient Blurs */}
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-gradient-to-tr from-[#38768B] to-[#438398] rounded-full blur-[100px] opacity-40 z-[2] animate-pulse duration-1000" />
      <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] bg-gradient-to-bl from-[#7B52CC] to-[#609183] rounded-full blur-[100px] opacity-30 z-[2]" />

      {/* 3D Floating Cards Constellation Removed per user request */}

      {/* Hero Copy (Matches Home.jsx exactly) */}
      <div className="relative z-20" style={{ animation: 'pageFadeIn 0.8s ease forwards' }}>
        <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.15] text-[#A7C4BC] text-xs font-semibold px-5 py-2 rounded-full mb-8 backdrop-blur-sm tracking-wide">
          <Sparkles size={14} className="text-[#A7C4BC]" />
          OUR STORY
        </div>

        <h1 className="font-['Playfair_Display'] text-white text-[48px] md:text-[80px] lg:text-[96px] mb-4 drop-shadow-xl tracking-wide font-black leading-[1.05]">
          WHY WE BUILT<br />SOULIFY
        </h1>
        <p className="text-[#A7C4BC] uppercase tracking-[6px] text-[14px] md:text-[18px] font-semibold drop-shadow-md mb-2">
          Because Emotions Matter
        </p>
        <p className="text-white/50 text-sm md:text-base max-w-[520px] mx-auto leading-relaxed mt-4 mb-8 px-4 font-['Inter']">
          A team of therapists, engineers, and designers united by one belief —
          everyone deserves access to emotional clarity, regardless of circumstance.
        </p>
      </div>
    </div>
  );
}

// 3D Floating Helper
function FloatingCard({ mouseX, mouseY, depth, children, className }) {
  const x = useSpring(useTransform(mouseX, [-0.5, 0.5], [depth * -80, depth * 80]), { stiffness: 100, damping: 30 });
  const y = useSpring(useTransform(mouseY, [-0.5, 0.5], [depth * -80, depth * 80]), { stiffness: 100, damping: 30 });
  const rotX = useSpring(useTransform(mouseY, [-0.5, 0.5], [depth * 15, depth * -15]), { stiffness: 100, damping: 30 });
  const rotY = useSpring(useTransform(mouseX, [-0.5, 0.5], [depth * -15, depth * 15]), { stiffness: 100, damping: 30 });

  return (
    <motion.div style={{ x, y, rotateX: rotX, rotateY: rotY }} className={`absolute ${className}`}>
      {children}
    </motion.div>
  );
}

// 3D Tilt Card for Team
function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 30 });

  const move = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={move} onMouseLeave={reset}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', perspective: 1200 }}
      className={className}>
      {children}
    </motion.div>
  );
}

export default function About() {
  return (
    <div className="bg-[#0a1c24] min-h-screen text-white font-['Inter'] overflow-x-hidden selection:bg-[#38768B]/30">
      <style>{`
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {/* ── 3D HERO ── */}
      <Interactive3DHero />

      {/* Transition gradient (Matches Home.jsx transition rhythm) */}
      <div className="h-24 w-full bg-gradient-to-b from-[#234b5a] to-[#F2F5F7] relative z-[5]" />

      {/* ── ORIGIN STORY (Light Section for rhythm) ── */}
      <section className="py-[120px] px-6 bg-[#F2F5F7] text-[#1E2E35] relative">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-6">
            <span className="text-[#2F5D6E] uppercase tracking-[3px] text-xs font-semibold">The Origin</span>
            <h2 className="font-['Playfair_Display'] text-[38px] md:text-[48px] text-[#2F5D6E] leading-tight mb-6">
              Born From Personal Pain
            </h2>
            <div className="w-16 h-1 bg-[#38768B] mb-8" />
            <p className="text-gray-600 text-lg leading-relaxed">
              In 2022, our co-founders Aria and Marcus experienced a shared frustration: therapy was expensive, inaccessible, and rarely available at 2 AM when anxiety hits hardest.
            </p>
            <p className="text-[#2F5D6E] font-semibold text-xl italic leading-relaxed py-4 border-l-4 border-[#38768B] pl-6 my-6 bg-white/50 rounded-r-2xl">
              "What if AI could understand not just what you say, but how you feel when you say it?"
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              That question became Soulify. Today, we track 28 distinct emotional states and have guided over 500,000 conversations — each one moving someone closer to calm.
            </p>
          </div>
          
          <div className="flex-1 relative">
            <div className="aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl relative">
               <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000&q=80" alt="Founders collaborating" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-tr from-[#2F5D6E]/40 to-transparent mix-blend-multiply" />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-4 border border-gray-100">
               <div className="w-12 h-12 bg-[#38768B]/10 text-[#38768B] rounded-full flex items-center justify-center">
                 <Activity size={24} />
               </div>
               <div>
                 <div className="text-2xl font-black text-[#1E2E35]">500k+</div>
                 <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Conversations</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transition gradient */}
      <div className="h-24 w-full bg-gradient-to-b from-[#F2F5F7] to-[#0a1c24] relative z-[5]" />

      {/* ── BENTO GRID VALUES (Matches "Core Benefits" from Home.jsx exactly) ── */}
      <section className="py-[100px] px-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1c24 0%, #0f2a35 50%, #0a1c24 100%)' }}>
        {/* Ambient glow orbs */}
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(56,118,139,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.08)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Grain Texture */}
        <div className="absolute inset-0 z-[1] opacity-[0.035] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <span className="text-[#A7C4BC] uppercase tracking-[3px] text-xs font-semibold">Our Principles</span>
          <h2 className="text-[34px] md:text-[44px] font-['Playfair_Display'] text-white mt-2 mb-16">What We Stand For</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {[
              { icon: Heart, title: 'Radical Empathy', desc: 'Every feature starts with one question: how does this make people feel? We design for human connection before efficiency.', accent: '#EC4899', accentLight: 'rgba(236, 72, 153, 0.2)' },
              { icon: Lock, title: 'Privacy First', desc: 'Your emotional data is sacred. We encrypt everything, train models on anonymized aggregates, and sell nothing.', accent: '#38768B', accentLight: 'rgba(56, 118, 139, 0.25)' },
              { icon: Brain, title: 'Science-Backed', desc: 'Our emotion engine is built on peer-reviewed psychology and neuroscience, not just technical guesses.', accent: '#7B52CC', accentLight: 'rgba(123, 82, 204, 0.2)' },
              { icon: Sparkles, title: 'Beautiful Design', desc: 'Healing should feel as good as it works. We believe that aesthetics are a fundamental part of therapy.', accent: '#F59E0B', accentLight: 'rgba(245, 158, 11, 0.15)' },
              { icon: Users, title: 'Inclusive Access', desc: 'Mental wellness is not a luxury. Souli is free to start, always. We believe everyone deserves a safe space.', accent: '#10b981', accentLight: 'rgba(16, 185, 129, 0.2)' },
              { icon: Cpu, title: 'Ethical AI', desc: 'We train our models carefully to avoid bias, ensuring our empathy engine understands all cultural nuances.', accent: '#06b6d4', accentLight: 'rgba(6, 182, 212, 0.2)' },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/[0.05] backdrop-blur-sm rounded-[24px] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-400 group border border-white/[0.08] relative overflow-hidden"
              >
                <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full" style={{ background: feature.accent }} />
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: feature.accentLight }} />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative" style={{ background: feature.accentLight }}>
                  <feature.icon style={{ color: feature.accent }} size={24} />
                </div>
                <h4 className="font-bold text-white text-lg mb-3">{feature.title}</h4>
                <p className="text-sm text-white/65 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transition out of dark features */}
      <div className="h-24 w-full bg-gradient-to-b from-[#0a1c24] to-white relative z-10" />

      {/* ── THE TEAM ── */}
      <section className="py-[120px] bg-white px-4 border-b border-[#2F5D6E]/5 overflow-hidden">
        <div className="max-w-[1200px] mx-auto text-center mb-20">
          <span className="text-[#2F5D6E] uppercase tracking-[3px] text-xs font-semibold">The People</span>
          <h2 className="text-[38px] md:text-[46px] font-['Playfair_Display'] text-[#2F5D6E] mt-2 mb-4">Meet the Minds</h2>
          <p className="text-gray-600 max-w-xl mx-auto">The humans behind every feature, every word, and every moment of calm.</p>
        </div>

        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((m, i) => (
            <TiltCard key={i} className="group">
              <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0_10px_35px_rgba(0,0,0,0.05)] flex flex-col items-center text-center h-full relative overflow-hidden transform-style-3d">
                
                {/* 3D background glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: m.color }} />
                
                {/* 3D Popping Avatar Image */}
                <div 
                  className="w-28 h-28 rounded-full mb-6 relative transition-transform duration-500 ease-out flex items-center justify-center shadow-xl overflow-hidden" 
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <img src={m.avatarImg} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  {/* Subtle ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 opacity-50 group-hover:border-transparent transition-all duration-500 pointer-events-none" />
                </div>
                
                <h3 className="text-xl font-bold text-[#1E2E35] mb-1" style={{ transform: 'translateZ(20px)' }}>{m.name}</h3>
                <p className="text-[11px] font-bold tracking-wider uppercase mb-5" style={{ color: m.color, transform: 'translateZ(15px)' }}>{m.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed" style={{ transform: 'translateZ(10px)' }}>{m.bio}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

    </div>
  );
}