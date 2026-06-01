import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Clock, MapPin, Send, MessageCircle, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.15, ease: "easeOut" },
});

const contactCards = [
  { icon: Mail, label: 'Email Us', value: 'hello@soulify.com', color: '#38768B', sub: 'Replies within 24 hours' },
  { icon: Phone, label: 'Call Us', value: '+1 (555) 123-4567', color: '#7B52CC', sub: 'Mon–Fri, 9 AM–6 PM' },
  { icon: MessageCircle, label: 'Live Chat', value: 'Start a conversation', color: '#EC4899', sub: 'Usually replies instantly' },
  { icon: MapPin, label: 'Find Us', value: '123 Serenity Lane, CA', color: '#10B981', sub: 'Wellness Valley, CA 90210' },
];

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#050e12] min-h-screen text-[#f0f8fa] font-['Inter'] relative overflow-hidden selection:bg-[#38768B]/30 pt-24">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#38768B]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7B52CC]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiLz48L3N2Zz4=')] opacity-50" />

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#38768B]/30 bg-white/5 backdrop-blur-md">
          <MessageCircle size={14} className="text-[#38768B]" />
          <span className="text-xs uppercase tracking-widest text-[#A7C4BC] font-semibold">Contact Us</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Let's Start a <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7EC8C8] to-[#38768B]">Conversation</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
          className="text-lg md:text-xl text-[#A7C4BC] max-w-2xl font-light leading-relaxed">
          Whether you have a question, a partnership idea, or just want to say hello — we'd love to hear from you.
        </motion.p>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-3">
            <motion.div className="bg-[#0A1E26]/60 border border-white/5 backdrop-blur-2xl rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden" {...fadeUp(0)}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#38768B]/10 rounded-full blur-[80px] -z-10" />
              
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5, type: 'spring' }}
                    className="flex flex-col items-center justify-center text-center h-[500px]">
                    <div className="w-24 h-24 bg-gradient-to-tr from-[#10B981] to-[#34D399] rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 size={48} className="text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Message Sent!</h3>
                    <p className="text-[#A7C4BC] mb-8 text-lg max-w-sm">We've received your message and will get back to you within 24 hours. Check your inbox.</p>
                    <button onClick={() => setSubmitted(false)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white font-medium">
                      Send Another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`text-sm font-semibold transition-colors ${focusedField === 'name' ? 'text-[#7EC8C8]' : 'text-[#A7C4BC]'}`}>Full Name</label>
                        <input type="text" required placeholder="Your name" value={formState.name}
                          onChange={e => setFormState({ ...formState, name: e.target.value })}
                          onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                          className="w-full bg-[#050e12]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#38768B] focus:ring-1 focus:ring-[#38768B] transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className={`text-sm font-semibold transition-colors ${focusedField === 'email' ? 'text-[#7EC8C8]' : 'text-[#A7C4BC]'}`}>Email Address</label>
                        <input type="email" required placeholder="your@email.com" value={formState.email}
                          onChange={e => setFormState({ ...formState, email: e.target.value })}
                          onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                          className="w-full bg-[#050e12]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#38768B] focus:ring-1 focus:ring-[#38768B] transition-all" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`text-sm font-semibold transition-colors ${focusedField === 'subject' ? 'text-[#7EC8C8]' : 'text-[#A7C4BC]'}`}>Subject</label>
                      <input type="text" placeholder="How can we help?" value={formState.subject}
                        onChange={e => setFormState({ ...formState, subject: e.target.value })}
                        onFocus={() => setFocusedField('subject')} onBlur={() => setFocusedField(null)}
                        className="w-full bg-[#050e12]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#38768B] focus:ring-1 focus:ring-[#38768B] transition-all" />
                    </div>

                    <div className="space-y-2">
                      <label className={`text-sm font-semibold transition-colors ${focusedField === 'message' ? 'text-[#7EC8C8]' : 'text-[#A7C4BC]'}`}>Message</label>
                      <textarea required placeholder="Tell us what's on your mind..." rows={6} value={formState.message}
                        onChange={e => setFormState({ ...formState, message: e.target.value })}
                        onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)}
                        className="w-full bg-[#050e12]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#38768B] focus:ring-1 focus:ring-[#38768B] transition-all resize-none" />
                    </div>

                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#38768B] to-[#2F5D6E] text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(56,118,139,0.3)] hover:shadow-[0_0_30px_rgba(56,118,139,0.5)] transition-shadow">
                      <Send size={18} /> Send Message
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Column: Contact Info & Aside */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {contactCards.map((c, i) => (
                <motion.div key={i} {...fadeUp(0.1 * i)}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, ${c.color}, transparent)` }} />
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: `${c.color}20` }}>
                    <c.icon size={20} color={c.color} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{c.label}</h4>
                    <p className="text-[#A7C4BC] text-sm mb-1">{c.value}</p>
                    <p className="text-white/40 text-xs">{c.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div {...fadeUp(0.4)} className="p-8 rounded-3xl bg-gradient-to-b from-[#0A1E26] to-[#050e12] border border-[#38768B]/30 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#7EC8C8]/20 rounded-full blur-[40px]" />
              <Sparkles size={28} color="#7EC8C8" className="mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Talk to Souli Instead</h3>
              <p className="text-[#A7C4BC] text-sm leading-relaxed mb-6">Need help right now? Souli is available 24/7 — no wait times, no judgment. A deeply empathetic listener is just a click away.</p>
              <Link to="/chat" className="inline-flex items-center gap-2 text-white font-semibold group px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                Start Chat <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
          
        </div>
      </section>

    </div>
  );
}