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
    <div
      className="fixed bottom-6 left-6 right-6 max-w-sm z-[90] font-sans"
      role="region"
      aria-label="Cookie consent banner"
      style={{ maxWidth: '440px' }}
    >
      <div className="fm-glass-card p-5 shadow-2xl shadow-black/60">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 font-semibold text-sm text-white">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Privacy & Preference Notice</span>
          </div>
          <button
            onClick={handleDecline}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close banner"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          We use essential local storage to save your application preferences. We do not track you across third-party websites or sell your data.{' '}
          <button
            onClick={onOpenPrivacy}
            className="text-zinc-200 underline underline-offset-2 hover:text-white transition-colors"
          >
            Read Privacy Policy
          </button>
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleDecline}
            className="btn-vesper btn-vesper-ghost h-8 px-3 text-xs"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="btn-vesper btn-vesper-solid h-8 px-4 text-xs font-semibold"
          >
            Accept Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
