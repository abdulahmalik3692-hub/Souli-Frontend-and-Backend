import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Brain, Sparkles, Heart, Check, X, ArrowRight, Zap, Target } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, ease: "easeOut", delay },
});

const cornerstones = [
  {
    icon: Brain,
    title: 'Hyper-Personalized AI',
    desc: 'Unlike generic chatbots, Souli learns your unique emotional baseline. It remembers past conversations, recognizes patterns in your vocabulary, and tailors its responses to your specific cognitive style.',
    color: '#7B52CC'
  },
  {
    icon: Shield,
    title: 'Clinical-Grade Framework',
    desc: 'Every response is filtered through CBT (Cognitive Behavioral Therapy) and DBT (Dialectical Behavior Therapy) frameworks. Souli doesn\'t just sympathize; it provides actionable, scientifically-validated coping strategies.',
    color: '#38768B'
  },
  {
    icon: Heart,
    title: 'Radical Empathy Engine',
    desc: 'Trained on over 2 million anonymized crisis and therapy transcripts, our proprietary emotion engine detects 28 distinct emotional states with 94% accuracy, responding with profound nuance.',
    color: '#EC4899'
  },
  {
    icon: Sparkles,
    title: 'Beautiful, Calming UX',
    desc: 'We believe healing should happen in a beautiful space. From dynamic color palettes that respond to your mood to ambient generative soundscapes, every pixel is designed to reduce cortisol.',
    color: '#10B981'
  }
];

