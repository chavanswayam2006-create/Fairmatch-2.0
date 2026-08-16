import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { analytics } from '../utils/analytics';

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('fairmatch_cookie_consent');
    if (!consent) {
      // Delay showing banner slightly for clean page load
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('fairmatch_cookie_consent', 'accepted');
    analytics.cookieConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('fairmatch_cookie_consent', 'declined');
    analytics.cookieConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      right: '24px',
      maxWidth: '460px',
      backgroundColor: '#ffffff',
      border: '1px solid #e4e4e7',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      zIndex: 90,
      fontFamily: "'Inter', sans-serif"
    }}
      role="region"
      aria-label="Cookie consent banner"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: '#09090b' }}>
          <ShieldCheck size={18} color="#16a34a" />
          <span>Privacy & Preference Notice</span>
        </div>
        <button
          onClick={handleDecline}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '2px' }}
          aria-label="Close banner"
        >
          <X size={16} />
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, marginBottom: '14px' }}>
        We use essential local storage to save your application preferences. We do not track you across third-party websites or sell your data.{' '}
        <button
          onClick={onOpenPrivacy}
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}
        >
          Read Privacy Policy
        </button>
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleDecline}
          className="btn-outline"
          style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '9999px' }}
        >
          Essential Only
        </button>
        <button
          onClick={handleAccept}
          className="btn-black"
          style={{ padding: '6px 16px', fontSize: '12px', borderRadius: '9999px' }}
        >
          Accept Preferences
        </button>
      </div>
    </div>
  );
};
