import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Lock, Brain, Cpu, Smile, Check, X, Shield, Activity, Heart } from 'lucide-react';

const fadeUp = () => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.15, ease: "easeOut" },
});

const PILLARS = [
  {
    icon: Brain,
    title: 'Emotionally Intelligent',
    desc: "Souli understands context, tone, and nuance — not just keywords. It listens like a person, not a machine.",
    color: '#38768B',
  },
  {
    icon: Lock,
    title: 'Radically Private',
    desc: 'Your conversations never train our models. Your vulnerabilities are yours to keep. End-to-end encrypted.',
    color: '#7B52CC',
  },
  {
    icon: Cpu,
    title: 'Science-Backed',
    desc: 'Grounded in Cognitive Behavioral Therapy, Positive Psychology, and real-time biometric-like data mapping.',
    color: '#EC4899',
  },
  {
    icon: Smile,
    title: 'Always Compassionate',
    desc: 'No judgement. Just a space that genuinely wants you to feel better, 24/7/365.',
    color: '#10B981',
  },
];

const COMPARISON = [
  { aspect: 'Emotional Understanding', souli: true, generic: false },
  { aspect: 'Privacy First Architecture', souli: true, generic: false },
  { aspect: 'Personalized Insight Reports', souli: true, generic: false },
  { aspect: 'Science-Based Approaches', souli: true, generic: 'partial' },
  { aspect: 'Judgment-Free Safe Space', souli: true, generic: false },
  { aspect: 'Continuous Memory Context', souli: true, generic: 'partial' },
];

const TESTIMONIALS = [
  { name: 'Aisha K.', role: 'University Student', quote: 'I used to journal to process my emotions. Souli does all of that — but it actually understands and talks back.' },
  { name: 'Marcus T.', role: 'Software Engineer', quote: 'Souli doesn’t feel like an app. It feels like an understanding presence. It’s changed my nightly routine.' },
  { name: 'Priya R.', role: 'Working Mother', quote: 'In 15 minutes a day, Souli gives me the emotional check-in I never had time for.' },
];

