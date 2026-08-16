import React from 'react';
import { ArrowLeft, ShieldCheck, Target, Cpu, Users, Award, FileSearch, CheckCircle2, Sparkles } from 'lucide-react';

interface PlatformDetailsViewProps {
  onBack: () => void;
  onOpenDashboard: () => void;
}

export const PlatformDetailsView: React.FC<PlatformDetailsViewProps> = ({ onBack, onOpenDashboard }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#09090b',
      fontFamily: "'Inter', sans-serif",
      paddingBottom: '80px'
    }}>
      {/* Sticky Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
          >
            <ArrowLeft size={14} /> Back
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="8" width="16" height="8" rx="4" transform="rotate(-35 6 8)" fill="#000000" />
              <rect x="12" y="14" width="16" height="8" rx="4" transform="rotate(-35 12 14)" fill="#000000" />
            </svg>
            {/* Platform Engine Reference - Plain Text Only */}
            <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', color: '#000000' }}>
              FairMatch Analysis Platform
            </span>
          </div>
        </div>

        <button onClick={onOpenDashboard} className="btn-black" style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '9999px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          Open Dashboard →
        </button>
      </header>

      {/* Hero Header */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px 40px 24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#f4f4f6',
          padding: '6px 16px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#333333',
          marginBottom: '20px'
        }}>
          <ShieldCheck size={16} color="#16a34a" />
          <span>Job-Specific Evidence Analysis (No Ranking or Numerical Scores)</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
          fontWeight: 300,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: '24px',
          color: '#000000'
        }}>
          Comprehensive Platform & <br />
          Job Evidence Analysis System
        </h1>

        <p style={{
          fontSize: '18px',
          lineHeight: 1.6,
          color: '#555555',
          maxWidth: '820px'
        }}>
          FairMatch is a supportive, job-specific AI career assistant. It analyzes candidate resumes against specific job description requirements to highlight demonstrated strengths, identify missing evidence, and deliver actionable recommendations—without candidate rankings or arbitrary scores.
        </p>
      </section>

      {/* Grid of Platform Details */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* 1. Platform Overview */}
        <div style={{
          backgroundColor: '#fcfcfd',
          border: '1px solid #e4e4e7',
          borderRadius: '20px',
          padding: '36px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Cpu size={22} color="#000000" />
            <h2 style={{ fontSize: '22px', fontWeight: 600 }}>1. Platform Overview</h2>
          </div>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#444444' }}>
            Traditional platforms treat resume screening as a competitive leaderboard or arbitrary score generator. FairMatch eliminates competitive ranking entirely. Instead, it parses both job descriptions and resumes to classify evidence strength across required skills, qualifications, and project outcomes.
          </p>
        </div>

        {/* 2. Purpose & Principles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '18px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Target size={20} color="#16a34a" />
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Core Principles</h3>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#555555' }}>
              <strong>“Your resume is being analyzed against the requirements of your selected job, not ranked against other candidates.”</strong> The evaluation is constructive, job-specific, and supportive.
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '18px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Sparkles size={20} color="#2563eb" />
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Zero Demographic Bias</h3>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#555555' }}>
              Candidate names, university prestige tiers, formatting diacritics, age, gender, and protected characteristics have <strong>zero influence</strong> on evidence analysis.
            </p>
          </div>
        </div>

        {/* 3. Key Features & Global Taxonomies */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '20px', padding: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>3. Key Features & Global Occupational Taxonomies</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <FeatureCard
              title="ISCO-08 & ESCO Taxonomy Integration"
              desc="Built upon ISCO-08 international classification and ESCO skills taxonomy covering occupations, unit groups, and multilingual terminology worldwide."
            />
            <FeatureCard
              title="RAG Retrieval Architecture"
              desc="Uses Retrieval-Augmented Generation to search occupational definitions, skill concepts, and benchmark databases before generating analysis."
            />
            <FeatureCard
              title="Demonstrated vs. Mentioned Evidence"
              desc="Distinguishes skills listed in isolation from skills demonstrated in work/projects, and identifies quantified metric impact."
            />
            <FeatureCard
              title="Dual-Dimension Evaluation"
              desc="Separates Resume Quality (clarity, structure, formatting) from Job Alignment (requirement coverage, domain fit) for complete transparency."
            />
            <FeatureCard
              title="Zero False-Positive Skill Invention"
              desc="Never invents skills or assumes candidate competence without explicit resume evidence."
            />
            <FeatureCard
              title="Prioritized 4-Part Recommendations"
              desc="Provides transparent guidance answering: What was found?, Why it matters?, Where is evidence?, and What to improve (with truthfulness guidance)."
            />
          </div>
        </div>

        {/* 4. How the Analysis Engine Works */}
        <div style={{ backgroundColor: '#fcfcfd', border: '1px solid #e4e4e7', borderRadius: '20px', padding: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>4. How the Universal Analysis Pipeline Works</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <StepBox step="1" title="Parse & Classify Job" text="Extract required skills, tools, and detect ISCO-08 group, ESCO taxonomy, and seniority level." />
            <StepBox step="2" title="Parse Resume Sections" text="Extract demonstrated skills, work history, project details, degrees, and metric outcomes." />
            <StepBox step="3" title="RAG Semantic Retrieval" text="Search knowledge graph and taxonomies for semantic equivalents (e.g. REST API -> FastAPI, Django)." />
            <StepBox step="4" title="Requirement Evidence Matrix" text="Classify evidence level (Strong, Moderate, Limited, No Evidence) and source location." />
            <StepBox step="5" title="Synthesize Report" text="Generate dual-dimension metrics, strengths, missing items, and prioritized 4-part improvement steps." />
          </div>
        </div>

        {/* 5. Target Users & Benefits */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '20px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Users size={22} color="#000000" />
              <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Target Users</h3>
            </div>
            <ul style={{ fontSize: '14px', lineHeight: 1.7, color: '#444444', paddingLeft: '20px' }}>
              <li><strong>Job Candidates:</strong> Receive clear, constructive guidance on optimizing their resume for target positions.</li>
              <li><strong>Career Coaches & Advisors:</strong> Help clients identify genuine skill gaps and evidence clarity.</li>
              <li><strong>Hiring Managers & Recruiters:</strong> Objective requirement-by-requirement evidence validation.</li>
            </ul>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '20px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Award size={22} color="#16a34a" />
              <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Key User Benefits</h3>
            </div>
            <ul style={{ fontSize: '14px', lineHeight: 1.7, color: '#444444', paddingLeft: '20px' }}>
              <li><strong>Supportive Experience:</strong> Replaces stressful ranking leaderboards with constructive feedback.</li>
              <li><strong>100% Transparent:</strong> Every recommendation explains what was found and why it matters.</li>
              <li><strong>Job-Personalized:</strong> Different insights produced for different target job roles.</li>
            </ul>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div style={{
          backgroundColor: '#000000',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h2 style={{ fontSize: '26px', fontWeight: 400, letterSpacing: '-0.02em' }}>
            Ready for supportive, job-specific resume analysis?
          </h2>
          <p style={{ fontSize: '14px', color: '#a1a1aa', maxWidth: '540px' }}>
            Upload your resume and target job description to receive instant evidence matching, strengths analysis, and 4-part improvement steps.
          </p>
          <button
            onClick={onOpenDashboard}
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Start Job Analysis →
          </button>
        </div>

      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f6', borderRadius: '14px', padding: '20px' }}>
    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#000', marginBottom: '6px' }}>{title}</h4>
    <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, margin: 0 }}>{desc}</p>
  </div>
);

const StepBox: React.FC<{ step: string; title: string; text: string }> = ({ step, title, text }) => (
  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '14px', padding: '20px' }}>
    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>
      {step}
    </div>
    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '4px' }}>{title}</h4>
    <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.5, margin: 0 }}>{text}</p>
  </div>
);
