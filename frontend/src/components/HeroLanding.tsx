import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';

interface HeroLandingProps {
  onOpenDashboard: () => void;
  onOpenAbout: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onExploreJobs?: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ onOpenDashboard, onOpenAbout, onOpenPrivacy, onOpenTerms, onExploreJobs }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* 1. Fixed Navbar */}
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: easeCurve }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          pointerEvents: 'none',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        className="navbar-container"
      >
        {/* Left Side Navbar */}
        <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Platform Icon / Logo — Clickable to open Platform Details */}
          <div 
            onClick={onOpenAbout}
            title="Click to view Platform Details & Architecture"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="8" width="16" height="8" rx="4" transform="rotate(-35 6 8)" fill="#000000" />
              <rect x="12" y="14" width="16" height="8" rx="4" transform="rotate(-35 12 14)" fill="#000000" />
            </svg>
            <span style={{
              fontWeight: 600,
              fontSize: '17px',
              letterSpacing: '-0.02em',
              color: '#000000'
            }} className="logo-text">
              FairMatch AI
            </span>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="nav-links" style={{ display: 'flex', gap: '18px', marginLeft: '12px' }}>
            <button onClick={onOpenAbout} style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: 500, color: '#333', cursor: 'pointer' }}>Platform Details</button>
            {onExploreJobs && <button onClick={onExploreJobs} style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: 500, color: '#333', cursor: 'pointer' }}>Explore Jobs</button>}
            <button onClick={onOpenDashboard} style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: 500, color: '#333', cursor: 'pointer' }}>Start Analysis</button>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 14px 6px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000'
            }}>
              <Plus size={12} strokeWidth={3} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Menu
            </span>
          </button>

          {/* Tags Pill */}
          <div 
            className="tags-pill"
            style={{
              backgroundColor: '#F4F4F6',
              borderRadius: '9999px',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#444444'
            }}
          >
            <span>Ethical AI</span>
            <span>Bias Auditor</span>
          </div>
        </div>

        {/* Right Side Navbar — Platform Engine Reference (Plain Text Only, Non-Clickable) */}
        <div style={{ pointerEvents: 'auto' }} className="adaptive-systems-btn">
          <div 
            style={{
              backgroundColor: '#F4F4F6',
              borderRadius: '9999px',
              padding: '4px 14px 4px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#444444',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#555555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* 4-dot Grid Icon */}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect width="3.5" height="3.5" rx="0.8" fill="white" />
                <rect x="5.5" width="3.5" height="3.5" rx="0.8" fill="white" />
                <rect y="5.5" width="3.5" height="3.5" rx="0.8" fill="white" />
                <rect x="5.5" y="5.5" width="3.5" height="3.5" rx="0.8" fill="white" />
              </svg>
            </div>
            <span>Fair Talent Engine</span>
          </div>
        </div>
      </motion.nav>

      {/* 2. Full-Screen Background Video */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: easeCurve }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa'
        }}
      >
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          className="hero-video"
        />
      </motion.div>

      {/* Spacer for top flex alignment */}
      <div style={{ height: '80px' }} />

      {/* 3. Footer Content (Bottom, over gradient fade-up) */}
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: easeCurve }}
        style={{
          position: 'relative',
          zIndex: 30,
          background: 'linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.85) 60%, transparent 100%)',
          padding: '40px 32px 32px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%'
        }}
        className="footer-content"
      >
        {/* Left Block */}
        <div style={{ maxWidth: '780px' }}>
          {/* Subtitle */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: easeCurve }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000' }} />
            <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>
              AI-Powered Job-Fit & Resume Improvement Assistant
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: easeCurve }}
            style={{
              fontWeight: 300,
              fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: '#000000',
              marginBottom: '24px'
            }}
          >
            Job-Specific Evidence / Analysis.<br />
            Zero Ranking.
          </motion.h1>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0, ease: easeCurve }}
            style={{ display: 'flex', gap: '14px' }}
          >
            <button
              onClick={onOpenDashboard}
              className="btn-black"
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Start Job Analysis</span>
              <span>→</span>
            </button>
            {onExploreJobs && (
              <button
                onClick={onExploreJobs}
                className="btn-outline"
                style={{
                  backgroundColor: 'transparent',
                  color: '#000000',
                  border: '1px solid #d1d5db',
                  borderRadius: '9999px',
                  padding: '14px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Explore Jobs
              </button>
            )}
          </motion.div>
        </div>

        {/* Right Block — Tag Pills & Footer Links */}
        <div 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}
          className="right-tag-pills"
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="tag-pill">Ethical AI</span>
            <span className="tag-pill">No Ranking</span>
            <span className="tag-pill">Evidence Based</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#666' }}>
            {onOpenPrivacy && (
              <button onClick={onOpenPrivacy} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#555', cursor: 'pointer', textDecoration: 'underline' }}>
                Privacy Policy
              </button>
            )}
            {onOpenTerms && (
              <button onClick={onOpenTerms} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#555', cursor: 'pointer', textDecoration: 'underline' }}>
                Terms of Service
              </button>
            )}
          </div>
        </div>
      </motion.footer>

      {/* Menu Overlay Drawer */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(8px)'
        }}>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: easeCurve }}
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#ffffff',
              height: '100%',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <span style={{ fontWeight: 600, fontSize: '18px' }}>FairMatch Menu</span>
                <button 
                  onClick={() => setMenuOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 300 }}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <button
                  onClick={() => { setMenuOpen(false); onOpenDashboard(); }}
                  style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '20px', fontWeight: 400, cursor: 'pointer', borderBottom: '1px solid #eee', paddingBottom: '12px' }}
                >
                  Start Job Analysis →
                </button>
                {onExploreJobs && (
                  <button
                    onClick={() => { setMenuOpen(false); onExploreJobs(); }}
                    style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '20px', fontWeight: 400, cursor: 'pointer', borderBottom: '1px solid #eee', paddingBottom: '12px' }}
                  >
                    Explore Jobs →
                  </button>
                )}
                <button
                  onClick={() => { setMenuOpen(false); onOpenAbout(); }}
                  style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '20px', fontWeight: 400, cursor: 'pointer', borderBottom: '1px solid #eee', paddingBottom: '12px' }}
                >
                  Platform Architecture →
                </button>
                {onOpenPrivacy && (
                  <button
                    onClick={() => { setMenuOpen(false); onOpenPrivacy(); }}
                    style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '18px', fontWeight: 400, cursor: 'pointer', borderBottom: '1px solid #eee', paddingBottom: '12px' }}
                  >
                    Privacy Policy →
                  </button>
                )}
                {onOpenTerms && (
                  <button
                    onClick={() => { setMenuOpen(false); onOpenTerms(); }}
                    style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '18px', fontWeight: 400, cursor: 'pointer', borderBottom: '1px solid #eee', paddingBottom: '12px' }}
                  >
                    Terms of Service →
                  </button>
                )}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#888' }}>
              FairMatch AI © {new Date().getFullYear()}. Job-Specific Evidence Analysis.
            </div>
          </motion.div>
        </div>
      )}

      {/* Embedded CSS for responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .logo-text, .tags-pill, .adaptive-systems-btn, .nav-links, .right-tag-pills {
            display: none !important;
          }
          .navbar-container {
            padding: 16px !important;
          }
          .hero-video {
            width: 80% !important;
            height: 80% !important;
          }
          .footer-content {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 24px 20px 24px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

