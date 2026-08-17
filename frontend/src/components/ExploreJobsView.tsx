import React, { useState, useEffect, useCallback } from 'react';
import { Search, Briefcase, MapPin, GraduationCap, ChevronRight, ArrowLeft, Globe, Filter, X, Layers, Clock, CheckCircle2, Star, Sparkles, AlertCircle, ChevronDown } from 'lucide-react';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

interface JobItem {
  id: string;
  slug: string;
  title: string;
  normalized_title: string;
  industry: string;
  seniority: string;
  location: string;
  country: string;
  employment_type: string;
  description: string;
  responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  tools: string[];
  education: string;
  experience_years: number;
  is_generic_profile: boolean;
  source: string;
}

interface ExploreJobsViewProps {
  onBack: () => void;
  onAnalyzeJob: (jobData: JobItem) => void;
}

export const ExploreJobsView: React.FC<ExploreJobsViewProps> = ({ onBack, onAnalyzeJob }) => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSeniority, setSelectedSeniority] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [seniorityLevels, setSeniorityLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 20;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('query', searchQuery.trim());
      if (selectedIndustry) params.set('industry', selectedIndustry);
      if (selectedSeniority) params.set('seniority', selectedSeniority);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`${API_BASE}/api/v1/job-library?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load jobs');
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      if (data.industries) setIndustries(data.industries);
      if (data.seniority_levels) setSeniorityLevels(data.seniority_levels);
    } catch (err: any) {
      setError(err.message || 'Could not load job library. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedIndustry, selectedSeniority, page]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchJobs]);

  const totalPages = Math.ceil(total / limit);

  // Job Details View
  if (selectedJob) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e4e4e7', padding: '14px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <button onClick={() => setSelectedJob(null)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
            borderRadius: '9999px', border: '1px solid #e4e4e7', background: '#fff',
            cursor: 'pointer', fontSize: '13px', fontWeight: 500
          }}>
            <ArrowLeft size={14} /> Back to Jobs
          </button>
          <button onClick={() => onAnalyzeJob(selectedJob)} style={{
            backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '9999px',
            padding: '10px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Sparkles size={15} /> Analyze My Resume Against This Job →
          </button>
        </header>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>
          {/* Generic Profile Badge */}
          {selectedJob.is_generic_profile && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a',
              padding: '4px 14px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
              marginBottom: '16px'
            }}>
              <AlertCircle size={13} />
              General occupational profile — not a specific employer vacancy
            </div>
          )}

          <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#09090b', marginBottom: '8px' }}>
            {selectedJob.title}
          </h1>

          {/* Meta Tags Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            <span style={tagStyle('#eff6ff', '#1e40af', '#bfdbfe')}><Briefcase size={12} /> {selectedJob.industry}</span>
            <span style={tagStyle('#f3e8ff', '#6b21a8', '#e9d5ff')}><Layers size={12} /> {selectedJob.seniority}</span>
            <span style={tagStyle('#f0fdf4', '#166534', '#bbf7d0')}><MapPin size={12} /> {selectedJob.location}</span>
            <span style={tagStyle('#fafafa', '#333', '#e4e4e7')}><Clock size={12} /> {selectedJob.experience_years}+ years</span>
            <span style={tagStyle('#fafafa', '#333', '#e4e4e7')}><GraduationCap size={12} /> {selectedJob.education}</span>
          </div>

          {/* Overview */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={sectionHeadingStyle}>Overview</h2>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#334155' }}>{selectedJob.description}</p>
          </section>

          {/* Responsibilities */}
          {selectedJob.responsibilities.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={sectionHeadingStyle}>Key Responsibilities</h2>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: 1.8, color: '#334155' }}>
                {selectedJob.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </section>
          )}

          {/* Skills Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {selectedJob.required_skills.length > 0 && (
              <div style={skillBoxStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#16a34a" /> Required Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedJob.required_skills.map((s, i) => (
                    <span key={i} style={skillPillStyle('#dcfce7', '#166534')}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedJob.preferred_skills.length > 0 && (
              <div style={skillBoxStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={15} color="#eab308" /> Preferred Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedJob.preferred_skills.map((s, i) => (
                    <span key={i} style={skillPillStyle('#fef9c3', '#854d0e')}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tools */}
          {selectedJob.tools.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={sectionHeadingStyle}>Tools & Technologies</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedJob.tools.map((t, i) => (
                  <span key={i} style={skillPillStyle('#f4f4f6', '#333')}>{t}</span>
                ))}
              </div>
            </section>
          )}

          {/* Big CTA */}
          <div style={{
            backgroundColor: '#09090b', borderRadius: '16px', padding: '28px',
            textAlign: 'center', marginTop: '40px'
          }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
              Ready to analyze your resume for this role?
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '18px' }}>
              Upload your resume and receive job-specific strengths, gaps, and actionable recommendations.
            </p>
            <button onClick={() => onAnalyzeJob(selectedJob)} style={{
              backgroundColor: '#ffffff', color: '#09090b', border: 'none', borderRadius: '9999px',
              padding: '12px 30px', fontSize: '15px', fontWeight: 600, cursor: 'pointer'
            }}>
              Analyze My Resume Against This Job →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Job Library List View
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e4e4e7', padding: '14px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
            borderRadius: '9999px', border: '1px solid #e4e4e7', background: '#fff',
            cursor: 'pointer', fontSize: '13px', fontWeight: 500
          }}>
            <ArrowLeft size={14} /> Home
          </button>
          <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em' }}>
            <Globe size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
            Explore Jobs
          </span>
        </div>
        <span style={{ fontSize: '12px', color: '#666' }}>{total} jobs available</span>
      </header>

      {/* Hero Search Section */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 24px' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 300, letterSpacing: '-0.02em', color: '#09090b', marginBottom: '8px' }}>
          Find the right role for <strong style={{ fontWeight: 600 }}>your career</strong>
        </h1>
        <p style={{ fontSize: '15px', color: '#555', marginBottom: '24px' }}>
          Browse {total}+ global occupation profiles across industries. Select a role and analyze your resume against its specific requirements.
        </p>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by job title, skill, or industry (e.g. data analyst, python, marketing)..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            style={{
              width: '100%', padding: '14px 16px 14px 44px', borderRadius: '14px',
              border: '1px solid #e4e4e7', fontSize: '15px', backgroundColor: '#fafafa',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filter Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowFilters(!showFilters)} style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px',
            borderRadius: '9999px', border: '1px solid #e4e4e7', background: showFilters ? '#09090b' : '#fff',
            color: showFilters ? '#fff' : '#333', cursor: 'pointer', fontSize: '12px', fontWeight: 600
          }}>
            <Filter size={13} /> Filters <ChevronDown size={12} />
          </button>

          {/* Active Filter Chips */}
          {selectedIndustry && (
            <span style={{ ...activeFilterChip }}>{selectedIndustry} <X size={12} onClick={() => { setSelectedIndustry(''); setPage(1); }} style={{ cursor: 'pointer' }} /></span>
          )}
          {selectedSeniority && (
            <span style={{ ...activeFilterChip }}>{selectedSeniority} <X size={12} onClick={() => { setSelectedSeniority(''); setPage(1); }} style={{ cursor: 'pointer' }} /></span>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div style={{
            marginTop: '14px', padding: '18px', backgroundColor: '#fafafa',
            borderRadius: '14px', border: '1px solid #e4e4e7',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px'
          }}>
            <div>
              <label style={filterLabelStyle}>Industry</label>
              <select value={selectedIndustry} onChange={e => { setSelectedIndustry(e.target.value); setPage(1); }} style={selectStyle}>
                <option value="">All Industries</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div>
              <label style={filterLabelStyle}>Seniority Level</label>
              <select value={selectedSeniority} onChange={e => { setSelectedSeniority(e.target.value); setPage(1); }} style={selectStyle}>
                <option value="">All Levels</option>
                {seniorityLevels.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Results */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 60px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '14px' }}>
            Loading job profiles...
          </div>
        )}

        {error && (
          <div style={{
            textAlign: 'center', padding: '40px', color: '#991b1b',
            backgroundColor: '#fee2e2', borderRadius: '14px', border: '1px solid #fca5a5', fontSize: '14px'
          }}>
            {error}
            <br />
            <button onClick={fetchJobs} style={{
              marginTop: '12px', padding: '8px 20px', borderRadius: '9999px',
              border: '1px solid #fca5a5', background: '#fff', cursor: 'pointer', fontSize: '13px'
            }}>Retry</button>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: '#666'
          }}>
            <Search size={40} color="#ccc" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>No matching jobs found</h3>
            <p style={{ fontSize: '14px' }}>Try another search term or adjust your filters. You can also paste your own job description in the dashboard.</p>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {jobs.map(job => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  style={{
                    backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '16px',
                    padding: '20px', cursor: 'pointer', transition: 'all 0.15s ease',
                    display: 'flex', flexDirection: 'column', gap: '10px'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#000'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e4e4e7'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#09090b', lineHeight: 1.3, flex: 1 }}>{job.title}</h3>
                    <ChevronRight size={16} color="#999" style={{ flexShrink: 0, marginTop: '2px' }} />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    <span style={cardTagStyle}>{job.industry}</span>
                    <span style={cardTagStyle}>{job.seniority}</span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {job.required_skills.slice(0, 4).map((s, i) => (
                      <span key={i} style={{ fontSize: '10px', backgroundColor: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '9999px', fontWeight: 500 }}>{s}</span>
                    ))}
                    {job.required_skills.length > 4 && (
                      <span style={{ fontSize: '10px', color: '#999' }}>+{job.required_skills.length - 4} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ ...paginationBtnStyle, opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
                <span style={{ padding: '8px 14px', fontSize: '13px', color: '#666' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ ...paginationBtnStyle, opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

// Inline style helpers
const tagStyle = (bg: string, color: string, border: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  backgroundColor: bg, color: color, border: `1px solid ${border}`,
  padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600
});

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '16px', fontWeight: 600, color: '#09090b', marginBottom: '10px',
  paddingBottom: '6px', borderBottom: '1px solid #f4f4f6'
};

const skillBoxStyle: React.CSSProperties = {
  backgroundColor: '#fafafa', border: '1px solid #e4e4e7', borderRadius: '14px', padding: '18px'
};

const skillPillStyle = (bg: string, color: string): React.CSSProperties => ({
  backgroundColor: bg, color: color, padding: '3px 10px', borderRadius: '9999px',
  fontSize: '11px', fontWeight: 600
});

const cardTagStyle: React.CSSProperties = {
  fontSize: '10px', backgroundColor: '#f4f4f6', color: '#555', padding: '2px 8px',
  borderRadius: '9999px', fontWeight: 600
};

const activeFilterChip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  backgroundColor: '#09090b', color: '#fff', padding: '4px 12px',
  borderRadius: '9999px', fontSize: '11px', fontWeight: 600
};

const filterLabelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px'
};

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '10px',
  border: '1px solid #e4e4e7', fontSize: '13px', backgroundColor: '#fff'
};

const paginationBtnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '9999px', border: '1px solid #e4e4e7',
  background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500
};
