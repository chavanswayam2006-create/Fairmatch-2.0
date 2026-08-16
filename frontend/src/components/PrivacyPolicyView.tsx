import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
  onOpenDashboard: () => void;
  onOpenTerms: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack, onOpenDashboard, onOpenTerms }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#09090b',
      fontFamily: "'Inter', sans-serif",
      paddingBottom: '60px'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e4e4e7',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            className="btn-outline"
            style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '9999px', border: '1px solid #e4e4e7', background: '#ffffff', cursor: 'pointer' }}
            aria-label="Go back"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em' }}>Privacy Policy</span>
        </div>
        <button onClick={onOpenDashboard} className="btn-black" style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}>
          Open Dashboard →
        </button>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }} role="main" aria-label="Privacy Policy">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f4f4f6', padding: '6px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '20px' }}>
          <ShieldCheck size={16} color="#16a34a" />
          <span>Your Data, Your Control</span>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '36px' }}>Last updated: August 2026</p>

        <article style={{ fontSize: '15px', lineHeight: 1.8, color: '#334155' }}>
          <Section title="1. Overview">
            FairMatch AI is a job-specific resume analysis platform. This Privacy Policy describes how we collect, use, and protect information when you use our services.
          </Section>

          <Section title="2. Information We Process">
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li><strong>Job Descriptions:</strong> Text you provide describing target job positions and their requirements.</li>
              <li><strong>Resume Content:</strong> Resume text or files you upload for evidence-based job-fit analysis.</li>
              <li><strong>Usage Data:</strong> Anonymized interaction events such as button clicks and page views (no personal identifying information is collected).</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li>To analyze your resume against job description requirements and generate evidence-based insights.</li>
              <li>To provide transparent improvement recommendations.</li>
              <li>To improve platform functionality through anonymized usage analytics.</li>
            </ul>
            <p style={{ marginTop: '8px' }}>
              We do <strong>not</strong> rank candidates against each other or assign competitive numerical scores.
            </p>
          </Section>

          <Section title="4. Data Retention">
            Resume and job description data submitted through the platform is processed in real-time for analysis. Data stored in the application database is retained only for the purpose of allowing users to revisit their analysis results. You may request deletion of your data at any time.
          </Section>

          <Section title="5. AI Processing Disclosure">
            FairMatch AI uses algorithmic skill taxonomy matching and evidence classification to analyze resumes. The AI does not make hiring decisions. All analysis results are advisory and intended to help users improve their resumes. The system explicitly avoids penalizing candidates based on name formatting, university prestige, diacritics, age, gender, or any protected characteristics.
          </Section>

          <Section title="6. Cookies & Tracking">
            This platform uses minimal local storage to remember your cookie consent preference. We do not use third-party advertising cookies. Analytics events are anonymized and do not contain personally identifiable information.
          </Section>

          <Section title="7. Third-Party Services">
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li><strong>Google Fonts:</strong> Used to load the Inter typeface for UI rendering.</li>
            </ul>
            We do not sell, share, or transfer your resume or job description data to any third party.
          </Section>

          <Section title="8. Your Rights">
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li>Request access to data we have processed on your behalf.</li>
              <li>Request deletion of your analysis history.</li>
              <li>Withdraw cookie consent at any time by clearing your browser's local storage.</li>
            </ul>
          </Section>

          <Section title="9. Contact">
            <p>
              For privacy-related inquiries, please contact the platform operator at the contact details provided on the website. If a contact email is not yet displayed, one will be added by the website owner.
            </p>
          </Section>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e4e4e7', fontSize: '13px', color: '#888' }}>
            <button
              onClick={onOpenTerms}
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: 500, padding: 0 }}
            >
              View Terms of Service →
            </button>
          </div>
        </article>
      </main>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginBottom: '28px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#09090b', marginBottom: '8px' }}>{title}</h2>
    <div>{children}</div>
  </section>
);
