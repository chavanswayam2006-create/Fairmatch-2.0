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
    <>
      <div
        className="mobile-sticky-cta-bar fixed bottom-0 left-0 right-0 z-[45] flex items-center gap-3 px-4"
        style={{
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          paddingTop: '12px',
          background: 'rgba(8, 8, 8, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
        }}
        role="region"
        aria-label="Quick action navigation bar"
      >
        <button
          onClick={() => {
            analytics.ctaClick('sticky_mobile_start_analysis');
            onOpenDashboard();
          }}
          className="btn-vesper btn-vesper-solid flex-1 h-12 text-sm font-semibold"
        >
          <Play size={14} className="fill-current mr-2" />
          <span>Launch FairMatch Analysis →</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors shrink-0"
          aria-label="Dismiss sticky CTA"
        >
          <X size={16} />
        </button>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .mobile-sticky-cta-bar {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
