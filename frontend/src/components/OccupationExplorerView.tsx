import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ChevronRight, FileSearch, Globe2, Search, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

type Group = { code: string; title: string; level: number; parent_code?: string; definition: string; source_page?: number };
type Detail = Group & {
  hierarchy: Record<string, { code: string; title: string }>;
  main_tasks: string[];
  included_occupations: string[];
  source_document: string;
  source_version: string;
};

interface Props {
  onBack: () => void;
  onAnalyzeOccupation: (occupation: unknown) => void;
}

const levelNames = ['Major groups', 'Sub-major groups', 'Minor groups', 'Unit groups'];

export function OccupationExplorerView({ onBack, onAnalyzeOccupation }: Props) {
  const [level, setLevel] = useState(1);
  const [parentCode, setParentCode] = useState<string | null>(null);
  const [trail, setTrail] = useState<Group[]>([]);
  const [items, setItems] = useState<Group[]>([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.trim()) return;
    setLoading(true); setError('');
    const params = new URLSearchParams({ level: String(level), limit: '100' });
    if (parentCode) params.set('parent_code', parentCode);
    fetch(`${API_BASE}/api/v1/occupations?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setItems(data.items || []))
      .catch(() => setError("We couldn't load occupations. Please try again."))
      .finally(() => setLoading(false));
  }, [level, parentCode, query]);

  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); return; }
    const timer = window.setTimeout(() => {
      setLoading(true); setError('');
      fetch(`${API_BASE}/api/v1/occupations/search?query=${encodeURIComponent(query)}&limit=24`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setSearchResults(data.items || []))
        .catch(() => setError("We couldn't load occupations. Please try again."))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const openGroup = (group: Group) => {
    if (group.level === 4) { openDetail(group.code); return; }
    setTrail(current => [...current, group]);
    setParentCode(group.code); setLevel(group.level + 1); setQuery('');
  };
  const openDetail = (code: string) => {
    setLoading(true); setError('');
    fetch(`${API_BASE}/api/v1/occupations/${code}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setDetail(data))
      .catch(() => setError('This occupation record is currently unavailable.'))
      .finally(() => setLoading(false));
  };
  const selectCrumb = (index: number) => {
    const selected = trail[index];
    setTrail(trail.slice(0, index));
    setLevel(selected.level + 1); setParentCode(selected.code); setDetail(null); setQuery('');
  };
  const analyze = () => detail && onAnalyzeOccupation({
    title: detail.title, normalized_title: detail.title,
    industry: detail.hierarchy.major_group?.title || 'ISCO-08',
    description: detail.definition, responsibilities: detail.main_tasks,
    required_skills: [], preferred_skills: [], tools: [], education: '', experience_years: 0,
    seniority: 'Occupational context', source: 'ILO ISCO-08 Volume I', is_generic_profile: true,
  });

  if (detail) return <main style={pageStyle}>
    <header style={headerStyle}><button style={buttonStyle} onClick={() => setDetail(null)}><ArrowLeft size={15} /> Back to explorer</button><button style={primaryStyle} onClick={analyze}><Sparkles size={15} /> Analyze my resume</button></header>
    <section style={contentStyle}>
      <div style={sourceBadge}>Global occupational classification framework · {detail.source_document} ({detail.source_version})</div>
      <h1 style={titleStyle}>{detail.title}</h1><p style={codeStyle}>ISCO-08 unit group {detail.code}{detail.source_page ? ` · PDF page ${detail.source_page}` : ''}</p>
      <section style={sectionStyle}><h2 style={headingStyle}>Classification path</h2><div style={crumbWrap}>{Object.values(detail.hierarchy).map((group, i) => <React.Fragment key={group.code}><span style={crumbStyle}>{group.code} · {group.title}</span>{i < 3 && <ChevronRight size={14} color="#71717a" />}</React.Fragment>)}</div></section>
      <section style={sectionStyle}><h2 style={headingStyle}>Description</h2><p style={bodyStyle}>{detail.definition || 'No source definition is currently available.'}</p></section>
      {detail.main_tasks.length > 0 && <section style={sectionStyle}><h2 style={headingStyle}>Main tasks and duties</h2>{detail.main_tasks.map((task, i) => <p key={i} style={bodyStyle}>{task}</p>)}</section>}
      {detail.included_occupations.length > 0 && <section style={sectionStyle}><h2 style={headingStyle}>Included occupations / examples</h2><div style={pillWrap}>{detail.included_occupations.map(title => <span style={pillStyle} key={title}>{title}</span>)}</div></section>}
      <aside style={calloutStyle}><FileSearch size={19} /><div><strong>Use this as occupational context.</strong><br />A specific employer job description remains the primary source for vacancy requirements.</div></aside>
    </section>
  </main>;

  const visible = query.trim() ? searchResults : items;
  return <main style={pageStyle}>
    <header style={headerStyle}><button style={buttonStyle} onClick={onBack}><ArrowLeft size={15} /> Home</button><span style={{ fontWeight: 700 }}><Globe2 size={16} style={{ verticalAlign: 'text-bottom' }} /> ISCO-08 Explorer</span></header>
    <section style={contentStyle}>
      <div style={sourceBadge}>ILO ISCO-08 Volume I · 10 major groups · 43 sub-major groups · 130 minor groups · 436 unit groups</div>
      <h1 style={titleStyle}>Explore occupations</h1>
      <p style={{ ...bodyStyle, marginTop: 0 }}>Browse a global occupational classification framework. It is not a live job-board database or a replacement for a specific job description.</p>
      <label style={{ position: 'relative', display: 'block', margin: '24px 0 18px' }}><Search size={18} color="#71717a" style={{ position: 'absolute', top: 14, left: 15 }} /><input aria-label="Search ISCO occupations" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by occupation, example title, task, or definition" style={inputStyle} /></label>
      {!query && trail.length > 0 && <nav aria-label="Occupation path" style={crumbWrap}>{trail.map((group, index) => <React.Fragment key={group.code}><button onClick={() => selectCrumb(index)} style={crumbButton}>{group.code} · {group.title}</button><ChevronRight size={14} color="#71717a" /></React.Fragment>)}</nav>}
      <h2 style={headingStyle}>{query ? 'Search results' : levelNames[level - 1]}</h2>
      {error && <div role="alert" style={errorStyle}><AlertCircle size={17} /> {error}</div>}
      {loading && <p style={{ color: '#52525b' }}>Loading occupations…</p>}
      {!loading && !error && visible.length === 0 && <div style={emptyStyle}><Search size={30} /><strong>No matching occupations were found.</strong><span>Try another title or browse the classification hierarchy.</span></div>}
      <div style={gridStyle}>{visible.map(group => <button key={group.code} onClick={() => openGroup(group)} style={cardStyle}><span style={cardCode}>{group.code}</span><h3 style={{ margin: '8px 0', fontSize: 16 }}>{group.title}</h3><p style={cardText}>{group.definition}</p><span style={{ fontSize: 13, fontWeight: 600 }}>View {group.level === 4 ? 'details' : 'groups'} <ChevronRight size={14} style={{ verticalAlign: 'text-bottom' }} /></span></button>)}</div>
    </section>
  </main>;
}

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: '#fff', color: '#18181b', fontFamily: 'Inter, sans-serif' };
const headerStyle: React.CSSProperties = { position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px clamp(16px, 4vw, 36px)', borderBottom: '1px solid #e4e4e7', background: 'rgba(255,255,255,.96)' };
const contentStyle: React.CSSProperties = { maxWidth: 960, margin: '0 auto', padding: '42px clamp(16px, 4vw, 28px) 76px' };
const buttonStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #d4d4d8', borderRadius: 999, padding: '8px 13px', cursor: 'pointer', fontWeight: 600 };
const primaryStyle: React.CSSProperties = { ...buttonStyle, background: '#18181b', borderColor: '#18181b', color: '#fff' };
const sourceBadge: React.CSSProperties = { display: 'inline-block', padding: '5px 10px', background: '#f4f4f5', borderRadius: 99, fontSize: 12, color: '#52525b', fontWeight: 600 };
const titleStyle: React.CSSProperties = { fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.1, letterSpacing: '-.04em', margin: '16px 0 10px' };
const codeStyle: React.CSSProperties = { color: '#52525b', fontWeight: 600, margin: 0 };
const headingStyle: React.CSSProperties = { fontSize: 18, margin: '0 0 12px', letterSpacing: '-.02em' };
const sectionStyle: React.CSSProperties = { borderTop: '1px solid #e4e4e7', marginTop: 30, paddingTop: 24 };
const bodyStyle: React.CSSProperties = { fontSize: 15, lineHeight: 1.7, color: '#3f3f46', whiteSpace: 'pre-line' };
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '13px 16px 13px 45px', border: '1px solid #d4d4d8', borderRadius: 12, fontSize: 15, outline: 'none' };
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 };
const cardStyle: React.CSSProperties = { textAlign: 'left', padding: 18, border: '1px solid #e4e4e7', borderRadius: 14, background: '#fff', cursor: 'pointer', color: '#18181b' };
const cardCode: React.CSSProperties = { fontSize: 12, fontWeight: 800, color: '#52525b' };
const cardText: React.CSSProperties = { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 13, lineHeight: 1.5, color: '#52525b', minHeight: 58 };
const crumbWrap: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 7, margin: '18px 0 24px' };
const crumbStyle: React.CSSProperties = { background: '#f4f4f5', padding: '5px 8px', borderRadius: 6, fontSize: 12, color: '#3f3f46' };
const crumbButton: React.CSSProperties = { ...crumbStyle, border: 0, cursor: 'pointer' };
const pillWrap: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 8 };
const pillStyle: React.CSSProperties = { padding: '5px 9px', border: '1px solid #d4d4d8', borderRadius: 999, fontSize: 13, color: '#3f3f46' };
const calloutStyle: React.CSSProperties = { marginTop: 32, padding: 18, display: 'flex', gap: 12, background: '#eff6ff', color: '#1e3a8a', borderRadius: 12, lineHeight: 1.5, fontSize: 14 };
const errorStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, padding: 14, marginBottom: 16, borderRadius: 10, background: '#fef2f2', color: '#991b1b' };
const emptyStyle: React.CSSProperties = { display: 'grid', justifyItems: 'center', gap: 10, padding: 56, color: '#52525b', border: '1px dashed #d4d4d8', borderRadius: 14, marginBottom: 20 };
