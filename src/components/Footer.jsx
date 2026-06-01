import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock, Instagram, Facebook, Youtube, Twitter, ArrowUpRight, Heart } from 'lucide-react';
import logo from '../assets/new_logo.png';
import './Footer.css';

const navLinks = [
  { label: 'Home', to: '/home' },
  { label: 'Our Work', to: '/work' },
  { label: 'Why Soulify', to: '/why' },
  { label: 'View Report', to: '/report' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'About Us', to: '/about' },
];

const socialLinks = [
  { Icon: Instagram, label: 'Instagram', href: '#', color: '#E1306C' },
  { Icon: Twitter,   label: 'Twitter/X', href: '#', color: '#1DA1F2' },
  { Icon: Youtube,   label: 'YouTube',   href: '#', color: '#FF0000' },
  { Icon: Facebook,  label: 'Facebook',  href: '#', color: '#1877F2' },
];

const contactItems = [
  { Icon: Mail,  text: 'hello@soulify.com' },
  { Icon: Phone, text: '+1 (555) 123-4567' },
  { Icon: Clock, text: 'Mon – Fri: 9 AM – 6 PM' },
  { Icon: MapPin,text: '123 Serenity Lane, CA 90210' },
];

const anim = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.15, ease: "easeOut" },
});

const Footer = () => (
  <footer className="footer-root">
    <div className="footer-glow-left" />
    <div className="footer-glow-right" />

    {/* ── TOP: Brand + Newsletter ── */}
    <div className="footer-top">
      <motion.div className="footer-logo-wrap" {...anim(0)}>
        <div className="footer-logo">
          <img src={logo} alt="Soulify" />
          <span>SOULIFY</span>
        </div>
        <p className="footer-brand-desc">
          AI-powered emotional wellness — guiding your journey to inner peace, gently and beautifully.
        </p>
        <div className="footer-socials">
          {socialLinks.map(({ Icon, label, href, color }, i) => (
            <motion.a key={i} href={href} aria-label={label}
              className="footer-social-btn"
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{ '--hover-color': color }}
            >
              <Icon size={17} />
            </motion.a>
          ))}
        </div>
      </motion.div>

      <motion.div className="footer-newsletter-side" {...anim(0.15)}>
        <div className="footer-newsletter-label">Newsletter</div>
        <div className="footer-newsletter-tagline">
          Weekly calm,<br />delivered to you.
        </div>
        <div className="footer-form-row">
          <input type="email" placeholder="your@email.com" className="footer-input" />
          <button className="footer-subscribe-btn">Subscribe</button>
        </div>
        <p className="footer-privacy-note">No spam. Unsubscribe anytime.</p>
      </motion.div>
    </div>

    {/* ── MIDDLE: Nav + Contact + Hours ── */}
    <div className="footer-inner">
      {/* Navigation */}
      <motion.div {...anim(0.05)}>
        <h4 className="footer-heading">Pages</h4>
        <ul className="footer-nav-list">
          {navLinks.map(({ label, to }) => (
            <li key={label}>
              <Link to={to} className="footer-nav-link">
                <ArrowUpRight size={12} className="footer-link-arrow" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Contact */}
      <motion.div {...anim(0.12)}>
        <h4 className="footer-heading">Contact</h4>
        <ul className="footer-contact-list">
          {contactItems.map(({ Icon, text }, i) => (
            <li key={i} className="footer-contact-item">
              <div className="footer-contact-icon"><Icon size={14} /></div>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* About blurb */}
      <motion.div {...anim(0.2)}>
        <h4 className="footer-heading">Our Mission</h4>
        <p style={{ fontSize: '0.875rem', color: 'rgba(200,225,230,0.38)', lineHeight: 1.75 }}>
          Soulify was built on a simple belief — everyone deserves access to emotional clarity.
          We combine AI, color psychology, and empathy to make that possible.
        </p>
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {['28 Emotion States', '12,000+ Active Users', '4.9 ★ App Rating'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(200,225,230,0.35)' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#38768B', flexShrink: 0 }}/>
              {s}
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* ── BOTTOM BAR ── */}
    <div className="footer-bottom">
      <div className="footer-bottom-inner">
        <span className="footer-copy">© 2025 Soulify Inc. All rights reserved.</span>
        <span className="footer-made-with">
          Made with <Heart size={11} fill="#EC4899" color="#EC4899" style={{ display:'inline', margin:'0 3px', verticalAlign:'middle' }} /> for your peace of mind
        </span>
        <div className="footer-legal">
          <a href="#" className="footer-legal-link">Privacy</a>
          <span>·</span>
          <a href="#" className="footer-legal-link">Terms</a>
          <span>·</span>
          <a href="#" className="footer-legal-link">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
