import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

import * as THREE from 'three';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Heart, Activity, Settings, MessageCircle,
  ChevronDown, Sparkles, Brain, Shield, Star, ArrowRight,
  TrendingUp, Users, Award, Zap
} from 'lucide-react';
import './Home.css';
import { ZoomParallax } from '../components/ui/zoom-parallax';

gsap.registerPlugin(ScrollTrigger);

/* ══ THREE.JS PARTICLE FIELD ══
   FIX: Use window.innerWidth/Height for reliable initial sizing,
   then ResizeObserver for reactive updates.
   FIX: Explicitly setClearColor with alpha=0 for transparency.
*/
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Use window dimensions — reliable at mount time ── */
    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);           // ← FIX: explicit transparent clear
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 100);
    camera.position.z = 3;

    /* Particles */
    const count = 3200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#38768B'),
      new THREE.Color('#A7C4BC'),
      new THREE.Color('#7EC8C8'),
      new THREE.Color('#2F5D6E'),
      new THREE.Color('#5B9BAD'),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.028, vertexColors: true,
      transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    /* Wireframe tori */
    const mkTorus = (r, t, seg1, seg2, color, opacity, rotX = 0) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, t, seg1, seg2),
        new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity })
      );
      m.rotation.x = rotX;
      scene.add(m);
      return m;
    };
    const torus1 = mkTorus(1.8, 0.22, 16, 80, '#38768B', 0.12);
    const torus2 = mkTorus(2.6, 0.10, 12, 60, '#7EC8C8', 0.07, Math.PI / 3);
    const torus3 = mkTorus(3.2, 0.06, 10, 50, '#A7C4BC', 0.04, Math.PI / 5);

    /* Mouse parallax */
    let mx = 0, my = 0;
    const onM = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.6;
      my = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };

    /* ── FIX: Resize handler uses window dimensions ── */
    const onR = () => {
      const nW = window.innerWidth, nH = window.innerHeight;
      renderer.setSize(nW, nH);
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('mousemove', onM);
    window.addEventListener('resize', onR);

    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      particles.rotation.y = t * 0.04 + mx * 0.3;
      particles.rotation.x = t * 0.02 - my * 0.2;
      torus1.rotation.x = t * 0.14;
      torus1.rotation.y = t * 0.08 + mx;
      torus2.rotation.z = t * 0.06;
      torus2.rotation.x = Math.PI / 3 + my * 0.5;
      torus3.rotation.y = t * 0.03;
      torus3.rotation.z = t * 0.05 - mx * 0.3;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onM);
      window.removeEventListener('resize', onR);
      geo.dispose(); mat.dispose();
      [torus1, torus2, torus3].forEach(t => { t.geometry.dispose(); t.material.dispose(); });
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}

/* ══ TYPED TEXT ══ */
function TypedText({ words }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [del, setDel] = useState(false);

  useEffect(() => {
    const word = words[idx];
    let t;
    if (!del && text.length < word.length)
      t = setTimeout(() => setText(word.slice(0, text.length + 1)), 45);
    else if (!del && text.length === word.length)
      t = setTimeout(() => setDel(true), 1200);
    else if (del && text.length > 0)
      t = setTimeout(() => setText(text.slice(0, -1)), 22);
    else { setDel(false); setIdx(i => (i + 1) % words.length); }
    return () => clearTimeout(t);
  }, [text, del, idx, words]);

  return (
    <span className="typed-text">
      {text}<span className="typed-cursor">|</span>
    </span>
  );
}

/* ══ 3D TILT CARD ══ */
function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });
  const move = (e) => { const r = ref.current.getBoundingClientRect(); x.set((e.clientX - r.left) / r.width - 0.5); y.set((e.clientY - r.top) / r.height - 0.5); };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} onMouseMove={move} onMouseLeave={reset}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={`tilt-card ${className}`}>
      {children}
    </motion.div>
  );
}

