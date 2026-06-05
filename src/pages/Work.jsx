import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Award, TrendingUp, Users, Star, Layers, Activity } from 'lucide-react';

const fadeUp = () => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.15, ease: "easeOut" },
});

const projects = [
  {
    id: '01',
    title: 'Emotion Engine v3.0',
    category: 'AI Research',
    desc: 'Our most advanced emotion classifier yet — 28 states, 94% accuracy, real-time inference under 120ms. Trained on 2M+ anonymized conversations.',
    tags: ['NLP', 'PyTorch', 'BERT', 'Real-Time'],
    accent: '#38768B',
    stat: ['94%', 'Accuracy'],
    year: '2024',
    icon: Activity,
    videoSrc: 'https://media.w3.org/2010/05/sintel/trailer.mp4'
  },
  {
    id: '02',
    title: 'Color Psychology Engine',
    category: 'Wellness Design',
    desc: 'A dynamic chromotherapy system that adapts the entire UI palette in real-time based on detected emotion — shifting users toward calm through science-backed color theory.',
    tags: ['Color Theory', 'React', 'CSS Variables', 'Psychology'],
    accent: '#7B52CC',
    stat: ['38%', 'Mood Lift'],
    year: '2024',
    icon: Layers,
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    id: '03',
    title: 'Souli Insight Reports',
    category: 'Data Visualization',
    desc: 'Weekly personal emotion reports with beautiful data visualizations — radar charts, mood timelines, and trigger analysis delivered to each user.',
    tags: ['D3.js', 'Python', 'MongoDB', 'Data Viz'],
    accent: '#EC4899',
    stat: ['500K+', 'Reports'],
    year: '2023',
    icon: TrendingUp,
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: '04',
    title: 'Adaptive Meditation Library',
    category: 'Content Platform',
    desc: 'A curated library of 200+ guided meditations, breathing exercises, and affirmations — dynamically surfaced based on your current emotional state.',
    tags: ['Content', 'Recommendation AI', 'Audio', 'UX'],
    accent: '#10B981',
    stat: ['200+', 'Sessions'],
    year: '2023',
    icon: Users,
    videoSrc: 'https://www.w3schools.com/tags/movie.mp4'
  },
];

const achievements = [
  { icon: Award, label: 'Best Mental Health App 2024', by: 'ProductHunt', color: '#F59E0B' },
  { icon: TrendingUp, label: '#1 Trending on App Store', by: 'Health & Fitness', color: '#10B981' },
  { icon: Users, label: '12,000+ Active Users', by: 'Worldwide', color: '#38768B' },
  { icon: Star, label: '4.9 / 5 Average Rating', by: '2,400+ Reviews', color: '#EC4899' },
];

function ProjectCard({ project, index }) {
  const isEven = index % 2 === 0;

  return (
    <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24 mb-32`}>
      
      {/* Project Image / Visual Placeholder */}
      <div className="w-full lg:w-1/2 relative">
        <motion.div className="relative z-10 w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a1c24] flex flex-col justify-between transition-transform duration-500 group-hover:scale-[1.02]">
          
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen scale-150"
              style={{ filter: 'blur(20px) contrast(200%) grayscale(50%) hue-rotate(45deg)' }}
            >
              <source src={project.videoSrc} type="video/mp4" />
            </video>
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1c24] via-[#0a1c24]/40 to-transparent" />
          </div>

          <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${project.accent}, transparent)` }} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz48L3N2Zz4=')] mix-blend-overlay z-0" />
          
          <div className="flex justify-between items-start relative z-10">
            <span className="font-['Playfair_Display'] text-[80px] font-black text-white/10 leading-none">{project.id}</span>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-md">
               <project.icon size={28} style={{ color: project.accent }} />
            </div>
          </div>
          
          <div className="relative z-10 flex items-end justify-between">
             <div className="flex flex-wrap gap-2">
               {project.tags.map((tag, i) => (
                 <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold border border-white/10 bg-black/20 text-[#A7C4BC] backdrop-blur-sm">
                   {tag}
                 </span>
               ))}
             </div>
          </div>
        </motion.div>
        
        {/* Glow behind image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full blur-[100px] -z-10" style={{ background: project.accent, opacity: 0.15 }} />
      </div>

      {/* Project Details */}
      <motion.div {...fadeUp()} className="w-full lg:w-1/2 space-y-8">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border" style={{ color: project.accent, borderColor: `${project.accent}50`, backgroundColor: `${project.accent}10` }}>
            {project.category}
          </span>
          <span className="text-[#A7C4BC] text-sm font-medium">{project.year}</span>
        </div>
        
        <h2 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight">
          {project.title}
        </h2>
        
        <p className="text-[#A7C4BC] text-lg font-light leading-relaxed">
          {project.desc}
        </p>

        <div className="flex items-center gap-4 pt-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
            <TrendingUp size={20} style={{ color: project.accent }} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{project.stat[0]}</div>
            <div className="text-xs text-[#A7C4BC] uppercase tracking-wider">{project.stat[1]}</div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

export default function Work() {
  return (
    <div className="bg-[#050e12] min-h-screen text-[#f0f8fa] font-['Inter'] relative overflow-hidden selection:bg-[#38768B]/30 pt-24">
      
      {/* ── HERO ── */}
      <section className="relative py-20 px-6 min-h-[60vh] flex flex-col justify-center items-center text-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
        <div className="absolute top-0 w-full max-w-4xl h-[400px] bg-[#38768B]/20 rounded-full blur-[150px] pointer-events-none -translate-y-1/2" />
        
        <motion.div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#38768B]/30 bg-white/5 backdrop-blur-md">
            <Award size={14} className="text-[#38768B]" />
            <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold">Our Work</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
            className="font-['Playfair_Display'] text-[56px] md:text-[80px] lg:text-[96px] font-black tracking-tight mb-8 leading-[1.05]">
            The Work Behind <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7EC8C8] to-[#38768B]">Every Breakthrough</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
            className="text-lg md:text-xl text-[#A7C4BC] font-light leading-relaxed max-w-2xl">
            Six major products and systems built to make emotional wellness more intelligent, beautiful, and accessible.
          </motion.p>
        </motion.div>
      </section>

      {/* ── ACHIEVEMENTS MARQUEE / GRID ── */}
      <section className="relative z-20 py-12 border-y border-white/5 bg-[#050e12]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((a, i) => (
              <motion.div key={i} {...fadeUp()} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ color: a.color }}>
                  <a.icon size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{a.label}</div>
                  <div className="text-xs text-[#A7C4BC]">{a.by}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS GALLERY ── */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[#0A1E26]/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-[#38768B]/20 rounded-[100%] blur-[120px] pointer-events-none" />
        
        <motion.div className="max-w-3xl mx-auto text-center relative z-10" {...fadeUp()}>
          <h2 className="font-['Playfair_Display'] text-[48px] md:text-[72px] font-black mb-6 leading-[1.1] tracking-tight">See the Work <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-[#A7C4BC]">In Action</span></h2>
          <p className="text-[#A7C4BC] text-lg mb-10">The best way to understand Soulify is to feel it yourself.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/chat" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-[#38768B] to-[#2F5D6E] rounded-xl hover:shadow-[0_0_30px_rgba(56,118,139,0.4)] hover:-translate-y-1">
              <span className="flex items-center gap-2">Try Souli Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <Link to="/about" className="inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 border border-white/20 rounded-xl hover:bg-white/10 hover:-translate-y-1">
              Meet the Team
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}