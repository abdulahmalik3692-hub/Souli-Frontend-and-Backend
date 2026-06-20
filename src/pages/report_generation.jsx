import React, { useState, useEffect, useRef } from "react";
import { Download, TrendingUp, PieChart, Sparkles, Brain, Activity, ArrowLeft } from "lucide-react";
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
import { Link } from "react-router-dom";
import soulifyLogo from "../assets/new_logo.png";

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

// Get the logged-in user info
function getUserInfo() {
  const savedUser = localStorage.getItem("soulify_user");
  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch (e) { /* ignore */ }
  }
  return null;
}

function getUserId() {
  const user = getUserInfo();
  if (user?.id) return user.id;
  if (user?.email) return user.email;
  return localStorage.getItem("soulify_user_id") || "guest_user";
}

export default function ReportPage() {
  const [duration, setDuration] = useState("1w");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function fetchReport(isInitial) {
      if (isInitial) {
        setLoading(true);
        setError(null);
      }
      try {
        const userId = getUserId();
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/report?user_id=${encodeURIComponent(userId)}&duration=${duration}`);
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (active) {
          setReportData(data);
        }
      } catch (err) {
        console.error("Error fetching mood insights report:", err);
        if (active && isInitial) {
          setError("Failed to fetch report data from the backend. Make sure the Node.js server is running on port 5000.");
        }
      } finally {
        if (active && isInitial) {
          setLoading(false);
        }
      }
    }

    fetchReport(true);
    
    // Live Real-Time Detection Sync
    const interval = setInterval(() => {
      fetchReport(false);
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [duration]);

  // ── PDF Generation ───────────────────────────────────────────────
  const generatePDF = async () => {
    if (!reportData) return;
    setPdfGenerating(true);

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const userInfo = getUserInfo();
      const userName = userInfo?.name || "User";
      const userEmail = userInfo?.email || "";
      const dateNow = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });

      // ── BACKGROUND ─────────────────────────────────────────────────
      pdf.setFillColor(42, 85, 101);  // #2A5565 (Premium Teal from Contact Form)
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // ── HEADER ACCENT LINE ─────────────────────────────────────────
      pdf.setFillColor(56, 118, 139);  // #38768B
      pdf.rect(0, 0, pageWidth, 3, "F");

      // ── HEADER ─────────────────────────────────────────────────────
      y = 18;
      
      try {
        const img = new Image();
        img.src = soulifyLogo;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        if (img.complete && img.naturalWidth > 0) {
          pdf.addImage(img, "PNG", margin, y - 8, 12, 12);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(28);
          pdf.setTextColor(240, 248, 250);
          pdf.text("Soulify", margin + 16, y + 2);

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(126, 200, 200);
          pdf.text("Emotional Intelligence Report", margin + 63, y + 2);
        } else {
          throw new Error("Img fails");
        }
      } catch(e) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(28);
        pdf.setTextColor(240, 248, 250);
        pdf.text("Soulify", margin, y);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(126, 200, 200);
        pdf.text("Emotional Intelligence Report", margin + 48, y);
      }

      // Date and user on the right
      pdf.setFontSize(9);
      pdf.setTextColor(167, 196, 188);
      pdf.text(dateNow, pageWidth - margin, y - 6, { align: "right" });
      pdf.text(`${userName}${userEmail ? ` · ${userEmail}` : ""}`, pageWidth - margin, y, { align: "right" });

      // Separator
      y += 8;
      pdf.setDrawColor(56, 118, 139, 80);
      pdf.setLineWidth(0.3);
      pdf.line(margin, y, pageWidth - margin, y);

      // ── REPORT PERIOD ──────────────────────────────────────────────
      y += 12;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(240, 248, 250);
      pdf.text(`Mood Overview — ${reportData.label}`, margin, y);

      // ── STATS CARDS ────────────────────────────────────────────────
      y += 14;
      const cardWidth = (contentWidth - 10) / 3;
      const cardHeight = 32;

      // Card backgrounds
      const stats = [
        { label: "Average Mood", value: `${reportData.avgMood}/10`, color: [56, 118, 139] },
        { label: "Calm Increase", value: `+${reportData.calmIncrease}%`, color: [123, 82, 204] },
        { label: "Dominant State", value: reportData.dominant, color: [236, 72, 153] }
      ];

      stats.forEach((stat, i) => {
        const x = margin + i * (cardWidth + 5);

        // Card background (Darker teal to pop against the lighter background)
        pdf.setFillColor(24, 52, 64);  // #183440
        pdf.roundedRect(x, y, cardWidth, cardHeight, 4, 4, "F");

        // Card border
        pdf.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(x, y, cardWidth, cardHeight, 4, 4, "S");

        // Label
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(167, 196, 188);
        pdf.text(stat.label.toUpperCase(), x + 6, y + 10);

        // Value
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.setTextColor(255, 255, 255);
        pdf.text(String(stat.value), x + 6, y + 25);
      });

      y += cardHeight + 14;

      // ── MOOD CHART ─────────────────────────────────────────────────
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(240, 248, 250);
      pdf.text("Mood Trajectory", margin, y);
      y += 6;

      // Capture the chart from the DOM
      if (chartRef.current) {
        try {
          const canvas = await html2canvas(chartRef.current, {
            backgroundColor: "#183440",
            scale: 2,
            useCORS: true,
            logging: false
          });
          const chartImgData = canvas.toDataURL("image/png");
          const chartAspect = canvas.height / canvas.width;
          const chartImgWidth = contentWidth;
          const chartImgHeight = chartImgWidth * chartAspect;

          pdf.addImage(chartImgData, "PNG", margin, y, chartImgWidth, chartImgHeight);
          y += chartImgHeight + 10;
        } catch (chartErr) {
          console.warn("Could not capture chart:", chartErr);
          y += 5;
        }
      }

      // ── AI INSIGHTS & SUGGESTIONS ──────────────────────────────────
      // Check if we need a new page
      if (y > pageHeight - 80) {
        pdf.addPage();
        pdf.setFillColor(42, 85, 101);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
        y = margin;
      }

      // Section header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(126, 200, 200);
      pdf.text("AI Behavioral Insights", margin, y);
      y += 8;

      // Insights box (Darker teal)
      const insightsText = reportData.insights || "No insights available yet. Keep chatting to build your emotional profile.";
      pdf.setFillColor(24, 52, 64); // #183440
      const insightsLines = pdf.splitTextToSize(insightsText, contentWidth - 16);
      const insightsBoxHeight = insightsLines.length * 5.5 + 14;
      pdf.roundedRect(margin, y, contentWidth, insightsBoxHeight, 4, 4, "F");
      pdf.setDrawColor(126, 200, 200); // lighter border
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin, y, contentWidth, insightsBoxHeight, 4, 4, "S");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(240, 248, 250);
      pdf.text(insightsLines, margin + 8, y + 10);
      y += insightsBoxHeight + 12;

      // ── IMPROVEMENT SUGGESTIONS ────────────────────────────────────
      if (y > pageHeight - 70) {
        pdf.addPage();
        pdf.setFillColor(42, 85, 101);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
        y = margin;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(126, 200, 200);
      pdf.text("Suggestions for Improvement", margin, y);
      y += 10;

      const suggestions = (reportData.suggestions && reportData.suggestions.length > 0) ? reportData.suggestions : getSuggestions(reportData);
      suggestions.forEach((tip, i) => {
        if (y > pageHeight - 30) {
          pdf.addPage();
          pdf.setFillColor(42, 85, 101);
          pdf.rect(0, 0, pageWidth, pageHeight, "F");
          y = margin;
        }

        // Bullet circle
        pdf.setFillColor(56, 118, 139);
        pdf.circle(margin + 3, y - 1.2, 1.5, "F");

        // Text
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(200, 220, 215);
        const tipLines = pdf.splitTextToSize(tip, contentWidth - 14);
        pdf.text(tipLines, margin + 10, y);
        y += tipLines.length * 5.5 + 4;
      });

      // ── FOOTER ─────────────────────────────────────────────────────
      const totalPages = pdf.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);

        // Footer line
        pdf.setDrawColor(126, 200, 200, 40); // softer line
        pdf.setLineWidth(0.4);
        pdf.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

        // Footer text
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(56, 118, 139);
        pdf.text("CONFIDENTIAL · GENERATED BY SOULIFY AI", margin, pageHeight - 10);
        
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 140, 150);
        pdf.text("Emotional Intelligence Platform", margin, pageHeight - 6);
        
        pdf.setFont("helvetica", "bold");
        pdf.text(`PAGE ${p} OF ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
      }

      // ── SAVE ───────────────────────────────────────────────────────
      const filename = `Soulify_Report_${reportData.label.replace(/\s/g, "_")}_${dateNow.replace(/[\s,]/g, "_")}.pdf`;
      pdf.save(filename);

    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setPdfGenerating(false);
    }
  };

  // ── Suggestions Generator ────────────────────────────────────────
  function getSuggestions(data) {
    const tips = [];
    const mood = data.avgMood;
    const dominant = (data.dominant || "").toLowerCase();

    // Core suggestions based on mood score
    if (mood <= 4) {
      tips.push(
        "Your mood has been low this period. Consider scheduling a conversation with a trusted friend or counselor to share how you're feeling.",
        "Try a 10-minute guided meditation each morning to help reset your emotional baseline.",
        "Physical activity — even a short walk outdoors — can significantly boost mood-regulating neurotransmitters."
      );
    } else if (mood <= 6) {
      tips.push(
        "Your emotional state is balanced but could benefit from more positive anchoring. Try a gratitude journaling practice — list 3 things you're grateful for each evening.",
        "Mindful breathing exercises (4-7-8 technique) before sleep can deepen your calm and improve your next day's emotional resilience."
      );
    } else {
      tips.push(
        "You're maintaining a healthy emotional baseline. Continue your current mindfulness practices to sustain this positive trajectory.",
        "Consider channeling your positive energy into creative expression — art, writing, or music can deepen self-awareness."
      );
    }

    // Dominant emotion specific tips
    if (["anxious", "fearful", "nervous"].some(e => dominant.includes(e))) {
      tips.push("For anxiety patterns, progressive muscle relaxation (PMR) practiced for 5 minutes daily has shown measurable cortisol reduction.");
    }
    if (["irritated", "agitated", "angry"].some(e => dominant.includes(e))) {
      tips.push("When agitation dominates, cold water therapy (splashing cold water on face) activates the dive reflex and rapidly calms the nervous system.");
    }
    if (["reflective", "disappointed", "sad"].some(e => dominant.includes(e))) {
      tips.push("Reflective states benefit from structured journaling. Write for 10 minutes about what's causing these feelings — externalizing thoughts reduces their emotional intensity.");
    }
    if (["calm", "grateful", "optimistic"].some(e => dominant.includes(e))) {
      tips.push("Your calm foundation is excellent for building deeper meditation practices. Consider extending your sessions to 15-20 minutes for enhanced benefits.");
    }

    // Trend-based
    if (data.calmIncrease > 10) {
      tips.push(`Great progress! Your calm has increased by ${data.calmIncrease}% — whatever you've been doing, keep it up!`);
    } else if (data.calmIncrease === 0) {
      tips.push("Your calm trend hasn't shifted yet. Try introducing a new wellness habit this week — like a digital detox hour each evening.");
    }

    return tips;
  }

  // ── Loading State ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1c24] text-[#f0f8fa] font-['Inter'] relative pt-32 pb-20 px-6 flex flex-col items-center justify-center overflow-hidden">
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

  // ── Error State ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a1c24] text-[#f0f8fa] font-['Inter'] relative pt-32 pb-20 px-6 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#38768B]/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-md">
          <Activity size={48} className="text-red-400" />
          <h2 className="text-2xl font-bold tracking-wide text-red-300 font-semibold">Sync Interrupted</h2>
          <p className="text-[#A7C4BC] text-sm leading-relaxed">{error}</p>
          <button 
            onClick={() => setDuration(d => d)}
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
    <div className="min-h-screen bg-[#050e12] text-white font-['Inter'] relative pt-32 pb-20 px-6 overflow-hidden selection:bg-[#7EC8C8]/30">
      
      {/* Full Bleed Cinematic Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050e12]/80 via-[#050e12]/40 to-[#050e12]/90 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=2000&auto=format&fit=crop" 
          alt="AI Neural Network"
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Ambient Background Glows */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#7EC8C8]/20 rounded-full blur-[150px] pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#7B52CC]/20 rounded-full blur-[150px] pointer-events-none z-0" 
      />

      {/* Back to Chat */}
      <Link
        to="/chat"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest shadow-lg"
      >
        <ArrowLeft size={16} />
        Back to Chat
      </Link>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER */}
        <header className="text-center mb-16 flex flex-col items-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}
            className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#7EC8C8]/20 bg-white/5 backdrop-blur-xl shadow-[0_0_20px_rgba(126,200,200,0.1)]">
            <Sparkles size={16} className="text-[#7EC8C8]" />
            <span className="text-xs uppercase tracking-[3px] text-[#A7C4BC] font-bold">Insights & Analytics</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
            className="text-5xl md:text-7xl font-['Playfair_Display'] font-bold tracking-tight mb-10 leading-tight text-white drop-shadow-2xl">
            Your Emotional <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7EC8C8] to-[#b196f0]">Journey</span>
          </motion.h1>

          {/* Timeline Selector */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
            className="flex flex-wrap justify-center gap-2 bg-white/5 p-2 rounded-[32px] border border-white/10 backdrop-blur-2xl shadow-xl">
            {DURATIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDuration(key)}
                className={cn(
                  "px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden",
                  duration === key ? "text-[#050e12]" : "text-[#A7C4BC] hover:text-white"
                )}
              >
                {duration === key && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-[#7EC8C8] to-[#A7C4BC] rounded-full shadow-[0_0_20px_rgba(126,200,200,0.4)]" />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </motion.div>
        </header>

        {/* METRICS GRID */}
        <AnimatePresence mode="wait">
          <motion.div key={`metrics-${duration}`} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
            {/* Metric 1 */}
            <motion.div {...fadeUp(0.1)} className="bg-white/[0.03] border border-white/10 rounded-[24px] p-6 backdrop-blur-2xl hover:-translate-y-1 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-[0_20px_50px_rgba(126,200,200,0.15)] transition-all duration-500 group relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7EC8C8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#7EC8C8]/10 rounded-full blur-3xl group-hover:bg-[#7EC8C8]/20 transition-all duration-500" />
              <div className="relative z-10 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 group-hover:border-[#7EC8C8]/50 transition-all duration-500 shadow-inner">
                <Activity size={20} className="text-[#7EC8C8]" />
              </div>
              <h3 className="text-[#A7C4BC] text-[11px] uppercase tracking-[2px] font-bold mb-2">Average Mood</h3>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-5xl font-['Playfair_Display'] font-black text-white">{current.avgMood}</span>
                <span className="text-lg text-white/40 mb-1.5 font-bold">/10</span>
              </div>
            </motion.div>

            {/* Metric 2 */}
            <motion.div {...fadeUp(0.2)} className="bg-white/[0.03] border border-white/10 rounded-[24px] p-6 backdrop-blur-2xl hover:-translate-y-1 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-[0_20px_50px_rgba(177,150,240,0.15)] transition-all duration-500 group relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#b196f0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#b196f0]/10 rounded-full blur-3xl group-hover:bg-[#b196f0]/20 transition-all duration-500" />
              <div className="relative z-10 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 group-hover:border-[#b196f0]/50 transition-all duration-500 shadow-inner">
                <TrendingUp size={20} className="text-[#b196f0]" />
              </div>
              <h3 className="text-[#A7C4BC] text-[11px] uppercase tracking-[2px] font-bold mb-2">Calm Increase</h3>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-5xl font-['Playfair_Display'] font-black text-white">+{current.calmIncrease}</span>
                <span className="text-lg text-white/40 mb-1.5 font-bold">%</span>
              </div>
            </motion.div>

            {/* Metric 3 */}
            <motion.div {...fadeUp(0.3)} className="bg-white/[0.03] border border-white/10 rounded-[24px] p-6 backdrop-blur-2xl hover:-translate-y-1 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-[0_20px_50px_rgba(244,154,200,0.15)] transition-all duration-500 group relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f49ac8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#f49ac8]/10 rounded-full blur-3xl group-hover:bg-[#f49ac8]/20 transition-all duration-500" />
              <div className="relative z-10 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 group-hover:border-[#f49ac8]/50 transition-all duration-500 shadow-inner">
                <Brain size={20} className="text-[#f49ac8]" />
              </div>
              <h3 className="text-[#A7C4BC] text-[11px] uppercase tracking-[2px] font-bold mb-2">Dominant State</h3>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-3xl md:text-4xl font-['Playfair_Display'] font-black text-white leading-tight capitalize">{current.dominant}</span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* CHART & INSIGHTS ROW */}
        <AnimatePresence mode="wait">
          <motion.div key={`chart-${duration}`} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
            
            {/* Chart */}
            <motion.div {...fadeUp(0.4)} className="lg:col-span-2 flex flex-col bg-white/[0.03] border border-white/10 rounded-[24px] p-6 backdrop-blur-2xl shadow-2xl hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#7EC8C8]/5 to-transparent pointer-events-none" />
              <h3 className="relative z-10 text-lg font-bold text-white mb-4 flex items-center gap-3">
                Mood Trajectory 
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest text-[#7EC8C8]">Analytics</span>
              </h3>
              <div ref={chartRef} className="relative z-10 flex-1 w-full min-h-[260px]" style={{ backgroundColor: "transparent" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={current.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMoodPremium" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7EC8C8" stopOpacity={0.6} />
                        <stop offset="50%" stopColor="#7EC8C8" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#38768B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="day" stroke="#A7C4BC" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#A7C4BC" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(5,14,18,0.8)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', padding: '10px 16px' }}
                      itemStyle={{ color: '#7EC8C8', fontWeight: 'bold' }}
                      cursor={{ stroke: 'rgba(126,200,200,0.2)', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#FFFFFF" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorMoodPremium)"
                      connectNulls={true}
                      dot={{ r: 3, fill: "#183440", stroke: "#FFFFFF", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#FFFFFF", stroke: "#7EC8C8", strokeWidth: 2, shadow: "0 0 10px #FFFFFF" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div {...fadeUp(0.5)} className="lg:col-span-1 bg-gradient-to-br from-[#2E5868]/40 to-[#16333c]/40 border border-white/10 rounded-[24px] p-6 backdrop-blur-2xl flex flex-col hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(126,200,200,0.1)_0%,transparent_70%)] pointer-events-none" />
              <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10 mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[9px] uppercase tracking-widest font-bold text-[#7EC8C8] mb-4 shadow-inner border border-white/5">
                  <Sparkles size={10} /> AI Analysis
                </span>
                <h3 className="text-2xl font-['Playfair_Display'] font-black text-white leading-tight">Behavioral<br/>Insights</h3>
              </div>
              <p className="text-[#A7C4BC] leading-relaxed text-sm flex-grow font-medium relative z-10">
                {current.insights}
              </p>
              <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-2.5 h-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]"></span>
                  </div>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Live Sync Active</span>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </AnimatePresence>

        {/* DOWNLOAD SECTION */}
        <motion.div {...fadeUp(0.6)} className="relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-[24px] p-8 md:p-10 backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-white/20 transition-all duration-500 shadow-2xl relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7EC8C8]/10 via-[#b196f0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#7EC8C8]/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-2xl font-['Playfair_Display'] font-black text-white mb-2">Download Full Report</h3>
            <p className="text-[#A7C4BC] text-base max-w-xl">Export a professional PDF with your mood chart, deep cognitive insights, and personalized improvement suggestions.</p>
          </div>

          <button 
            onClick={generatePDF}
            disabled={pdfGenerating}
            className="relative z-10 flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#7EC8C8] to-[#38768B] text-[#050e12] rounded-[16px] font-bold uppercase tracking-widest text-xs hover:scale-105 hover:shadow-[0_20px_40px_rgba(126,200,200,0.4)] transition-all duration-300 flex-shrink-0 disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none border border-white/20"
          >
            {pdfGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-[#050e12]/30 border-t-[#050e12] rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Export PDF
              </>
            )}
          </button>
        </motion.div>

      </div>
    </div>
  );
}