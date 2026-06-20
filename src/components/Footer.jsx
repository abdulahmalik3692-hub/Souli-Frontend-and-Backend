import React from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, Clock, MapPin, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const location = useLocation();

  // Dynamically set the wave background color to match the bottom of the preceding page section
  let waveBgColor = '#050e12'; // Default dark background for Why, Contact, Report, etc.
  
  if (location.pathname === '/home') {
    waveBgColor = '#edf5f8'; // Matches the Home page last section's bottom gradient color
  } else if (location.pathname === '/about') {
    waveBgColor = '#ffffff'; // Matches the About page last section's white background
  } else if (location.pathname === '/work') {
    waveBgColor = '#07141a'; // Combined color of #0A1E26/40 overlay on #050e12 base
  } else if (location.pathname !== '/why' && location.pathname !== '/contact' && location.pathname !== '/report') {
    // If it's a 404 or any other unexpected route with a footer, match the error page background
    waveBgColor = '#D1E0E1';
  }

  return (
    <footer className="short-footer-root">
      {/* SVG Wave top edge */}
      <div className="short-footer-wave" style={{ backgroundColor: waveBgColor }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C320,120 420,0 720,60 C1020,120 1120,0 1440,60 L1440,120 L0,120 Z" fill="#305D6E" />
        </svg>
      </div>

      <div className="short-footer-content">
      <div className="short-footer-content-inner">
        <div className="short-footer-grid">
        
        {/* Column 1: Brand */}
        <div className="short-footer-col">
          <h3 className="short-footer-brand">Soulify</h3>
          <p className="short-footer-desc">
            Empowering your spiritual journey through technology and mindfulness. Find your inner peace with us.
          </p>
          <div className="short-footer-location">
            <MapPin size={16} />
            <span>123 Serenity Lane, Wellness<br/>Valley, CA 90210</span>
          </div>
        </div>

        {/* Column 2: Contact Us */}
        <div className="short-footer-col">
          <h4 className="short-footer-title">Contact Us</h4>
          <ul className="short-footer-list">
            <li>
              <Mail size={16} />
              <span>hello@soulify.com</span>
            </li>
            <li>
              <Phone size={16} />
              <span>+1 (555) 123-4567</span>
            </li>
            <li>
              <Clock size={16} />
              <span>Mon – Fri: 9:00 AM – 6:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Column 3: Follow Us */}
        <div className="short-footer-col">
          <h4 className="short-footer-title">Follow Us</h4>
          <p className="short-footer-desc" style={{ marginBottom: '1rem' }}>
            Join our community on social media for daily inspiration and tips.
          </p>
          <div className="short-footer-socials">
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={18} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
          </div>
        </div>
      </div>
      
      <div className="short-footer-bottom">
        <p>© 2025 Soulify Inc. All rights reserved.</p>
      </div>
    </div>
    </div>
  </footer>
  );
};

export default Footer;
