import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, FileBarChart2, 
    Settings, BrainCircuit, 
    MessageSquare, Wind, Coffee, Heart, Home
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PromptInputBox } from "../components/ui/ai-prompt-box";
import logo from "../assets/new_logo.png";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const bgMap = {
    sadness: "#120f03",
    grief: "#120f03",
    remorse: "#120f03",
    fear: "#031206",
    nervousness: "#031206",
    anger: "#0c0303",
    annoyance: "#0c0303",
    disgust: "#0c0303",
    disapproval: "#0c0303",
    confusion: "#0a0312",
    disappointment: "#031211",
    embarrassment: "#12030d",
    joy: "#120a03",
    excitement: "#120a03",
    amusement: "#120a03",
    love: "#120303",
    desire: "#120303",
    caring: "#120303",
    admiration: "#030c12",
    approval: "#030c12",
    gratitude: "#031206",
    optimism: "#031206",
    pride: "#031206",
    curiosity: "#080612",
    realization: "#080612",
    surprise: "#080612",
    relief: "#031211",
    neutral: "#050e12"
};

const labelMap = {
    sadness: "Healing Gold",
    grief: "Healing Gold",
    remorse: "Healing Gold",
    fear: "Grounding Mint",
    nervousness: "Grounding Mint",
    anger: "Cooling Arctic Blue",
    annoyance: "Cooling Arctic Blue",
    disgust: "Cooling Arctic Blue",
    disapproval: "Cooling Arctic Blue",
    confusion: "Clarity Lavender",
    disappointment: "Ocean Teal Perspective",
    embarrassment: "Compassion Pink",
    joy: "Vibrant Celebration",
    excitement: "Vibrant Celebration",
    amusement: "Vibrant Celebration",
    love: "Deep Connection",
    desire: "Deep Connection",
    caring: "Deep Connection",
    admiration: "Royal Indigo Respect",
    approval: "Royal Indigo Respect",
    gratitude: "Emerald Flourishing",
    optimism: "Emerald Flourishing",
    pride: "Emerald Flourishing",
    curiosity: "Curious Purple",
    realization: "Realization Violet",
    surprise: "Surprise Violet",
    relief: "Relief Teal",
    neutral: "Neutral Balance"
};

const DEFAULT_THEME = {
    bg: "#050e12",
    laser: "#38768B",
    accent: "from-[#38768B] to-[#1a3a47]",
    text: "text-[#7EC8C8]",
    glow: "rgba(56, 118, 139, 0.15)",
    label: "Neutral Balance"
};

const getThemeForEmotion = (emotion, apiTheme) => {
    const defaultAccent = "#38768B";
    const accent = apiTheme?.accent || defaultAccent;
    const bg = bgMap[emotion] || "#050e12";
    const label = labelMap[emotion] || (emotion ? emotion.charAt(0).toUpperCase() + emotion.slice(1) : "Neutral Balance");

    return {
        bg: bg,
        laser: accent,
        accent: `from-[${accent}] to-[#000000]`,
        text: `text-[${accent}]`,
        glow: `${accent}26`,
        label: label,
        rawAccent: accent
    };
};

const getOrCreateSessionId = () => {
    let sid = sessionStorage.getItem("soulify_session_id");
    if (!sid) {
        sid = "session_" + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem("soulify_session_id", sid);
    }
    return sid;
};