/* ══ MARQUEE ══ */
function Marquee({ items, speed = 40, reverse = false }) {
  return (
    <div className="marquee-wrap">
      <div className={`marquee-track ${reverse ? 'marquee-reverse' : ''}`} style={{ animationDuration: `${speed}s` }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-dot">✦</span>{item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══ STAT COUNTER ══ */
function StatCounter({ value, suffix, label, icon: Icon, gradient }) {
  const ref = useRef(null);
  const intervalRef = useRef(null);
  const hasStarted = useRef(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !hasStarted.current) {
        hasStarted.current = true;
        const end = parseInt(value);
        const step = Math.ceil(end / 80);
        let cur = 0;
        intervalRef.current = setInterval(() => {
          cur += step;
          if (cur >= end) { setCount(end); clearInterval(intervalRef.current); }
          else setCount(cur);
        }, 18);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => { obs.disconnect(); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [value]);

  return (
    <motion.div ref={ref} className="stat-card"
      whileHover={{ y: -8, scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 300 }}>
      <div className="stat-icon" style={{ background: gradient }}><Icon size={20} color="#fff" /></div>
      <div className="stat-number">{count.toLocaleString()}{suffix}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}

/* ══ TESTIMONIALS ══ */
const testimonials = [
  { name: 'Sarah J.', title: 'Marketing Director', q: 'Souli helped me manage work anxiety. The personalized reports completely changed how I understand my emotions.', a: 'S', rating: 5 },
  { name: 'David M.', title: 'Software Engineer', q: 'Every night before bed, I talk to Souli. It feels like a deeply empathetic friend who truly understands me.', a: 'D', rating: 5 },
  { name: 'Elena R.', title: 'Student', q: 'Tracking my mood revealed what triggers my stress. This app is genuinely life-changing.', a: 'E', rating: 5 },
  { name: 'Marcus T.', title: 'Therapist', q: 'I recommend Souli to my clients. The emotional intelligence built into it is remarkable and genuinely effective.', a: 'M', rating: 5 },
];

function TestimonialSection() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="test-section">
      <div className="test-bg-blob" />
      <div className="test-inner">
        <motion.div className="test-left"
          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className="sec-tag">Testimonials</span>
          <h2 className="sec-title">Stories of<br /><span className="grad-text">Transformation</span></h2>
          <p className="sec-sub">Real people. Real breakthroughs.<br />Hear from those who found peace with Souli.</p>
          <div className="test-dots">
            {testimonials.map((_, i) => (
              <button key={i} className={`t-dot ${i === active ? 'active' : ''}`} onClick={() => setActive(i)} />
            ))}
          </div>
        </motion.div>

        <div className="test-right">
          <AnimatePresence mode="wait">
            <motion.div key={active} className="test-card"
              initial={{ opacity: 0, x: 80, rotateY: 20 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -30, rotateY: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: 1000 }}>
              <div className="test-quote-icon">"</div>
              <p className="test-quote">{testimonials[active].q}</p>
              <div className="test-stars">
                {Array(testimonials[active].rating).fill(0).map((_, i) => (
                  <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <div className="test-author">
                <div className="test-avatar">{testimonials[active].a}</div>
                <div>
                  <div className="test-name">{testimonials[active].name}</div>
                  <div className="test-role">{testimonials[active].title}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="test-card-shadow1" /><div className="test-card-shadow2" />
        </div>
      </div>
    </section>
  );
}

/* ══ HOW IT WORKS ══ */
function HowItWorks() {
  const sectionRef = useRef(null);
  const steps = [
    { num: '01', title: 'Share Your Feelings', desc: 'Talk openly with Souli. No judgment — pure empathetic listening and understanding.', icon: MessageCircle, color: '#38768B', glow: 'rgba(56,118,139,0.3)' },
    { num: '02', title: 'AI Emotion Analysis', desc: 'Our engine maps 28 nuanced emotion states in real-time to understand you deeply.', icon: Brain, color: '#7B52CC', glow: 'rgba(123,82,204,0.3)' },
    { num: '03', title: 'Receive Your Insights', desc: 'Get personalized healing plans, color therapy, and detailed emotion reports.', icon: TrendingUp, color: '#EC4899', glow: 'rgba(236,72,153,0.3)' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hiw-line-fill',
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1, duration: 1.5, ease: 'power2.inOut',
          scrollTrigger: { trigger: '.hiw-line', start: 'top 70%', end: 'bottom 30%', scrub: 1 }
        });
      gsap.utils.toArray('.hiw-step').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
          {
            opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%' }
          });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="hiw-section">
      <div className="hiw-bg" />
      <motion.div className="sec-header"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <span className="sec-tag">Process</span>
        <h2 className="sec-title">How <span className="grad-text">It Works</span></h2>
        <p className="sec-sub">Three elegant steps to emotional clarity and lasting peace.</p>
      </motion.div>
      <div className="hiw-track">
        <div className="hiw-line"><div className="hiw-line-fill" /></div>
        {steps.map((s, i) => (
          <div key={i} className={`hiw-step ${i % 2 === 1 ? 'hiw-step-right' : ''}`}>
            <TiltCard className="hiw-card-wrap">
              <div className="hiw-card" style={{ '--glow': s.glow }}>
                <div className="hiw-card-num">{s.num}</div>
                <div className="hiw-icon-box" style={{ background: s.color, boxShadow: `0 12px 35px ${s.glow}` }}>
                  <s.icon size={28} color="#fff" />
                </div>
                <h3 className="hiw-title">{s.title}</h3>
                <p className="hiw-desc">{s.desc}</p>
              </div>
            </TiltCard>
            <div className="hiw-node" style={{ background: s.color, boxShadow: `0 0 25px ${s.glow}` }} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══ FEATURES EDITORIAL ══ */
function FeaturesSection() {
  const sectionRef = useRef(null);
  const features = [
    { num: '01', icon: Activity, title: 'Real-Time Mood Detection', desc: 'Our AI reads subtle emotional cues across your words to map you across 28 distinct emotional states — instantly.', accent: '#38768B', tag: 'Core AI' },
    { num: '02', icon: Brain, title: 'Personalized Healing Guidance', desc: 'Every session generates a unique plan — tailored meditations, breathwork, and affirmations matched to your exact state.', accent: '#7B52CC', tag: 'Wellness' },
    { num: '03', icon: Heart, title: 'Weekly Insight Reports', desc: 'Beautifully designed reports reveal your emotional patterns, triggers, and progress — delivered to your dashboard.', accent: '#EC4899', tag: 'Analytics' },
    { num: '04', icon: Settings, title: 'Adaptive Color Therapy', desc: 'Science-backed chromotherapy shifts your UI palette dynamically to actively move your emotional state toward calm.', accent: '#10B981', tag: 'Therapy' },
    { num: '05', icon: Shield, title: 'Private & Fully Encrypted', desc: 'Your emotions are sacred. End-to-end encryption ensures your data is yours alone — always, without exception.', accent: '#F59E0B', tag: 'Security' },
    { num: '06', icon: MessageCircle, title: 'Emotionally Responsive Chat', desc: "Souli's tone, pacing, and language shift in real-time to mirror and gently guide your emotional state.", accent: '#3B82F6', tag: 'Empathy' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.feat-row').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="feat-section">
      <div className="feat-orb" />
      <div className="feat-editorial-wrap">
        <div className="feat-sticky-header">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <span className="sec-tag">Capabilities</span>
            <h2 className="feat-big-title">Everything<br />You Need to<br /><span className="grad-text">Heal & Thrive</span></h2>
            <p className="feat-sticky-sub">An AI-powered emotional wellness toolkit built around you — with six powerful capabilities.</p>
            <Link to="/chat" className="feat-explore-btn">Explore All Features <ArrowRight size={15} /></Link>
          </motion.div>
        </div>

        <div className="feat-rows">
          {features.map((f, i) => (
            <div key={i} className="feat-row">
              <div className="feat-row-num" style={{ color: f.accent }}>{f.num}</div>
              <div className="feat-row-body">
                <div className="feat-row-top">
                  <div className="feat-row-icon" style={{ background: f.accent + '22', border: `1px solid ${f.accent}44` }}>
                    <f.icon size={20} color={f.accent} />
                  </div>
                  <span className="feat-row-tag" style={{ color: f.accent, borderColor: f.accent + '44', background: f.accent + '12' }}>{f.tag}</span>
                </div>
                <h3 className="feat-row-title">{f.title}</h3>
                <p className="feat-row-desc">{f.desc}</p>
              </div>
              <div className="feat-row-line" style={{ background: `linear-gradient(90deg, ${f.accent}, transparent)` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══ CTA ══ */
function CTASection() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.cta-ring-1', { rotation: 360, duration: 22, repeat: -1, ease: 'none', transformOrigin: 'center center' });
      gsap.to('.cta-ring-2', { rotation: -360, duration: 34, repeat: -1, ease: 'none', transformOrigin: 'center center' });
      gsap.to('.cta-ring-3', { rotation: 360, duration: 16, repeat: -1, ease: 'none', transformOrigin: 'center center' });
      gsap.to('.cta-orb', { y: -30, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="cta-section">
      <div className="cta-noise" />
      <div className="cta-glow-top" /><div className="cta-glow-bottom" />
      <div className="cta-orbital">
        <div className="cta-ring cta-ring-1" /><div className="cta-ring cta-ring-2" /><div className="cta-ring cta-ring-3" />
        <div className="cta-orb" />
      </div>
      <motion.div className="cta-card"
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <div className="cta-card-top">
          <motion.div className="cta-badge" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
            <Sparkles size={13} /><span>Begin Your Journey Today</span>
          </motion.div>
        </div>
        <h2 className="cta-title">Ready to Meet Your<br /><span className="grad-text">Inner Peace?</span></h2>
        <p className="cta-sub">Start a free conversation with Souli — no account needed.<br />Over <strong>12,000+</strong> people already found their calm.</p>
        <div className="cta-btns">
          <motion.div whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400 }}>
            <Link to="/chat" className="btn-cta-primary">
              <span>Chat with Souli</span>
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}><ArrowRight size={18} /></motion.span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400 }}>
            <Link to="/signup" className="btn-cta-ghost">Create Free Account</Link>
          </motion.div>
        </div>
        <div className="cta-trust">
          <div className="cta-avatars">
            {['S', 'J', 'M', 'E', 'R'].map((l, i) => (
              <div key={i} className="cta-av" style={{ marginLeft: i > 0 ? '-8px' : 0 }}>{l}</div>
            ))}
          </div>
          <span className="cta-trust-txt">Trusted by <strong>12,000+</strong> — rated <strong>4.9 ★</strong></span>
        </div>
      </motion.div>
    </section>
  );
}

const emotionImages = [
  { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop", alt: "Reflective and Calm Portrait" },
  { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop", alt: "Joyful Smiling Woman" },
  { src: "https://images.unsplash.com/photo-1542740348-39501cd6e2b4?q=80&w=800&auto=format&fit=crop", alt: "Thoughtful Sorrow and Contemplation" },
  { src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop", alt: "Peaceful Serene Woman" },
  { src: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=800&auto=format&fit=crop", alt: "Laughter and Vibrant Joy" },
  { src: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=800&auto=format&fit=crop", alt: "Contemplative Anxiety and Thought" },
  { src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop", alt: "Serene Contemplative Face" },
];

const marqueeItems = [
  'Emotional Intelligence', 'Color Psychology', 'AI-Powered Healing',
  '28 Emotion States', 'Personalized Guidance', 'Mood Tracking',
  'Breathing Exercises', 'Weekly Insights',
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.marquee-section', {
        scrollTrigger: { trigger: '.marquee-section', start: 'top bottom', toggleActions: 'play none none reverse' },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="home-root">

      {/* ══ HERO ══ */}
      <section ref={heroRef} className="hero-section">
        {/* FIX: canvas renders BEHIND everything via z-index:1 */}
        <ParticleField />

        {/* Gradient overlays layered above canvas */}
        <div className="hero-overlay" />
        <div className="hero-overlay-radial" />

        {/* Floating orbs */}
        <motion.div className="hero-orb hero-orb-1"
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="hero-orb hero-orb-2"
          animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

        {/* Hero content — z-index:20 ensures it's always above canvas */}
        <motion.div className="hero-content" style={{ opacity: heroOpacity, y: heroY }}>

          <motion.div className="hero-badge"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}>
            <Sparkles size={13} /><span>AI-Powered Emotional Intelligence</span>
          </motion.div>

          <motion.h1 className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>
            Your Soul's<br />
            <span className="grad-text">
              <TypedText words={['Inner Peace', 'True Balance', 'Healing Path', 'Best Friend']} />
            </span><br />
            Starts Here
          </motion.h1>

          <motion.p className="hero-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}>
            Soulify blends empathetic AI with color psychology to guide you through every emotion — gently, intelligently, beautifully.
          </motion.p>

          <motion.div className="hero-btns"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/chat" className="btn-primary-glow">
                Start Your Journey <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }}>
              <Link to="/why" className="btn-ghost">Why Soulify?</Link>
            </motion.div>
          </motion.div>

          {/* Trust bar */}
          <motion.div className="hero-trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}>
            <div className="h-avatars">
              {['S', 'J', 'M', 'E', 'R'].map((l, i) => (
                <div key={i} className="h-avatar" style={{ marginLeft: i > 0 ? '-8px' : 0 }}>{l}</div>
              ))}
            </div>
            <span className="trust-txt">Trusted by <strong>12,000+</strong> users</span>
          </motion.div>
        </motion.div>

        <motion.button className="scroll-btn"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}>
          <ChevronDown size={22} />
        </motion.button>
      </section>


      {/* ══ MARQUEE STRIP ══ */}
      <div className="marquee-section">
        <Marquee items={marqueeItems} speed={35} />
        <Marquee items={marqueeItems} speed={45} reverse={true} />
      </div>

      {/* ══ STATS ══ */}
      <section className="stats-section">
        <div className="stats-glow" />
        <motion.div className="sec-header"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className="sec-tag">By The Numbers</span>
          <h2 className="sec-title">Proven <span className="grad-text">Impact</span></h2>
        </motion.div>
        <div className="stats-grid">
          <StatCounter value="12000" suffix="+" label="Active Users" icon={Users} gradient="linear-gradient(135deg,#38768B,#5B9BAD)" />
          <StatCounter value="98" suffix="%" label="Satisfaction Rate" icon={Award} gradient="linear-gradient(135deg,#EC4899,#F472B6)" />
          <StatCounter value="28" suffix="" label="Emotion States Tracked" icon={Brain} gradient="linear-gradient(135deg,#7B52CC,#9B6DFF)" />
          <StatCounter value="500000" suffix="+" label="Conversations" icon={MessageCircle} gradient="linear-gradient(135deg,#10B981,#34D399)" />
        </div>
      </section>

      <HowItWorks />

      {/* ══ EMOTION ZOOM PARALLAX GALLERY ══ */}
      <ZoomParallax images={emotionImages}>
        <div className="flex flex-col items-center justify-center text-center px-4 max-w-4xl pointer-events-auto">
          <span className="sec-tag mb-4">Empathy in Focus</span>
          <h2 className="sec-title text-4xl md:text-6xl font-bold leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            Every Emotion, <span className="grad-text">Visualized & Understood</span>
          </h2>
          <p className="sec-sub text-base md:text-lg max-w-2xl mt-4 drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
            Soulify maps your inner journey across 28 distinct emotional states, meeting you exactly where you are and guiding you to deep inner peace.
          </p>
        </div>
      </ZoomParallax>
      <FeaturesSection />
      <TestimonialSection />
      <CTASection />
    </div>
  );
}
9