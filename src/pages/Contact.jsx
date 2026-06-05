import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Phone, Send, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

function ContactInfoCard({ icon: Icon, title, content, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center gap-5 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300 group"
    >
      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
        <Icon className="text-[#7EC8C8]" size={24} />
      </div>
      <div>
        <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
        <p className="text-white/70 font-medium">{content}</p>
      </div>
    </motion.div>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <div className="min-h-screen text-white font-['Inter'] relative selection:bg-[#7EC8C8]/30 flex flex-col pt-[120px] pb-20 overflow-hidden bg-[#050e12]">
      
      {/* Full Bleed Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050e12]/60 via-[#050e12]/30 to-[#050e12]/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=2000&auto=format&fit=crop" 
          alt="Peaceful zen sanctuary background"
          className="w-full h-full object-cover opacity-100"
        />
      </div>

      {/* Animated Light Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
          x: [0, 50, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] -left-[10%] w-[600px] h-[600px] bg-[#7EC8C8]/20 rounded-full blur-[120px] pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
          y: [0, -50, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[10%] right-[10%] w-[700px] h-[700px] bg-[#38768B]/15 rounded-full blur-[150px] pointer-events-none z-0" 
      />

      <div className="relative z-10 max-w-[1300px] mx-auto w-full px-6 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center lg:items-start">
        
        {/* ── LEFT: STRUCTURED CANVAS ── */}
        <div className="lg:w-1/2 flex flex-col w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md text-[#7EC8C8] text-xs font-bold px-5 py-2.5 rounded-full mb-6 shadow-sm tracking-wide">
              <Sparkles size={14} />
              GET IN TOUCH
            </div>
            
            <h1 className="font-['Playfair_Display'] text-[56px] md:text-[80px] lg:text-[96px] mb-6 tracking-tight font-black leading-[1.05] text-white">
              WE'RE HERE<br />FOR YOU
            </h1>
            
            <p className="text-[#7EC8C8] uppercase tracking-[5px] text-[15px] font-bold border-l-4 border-[#7EC8C8] pl-4 mb-8">
              Start the Conversation
            </p>
            
            <p className="text-white/80 text-lg leading-relaxed max-w-md">
              Whether you have a question about our cognitive AI, need support, or just want to share your journey, our team is ready to listen.
            </p>
          </motion.div>

          {/* We removed the image box on the left because we have a full page background now */}

          {/* Structured Grid of Contact Cards */}
          <div className="flex flex-col gap-4">
            <ContactInfoCard 
              delay={0.2}
              icon={MapPin} 
              title="Our Sanctuary" 
              content="1200 Serenity Blvd, Suite 400, CA 94103"
            />
            <ContactInfoCard 
              delay={0.3}
              icon={Mail} 
              title="Email Us" 
              content="hello@soulify.ai"
            />
            <ContactInfoCard 
              delay={0.4}
              icon={Phone} 
              title="Call Us" 
              content="+1 (800) 555-0199"
            />
          </div>
        </div>

        {/* ── RIGHT: PREMIUM DARK FORM ── */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:w-1/2 w-full lg:sticky lg:top-[120px]"
        >
          {/* Outer glow behind the dark card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#7EC8C8]/10 to-[#38768B]/10 blur-[80px] -z-10" />
          
          <div className="bg-white/5 backdrop-blur-xl rounded-[40px] p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/10">
            
            {/* Subtle internal grid/glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_60%)] pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6 relative z-10"
                >
                  <h2 className="text-3xl font-['Playfair_Display'] text-white font-bold mb-8">Send a Message</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <label className={`absolute left-4 transition-all duration-300 pointer-events-none font-semibold z-10 ${focusedField === 'name' || formData.name ? 'top-2 text-[11px] text-[#7EC8C8]' : 'top-4 text-sm text-[#A7C4BC]'}`}>
                        Full Name
                      </label>
                      <input
                        type="text" required
                        onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        value={formData.name}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 pt-7 pb-3 text-white outline-none focus:border-[#7EC8C8]/60 focus:bg-white/[0.06] transition-all shadow-inner relative z-0"
                      />
                    </div>
                    
                    <div className="relative group">
                      <label className={`absolute left-4 transition-all duration-300 pointer-events-none font-semibold z-10 ${focusedField === 'email' || formData.email ? 'top-2 text-[11px] text-[#7EC8C8]' : 'top-4 text-sm text-[#A7C4BC]'}`}>
                        Email Address
                      </label>
                      <input
                        type="email" required
                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        value={formData.email}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 pt-7 pb-3 text-white outline-none focus:border-[#7EC8C8]/60 focus:bg-white/[0.06] transition-all shadow-inner relative z-0"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none font-semibold z-10 ${focusedField === 'subject' || formData.subject ? 'top-2 text-[11px] text-[#7EC8C8]' : 'top-4 text-sm text-[#A7C4BC]'}`}>
                      Subject
                    </label>
                    <input
                      type="text" required
                      onFocus={() => setFocusedField('subject')} onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      value={formData.subject}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 pt-7 pb-3 text-white outline-none focus:border-[#7EC8C8]/60 focus:bg-white/[0.06] transition-all shadow-inner relative z-0"
                    />
                  </div>

                  <div className="relative group">
                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none font-semibold z-10 ${focusedField === 'message' || formData.message ? 'top-2 text-[11px] text-[#7EC8C8]' : 'top-5 text-sm text-[#A7C4BC]'}`}>
                      How can we help you?
                    </label>
                    <textarea
                      required rows="4"
                      onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      value={formData.message}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 pt-7 pb-4 text-white outline-none focus:border-[#7EC8C8]/60 focus:bg-white/[0.06] transition-all shadow-inner resize-none relative z-0"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full group bg-gradient-to-r from-[#7EC8C8] to-[#38768B] hover:shadow-[0_15px_30px_rgba(126,200,200,0.3)] text-white font-bold text-lg py-4 px-8 rounded-2xl transition-all duration-300 flex justify-center items-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.2)] disabled:opacity-70 disabled:cursor-not-allowed border border-white/10"
                    >
                      {isSubmitting ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <AlertCircle size={22} />
                        </motion.div>
                      ) : (
                        <>Send Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-16 relative z-10"
                >
                  <div className="w-24 h-24 bg-[#10b981]/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 size={48} className="text-[#10b981]" />
                  </div>
                  <h3 className="text-[32px] font-bold font-['Playfair_Display'] text-white mb-4">Message Sent</h3>
                  <p className="text-[#A7C4BC] text-lg mb-10 max-w-[300px]">
                    Thank you for reaching out. A human from our sanctuary will connect with you soon.
                  </p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full border border-white/20 transition-all duration-300"
                  >
                    Send Another
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}