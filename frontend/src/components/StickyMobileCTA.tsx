import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { analytics } from '../utils/analytics';

interface StickyMobileCTAProps {
  onOpenDashboard: () => void;
}

export const StickyMobileCTA: React.FC<StickyMobileCTAProps> = ({ onOpenDashboard }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="mobile-sticky-cta-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid #e4e4e7',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        zIndex: 45,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
        fontFamily: "'Inter', sans-serif"
      }}
      role="region"
      aria-label="Quick action navigation bar"
    >
      <button
        onClick={() => {
          analytics.ctaClick('sticky_mobile_start_analysis');
          onOpenDashboard();
        }}
        className="btn-black"
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: '12px 20px',
          fontSize: '13px',
          fontWeight: 600,
          borderRadius: '9999px'
        }}
      >
        <Play size={14} fill="white" />
        <span>Start Job Analysis →</span>
      </button>

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#888',
          padding: '8px',
          cursor: 'pointer',
          borderRadius: '50%'
        }}
        aria-label="Dismiss sticky CTA"
      >
        <X size={16} />
      </button>

      <style>{`
        @media (min-width: 769px) {
          .mobile-sticky-cta-bar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
