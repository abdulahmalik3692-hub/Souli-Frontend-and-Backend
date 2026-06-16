import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import { 
  Heart, Activity, User, Book, Settings, MessageCircle, ChevronDown, 
  X, Download, Sparkles, LineChart, BookOpen, Smartphone, Play, CheckCircle2,
  ArrowRight, Shield
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FloatingLines from '../components/FloatingLines';

import joyImg from '../assets/human_happy_1780583191369.png';
import sorrowImg from '../assets/human_sad_1780583203693.png';
import calmImg from '../assets/human_calm_1780583260451.png';
import angerImg from '../assets/human_angry_1780583220700.png';
import disgustImg from '../assets/human_stressed_1780583275060.png';
import fearImg from '../assets/human_anxious_1780583244895.png';
import surpriseImg from '../assets/human_confused_1780583315511.png';
import trustImg from '../assets/human_tired_1780583302050.png';
import hopeImg from '../assets/human_excited_1780583232842.png';
import loveImg from '../assets/human_loved_1780583288850.png';

gsap.registerPlugin(ScrollTrigger);

// Custom styles for floating bubbles, laser scanner, and breathing visualizer
const customCss = `
@keyframes blobFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,40px)} }
@keyframes blobFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,-30px)} }
.blob1 { animation: blobFloat1 15s ease-in-out infinite; }
.blob2 { animation: blobFloat2 12s ease-in-out infinite 1s; }

/* Gentle drift paths for floating bubbles in Section 4 */
@keyframes float-p1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -40px) scale(1.08); }
}
@keyframes float-p2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-35px, -25px) scale(1.05); }
}
@keyframes float-p3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, 30px) scale(1.1); }
}
@keyframes float-p4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 45px) scale(1.07); }
}

.float-b1 { animation: float-p1 15s ease-in-out infinite; }
.float-b2 { animation: float-p2 19s ease-in-out infinite 0.5s; }
.float-b3 { animation: float-p3 17s ease-in-out infinite 1.2s; }
.float-b4 { animation: float-p4 16s ease-in-out infinite 0.8s; }
.float-b5 { animation: float-p1 21s ease-in-out infinite 2s; }
.float-b6 { animation: float-p2 14s ease-in-out infinite 1s; }
.float-b7 { animation: float-p3 20s ease-in-out infinite 2.5s; }
.float-b8 { animation: float-p4 18s ease-in-out infinite 3s; }
.float-b9 { animation: float-p1 16s ease-in-out infinite 1.5s; }
.float-b10 { animation: float-p2 22s ease-in-out infinite 0.2s; }

/* Interactive Scanning Laser */
@keyframes laserScan {
  0% { top: 0%; opacity: 0.8; }
  50% { top: 100%; opacity: 0.8; }
  100% { top: 0%; opacity: 0.8; }
}
.laser-line {
  animation: laserScan 2s linear infinite;
}

/* Page fade animation */
@keyframes pageFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* How It Works cards slide-up */
@keyframes cardSlideUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
.how-works-section .how-card {
  animation: cardSlideUp 0.65s ease forwards;
}
.how-works-section .how-card:nth-child(1) { animation-delay: 0.05s; }
.how-works-section .how-card:nth-child(2) { animation-delay: 0.15s; }
.how-works-section .how-card:nth-child(3) { animation-delay: 0.25s; }
.how-works-section .how-card:nth-child(4) { animation-delay: 0.35s; }

.testimonials-swiper { overflow: hidden !important; padding: 0 1rem 3rem; }
.testimonials-swiper .swiper-slide {
  height: auto;
  opacity: 0.5;
  transform: scale(0.92);
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.testimonials-swiper .swiper-slide-active {
  opacity: 1;
  transform: scale(1);
}
@media (min-width: 1100px) {
  .testimonials-swiper .swiper-slide { opacity: 1; transform: scale(1); }
}
`;

const EMOTIONS = [
  {
    id: 'happy',
    name: 'Happy',
    emoji: '😊',
    tagline: 'Radiant Joy & Gratitude',
    desc: 'Embrace the warmth of happiness. Share it, amplify it, and let it light up your path.',
    color: 'from-amber-200 to-orange-300',
    accentColor: '#f59e0b',
    image: joyImg,
    guidance: 'Happiness expands when acknowledged. Take a moment to write down three things you are grateful for today, allowing the positive neural pathways to strengthen.',
    activity: 'Gratitude Reflection & Sharing'
  },
  {
    id: 'sad',
    name: 'Sad',
    emoji: '😢',
    tagline: 'Grief, Release & Healing',
    desc: 'Sadness is the rain that cleanses the spirit. Give yourself permission to feel and let go.',
    color: 'from-blue-200 to-indigo-300',
    accentColor: '#3b82f6',
    image: sorrowImg,
    guidance: 'Honoring your tears is a form of self-love. Sit with this feeling without judgment. Like clouds passing in the sky, this emotion will eventually shift.',
    activity: 'Somatic Emotional Release'
  },
  {
    id: 'angry',
    name: 'Angry',
    emoji: '😠',
    tagline: 'Fiery Energy & Redirection',
    desc: 'Anger holds immense energy. Channel it constructively to establish healthy boundaries.',
    color: 'from-red-200 to-rose-400',
    accentColor: '#f43f5e',
    image: angerImg,
    guidance: 'Anger signals that a boundary was crossed. Take a deep, cooling breath. Direct this physical energy into writing, movement, or establishing positive action steps.',
    activity: 'Cooling Breath (Sitali)'
  },
  {
    id: 'excited',
    name: 'Excited',
    emoji: '🤩',
    tagline: 'Boundless Play & Inspiration',
    desc: 'Thrill in the magic of the present. Let your creative sparks fly and shape your dreams.',
    color: 'from-yellow-200 to-amber-400',
    accentColor: '#eab308',
    image: hopeImg,
    guidance: 'Channel your creative excitement. Grab a notepad and brainstorm without limits. Let this electrical energy fuel your passions.',
    activity: 'Creative Visioning Spark'
  },
  {
    id: 'anxious',
    name: 'Anxious',
    emoji: '😰',
    tagline: 'Anchoring in the Present',
    desc: 'Gently quiet the chatter of the mind. Return your focus to the stability of the Earth.',
    color: 'from-teal-100 to-cyan-300',
    accentColor: '#06b6d4',
    image: fearImg,
    guidance: 'Anxiety lives in the future. Ground yourself using the 5-4-3-2-1 sensory method: acknowledge 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.',
    activity: '5-4-3-2-1 Grounding'
  },
  {
    id: 'calm',
    name: 'Calm',
    emoji: '😌',
    tagline: 'Serenity & Inner Stillness',
    desc: 'Rest in the quiet sanctuary of the heart. The storm has passed; you are safe.',
    color: 'from-teal-200 to-emerald-300',
    accentColor: '#10b981',
    image: calmImg,
    guidance: 'Calm is your natural state of being. Sink deeper into it with every breath. Appreciate this stillness and let it radiate outward to those around you.',
    activity: 'Restorative Meditation'
  },
  {
    id: 'stressed',
    name: 'Stressed',
    emoji: '😬',
    tagline: 'Releasing Tension & Balance',
    desc: 'Unclench your jaw, drop your shoulders. Let go of what you cannot control.',
    color: 'from-purple-200 to-indigo-300',
    accentColor: '#6366f1',
    image: disgustImg,
    guidance: 'Stress builds when we hold too tight. Consciously scan your body, releasing the tension in your shoulders, jaw, and brow. Exhale slowly to tell your nervous system that it is safe.',
    activity: 'Progressive Muscle Relaxation'
  },
  {
    id: 'loved',
    name: 'Loved',
    emoji: '😍',
    tagline: 'Connection & Self-Compassion',
    desc: 'Feel the warm, golden glow of love. You are worthy of love, and you are loved.',
    color: 'from-rose-200 to-pink-300',
    accentColor: '#ec4899',
    image: loveImg,
    guidance: 'Send kindness to yourself. Place both hands over your heart and repeat silently: "May I be happy. May I be healthy. May I live with ease." Feel the warmth expand.',
    activity: 'Loving-Kindness (Metta)'
  },
  {
    id: 'tired',
    name: 'Tired',
    emoji: '😴',
    tagline: 'Deep Rest & Restoration',
    desc: 'Your body is asking for sanctuary. Unplug, drift off, and let your spirit restore.',
    color: 'from-sky-200 to-blue-400',
    accentColor: '#0284c7',
    image: trustImg,
    guidance: 'Rest is not lazy; it is essential. Switch off all screens. Lie comfortably, close your eyes, and listen to a calming soundscape. Let your thoughts float away.',
    activity: 'Yoga Nidra Deep Rest'
  },
  {
    id: 'confused',
    name: 'Confused',
    emoji: '🤔',
    tagline: 'Patience & Inner Knowing',
    desc: 'Do not rush the answer. Trust that clarity is rising like mist clearing at dawn.',
    color: 'from-stone-200 to-slate-400',
    accentColor: '#64748b',
    image: surpriseImg,
    guidance: 'Confusion precedes breakthrough. Stop trying to figure it out with the logical mind. Take a walk or sit in silence, letting the subconscious mind organize and reveal the path.',
    activity: 'Intuitive Reflection Session'
  }
];

const BUBBLES_DATA = [
  { emoji: '😊', name: 'Happy', desc: 'A radiant state of joy and gratitude.', activity: 'Write down 3 things you are thankful for today.', gradient: 'from-amber-200 to-orange-300', floatClass: 'float-b1', top: '15%', left: '10%' },
  { emoji: '😢', name: 'Sad', desc: 'A natural wave of emotional release and healing.', activity: 'Practice a comforting heart hold and release breath.', gradient: 'from-blue-200 to-indigo-300', floatClass: 'float-b2', top: '45%', left: '20%' },
  { emoji: '😠', name: 'Angry', desc: 'A surge of energy signaling boundaries.', activity: 'Take a cooling breath (inhale through curled tongue).', gradient: 'from-red-200 to-rose-300', floatClass: 'float-b3', top: '20%', left: '40%' },
  { emoji: '😍', name: 'Loved', desc: 'Deep connection and self-acceptance.', activity: 'Send three kind wishes to yourself right now.', gradient: 'from-rose-200 to-pink-300', floatClass: 'float-b4', top: '65%', left: '8%' },
  { emoji: '😰', name: 'Anxious', desc: 'A state of future-oriented worry.', activity: 'Touch 3 objects near you and note their texture.', gradient: 'from-teal-100 to-cyan-300', floatClass: 'float-b5', top: '70%', left: '35%' },
  { emoji: '🤩', name: 'Excited', desc: 'High-energy inspiration and play.', activity: 'Brainstorm three quick creative ideas on paper.', gradient: 'from-yellow-200 to-amber-300', floatClass: 'float-b6', top: '15%', left: '75%' },
  { emoji: '😌', name: 'Calm', desc: 'Serene presence and inner stillness.', activity: 'Inhale for 4 seconds, exhale for 6 seconds.', gradient: 'from-teal-200 to-emerald-300', floatClass: 'float-b7', top: '40%', left: '60%' },
  { emoji: '😎', name: 'Confident', desc: 'Inner strength, trust, and empowerment.', activity: 'Stand tall, drop your shoulders, and smile.', gradient: 'from-violet-200 to-fuchsia-300', floatClass: 'float-b8', top: '65%', left: '72%' },
  { emoji: '😴', name: 'Tired', desc: 'Your body calling for restorative rest.', activity: 'Unclench your jaw and rest your eyelids.', gradient: 'from-sky-200 to-blue-300', floatClass: 'float-b9', top: '42%', left: '80%' },
  { emoji: '🤔', name: 'Reflective', desc: 'A search for inner knowing and clarity.', activity: 'Sit silently and trace the flow of your breath.', gradient: 'from-stone-200 to-slate-300', floatClass: 'float-b10', top: '10%', left: '55%' }
];

export default function Home() {
  const containerRef = useRef(null);
  const gridSectionRef = useRef(null);
  const gridLayoutRef = useRef(null);
  const col1Ref = useRef(null);
  const col3Ref = useRef(null);

  const col1Emotions = [EMOTIONS[0], EMOTIONS[1], EMOTIONS[2]]; // Happy, Sad, Angry
  const col2Emotions = [EMOTIONS[3], EMOTIONS[4], EMOTIONS[5], EMOTIONS[6]]; // Excited, Anxious, Calm, Stressed
  const col3Emotions = [EMOTIONS[7], EMOTIONS[8], EMOTIONS[9]]; // Loved, Tired, Confused

  // Global Page States
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  
  // Section 2 Interactive Walkthroughs
  const [howItWorksStep, setHowItWorksStep] = useState(null); // 'chat', 'mood', 'theme', 'download'
  
  // Section 2: Mock Chat Interactive State
  const [mockChatStep, setMockChatStep] = useState(0);
  const mockChatDialogue = [
    { sender: 'user', text: "I feel really anxious and overwhelmed today." },
    { sender: 'ai', text: "I hear you. Let's ground ourselves. Can you feel where this tightness is holding in your body?" },
    { sender: 'user', text: "Mostly in my chest. My mind won't stop racing." },
    { sender: 'ai', text: "Place a gentle hand on your chest. Let's inhale peace together... and let it go. You are safe here." }
  ];

  // Section 2: Mock Scanner State
  const [scanState, setScanState] = useState('idle'); // 'idle', 'scanning', 'complete'
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("Empathetic Scan Ready");

  // Section 2: Mock Theme State
  const [mockTheme, setMockTheme] = useState('calm'); // 'calm', 'joy', 'love', 'rest'

  // Section 2: Mock Download State
  const [downloadState, setDownloadState] = useState('idle'); // 'idle', 'downloading', 'complete'
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Section 4: Floating Bubble Interaction States
  const [activeBubble, setActiveBubble] = useState(BUBBLES_DATA[6]); // Defaults to Calm bubble
  const [bubbleBreathPhase, setBubbleBreathPhase] = useState('idle'); // 'idle', 'inhale', 'exhale', 'done'
  const [bubbleBreathTimer, setBubbleBreathTimer] = useState(5);

  // Modal Breathing Visualizer state
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale
  const [breathTimer, setBreathTimer] = useState(4);

  // Modal Breathing controller effect
  useEffect(() => {
    if (!selectedEmotion) return;

    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev === 1) {
          setBreathPhase((currentPhase) => {
            if (currentPhase === 'inhale') return 'hold';
            if (currentPhase === 'hold') return 'exhale';
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedEmotion]);

  // Section 4: Bubble Guided Breathing Timer
  useEffect(() => {
    if (bubbleBreathPhase === 'idle' || bubbleBreathPhase === 'done') return;

    const timer = setInterval(() => {
      setBubbleBreathTimer((prev) => {
        if (prev === 1) {
          if (bubbleBreathPhase === 'inhale') {
            setBubbleBreathPhase('exhale');
            return 5;
          } else if (bubbleBreathPhase === 'exhale') {
            setBubbleBreathPhase('done');
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bubbleBreathPhase]);

  // GSAP animation for entrance of emotions on scroll
  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: gridSectionRef.current,
          scrub: 1,
          start: "top center",
          end: "bottom+=20% bottom",
        },
        defaults: { ease: "power1.inOut" }
      });

      tl.from(gridLayoutRef.current, {
        ease: "power1",
        scale: 3
      }, "start")
        .from(col1Ref.current.querySelectorAll('.grid-image'), {
          duration: 0.6,
          xPercent: i => -((i + 1) * 40 + i * 100),
          yPercent: i => (i + 1) * 40 + i * 100
        }, "start")
        .from(col3Ref.current.querySelectorAll('.grid-image'), {
          duration: 0.6,
          xPercent: i => (i + 1) * 40 + i * 100,
          yPercent: i => (i + 1) * 40 + i * 100
        }, "start");

      // how-cards use CSS animation for reliability
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  // Simulated Vibe Scanner activation
  const startScan = () => {
    setScanState('scanning');
    setScanProgress(0);
    setScanStatus("Calibrating biometric field...");
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setScanProgress(currentProgress);
      
      if (currentProgress === 30) {
        setScanStatus("Analyzing micro-facial adjustments...");
      } else if (currentProgress === 60) {
        setScanStatus("Tracing heart rate and breathing rhythms...");
      } else if (currentProgress === 80) {
        setScanStatus("Formulating custom emotional wellness blueprint...");
      } else if (currentProgress >= 100) {
        clearInterval(interval);
        setScanState('complete');
        setScanStatus("Analysis complete!");
      }
    }, 250);
  };

  // Simulated PDF Downloader
  const startDownload = () => {
    setDownloadState('downloading');
    setDownloadProgress(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setDownloadProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setDownloadState('complete');
      }
    }, 300);
  };

  return (
    <div ref={containerRef} className="font-['Inter'] text-[#1E2E35] bg-white overflow-x-hidden relative">
      <style>{customCss}</style>

      {/* 1️⃣ HERO SECTION WITH SHADER BACKGROUND */}
      <section className="relative w-screen h-screen min-h-screen flex flex-col items-center justify-center text-center overflow-hidden" style={{ background: 'radial-gradient(ellipse 90% 80% at 50% -5%, #0d2d38 0%, #1a4a5a 30%, #2F5D6E 60%, #234b5a 100%)' }}>
        
        {/* 🌊 Wavy Three.js Canvas */}
        <div className="absolute inset-0 w-full h-full z-0">
          <FloatingLines
            enabledWaves={["top", "middle", "bottom"]}
            lineCount={6}
            lineDistance={6}
            bendRadius={5}
            bendStrength={-0.5}
            interactive={true}
            parallax={true}
            animationSpeed={1}
            linesGradient={[
              '#A7C4BC',
              '#609183',
              '#38768B',
              '#2F5D6E'
            ]}
          />
        </div>

        {/* 🎨 Grain Texture Overlay for Premium Depth */}
        <div className="absolute inset-0 z-[1] opacity-[0.035] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />

        {/* 🌫️ Ambient GPU-Accelerated Blurs */}
        <div className="blob1 absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] md:w-[600px] md:h-[600px] bg-gradient-to-tr from-[#38768B] to-[#438398] rounded-full blur-[80px] opacity-40 z-[2] will-change-transform" />
        <div className="blob2 absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] md:w-[500px] md:h-[500px] bg-gradient-to-bl from-[#A7C4BC] to-[#609183] rounded-full blur-[80px] opacity-30 z-[2] will-change-transform" />
        <div className="blob1 absolute top-[30%] right-[10%] w-[30vw] h-[30vw] md:w-[350px] md:h-[350px] bg-gradient-to-tr from-[#2A5565] to-[#4a7a8c] rounded-full blur-[100px] opacity-20 z-[2] will-change-transform" />

        {/* Radial vignette overlay */}
        <div className="absolute inset-0 z-[3] pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 110%, rgba(47, 93, 110, 0.4) 0%, transparent 65%)' }} />

        {/* Hero Copy */}
        <div className="relative z-20" style={{ animation: 'pageFadeIn 0.8s ease forwards' }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.15] text-[#A7C4BC] text-xs font-semibold px-5 py-2 rounded-full mb-8 backdrop-blur-sm tracking-wide">
            <Sparkles size={14} className="text-[#A7C4BC]" />
            AI-POWERED WELLNESS
          </div>

          <h1 className="font-['Playfair_Display'] text-white text-[48px] md:text-[80px] lg:text-[96px] mb-4 drop-shadow-xl tracking-wide font-black leading-[1.05]">
            SOULIFY
          </h1>
          <p className="text-[#A7C4BC] uppercase tracking-[6px] text-[14px] md:text-[18px] font-semibold drop-shadow-md mb-2">
            Embrace Your Inner Calm
          </p>
          <p className="text-white/50 text-sm md:text-base max-w-[520px] mx-auto leading-relaxed mt-4 mb-8 px-4">
            Your emotionally intelligent companion for mindful living. Breathe, reflect, and grow — guided by AI that truly understands.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-10">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2A5565] to-[#1e3f4d] text-white px-8 py-4 rounded-full font-bold text-[15px] shadow-[0_8px_32px_rgba(56,118,139,0.5)] border border-[#A7C4BC]/15 hover:shadow-[0_18px_52px_rgba(56,118,139,0.6)] hover:-translate-y-[3px] hover:from-[#5B9BAD] hover:to-[#2A5565] transition-all duration-300"
            >
              Begin Your Journey <ArrowRight size={16} />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 bg-white/[0.06] text-[#A7C4BC] px-7 py-4 rounded-full font-semibold text-[15px] border border-[#A7C4BC]/20 backdrop-blur-sm hover:bg-white/[0.11] hover:border-[#A7C4BC]/50 hover:-translate-y-[2px] transition-all duration-300"
            >
              Learn More
            </Link>
          </div>

          {/* Trust Bar */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center -space-x-2">
              {['S','A','M','K'].map((letter, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A5565] to-[#A7C4BC] border-2 border-[#050e12]/80 flex items-center justify-center text-xs font-bold text-white">
                  {letter}
                </div>
              ))}
            </div>
            <span className="text-white/40 text-[13px]">Trusted by <strong className="text-[#A7C4BC]">12,000+</strong> mindful souls</span>
          </div>
        </div>

        {/* Scroll down trigger */}
        <div
          className="absolute bottom-12 flex flex-col items-center cursor-pointer z-20 transition-all duration-300 hover:scale-105"
          onClick={scrollToNext}
          role="button"
          aria-label="Scroll to next section"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToNext(); }}
        >
          <div className="w-12 h-12 bg-[#38768B]/20 hover:bg-[#38768B]/35 border border-[#38768B]/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg mb-2 transition-all duration-300">
            <ChevronDown className="text-[#A7C4BC]" />
          </div>
          <span className="text-white/50 text-xs tracking-widest uppercase">Scroll Down</span>
        </div>
      </section>
      {/* Smooth transition gradient from hero to light */}
      <div className="h-24 w-full bg-gradient-to-b from-[#234b5a] to-white relative z-[5]" />

      {/* 2️⃣ SECTION 1: EXPLORE EMOTIONS */}
      <section ref={gridSectionRef} className="w-full relative py-[120px] bg-white overflow-hidden z-10 flex flex-col items-center justify-center">
        <div className="max-w-[1200px] w-full px-4 text-center mb-8 absolute top-[80px] z-20">
          <span className="text-[#2F5D6E] uppercase tracking-[3px] text-xs font-semibold">Mindful Spectrum</span>
          <h2 className="font-['Playfair_Display'] text-[38px] md:text-[48px] text-[#2F5D6E] mt-2 mb-2 leading-tight">
            Explore Emotions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Every emotion is a portal to self-understanding. Tap on an emotional state below to unlock tailored mindfulness exercises and guides.
          </p>
        </div>

        <div className="w-full max-w-[1000px] h-[80vh] md:h-[100vh] mt-40 px-4 relative z-10">
          <div ref={gridLayoutRef} className="grid grid-cols-3 gap-4 h-full w-full origin-top">

            {/* Column 1 */}
            <div ref={col1Ref} className="h-full grid grid-rows-3 gap-4">
              {col1Emotions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedEmotion(item);
                    setBreathPhase('inhale');
                    setBreathTimer(4);
                  }}
                  className="grid-image w-full h-full relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                >
                  <img
                    src={item.image}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={item.name}
                    loading="lazy"
                    width="320"
                    height="320"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 transition-all group-hover:from-black/90 z-10">
                    <span className="text-3xl mb-1 transform transition-transform duration-300 group-hover:scale-110 origin-left">{item.emoji}</span>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-0.5">{item.name}</h3>
                    <p className="text-[10px] text-[#A7C4BC] uppercase tracking-wider font-semibold">{item.tagline}</p>
                    <p className="text-[11px] text-white/70 line-clamp-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 */}
            <div className="h-full grid grid-rows-4 gap-4">
              {col2Emotions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedEmotion(item);
                    setBreathPhase('inhale');
                    setBreathTimer(4);
                  }}
                  className="grid-image w-full h-full relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                >
                  <img
                    src={item.image}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={item.name}
                    loading="lazy"
                    width="320"
                    height="320"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 transition-all group-hover:from-black/90 z-10">
                    <span className="text-3xl mb-1 transform transition-transform duration-300 group-hover:scale-110 origin-left">{item.emoji}</span>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-0.5">{item.name}</h3>
                    <p className="text-[10px] text-[#A7C4BC] uppercase tracking-wider font-semibold">{item.tagline}</p>
                    <p className="text-[11px] text-white/70 line-clamp-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 3 */}
            <div ref={col3Ref} className="h-full grid grid-rows-3 gap-4">
              {col3Emotions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedEmotion(item);
                    setBreathPhase('inhale');
                    setBreathTimer(4);
                  }}
                  className="grid-image w-full h-full relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                >
                  <img
                    src={item.image}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={item.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 transition-all group-hover:from-black/90 z-10">
                    <span className="text-3xl mb-1 transform transition-transform duration-300 group-hover:scale-110 origin-left">{item.emoji}</span>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-0.5">{item.name}</h3>
                    <p className="text-[10px] text-[#A7C4BC] uppercase tracking-wider font-semibold">{item.tagline}</p>
                    <p className="text-[11px] text-white/70 line-clamp-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 3️⃣ SECTION 2: HOW IT WORKS */}
      <section className="py-[120px] bg-white relative z-10 px-4 how-works-section">
        <div className="max-w-[1200px] mx-auto how-grid-container">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[#2F5D6E] uppercase tracking-[3px] text-xs font-semibold">The Process</span>
            <h2 className="font-['Playfair_Display'] text-[38px] md:text-[48px] text-[#2F5D6E] mt-2 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600">
              Discover how Soulify merges state-of-the-art emotional intelligence with daily mindfulness. Click any card to preview the feature.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1: Chat with Souli */}
            <div 
              onClick={() => { setHowItWorksStep('chat'); setMockChatStep(0); }}
              className="how-card group rounded-3xl p-8 text-white flex flex-col justify-between min-h-[380px] shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#0a1c24]/80 z-0 group-hover:bg-[#0a1c24]/70 transition-colors duration-500" />
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=75&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover z-[-1] opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000" alt="Team connection" loading="lazy" width="800" height="534" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#7EC8C8]/20 rounded-bl-full blur-3xl z-0" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-6 backdrop-blur-md">
                  <MessageCircle size={24} />
                </div>
                <h3 className="text-3xl font-bold font-['Playfair_Display'] mb-4">Chat with Souli</h3>
                <p className="text-white/80 leading-relaxed max-w-md">
                  Experience emotionally attuned AI companion dialogs. Souli recognizes the emotional resonance of your messages and responds with tailored coaching and meditation guidance.
                </p>
              </div>
              <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold flex items-center gap-2 group-hover:translate-x-1 transition-transform relative z-10">
                Open Walkthrough Preview ➔
              </span>
            </div>

            {/* Sub-grid of 3 other features */}
            <div className="flex flex-col gap-6">
              {[
                { 
                  id: 'mood', 
                  title: 'Mood Analysis & Reports', 
                  desc: 'Unlock deep biometric and dialog analytics to map your patterns.',
                  icon: LineChart,
                  bg: 'bg-white' 
                },
                { 
                  id: 'theme', 
                  title: 'Dynamic Theme Tuning', 
                  desc: 'Watch the entire application interface adapt color tones to match your current state.',
                  icon: Settings,
                  bg: 'bg-white' 
                },
                { 
                  id: 'download', 
                  title: 'Report Download & Sharing', 
                  desc: 'Generate elegant PDF logs of your wellness progress to share with therapists.',
                  icon: Download,
                  bg: 'bg-white' 
                }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setHowItWorksStep(item.id);
                    if (item.id === 'mood') { setScanState('idle'); setScanProgress(0); }
                    if (item.id === 'download') { setDownloadState('idle'); setDownloadProgress(0); }
                  }}
                  className="how-card group bg-white border border-[#2F5D6E]/5 rounded-2xl p-6 shadow-sm hover:shadow-md hover:bg-gray-50/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-center gap-6"
                >
                  <div className="w-12 h-12 bg-[#F2F5F7] rounded-xl flex items-center justify-center text-[#2F5D6E] group-hover:scale-110 transition-transform">
                    <item.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#1E2E35] text-lg mb-1 group-hover:text-[#2F5D6E] transition-colors">{item.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                  <span className="text-[#2F5D6E]/30 group-hover:text-[#2F5D6E] transition-colors font-bold text-lg">➔</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ HERO EXTENSION: FEATURES DETAILS (DISCOVER YOUR INNER BALANCE) */}
      <section className="py-[100px] px-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1c24 0%, #0f2a35 50%, #0a1c24 100%)' }}>
        {/* Ambient glow orbs */}
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(56,118,139,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(167,196,188,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <span className="text-[#A7C4BC] uppercase tracking-[3px] text-xs font-semibold">Core Benefits</span>
          <h2 className="text-[34px] md:text-[44px] font-['Playfair_Display'] text-white mt-2 mb-4">Discover Your Inner Balance</h2>
          <p className="text-[#A7C4BC]/60 mb-12 max-w-2xl mx-auto relative z-10">
            Soulify empowers mindful growth by delivering practical wellness utilities backed by secure AI algorithms.
          </p>

          {/* Premium Horizontal Banner Image */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full h-[300px] md:h-[400px] rounded-[40px] overflow-hidden mb-20 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative z-10 group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1c24] via-transparent to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1499933374294-4584851497cc?q=75&w=1200&auto=format&fit=crop" 
              alt="Discover inner balance"
              loading="lazy"
              width="1200"
              height="400"
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2000ms]"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {[
              { icon: Activity, title: 'Real-Time Mood Detection', desc: 'Analyzes writing patterns and somatic data to capture shifts in emotional vibes.', accent: '#38768B', accentLight: 'rgba(56, 118, 139, 0.25)' },
              { icon: User, title: 'Personalized Coaching', desc: 'Tailors breathing exercises, journal triggers, and yoga schedules specifically for you.', accent: '#10b981', accentLight: 'rgba(16, 185, 129, 0.2)' },
              { icon: BookOpen, title: 'Mindful Journal Tracking', desc: 'Identifies core triggers by archiving your journaling sessions with secure analytics.', accent: '#06b6d4', accentLight: 'rgba(6, 182, 212, 0.2)' },
              { icon: Heart, title: 'Empathetic Reports', desc: 'Provides granular emotional insights complete with growth targets.', accent: '#f43f5e', accentLight: 'rgba(244, 63, 94, 0.15)' },
              { icon: Settings, title: 'Mood-Attuned Layouts', desc: 'Adapts color schemes and acoustic guides to soothe or energize your space.', accent: '#f59e0b', accentLight: 'rgba(245, 158, 11, 0.15)' },
              { icon: MessageCircle, title: 'Adaptive AI Attunement', desc: 'Souli shifts its dialog templates to complement high-anxiety or low-energy levels.', accent: '#8b5cf6', accentLight: 'rgba(139, 92, 246, 0.15)' },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/[0.05] backdrop-blur-sm rounded-[24px] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-400 group border border-white/[0.08] relative overflow-hidden"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Accent border strip */}
                <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full" style={{ background: feature.accent }} />
                {/* Subtle accent glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: feature.accentLight }} />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative" style={{ background: feature.accentLight }}>
                  <feature.icon style={{ color: feature.accent }} size={24} />
                </div>
                <h3 className="font-bold text-white text-lg mb-3">{feature.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transition out of dark features */}
      <div className="h-24 w-full bg-gradient-to-b from-[#0a1c24] to-white" />

      {/* 5️⃣ SECTION 3: STORIES OF TRANSFORMATION */}
      <section className="py-[120px] bg-white px-4 border-b border-[#2F5D6E]/5 overflow-hidden">
        <div className="max-w-[1200px] mx-auto text-center mb-16">
          <span className="text-[#2F5D6E] uppercase tracking-[3px] text-xs font-semibold">Testimonials</span>
          <h2 className="text-[38px] md:text-[46px] font-['Playfair_Display'] text-[#2F5D6E] mt-2 mb-4">Stories of Transformation</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Real journeys of users who reclaimed balance and stability using Soulify's interactive guides.</p>
        </div>

        <div className="max-w-[1280px] mx-auto px-2">
          <Swiper
            grabCursor
            centeredSlides
            loop
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            spaceBetween={24}
            pagination={{ clickable: true }}
            modules={[Pagination, Autoplay]}
            breakpoints={{
              0: { slidesPerView: 1.08, spaceBetween: 16 },
              768: { slidesPerView: 2.15, spaceBetween: 20 },
              1100: { slidesPerView: 3, spaceBetween: 28, centeredSlides: false },
            }}
            className="testimonials-swiper w-full"
          >
            {[
              { 
                name: 'Sarah J.', 
                title: 'Marketing Director', 
                quote: 'Soulify helped me identify work triggers. The breathing routines and daily AI checking logs literally helped me step down my panic attacks.',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
                before: 'Anxious (8/10)',
                after: 'Centered (2/10)',
                improvement: '+65% Stress Relief'
              },
              { 
                name: 'David M.', 
                title: 'Software Architect', 
                quote: 'The deep rest protocols are marvelous. Replaying the audio prompts before sleep silences my overactive logical brain completely.',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
                before: 'Exhausted (9/10)',
                after: 'Restored (3/10)',
                improvement: '+80% Rest Quality'
              },
              { 
                name: 'Elena R.', 
                title: 'Ph.D. Student', 
                quote: 'Analyzing reports changed my approach to work blocks. I learned to identify somatic tension and take structured breaks. I feel so much more focus.',
                image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
                before: 'Overwhelmed (7/10)',
                after: 'Mindful (1/10)',
                improvement: '+70% Cognitive Focus'
              },
              { 
                name: 'Marcus T.', 
                title: 'Creative Director', 
                quote: 'The mood-attuned layouts shifted my workspace energy. I finish projects calmer and more present with my team.',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
                before: 'Stressed (8/10)',
                after: 'Balanced (2/10)',
                improvement: '+60% Calm Focus'
              },
              { 
                name: 'Priya K.', 
                title: 'Healthcare Nurse', 
                quote: "Souli's nightly check-ins became my anchor after long shifts. The empathy in every response feels genuinely human.",
                image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
                before: 'Drained (9/10)',
                after: 'Grounded (3/10)',
                improvement: '+75% Emotional Recovery'
              },
            ].map((test, i) => (
              <SwiperSlide key={i} className="!h-auto bg-white border border-[#2F5D6E]/10 rounded-[32px] p-8 md:p-10 shadow-lg hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6 text-left">
                  <div className="relative w-20 h-20 rounded-full flex-shrink-0 overflow-hidden border-2 border-[#2F5D6E]/20 shadow-md">
                    <img 
                      src={test.image} 
                      alt={test.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width="152"
                      height="152"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-[#2A5565] to-[#A7C4BC] items-center justify-center text-2xl font-bold text-white hidden">
                      {test.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-[#1E2E35]">{test.name}</h3>
                    <span className="text-sm text-[#2A5565] font-medium">{test.title}</span>
                  </div>
                </div>
                
                <p className="italic text-gray-700 mb-8 text-base md:text-lg text-left leading-relaxed">
                  "{test.quote}"
                </p>

                {/* Before-and-after emotional dashboard metrics */}
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#2F5D6E]/10">
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                    <span className="block text-[10px] uppercase text-rose-700 font-bold tracking-wider mb-1">Before</span>
                    <span className="text-xs font-semibold text-rose-700">{test.before}</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                    <span className="block text-[10px] uppercase text-emerald-700 font-bold tracking-wider mb-1">After</span>
                    <span className="text-xs font-semibold text-emerald-700">{test.after}</span>
                  </div>
                  <div className="bg-[#2F5D6E]/5 border border-[#2F5D6E]/10 rounded-xl p-3 flex flex-col justify-center text-center">
                    <span className="block text-[10px] uppercase text-[#2F5D6E] font-bold tracking-wider mb-1">Gain</span>
                    <span className="text-xs font-bold text-[#2F5D6E]">{test.improvement}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 6️⃣ SECTION 4: EMOTION BUBBLE INTERACTION */}
      <section className="py-[120px] bg-gradient-to-br from-[#f0f7f5] via-white to-[#edf5f8] relative overflow-hidden px-6">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Section description */}
          <div className="lg:col-span-5 text-left">
            <span className="text-[#2F5D6E] uppercase tracking-[3px] text-xs font-semibold">Playful Connection</span>
            <h2 className="font-['Playfair_Display'] text-[38px] md:text-[48px] text-[#2F5D6E] mt-2 mb-6 leading-tight">
              Emotion Bubbles
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Emotions are dynamic energy bodies floating through your consciousness. Tap on any drifting bubble to analyze its focus and activate a 10-second guided micro-breath exercise.
            </p>

            {/* Bubble detail overlay inside the component */}
            {activeBubble && (
              <div className="bg-white/80 backdrop-blur-md border border-[#2F5D6E]/15 rounded-3xl p-6 shadow-xl transition-all duration-500 animate-[pageFadeIn_0.4s_ease-out]">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${activeBubble.gradient} flex items-center justify-center text-2xl shadow-md`}>
                    {activeBubble.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#1E2E35]">{activeBubble.name} Bubble</h3>
                    <span className="text-xs text-[#2F5D6E] font-medium uppercase tracking-wider">Active Choice</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                  {activeBubble.desc}
                </p>
                <div className="bg-[#2F5D6E]/5 border border-[#2F5D6E]/10 rounded-2xl p-4 mb-6">
                  <span className="block text-xs font-bold text-[#2F5D6E] mb-1">Recommended Activity:</span>
                  <p className="text-xs text-gray-600">{activeBubble.activity}</p>
                </div>

                {/* Inline 10s Guided Breath inside Bubble Panel */}
                {bubbleBreathPhase === 'idle' ? (
                  <button
                    onClick={() => { setBubbleBreathPhase('inhale'); setBubbleBreathTimer(5); }}
                    className="w-full bg-[#2F5D6E] text-white py-3 rounded-2xl font-semibold hover:bg-[#234b5a] transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={16} /> Take 10-Second Breath
                  </button>
                ) : bubbleBreathPhase === 'done' ? (
                  <div className="text-center py-2 text-emerald-600 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> You're doing great! Keep flowing.
                    <button 
                      onClick={() => setBubbleBreathPhase('idle')}
                      className="text-xs underline text-[#2F5D6E] font-semibold ml-2 hover:text-[#234b5a]"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 py-1">
                    {/* Breathing animated circle */}
                    <div className="w-12 h-12 rounded-full border border-[#2F5D6E]/20 flex items-center justify-center relative overflow-hidden bg-[#2F5D6E]/5">
                      <div 
                        className={`absolute inset-0 bg-[#2F5D6E]/20 rounded-full transition-transform duration-[5000ms] ease-in-out ${
                          bubbleBreathPhase === 'inhale' ? 'scale-100' : 'scale-0'
                        }`}
                      />
                      <span className="text-xs font-bold text-[#2F5D6E] relative z-10">{bubbleBreathTimer}s</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase font-bold text-[#2F5D6E]">
                        {bubbleBreathPhase === 'inhale' ? 'Inhale Deeply...' : 'Exhale Tension...'}
                      </span>
                      <span className="text-xs text-gray-500">Relax your shoulders and expand your lungs.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating Bubble field */}
          <div className="lg:col-span-7 h-[350px] md:h-[450px] relative bg-white/20 border border-white/50 backdrop-blur-sm rounded-[36px] shadow-inner overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
            
            {BUBBLES_DATA.map((bubble, i) => (
              <button
                key={i}
                onClick={() => { 
                  setActiveBubble(bubble); 
                  setBubbleBreathPhase('idle'); 
                }}
                className={`absolute w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${bubble.gradient} ${bubble.floatClass} flex items-center justify-center text-2xl shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:scale-125 hover:shadow-[0_15px_30px_rgba(47,93,110,0.25)] hover:border hover:border-white/50 hover:pause transition-all duration-300 cursor-pointer`}
                style={{
                  top: bubble.top,
                  left: bubble.left,
                }}
              >
                {bubble.emoji}
              </button>
            ))}
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* ============================== MODALS BLOCK ============================= */}
      {/* ========================================================================= */}

      {/* 🔴 MODAL A: EMOTION DETAILS + 12s BREATHING VISUALIZER */}
      {selectedEmotion && (
        <div className="fixed inset-0 z-50 bg-[#1E2E35]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl relative border border-[#2F5D6E]/10 animate-[pageFadeIn_0.3s_ease-out]">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedEmotion(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#F2F5F7] hover:bg-[#2F5D6E] hover:text-white transition-all flex items-center justify-center text-gray-500"
            >
              <X size={20} />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{selectedEmotion.emoji}</span>
              <div>
                <h3 className="text-2xl font-bold font-['Playfair_Display'] text-[#1E2E35] mb-1">{selectedEmotion.name}</h3>
                <p className="text-xs uppercase font-bold tracking-wider text-[#2F5D6E]">{selectedEmotion.tagline}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {selectedEmotion.desc}
            </p>

            {/* 🌬️ 12-Second Guided Breathing Interface */}
            <div className="bg-[#F2F5F7] rounded-3xl p-6 text-center border border-[#2F5D6E]/5 relative mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2F5D6E] block mb-4">
                Guided 12-Second Breath
              </span>

              {/* Pulsing visualizer circle */}
              <div className="flex items-center justify-center my-6">
                <div 
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-white font-bold relative transition-all duration-[4000ms] ease-in-out ${
                    breathPhase === 'inhale' 
                      ? 'scale-[1.18] bg-teal-500 shadow-[0_0_35px_rgba(20,184,166,0.5)]' 
                      : breathPhase === 'hold'
                      ? 'scale-[1.18] bg-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.5)]'
                      : 'scale-[0.82] bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  }`}
                >
                  <span className="text-sm uppercase tracking-wider block">{breathPhase}</span>
                  <span className="text-2xl font-extrabold mt-1">{breathTimer}s</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed italic max-w-sm mx-auto px-4 mt-2">
                {breathPhase === 'inhale' && "Inhale deeply. Feel your abdomen expand and lift."}
                {breathPhase === 'hold' && "Suspend the breath. Sit in comfortable stillness."}
                {breathPhase === 'exhale' && "Exhale slowly. Release all tension from your neck and shoulders."}
              </p>
            </div>

            {/* Spiritual Guidance Advice */}
            <div className="border-l-4 border-[#2F5D6E] pl-4 py-1 mb-8">
              <span className="text-xs uppercase font-bold text-[#2F5D6E] block mb-1">Mindful Guidance:</span>
              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedEmotion.guidance}
              </p>
            </div>

            {/* Navigates to Chat with preloaded Emotion State */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setSelectedEmotion(null)}
                className="w-full bg-[#F2F5F7] text-gray-700 py-3.5 rounded-2xl font-semibold hover:bg-gray-100 transition-all text-center text-sm"
              >
                Done
              </button>
              <Link 
                to={`/chat?emotion=${selectedEmotion.name.toLowerCase()}`}
                className="w-full bg-[#2F5D6E] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#234b5a] transition-all text-center text-sm flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={16} /> Chat with Souli
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 MODAL B: HOW IT WORKS PREVIEWS */}
      {howItWorksStep && (
        <div className="fixed inset-0 z-50 bg-[#1E2E35]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[32px] p-8 shadow-2xl relative border border-[#2F5D6E]/10 animate-[pageFadeIn_0.3s_ease-out]">
            {/* Close */}
            <button 
              onClick={() => { setHowItWorksStep(null); setMockChatStep(0); setScanState('idle'); setDownloadState('idle'); }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#F2F5F7] hover:bg-[#2F5D6E] hover:text-white transition-all flex items-center justify-center text-gray-500"
            >
              <X size={20} />
            </button>

            {/* Render sub sections based on selected feature preview */}

            {/* MOCK CHAT WITH SOULI INTERACTIVE */}
            {howItWorksStep === 'chat' && (
              <div>
                <h3 className="text-2xl font-bold font-['Playfair_Display'] text-[#1E2E35] mb-2 flex items-center gap-2">
                  <Smartphone size={22} className="text-[#2F5D6E]" /> Chat with Souli Preview
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Step through a simulated chat session to experience how Souli tailors responses dynamically.
                </p>

                {/* Chat window mockup */}
                <div className="bg-[#050b14] border-2 border-[#2C5B6B]/40 rounded-3xl p-6 h-[280px] overflow-y-auto flex flex-col gap-4 mb-6">
                  {mockChatDialogue.slice(0, mockChatStep + 1).map((msg, i) => (
                    <div
                      key={i}
                      className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-r from-[#2C5B6B] to-[#16333c] text-white self-end'
                          : 'bg-white/10 text-white/90 self-start border border-white/5'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  {mockChatStep < mockChatDialogue.length - 1 ? (
                    <button
                      onClick={() => setMockChatStep(prev => prev + 1)}
                      className="flex-1 bg-[#2F5D6E] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#234b5a] transition-all text-sm"
                    >
                      Advance Conversation Step ({mockChatStep + 1}/4)
                    </button>
                  ) : (
                    <Link
                      to="/chat"
                      className="flex-1 bg-emerald-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-emerald-700 transition-all text-center text-sm flex items-center justify-center gap-1"
                    >
                      <MessageCircle size={16} /> Open Real Chat Room
                    </Link>
                  )}
                  <button
                    onClick={() => setMockChatStep(0)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* MOOD ANALYSIS SCANNER SIMULATION */}
            {howItWorksStep === 'mood' && (
              <div>
                <h3 className="text-2xl font-bold font-['Playfair_Display'] text-[#1E2E35] mb-2 flex items-center gap-2">
                  <Activity size={22} className="text-[#2F5D6E]" /> Empathetic Vibe Scanner
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  A demo of the biometric and writing assessment system that calculates emotional blueprints.
                </p>

                {scanState === 'idle' && (
                  <div className="bg-[#F2F5F7] border-2 border-dashed border-[#2F5D6E]/20 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[220px] mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#2F5D6E]/10 flex items-center justify-center text-[#2F5D6E] mb-4">
                      <Sparkles size={28} />
                    </div>
                    <button
                      onClick={startScan}
                      className="bg-[#2F5D6E] text-white py-3 px-8 rounded-2xl font-semibold hover:bg-[#234b5a] transition-all text-sm shadow-md"
                    >
                      Start Empathetic Scan Simulation
                    </button>
                    <span className="text-[11px] text-gray-400 mt-2">Takes about 3 seconds to analyze biometrics.</span>
                  </div>
                )}

                {scanState === 'scanning' && (
                  <div className="bg-[#0f172a] rounded-3xl p-8 flex flex-col items-center justify-center min-h-[220px] mb-6 relative overflow-hidden">
                    {/* Laser line effect */}
                    <div className="laser-line absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#06b6d4] z-10" />

                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin mb-4" />
                    <span className="text-white text-sm font-semibold mb-2">{scanStatus}</span>
                    
                    {/* Progress Bar */}
                    <div className="w-full max-w-xs bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-cyan-400 h-full transition-all duration-200" style={{ width: `${scanProgress}%` }} />
                    </div>
                  </div>
                )}

                {scanState === 'complete' && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-6 animate-[pageFadeIn_0.3s_ease-out]">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="text-emerald-600" size={24} />
                      <h4 className="font-bold text-emerald-800 text-lg">Scan Results Complete!</h4>
                    </div>

                    <div className="space-y-4 mb-6">
                      {[
                        { label: "Optimal Peace (Calm Quotient)", val: "72%", color: "bg-emerald-500" },
                        { label: "Biometric Heart Coherence", val: "88%", color: "bg-teal-500" },
                        { label: "Somatic Tension Level", val: "22%", color: "bg-amber-400" }
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                            <span>{item.label}</span>
                            <span>{item.val}</span>
                          </div>
                          <div className="w-full bg-gray-200/60 rounded-full h-2">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: item.val }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-emerald-800 leading-relaxed bg-white/60 rounded-xl p-3 border border-emerald-100/50">
                      <strong>AI Counselor Insight:</strong> Your bio-frequencies show clean parasympathetic engagement. Keep grounding yourself. Try matching this flow in your chat sessions.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setScanState('idle')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-2xl font-semibold text-sm transition-all"
                  >
                    Clear & Retry Scan
                  </button>
                  <button
                    onClick={() => setHowItWorksStep(null)}
                    className="bg-[#2F5D6E] text-white py-3 px-8 rounded-2xl font-semibold hover:bg-[#234b5a] transition-all text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* DYNAMIC THEME TUNER PREVIEW */}
            {howItWorksStep === 'theme' && (
              <div>
                <h3 className="text-2xl font-bold font-['Playfair_Display'] text-[#1E2E35] mb-2 flex items-center gap-2">
                  <Settings size={22} className="text-[#2F5D6E]" /> Dynamic Theme Tuning
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Select a theme mood below to see how Soulify adapts its color grids, buttons, and layouts in real-time.
                </p>

                {/* Mock Card Preview Container */}
                <div className="flex items-center justify-center p-6 bg-gray-50 border border-gray-100 rounded-3xl mb-6">
                  <div className={`w-full max-w-sm rounded-[24px] p-6 shadow-lg text-white transition-all duration-500 ${
                    mockTheme === 'calm' ? 'bg-gradient-to-br from-teal-500 to-emerald-600 shadow-teal-500/10' :
                    mockTheme === 'joy' ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/10' :
                    mockTheme === 'love' ? 'bg-gradient-to-br from-rose-400 to-pink-500 shadow-pink-500/10' :
                    'bg-gradient-to-br from-indigo-600 to-slate-800 shadow-indigo-500/10'
                  }`}>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80">Soulify App Interface</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/80 animate-pulse" />
                    </div>
                    <span className="text-4xl block mb-2">
                      {mockTheme === 'calm' && '😌'}
                      {mockTheme === 'joy' && '😊'}
                      {mockTheme === 'love' && '😍'}
                      {mockTheme === 'rest' && '😴'}
                    </span>
                    <h4 className="text-xl font-bold mb-1">
                      {mockTheme === 'calm' && 'Ocean Calm Enabled'}
                      {mockTheme === 'joy' && 'Golden Joy Enabled'}
                      {mockTheme === 'love' && 'Warm Compassion Enabled'}
                      {mockTheme === 'rest' && 'Restorative Quiet Enabled'}
                    </h4>
                    <p className="text-xs opacity-90 leading-relaxed mb-4">
                      The interface dynamically changes fonts, accent colors, and sensory waves to aid your mental state.
                    </p>
                    <div className="bg-white/10 border border-white/10 rounded-xl p-3 text-center text-xs font-semibold backdrop-blur-sm">
                      Current: {mockTheme.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { id: 'calm', label: 'Calm', class: 'bg-teal-500 border-teal-600 text-teal-900' },
                    { id: 'joy', label: 'Joy', class: 'bg-amber-400 border-amber-500 text-amber-950' },
                    { id: 'love', label: 'Love', class: 'bg-rose-400 border-rose-500 text-rose-950' },
                    { id: 'rest', label: 'Rest', class: 'bg-indigo-600 border-indigo-700 text-indigo-50' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setMockTheme(btn.id)}
                      className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${btn.class} ${
                        mockTheme === btn.id ? 'ring-4 ring-[#2F5D6E]/20 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setHowItWorksStep(null)}
                  className="w-full bg-[#2F5D6E] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#234b5a] transition-all text-sm text-center"
                >
                  Save & Apply Theme
                </button>
              </div>
            )}

            {/* REPORT DOWNLOAD & SHARING WALKTHROUGH */}
            {howItWorksStep === 'download' && (
              <div>
                <h3 className="text-2xl font-bold font-['Playfair_Display'] text-[#1E2E35] mb-2 flex items-center gap-2">
                  <Download size={22} className="text-[#2F5D6E]" /> Wellness Report Generator
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Experience downloading structured wellness logs, maps of emotional states, and insights.
                </p>

                {/* PDF Card Preview */}
                <div className="bg-[#F2F5F7] border border-[#2F5D6E]/10 rounded-3xl p-6 mb-6">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 flex-shrink-0">
                      <Book size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-[#1E2E35] text-sm">soulify_wellness_insights_june.pdf</h4>
                      <span className="text-[11px] text-gray-400 block mb-2">PDF Document • 2.4 MB • Generated just now</span>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#2F5D6E]/5 text-[#2F5D6E] text-[10px] px-2 py-0.5 rounded font-bold uppercase">Weekly Logs</span>
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Safe Sharing</span>
                      </div>
                    </div>
                  </div>
                </div>

                {downloadState === 'idle' && (
                  <button
                    onClick={startDownload}
                    className="w-full bg-[#2F5D6E] text-white py-4 rounded-2xl font-semibold hover:bg-[#234b5a] transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Download size={18} /> Compile & Download Report
                  </button>
                )}

                {downloadState === 'downloading' && (
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-6 text-center animate-pulse">
                    <span className="text-sm font-bold text-gray-600 block mb-2">Assembling charts & details ({downloadProgress}%)</span>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#2F5D6E] h-full transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                    </div>
                  </div>
                )}

                {downloadState === 'complete' && (
                  <div className="text-center py-6 bg-emerald-50 border border-emerald-100 rounded-3xl mb-6">
                    <CheckCircle2 className="text-emerald-600 mx-auto mb-3" size={36} />
                    <h4 className="font-bold text-emerald-800 text-lg">Download Success!</h4>
                    <p className="text-xs text-emerald-700 mt-1">Check your simulated system download logs. The sample report was cached successfully.</p>
                  </div>
                )}

                {downloadState === 'complete' && (
                  <button
                    onClick={() => setDownloadState('idle')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-2xl font-semibold text-sm transition-all"
                  >
                    Download Another Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}