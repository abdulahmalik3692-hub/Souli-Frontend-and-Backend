import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Heart, Brain, Shield, Sparkles, Users, Award, ArrowRight, Zap } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.15, ease: "easeOut" },
});

const team = [
  { name: 'Aria Chen', role: 'CEO & Co-Founder', avatar: 'A', color: '#38768B', bio: 'Neuroscience + AI background. Passionate about emotional accessibility.' },
  { name: 'Marcus Webb', role: 'CTO & Co-Founder', avatar: 'M', color: '#7B52CC', bio: 'Built ML systems at scale. Believes tech should heal, not harm.' },
  { name: 'Leila Raza', role: 'Head of Wellness', avatar: 'L', color: '#EC4899', bio: 'Licensed therapist turned product thinker. 10 years in mental health.' },
  { name: 'James Osei', role: 'Lead AI Engineer', avatar: 'J', color: '#10B981', bio: 'Specializes in NLP and emotion recognition models at 28-label depth.' },
];

const values = [
  { icon: Heart, title: 'Radical Empathy', desc: 'Every feature starts with one question: how does this make people feel?', color: '#EC4899' },
  { icon: Shield, title: 'Privacy First', desc: 'Your emotional data is sacred. We encrypt everything and sell nothing.', color: '#38768B' },
  { icon: Brain, title: 'Science-Backed', desc: 'Our emotion engine is built on peer-reviewed psychology and neuroscience.', color: '#7B52CC' },
  { icon: Sparkles, title: 'Beautiful Design', desc: 'Healing should feel as good as it works. Aesthetics are part of therapy.', color: '#F59E0B' },
  { icon: Users, title: 'Inclusive Access', desc: 'Mental wellness is not a luxury. Souli is free to start, always.', color: '#10B981' },
  { icon: Zap, title: 'Continuous Growth', desc: 'Our AI learns. Our team grows. Our product evolves with your needs.', color: '#3B82F6' },
];

function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });

  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={move} onMouseLeave={reset}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={className}>
      {children}
    </motion.div>
  );
}

export default function About() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="bg-[#050e12] min-h-screen text-[#f0f8fa] font-['Inter'] overflow-hidden selection:bg-[#38768B]/30">
      
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-6">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#38768B]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7EC8C8]/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Particle/Grid Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz48L3N2Zz4=')] opacity-50" />

        <motion.div style={{ y: yBg, opacity }} className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#38768B]/30 bg-white/5 backdrop-blur-md">
            <Sparkles size={14} className="text-[#7EC8C8]" />
            <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold">About Us</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            We Built Souli <br className="hidden md:block"/>
            Because <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A7C4BC] to-[#38768B]">Emotions Matter</span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
            className="text-lg md:text-xl text-[#A7C4BC] max-w-2xl font-light leading-relaxed mb-16">
            A team of therapists, engineers, and designers united by one belief —
            everyone deserves access to emotional clarity, regardless of circumstance.
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
            {[['2022', 'Founded'], ['12K+', 'Users'], ['28', 'Emotions Tracked'], ['4.9★', 'Average Rating']].map(([n, l], i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
                className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="text-3xl font-bold text-white mb-2">{n}</span>
                <span className="text-sm text-[#A7C4BC] font-medium tracking-wide uppercase">{l}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── STORY ── */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <motion.div className="flex-1 space-y-6" {...fadeUp(0)}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
              <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
              <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold">Our Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">Born From <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-[#EC4899] to-[#7B52CC]">Personal Pain</span></h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#EC4899] to-transparent rounded-full" />
          </motion.div>

          <motion.div className="flex-1 space-y-8 text-[#A7C4BC] text-lg font-light leading-relaxed" {...fadeUp(0.2)}>
            <p className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#7B52CC]" />
              In 2022, our co-founders Aria and Marcus both experienced the same frustration —
              therapy was expensive, inaccessible, and rarely available at 2am when anxiety hits hardest.
            </p>
            <p>
              They asked: <em className="text-white font-medium">"What if AI could understand not just what you say, but how you feel when you say it?"</em> That question became Soulify.
            </p>
            <p>
              Today, Soulify tracks 28 distinct emotional states, generates personalized healing plans,
              and has guided over 500,000 conversations — each one moving someone closer to calm.
            </p>
            <Link to="/chat" className="inline-flex items-center gap-2 text-white font-semibold group mt-4">
              Try Souli Free 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050e12] via-[#38768B]/5 to-[#050e12]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div className="text-center mb-20" {...fadeUp()}>
            <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold mb-4 block">What We Stand For</span>
            <h2 className="text-4xl md:text-5xl font-bold">Our Core <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7EC8C8] to-[#38768B]">Values</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <TiltCard key={i}>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.15 }}
                  className="h-full p-8 rounded-[2rem] bg-[#0A1E26]/80 border border-white/5 backdrop-blur-xl group relative overflow-hidden flex flex-col hover:border-white/10 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to bottom right, ${v.color}, transparent)` }} />
                  
                  <div className="w-14 h-14 rounded-2xl mb-8 flex items-center justify-center relative z-10" style={{ backgroundColor: `${v.color}15`, border: `1px solid ${v.color}30` }}>
                    <v.icon size={24} color={v.color} className="group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{v.title}</h3>
                  <p className="text-[#A7C4BC] leading-relaxed relative z-10">{v.desc}</p>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-20" {...fadeUp()}>
            <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold mb-4 block">The People</span>
            <h2 className="text-4xl md:text-5xl font-bold">Meet the <span className="text-white">Team</span></h2>
            <p className="text-[#A7C4BC] mt-4">The humans behind every feature, every word, every moment of calm.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.15 }}
                className="group relative flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full mb-6 p-1 relative transition-transform duration-500 group-hover:scale-105" style={{ background: `linear-gradient(135deg, ${m.color}50, transparent)` }}>
                  <div className="w-full h-full rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl" style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}80)`, color: 'white' }}>
                    {m.avatar}
                  </div>
                  <div className="absolute -inset-4 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10" style={{ backgroundColor: m.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{m.name}</h3>
                <p className="text-sm font-semibold mb-4" style={{ color: m.color }}>{m.role}</p>
                <p className="text-[#A7C4BC] text-sm leading-relaxed max-w-[240px]">{m.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-[#38768B]/20 rounded-[100%] blur-[120px] pointer-events-none" />
        
        <motion.div className="max-w-3xl mx-auto text-center relative z-10" {...fadeUp()}>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to Start Your<br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-[#A7C4BC]">Healing Journey?</span></h2>
          <p className="text-[#A7C4BC] text-lg mb-10">No credit card. No sign-up required. Just Souli, and you.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/chat" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-[#38768B] to-[#2F5D6E] rounded-xl hover:shadow-[0_0_30px_rgba(56,118,139,0.4)] hover:-translate-y-1">
              <span className="flex items-center gap-2">Chat with Souli <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 border border-white/20 rounded-xl hover:bg-white/10 hover:-translate-y-1">
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}