export default function Why() {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ['start center', 'end center'] });

  return (
    <div className="bg-[#050e12] min-h-screen text-[#f0f8fa] font-['Inter'] relative overflow-x-hidden selection:bg-[#38768B]/30">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none z-0" />
      
      {/* ── HERO ── */}
      <section className="relative w-screen min-h-[70vh] md:min-h-[85vh] flex flex-col items-center justify-center text-center overflow-hidden mb-20 border-b border-white/5">
        <div className="absolute inset-0 z-[1]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050e12]/40 via-[#050e12]/10 to-[#050e12] z-10 pointer-events-none" />
          <motion.img 
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop" 
            alt="Calm and peaceful human mind"
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#38768B]/20 rounded-full blur-[150px] pointer-events-none z-[2]" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#7B52CC]/15 rounded-full blur-[120px] pointer-events-none z-[2]" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 mt-24">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <Target size={14} className="text-[#7EC8C8]" />
            <span className="text-xs uppercase tracking-widest text-[#7EC8C8] font-semibold">The Difference</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="font-['Playfair_Display'] text-[42px] md:text-[64px] lg:text-[80px] font-black tracking-tight mb-6 leading-[1.05] drop-shadow-2xl">
            Why Choose <br className="md:hidden" /><span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7EC8C8] to-[#38768B]">Soulify?</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-[#A7C4BC] font-light leading-relaxed drop-shadow-md">
            We aren't just another AI wrapper. Soulify is a purpose-built emotional intelligence engine designed by mental health professionals.
          </motion.p>
        </div>
      </section>

      {/* ── THE FOUR CORNERSTONES (Sticky Timeline) ── */}
      <section className="relative px-6 py-20" ref={scrollRef}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 relative">
          
          {/* Left: Sticky Header */}
          <div className="md:w-1/3 relative">
            <div className="sticky top-40 relative z-10 pr-8">
              <h2 className="font-['Playfair_Display'] text-[36px] md:text-[48px] font-black mb-4 leading-[1.1] tracking-tight">Our Four<br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7EC8C8] to-[#38768B]">Cornerstones</span></h2>
              <p className="text-[#A7C4BC] text-base mb-6 leading-relaxed max-w-sm">The foundational pillars that make Souli the most empathetic AI on the planet.</p>
              
              <div className="hidden md:block w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent mt-8" />
            </div>
          </div>

          {/* Right: Scrolling Timeline Cards */}
          <div className="md:w-2/3 flex flex-col pb-32 relative">
            {/* The Track */}
            <div className="absolute top-0 bottom-0 left-8 md:left-12 w-[2px] bg-white/5 hidden md:block" />
            {/* The Glowing Progress Line */}
            <motion.div 
              className="absolute top-0 left-8 md:left-12 w-[2px] bg-gradient-to-b from-[#7EC8C8] via-[#7B52CC] to-[#EC4899] origin-top hidden md:block"
              style={{ scaleY: scrollYProgress }}
            />

            <div className="flex flex-col gap-16 md:gap-24 pt-8">
              {cornerstones.map((item, i) => (
                <motion.div 
                  key={i} 
                  {...fadeUp(0.1)} 
                  className="relative group md:pl-32"
                >
                  {/* Timeline Node */}
                  <div className="hidden md:block absolute top-10 left-[39px] w-5 h-5 rounded-full bg-[#050e12] border-4 border-[#38768B] z-20 transition-transform duration-500 group-hover:scale-150 group-hover:border-[#7EC8C8] shadow-[0_0_20px_rgba(126,200,200,0.5)] -translate-x-[10px]" />
                  
                  {/* Card Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-[1500ms] blur-3xl rounded-full pointer-events-none" style={{ backgroundColor: item.color }} />
                  
                  <div className="bg-[#0a1c24]/80 border border-white/10 rounded-[32px] p-8 md:p-10 backdrop-blur-2xl relative z-10 hover:border-white/20 transition-all duration-500 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:-translate-y-2">
                    
                    {/* Subtle inner radial gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none rounded-full blur-[80px] transition-opacity duration-700 group-hover:opacity-40" style={{ backgroundColor: item.color }} />
                    
                    {/* Large elegant background number */}
                    <div className="absolute -bottom-10 -right-4 font-['Playfair_Display'] text-[180px] font-black opacity-[0.02] pointer-events-none select-none transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-4" style={{ color: item.color }}>
                      0{i + 1}
                    </div>

                    <div className="flex items-center gap-6 mb-8 relative z-10">
                      <div className="w-16 h-16 rounded-[20px] flex items-center justify-center border shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shrink-0" style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}40`, boxShadow: `0 10px 30px ${item.color}20` }}>
                        <item.icon size={32} color={item.color} />
                      </div>
                      <h3 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-white leading-[1.2] tracking-tight">{item.title}</h3>
                    </div>
                    
                    <p className="text-[#A7C4BC] text-lg leading-relaxed font-light relative z-10">{item.desc}</p>
                    
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ease-out" style={{ backgroundColor: item.color }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-32 px-6 relative bg-gradient-to-b from-[#0a1c24] to-[#050e12]">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16 relative z-10" {...fadeUp()}>
            <span className="text-xs uppercase tracking-widest text-[#EC4899] font-semibold mb-4 block">The Competition</span>
            <h2 className="font-['Playfair_Display'] text-[36px] md:text-[56px] font-black mb-4 leading-[1.1] tracking-tight">Souli vs. <span className="text-white/40">Generic AI</span></h2>
            <p className="text-[#A7C4BC] text-lg max-w-2xl mx-auto">Why specialized empathy engines outperform general-purpose LLMs in wellness applications.</p>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="grid grid-cols-3 border-b border-white/10 bg-white/5">
              <div className="p-4 md:p-6 flex items-center text-base font-bold text-white/50">Feature</div>
              <div className="p-4 md:p-6 flex items-center justify-center text-lg font-bold text-white/40 border-l border-white/10">ChatGPT / Claude</div>
              <div className="p-4 md:p-6 flex items-center justify-center text-xl font-bold text-white border-l border-white/10 bg-[#38768B]/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#38768B]/30 to-transparent" />
                <span className="relative z-10 flex items-center gap-2"><Sparkles className="text-[#7EC8C8]" size={20}/> Souli</span>
              </div>
            </div>

            {[
              ['Clinical Guardrails (CBT/DBT)', false, true],
              ['Long-term Memory & Context', false, true],
              ['Data Privacy (No Training on User Data)', false, true],
              ['28-State Deep Emotion Recognition', false, true],
              ['Proactive Check-ins & Reports', false, true],
              ['Beautiful Ambient Interface', false, true],
            ].map(([feature, generic, souli], i) => (
              <div key={i} className="grid grid-cols-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                <div className="p-4 md:p-6 text-[#A7C4BC] font-medium flex items-center text-sm md:text-base">{feature}</div>
                <div className="p-4 md:p-6 flex items-center justify-center border-l border-white/5">
                  {generic ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500/50" />}
                </div>
                <div className="p-4 md:p-6 flex items-center justify-center border-l border-white/5 bg-[#38768B]/5">
                  {souli ? <Check size={24} className="text-[#7EC8C8]" style={{ filter: 'drop-shadow(0 0 8px rgba(126,200,200,0.5))' }} /> : <X size={20} className="text-red-500" />}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 px-6 overflow-hidden bg-[#050e12]">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-[#7B52CC]/20 rounded-[100%] blur-[120px] pointer-events-none" />
        
        <motion.div className="max-w-3xl mx-auto text-center relative z-10" {...fadeUp()}>
          <h2 className="font-['Playfair_Display'] text-[42px] md:text-[64px] font-black mb-6 leading-[1.05] tracking-tight">Experience the <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7B52CC] to-[#EC4899]">Difference</span></h2>
          <p className="text-[#A7C4BC] text-lg mb-10">Start your journey today. Free forever for core features.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/chat" className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-[#7B52CC] to-[#EC4899] rounded-full hover:shadow-[0_0_40px_rgba(123,82,204,0.5)] hover:-translate-y-1 text-lg">
              <span className="flex items-center gap-2">Start Talking <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}