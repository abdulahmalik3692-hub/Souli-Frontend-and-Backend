import React, { useState, useEffect } from "react";
import { Download, TrendingUp, PieChart, Sparkles, Brain, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DURATIONS = [
  { key: "1w", label: "1 Week" },
  { key: "2w", label: "2 Weeks" },
  { key: "3w", label: "3 Weeks" },
  { key: "1m", label: "1 Month" }
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.15, ease: "easeOut", delay }
});

export default function ReportPage() {
  const [duration, setDuration] = useState("1w");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchReport() {
      setLoading(true);
      setError(null);
      try {
        // Read user email/ID from localStorage
        let userId = "";
        const savedUser = localStorage.getItem("soulify_user");
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed && parsed.email) {
              userId = parsed.email;
            }
          } catch (e) {
            console.error("Error parsing soulify_user context in reports page:", e);
          }
        }
        if (!userId) {
          userId = localStorage.getItem("soulify_user_id") || "guest_user";
        }

        const response = await fetch(`http://127.0.0.1:5000/report?user_id=${encodeURIComponent(userId)}&duration=${duration}`);
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (active) {
          setReportData(data);
        }
      } catch (err) {
        console.error("Error fetching mood insights report:", err);
        if (active) {
          setError("Failed to fetch report data from the backend. Make sure the Node.js server is running on port 5000.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchReport();
    return () => {
      active = false;
    };
  }, [duration]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050e12] text-[#f0f8fa] font-['Inter'] relative pt-32 pb-20 px-6 flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#38768B]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#7B52CC]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <Brain size={48} className="text-[#7EC8C8] animate-pulse" />
          <h2 className="text-2xl font-bold tracking-wide">Synthesizing Emotional Journey...</h2>
          <p className="text-sm text-[#A7C4BC]/60 max-w-sm">Querying database check-ins and analyzing cognitive dynamics with AI...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#050e12] text-[#f0f8fa] font-['Inter'] relative pt-32 pb-20 px-6 flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#38768B]/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-md">
          <Activity size={48} className="text-red-400" />
          <h2 className="text-2xl font-bold tracking-wide text-red-300 font-semibold">Sync Interrupted</h2>
          <p className="text-[#A7C4BC] text-sm leading-relaxed">{error}</p>
          <button 
            onClick={() => setDuration(d => d)} // Force re-fetch
            className="mt-6 px-6 py-2.5 bg-[#38768B] text-white rounded-full font-bold uppercase tracking-wider text-xs hover:scale-105 transition-transform"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const current = reportData;

  return (
    <div className="min-h-screen bg-[#050e12] text-[#f0f8fa] font-['Inter'] relative pt-32 pb-20 px-6 overflow-hidden selection:bg-[#38768B]/30">
      
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#38768B]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#7B52CC]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER */}
        <header className="text-center mb-16 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#38768B]/30 bg-white/5 backdrop-blur-md">
            <Sparkles size={14} className="text-[#7EC8C8]" />
            <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold">Insights & Analytics</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-10 leading-tight">
            Your Emotional <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7EC8C8] to-[#38768B]">Journey</span>
          </motion.h1>

          {/* Timeline Selector */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
            className="flex flex-wrap justify-center gap-3 bg-white/5 p-2 rounded-full border border-white/10 backdrop-blur-xl">
            {DURATIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDuration(key)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 relative overflow-hidden",
                  duration === key ? "text-white" : "text-[#A7C4BC] hover:text-white"
                )}
              >
                {duration === key && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#38768B] rounded-full shadow-[0_0_15px_rgba(56,118,139,0.5)]" />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </motion.div>
        </header>

        {/* METRICS GRID */}
        <AnimatePresence mode="wait">
          <motion.div key={`metrics-${duration}`} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Metric 1 */}
            <motion.div {...fadeUp(0.1)} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:bg-white/10 transition-colors group">
              <div className="w-12 h-12 bg-[#38768B]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#38768B]/30 group-hover:scale-110 transition-transform">
                <Activity size={20} className="text-[#7EC8C8]" />
              </div>
              <h3 className="text-[#A7C4BC] text-sm uppercase tracking-wider font-semibold mb-2">Average Mood</h3>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-white">{current.avgMood}</span>
                <span className="text-xl text-white/40 mb-1">/10</span>
              </div>
            </motion.div>

            {/* Metric 2 */}
            <motion.div {...fadeUp(0.2)} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:bg-white/10 transition-colors group">
              <div className="w-12 h-12 bg-[#7B52CC]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#7B52CC]/30 group-hover:scale-110 transition-transform">
                <TrendingUp size={20} className="text-[#b196f0]" />
              </div>
              <h3 className="text-[#A7C4BC] text-sm uppercase tracking-wider font-semibold mb-2">Calm Increase</h3>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-white">+{current.calmIncrease}</span>
                <span className="text-xl text-white/40 mb-1">%</span>
              </div>
            </motion.div>

            {/* Metric 3 */}
            <motion.div {...fadeUp(0.3)} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:bg-white/10 transition-colors group">
              <div className="w-12 h-12 bg-[#EC4899]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#EC4899]/30 group-hover:scale-110 transition-transform">
                <Brain size={20} className="text-[#f49ac8]" />
              </div>
              <h3 className="text-[#A7C4BC] text-sm uppercase tracking-wider font-semibold mb-2">Dominant State</h3>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white leading-tight">{current.dominant}</span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* CHART & INSIGHTS ROW */}
        <AnimatePresence mode="wait">
          <motion.div key={`chart-${duration}`} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Chart */}
            <motion.div {...fadeUp(0.4)} className="lg:col-span-2 bg-[#0A1E26]/60 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-6">Mood Trajectory</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={current.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7EC8C8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#38768B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#050e12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#7EC8C8' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#7EC8C8" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorMood)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div {...fadeUp(0.5)} className="lg:col-span-1 bg-gradient-to-br from-[#38768B]/20 to-[#7B52CC]/10 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white mb-4">AI Analysis</span>
                <h3 className="text-2xl font-bold text-white leading-tight">Behavioral<br/>Insights</h3>
              </div>
              <p className="text-[#A7C4BC] leading-relaxed text-lg flex-grow">
                {current.insights}
              </p>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Live Sync Active
                </p>
              </div>
            </motion.div>

          </motion.div>
        </AnimatePresence>

        {/* DOWNLOAD SECTION */}
        <motion.div {...fadeUp(0.6)} className="relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-10 md:p-12 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#38768B]/0 via-[#38768B]/10 to-[#7B52CC]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-3xl font-bold text-white mb-2">Download Full Report</h3>
            <p className="text-[#A7C4BC]">Export a detailed PDF with all cognitive insights and biometric mappings.</p>
          </div>

          <button className="relative z-10 flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#050e12] rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] flex-shrink-0">
            <Download size={18} />
            Export Data
          </button>
        </motion.div>

      </div>
    </div>
  );
}