export default function Why() {
  return (
    <div className="bg-[#050e12] min-h-screen text-[#f0f8fa] font-['Inter'] relative overflow-hidden selection:bg-[#38768B]/30">
      
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 px-6">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#38768B]/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#7EC8C8]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#38768B]/30 bg-white/5 backdrop-blur-md">
            <Heart size={14} className="text-[#EC4899]" />
            <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold">Why Soulify</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
            Because your emotions<br />
            deserve more than<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7EC8C8] to-[#38768B]">a chatbot.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
            className="text-xl md:text-2xl text-[#A7C4BC] font-light max-w-3xl mx-auto leading-relaxed mb-12">
            In a world of generic AI, Souli is built ground-up to understand the language of feelings. It's not just answering questions; it's holding space for you.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/chat" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-[#38768B] to-[#2F5D6E] rounded-xl hover:shadow-[0_0_30px_rgba(56,118,139,0.4)] hover:-translate-y-1">
              <span className="flex items-center gap-2">Try Souli Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── STICKY SCROLL PILLARS ── */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
        
        {/* Left Sticky Content */}
        <div className="w-full md:w-5/12 hidden md:block">
          <div className="sticky top-40 h-[60vh] flex flex-col justify-center">
            <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold mb-4 block">Our Principles</span>
            <h2 className="text-5xl font-bold text-white leading-tight mb-8">Built on Four<br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-[#38768B] to-[#7B52CC]">Cornerstones</span></h2>
            <p className="text-[#A7C4BC] text-lg max-w-sm">Every feature, response, and color in Soulify is designed with these non-negotiable principles in mind.</p>
          </div>
        </div>

        <div className="w-full md:hidden mb-12" {...fadeUp()}>
            <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold mb-4 block">Our Principles</span>
            <h2 className="text-4xl font-bold text-white leading-tight mb-6">Built on Four<br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-[#38768B] to-[#7B52CC]">Cornerstones</span></h2>
        </div>

        {/* Right Scrolling Pillars */}
        <div className="w-full md:w-7/12 relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#38768B] to-[#7B52CC] origin-top hidden md:block opacity-50" />

          <div className="space-y-24">
            {PILLARS.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={i} {...fadeUp()} className="relative md:pl-20">
                {/* Node on line */}
                <div className="absolute left-[20px] top-8 w-3 h-3 rounded-full bg-[#050e12] border-2 hidden md:block z-10" style={{ borderColor: color }} />
                
                <div className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-white/20 transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to bottom right, ${color}, transparent)` }} />
                  
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={32} color={color} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 relative z-10">{title}</h3>
                  <p className="text-[#A7C4BC] text-lg leading-relaxed relative z-10">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-[#0A1E26]/40 border-y border-white/5 backdrop-blur-md" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" {...fadeUp()}>
            <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold mb-4 block">The Difference</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Souli vs. <span className="text-white/40">Generic AI</span></h2>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="bg-[#050e12] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="grid grid-cols-5 p-6 border-b border-white/10 bg-white/5">
              <div className="col-span-3 text-[#A7C4BC] font-semibold text-sm uppercase tracking-wider">Feature</div>
              <div className="col-span-1 text-center font-bold text-[#7EC8C8] text-sm uppercase tracking-wider">Soulify</div>
              <div className="col-span-1 text-center text-[#A7C4BC] font-semibold text-sm uppercase tracking-wider">Generic AI</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
              {COMPARISON.map((row, i) => (
                <div key={i} className="grid grid-cols-5 p-6 items-center hover:bg-white/5 transition-colors">
                  <div className="col-span-3 text-white font-medium">{row.aspect}</div>
                  
                  <div className="col-span-1 flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#38768B]/20 flex items-center justify-center border border-[#38768B]/50 shadow-[0_0_15px_rgba(56,118,139,0.5)]">
                      <Check size={16} className="text-[#7EC8C8]" />
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex justify-center">
                    {row.generic === true ? (
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Check size={16} className="text-white/40" />
                      </div>
                    ) : row.generic === 'partial' ? (
                      <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
                        <span className="text-yellow-500 font-bold leading-none mb-1">~</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                        <X size={16} className="text-red-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, quote }, i) => (
              <motion.div key={i} {...fadeUp()} className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <QuoteIcon />
                <p className="text-white text-lg font-light leading-relaxed mb-8 mt-4">"{quote}"</p>
                <div>
                  <p className="text-white font-bold">{name}</p>
                  <p className="text-[#A7C4BC] text-sm">{role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-[#7B52CC]/15 rounded-[100%] blur-[120px] pointer-events-none" />
        
        <motion.div className="max-w-4xl mx-auto text-center relative z-10" {...fadeUp()}>
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">Your feelings deserve a <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7B52CC] to-[#EC4899]">real listener.</span></h2>
          
          <Link to="/chat" className="inline-flex items-center gap-3 px-12 py-5 bg-white text-[#050e12] rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            Chat with Souli <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

    </div>
  );
}

function QuoteIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#38768B]">
      <path d="M10 11C10 12.6569 8.65685 14 7 14C5.34315 14 4 12.6569 4 11V8C4 6.89543 4.89543 6 6 6H7C8.65685 6 10 7.34315 10 9V11ZM20 11C20 12.6569 18.6568 14 17 14C15.3431 14 14 12.6569 14 11V8C14 6.89543 14.8954 6 16 6H17C18.6568 6 20 7.34315 20 9V11Z" fill="currentColor" fillOpacity="0.4"/>
      <path d="M9.82823 15.1716C9.64069 15.3592 9.53534 15.6136 9.53534 15.8788C9.53534 16.4311 9.98306 16.8788 10.5353 16.8788H10.6064C12.3831 16.8788 13.9167 15.867 14.6548 14.3418C15.0063 13.6149 14.2811 12.9157 13.5658 13.2386L13.1408 13.4304C12.0125 13.9397 10.7415 14.2584 9.82823 15.1716Z" fill="currentColor"/>
    </svg>
  );
}