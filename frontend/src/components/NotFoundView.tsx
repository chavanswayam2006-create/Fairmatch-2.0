import React from 'react';
import { ArrowLeft, Home, FileSearch, HelpCircle } from 'lucide-react';

interface NotFoundViewProps {
  onGoHome: () => void;
  onOpenDashboard: () => void;
  onOpenAbout: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onGoHome, onOpenDashboard, onOpenAbout }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e4e4e7',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={onGoHome}
          className="btn-outline"
          style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '9999px', border: '1px solid #e4e4e7', background: '#ffffff', cursor: 'pointer' }}
          aria-label="Return to homepage"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
        <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', userSelect: 'none' }}>
          FairMatch AI
        </span>
      </header>

      {/* Main 404 Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center'
      }}
        role="main"
        aria-label="Page not found"
      >
        <div style={{
          fontSize: 'clamp(5rem, 12vw, 9rem)',
          fontWeight: 200,
          color: '#e4e4e7',
          lineHeight: 1,
          marginBottom: '16px',
          letterSpacing: '-0.04em'
        }}>
          404
        </div>

        <h1 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 600,
          color: '#09090b',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          Page Not Found
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#666666',
          maxWidth: '480px',
          lineHeight: 1.6,
          marginBottom: '36px'
        }}>
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back on track.
        </p>

        {/* Primary CTA */}
        <button
          onClick={onGoHome}
          className="btn-black"
          style={{
            padding: '14px 28px',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '24px'
          }}
          aria-label="Go to FairMatch AI homepage"
        >
          <Home size={16} />
          <span>Back to Homepage</span>
        </button>

        {/* Secondary Navigation */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={onOpenDashboard}
            className="btn-outline"
            style={{ padding: '10px 20px', fontSize: '13px' }}
            aria-label="Open the resume analysis dashboard"
          >
            <FileSearch size={14} />
            <span>Start Job Analysis</span>
          </button>
          <button
            onClick={onOpenAbout}
            className="btn-outline"
            style={{ padding: '10px 20px', fontSize: '13px' }}
            aria-label="Learn about the FairMatch AI platform"
          >
            <HelpCircle size={14} />
            <span>Platform Details</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e4e4e7',
        padding: '16px 32px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#888'
      }}>
        FairMatch AI © {new Date().getFullYear()}. Job-Specific Evidence Analysis.
      </footer>
    </div>
  );
};
