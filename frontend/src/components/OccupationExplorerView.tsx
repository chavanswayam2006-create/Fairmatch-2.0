import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ChevronRight, FileSearch, Globe2, Search, Sparkles } from 'lucide-react';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

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

  if (detail) return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="grain-overlay" />
      <div className="hero-photo-bg" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6 space-y-6">
        <header className="flex items-center justify-between border-b border-zinc-850 pb-5">
          <button onClick={() => setDetail(null)} className="btn-vesper btn-vesper-ghost h-9 px-3 text-xs">
            <ArrowLeft size={14} className="mr-1.5" />
            <span>Back to Explorer</span>
          </button>
          <button onClick={analyze} className="btn-vesper btn-vesper-solid h-9 px-4 text-xs font-semibold">
            <Sparkles size={14} className="mr-1.5" />
            <span>Analyze with FairMatch</span>
          </button>
        </header>

        <main className="fm-glass-card p-8 space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-zinc-850 text-zinc-300 text-xs font-medium border border-zinc-750">
            Global Classification Framework · {detail.source_document} ({detail.source_version})
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{detail.title}</h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">ISCO-08 Unit Group {detail.code}</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Classification Path</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-200">
              {Object.values(detail.hierarchy).map((group, i) => (
                <React.Fragment key={group.code}>
                  <span className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700">{group.code} · {group.title}</span>
                  {i < 3 && <ChevronRight size={13} className="text-zinc-500" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Description</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">{detail.definition || 'No definition available.'}</p>
          </div>

          {detail.main_tasks.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Main Tasks & Duties</h2>
              <div className="space-y-1.5 text-sm text-zinc-300">
                {detail.main_tasks.map((task, i) => (
                  <p key={i} className="pl-4 border-l-2 border-zinc-700">{task}</p>
                ))}
              </div>
            </div>
          )}

          {detail.included_occupations.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Included Occupations / Examples</h2>
              <div className="flex flex-wrap gap-2">
                {detail.included_occupations.map(title => (
                  <span key={title} className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                    {title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );

  const visible = query.trim() ? searchResults : items;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="grain-overlay" />
      <div className="hero-photo-bg" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6 space-y-6">
        <header className="flex items-center justify-between border-b border-zinc-850 pb-5">
          <button onClick={onBack} className="btn-vesper btn-vesper-ghost h-9 px-3 text-xs">
            <ArrowLeft size={14} className="mr-1.5" />
            <span>Home</span>
          </button>
          <div className="flex items-center gap-2 font-semibold text-base">
            <Globe2 size={18} className="text-white" />
            <span>Global Job Taxonomy Explorer</span>
          </div>
        </header>

        <main className="space-y-6">
          <div className="fm-glass-card p-6 space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Explore O*NET & ISCO-08 Standards</h1>
              <p className="text-xs text-zinc-400 mt-1">Search 1,000+ normalized global job classifications to map skill requirements for FairMatch matching.</p>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search job roles (e.g. Software Engineer, Data Analyst, Product Manager)..."
                className="w-full fm-input pl-10"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Breadcrumbs */}
          {!query.trim() && trail.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button onClick={() => { setTrail([]); setLevel(1); setParentCode(null); }} className="text-zinc-400 hover:text-white">
                All Major Groups
              </button>
              {trail.map((group, idx) => (
                <React.Fragment key={group.code}>
                  <ChevronRight size={12} className="text-zinc-600" />
                  <button onClick={() => selectCrumb(idx)} className="text-zinc-200 hover:text-white font-medium">
                    {group.title}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map((item) => (
              <div
                key={item.code}
                onClick={() => openGroup(item)}
                className="fm-glass-card p-5 cursor-pointer hover:border-zinc-500 transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-mono">Code {item.code}</span>
                    <span>{levelNames[item.level - 1]}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mt-1">{item.title}</h3>
                  {item.definition && (
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5">{item.definition}</p>
                  )}
                </div>
                <div className="flex items-center justify-end text-xs font-semibold text-white pt-2">
                  <span>Explore Profile</span>
                  <ChevronRight size={14} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