const getOrCreateUserId = () => {
    const savedUser = localStorage.getItem("soulify_user");
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            // Use the real MongoDB _id (stored as 'id') so mood logs are linked correctly
            if (parsed && parsed.id) {
                return parsed.id;
            }
            // Fallback to email if id is somehow missing (older sessions)
            if (parsed && parsed.email) {
                return parsed.email;
            }
        } catch (e) {
            console.error("Error reading soulify_user", e);
        }
    }
    let uid = localStorage.getItem("soulify_user_id");
    if (!uid) {
        uid = "user_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("soulify_user_id", uid);
    }
    return uid;
};

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [theme, setTheme] = useState(DEFAULT_THEME);
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarHovered, setSidebarHovered] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);  // real sessions from DB
    const [historyLoading, setHistoryLoading] = useState(true);
    
    const messagesEndRef = useRef(null);
    const firstKeyStrokeTimeRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Track dynamic typing speed metrics
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                if (firstKeyStrokeTimeRef.current === null) {
                    firstKeyStrokeTimeRef.current = Date.now();
                }
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    // Load real chat history from Node backend on mount
    useEffect(() => {
        const userId = getOrCreateUserId();
        if (!userId) { setHistoryLoading(false); return; }

        fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/chat/history?user_id=${encodeURIComponent(userId)}`)
            .then(r => r.json())
            .then(data => {
                if (data.status === 'success') setChatHistory(data.sessions);
            })
            .catch(err => console.warn("Could not load chat history:", err))
            .finally(() => setHistoryLoading(false));
    }, []);

    const startNewSession = () => {
        setMessages([]);
        setTheme(DEFAULT_THEME);
        const newSid = "session_" + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem("soulify_session_id", newSid);
    };

    // Load a past session's full messages when clicked in sidebar
    const loadSession = async (sessionId) => {
        const userId = getOrCreateUserId();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/chat/session?user_id=${encodeURIComponent(userId)}&session_id=${encodeURIComponent(sessionId)}`);
            const data = await res.json();
            if (data.status === 'success' && data.session?.messages) {
                sessionStorage.setItem("soulify_session_id", sessionId);
                setMessages(data.session.messages);
                setTheme(DEFAULT_THEME);
            }
        } catch (err) {
            console.warn("Could not load session:", err);
        }
    };

    const handleSend = async (messageText) => {
        if (!messageText.trim()) return;

        // 1. Add User Message immediately in UI
        const userMsgId = Date.now();
        setMessages((prev) => [...prev, { id: userMsgId, text: messageText, sender: "user" }]);
        setIsTyping(true);

        // 2. Measure characters/second typing speed
        let typingSpeed = 5.0;
        if (firstKeyStrokeTimeRef.current !== null) {
            const durationSeconds = (Date.now() - firstKeyStrokeTimeRef.current) / 1000;
            if (durationSeconds > 0.5) {
                typingSpeed = messageText.length / durationSeconds;
                typingSpeed = Math.max(1, Math.min(20, typingSpeed));
            }
            firstKeyStrokeTimeRef.current = null; // reset for next metric
        }

        // 3. Fire real-time request to the Python FastAPI backend
        const apiURL = `${import.meta.env.VITE_MODEL_URL || "http://127.0.0.1:8000"}/chat`;
        const sessionId = getOrCreateSessionId();
        const userId = getOrCreateUserId();

        try {
            const response = await fetch(apiURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: messageText,
                    session_id: sessionId,
                    user_id: userId,
                    typing_speed: parseFloat(typingSpeed.toFixed(2))
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            
            const aiMessage = { id: Date.now(), text: data.reply, sender: "ai" };

            // 4. Update the messages with AI response
            setMessages((prev) => {
                const updated = [...prev, aiMessage];

                // 5. Persist the full session to Node backend (fire-and-forget)
                const sessionId = getOrCreateSessionId();
                const userId = getOrCreateUserId();
                fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/chat/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, session_id: sessionId, messages: updated })
                }).then(r => r.json()).then(saved => {
                    // Refresh sidebar list silently after save
                    if (saved.status === 'success') {
                        fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/chat/history?user_id=${encodeURIComponent(userId)}`)
                            .then(r => r.json())
                            .then(histData => { if (histData.status === 'success') setChatHistory(histData.sessions); })
                            .catch(() => {});
                    }
                }).catch(() => {});

                // Log the detected emotion for the live graph report
                if (data.emotion) {
                    fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/api/log-mood`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: userId,
                            emotion: data.emotion,
                            message_preview: messageText.substring(0, 100)
                        })
                    }).catch(() => {});
                }

                return updated;
            });

            // 6. Update visual background theme dynamically based on emotion class & recommended accent colors
            const newTheme = getThemeForEmotion(data.emotion, data.theme);
            setTheme(newTheme);

        } catch (error) {
            console.error("Failed to connect to Soulify backend:", error);
            
            // Fail gracefully - maintain dark theme but trigger empathetic local reply
            setMessages((prev) => [
                ...prev,
                { 
                    id: Date.now(), 
                    text: "I'm having a brief issue connecting to my backend right now, but I am still here. Let's take a slow breath together.", 
                    sender: "ai" 
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <motion.div 
            animate={{ backgroundColor: theme.bg }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex h-screen w-full overflow-hidden font-['Inter'] relative selection:bg-white/20 selection:text-white text-white"
        >
            {/* Premium Moon Horizon Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#050e12]">
                {/* Full Bleed Background Image (Zen Sanctuary) */}
                <img 
                    src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=2000&auto=format&fit=crop" 
                    alt="Zen Sanctuary"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
                />
                
                {/* The Ruixen Moon Image */}
                <div
                    className="absolute inset-0 w-full h-full bg-no-repeat opacity-80"
                    style={{
                        backgroundImage: "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
                        backgroundPosition: "center 80%",
                        backgroundSize: "120% auto",
                    }}
                />
                {/* Dynamic Emotion Color Tinting */}
                <motion.div
                    animate={{ backgroundColor: theme.laser }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 mix-blend-color opacity-100"
                />
                {/* Vignette & Depth Shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050e12] via-transparent to-[#050e12]/80" />
            </div>

            {/* MINIMAL SIDEBAR */}
            <motion.div 
                className="relative z-20 flex flex-col justify-between py-6 h-full border-r border-white/[0.03] bg-black/20 backdrop-blur-3xl hidden md:flex"
                animate={{ width: sidebarHovered ? 260 : 80 }}
                onMouseEnter={() => setSidebarHovered(true)}
                onMouseLeave={() => setSidebarHovered(false)}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // smooth spring
            >
                <div className="flex flex-col px-4 gap-8">
                    {/* Brand */}
                    <div className="flex items-center gap-4 px-2 cursor-pointer" onClick={startNewSession}>
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                            <img src={logo} alt="Soulify" className="w-5 h-5 object-contain" />
                        </div>
                        <AnimatePresence>
                            {sidebarHovered && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -10 }} 
                                    className="font-bold text-lg tracking-tight whitespace-nowrap"
                                >
                                    Souli
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* New Chat */}
                    <button 
                        onClick={startNewSession}
                        className="flex items-center gap-4 px-2 py-2.5 hover:bg-white/[0.04] rounded-xl transition-colors group cursor-pointer"
                    >
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                            <Plus size={18} className="text-white/50 group-hover:text-white transition-colors" />
                        </div>
                        <AnimatePresence>
                            {sidebarHovered && (
                                <motion.span 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }} 
                                    className="text-[13px] font-medium text-white/70 group-hover:text-white whitespace-nowrap"
                                >
                                    New Session
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* History */}
                    <div className="flex flex-col gap-1 mt-4">
                        <AnimatePresence>
                            {sidebarHovered && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-white/30 mb-2 whitespace-nowrap">
                                    Recent
                                </motion.span>
                            )}
                        </AnimatePresence>
                        
                        {historyLoading && sidebarHovered && (
                            <div className="px-4 py-2 text-[11px] text-white/30 animate-pulse">Loading...</div>
                        )}

                        {!historyLoading && chatHistory.length === 0 && sidebarHovered && (
                            <div className="px-4 py-2 text-[11px] text-white/20 italic">No sessions yet</div>
                        )}

                        {chatHistory.map((session) => (
                            <div
                                key={session.session_id}
                                onClick={() => loadSession(session.session_id)}
                                className="flex items-center gap-4 px-2 py-2 hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer group"
                            >
                                <div className="w-8 h-8 flex items-center justify-center shrink-0 text-white/30 group-hover:text-white/70 transition-colors">
                                    <MessageSquare size={16} />
                                </div>
                                <AnimatePresence>
                                    {sidebarHovered && (
                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-white/50 group-hover:text-white/90 whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]">
                                            {session.title || 'Session'}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col px-4 gap-2">
                    <Link to="/" className="flex items-center gap-4 px-2 py-2 hover:bg-white/[0.04] rounded-xl transition-colors group">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                            <Home size={18} className="text-white/40 group-hover:text-white transition-colors" />
                        </div>
                        <AnimatePresence>
                            {sidebarHovered && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] font-medium text-white/70 group-hover:text-white whitespace-nowrap">
                                    Home
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                    <Link to="/report" className="flex items-center gap-4 px-2 py-2 hover:bg-white/[0.04] rounded-xl transition-colors group">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                            <FileBarChart2 size={18} className="text-[#7EC8C8] opacity-70 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <AnimatePresence>
                            {sidebarHovered && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] font-medium text-white/70 group-hover:text-white whitespace-nowrap">
                                    Insights Report
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                    <div className="flex items-center gap-4 px-2 py-2 hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer group">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                            <Settings size={18} className="text-white/40 group-hover:text-white transition-colors" />
                        </div>
                        <AnimatePresence>
                            {sidebarHovered && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] font-medium text-white/70 group-hover:text-white whitespace-nowrap">
                                    Preferences
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* MAIN CHAT AREA */}
            <div className="relative z-10 flex-1 flex flex-col bg-transparent">
                
                {/* Mobile Header */}
                <div className="md:hidden p-5 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                            <Home size={18} className="text-white/70" />
                        </Link>
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                            <img src={logo} alt="Soulify" className="w-4 h-4 object-contain opacity-80" />
                        </div>
                        <span className="font-bold tracking-tight">Souli</span>
                    </div>
                    <Link to="/report"><FileBarChart2 size={18} className="text-[#7EC8C8]" /></Link>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-8 md:pt-16 pb-32 flex flex-col">
                    <div className="w-full max-w-[750px] mx-auto flex flex-col gap-8">
                        {messages.length === 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="flex-1 flex flex-col items-center justify-center text-center mt-[10vh]"
                            >
                                {/* Breathing Orb */}
                                <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                                    <motion.div 
                                        animate={{ 
                                            scale: [1, 1.1, 1],
                                            opacity: [0.4, 0.7, 0.4] 
                                        }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute inset-0 rounded-full blur-3xl"
                                        style={{ backgroundColor: theme.laser }}
                                    />
                                    <img src={logo} alt="Soulify" className="w-16 h-16 object-contain z-10 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                </div>

                                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white/90 mb-4">
                                    How are you feeling?
                                </h2>
                                <p className="text-[15px] text-white/40 max-w-md mx-auto leading-relaxed mb-12 font-medium">
                                    I am an emotionally intelligent space designed to listen and adapt to what you need right now.
                                </p>
                                
                                {/* Quick Actions */}
                                <div className="flex flex-wrap justify-center gap-3">
                                    <QuickAction icon={<Wind size={14}/>} label="I feel anxious" onClick={() => handleSend("I am feeling really anxious and overwhelmed right now.")} />
                                    <QuickAction icon={<Coffee size={14}/>} label="I'm exhausted" onClick={() => handleSend("I am feeling incredibly tired and burned out.")} />
                                    <QuickAction icon={<Heart size={14}/>} label="I need to vent" onClick={() => handleSend("I just need to vent about something that happened today.")} />
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className={cn(
                                        "flex w-full group",
                                        msg.sender === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {msg.sender === "ai" && (
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mr-4 mt-1">
                                            <img src={logo} alt="Soulify" className="w-5 h-5 object-contain opacity-90" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "max-w-[85%] md:max-w-[75%] px-5 py-4 text-[15px] leading-[1.6] font-medium tracking-wide",
                                        msg.sender === "user" 
                                            ? "bg-white/5 text-white rounded-[24px] rounded-br-sm border border-white/5 shadow-xl" 
                                            : "bg-transparent text-white/80 rounded-2xl"
                                    )}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mr-4 mt-1">
                                    <img src={logo} alt="Soulify" className="w-5 h-5 object-contain opacity-90" />
                                </div>
                                <div className="py-4 flex gap-1.5 items-center">
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-10" />
                    </div>
                </div>

                {/* Input Area - Absolute fixed at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                    <div className="w-full max-w-[750px] mx-auto pointer-events-auto">
                        <PromptInputBox 
                            onSend={(text) => handleSend(text)}
                            isLoading={isTyping}
                        />
                        <div className="text-center mt-4 text-[11px] text-white/30 tracking-widest uppercase font-semibold">
                            Souli AI | Emotional Intelligence Model
                        </div>
                    </div>
                </div>

            </div>
            
            {/* Minimal Status Indicator */}
            <motion.div 
                layout
                className="absolute top-6 right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.05] bg-black/30 backdrop-blur-md"
            >
                <BrainCircuit size={12} style={{ color: theme.laser }} />
                <span className="text-[10px] font-semibold tracking-widest text-white/50 uppercase">{theme.label}</span>
            </motion.div>
        </motion.div>
    );
}

function QuickAction({ icon, label, onClick }) {
    return (
        <button 
            onClick={onClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-full text-[13px] font-medium text-white/60 hover:text-white transition-all hover:scale-[1.02]"
        >
            <span className="opacity-70">{icon}</span>
            {label}
        </button>
    );
}