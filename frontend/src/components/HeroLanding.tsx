import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Menu, X, ShieldCheck, Cpu, Scale, FileSearch, ChevronRight, Sparkles } from 'lucide-react';

interface HeroLandingProps {
  onOpenDashboard: () => void;
  onOpenAbout: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onExploreJobs?: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onOpenDashboard,
  onOpenAbout,
  onOpenPrivacy,
  onOpenTerms,
  onExploreJobs,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="relative text-white font-sans selection:bg-white/20 selection:text-white overflow-x-hidden">
      {/* Noise + Backdrop Layers */}
      <div className="grain-overlay" />
      <div className="hero-photo-bg" />

      {/* ─────────────────────────────────────────────
          HERO SECTION — single viewport on desktop
      ───────────────────────────────────────────── */}
      <div
        className="relative z-10"
        style={{
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          minHeight: '100dvh',
        }}
      >
        {/* Mobile Backdrop */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* ── Header ── */}
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: 'var(--header-y, 22px) var(--header-x, 40px) 10px',
            position: 'relative',
            zIndex: 50,
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.84 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.05, ease, delay: 0.08 }}
            className="inline-flex items-center gap-2.5 cursor-pointer text-white font-semibold tracking-tight"
            style={{ fontSize: 'var(--logo, 15.5px)', justifySelf: 'start' }}
            onClick={onOpenAbout}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <g transform="rotate(-30 12 12)">
                <circle cx="7.3" cy="3.2" r="1.45" />
                <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
                <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
                <circle cx="16.7" cy="20.8" r="1.45" />
              </g>
            </svg>
            <span>FairMatch<span className="font-normal text-zinc-400">.ai</span></span>
          </motion.div>

          {/* Nav Pills — desktop */}
          <nav className="hidden md:flex items-center gap-2" style={{ justifySelf: 'center' }}>
            {[
              { label: 'Platform Architecture', delay: 0.16, handler: onOpenAbout },
              { label: 'Evidence Analyzer', delay: 0.28, handler: onOpenDashboard },
              { label: 'Job Taxonomy', delay: 0.40, handler: onExploreJobs || onOpenAbout },
              { label: 'Compliance', delay: 0.52, handler: onOpenAbout },
            ].map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, ...(i % 2 === 0 ? { scale: 0.84 } : { y: 14 }) }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.05, ease, delay: item.delay }}
                onClick={item.handler}
                className="nav-pill-vesper"
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Header CTA — desktop */}
          <div className="hidden md:flex" style={{ justifySelf: 'end' }}>
            <motion.button
              initial={{ opacity: 0, scale: 0.84 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.05, ease, delay: 0.34 }}
              onClick={onOpenDashboard}
              className="btn-vesper btn-vesper-solid"
            >
              Launch Engine
            </motion.button>
          </div>

          {/* Mobile: logo + burger */}
          <div className="flex md:hidden items-center gap-2 col-span-2 justify-end" style={{ gridColumn: '3' }}>
            <motion.button
              initial={{ opacity: 0, scale: 0.84 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.05, ease, delay: 0.34 }}
              onClick={onOpenDashboard}
              className="btn-vesper btn-vesper-solid text-xs h-9 px-3"
            >
              Launch
            </motion.button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="flex flex-col items-center justify-center gap-[5px] w-10 h-10 rounded-md bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 transition-colors"
            >
              <span
                className="block w-4 h-[1.5px] bg-white rounded-sm transition-transform duration-200"
                style={{ transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : undefined }}
              />
              <span
                className="block w-4 h-[1.5px] bg-white rounded-sm transition-opacity duration-150"
                style={{ opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block w-4 h-[1.5px] bg-white rounded-sm transition-transform duration-200"
                style={{ transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : undefined }}
              />
            </button>
          </div>
        </header>

        {/* Mobile Overlay Nav */}
        {menuOpen && (
          <nav className="fixed inset-0 z-45 flex flex-col items-center justify-center gap-3 pt-24 pb-8 px-6 md:hidden">
            {[
              { label: 'Platform Architecture', handler: onOpenAbout },
              { label: 'Evidence Analyzer', handler: onOpenDashboard },
              { label: 'Global Job Taxonomy', handler: onExploreJobs || onOpenAbout },
              { label: 'Compliance & Privacy', handler: onOpenAbout },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => { setMenuOpen(false); item.handler(); }}
                className="w-full max-w-xs h-14 rounded-xl border border-zinc-800 bg-zinc-900/80 text-white font-medium text-lg flex items-center justify-center hover:border-zinc-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* ── Main Hero Copy (bottom-centered) ── */}
        <main
          className="flex items-end justify-center px-6"
          style={{ paddingBottom: 'var(--hero-gap, 85px)' }}
        >
          <div
            className="flex flex-col items-center text-center w-full"
            style={{ maxWidth: 'var(--copy-max, 880px)' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.05, ease, delay: 0.22 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-md text-zinc-200 font-normal tracking-tight"
              style={{
                fontSize: 'var(--badge, 12.5px)',
                background: 'linear-gradient(90deg, #7d7d7d 0%, #2a2a2a 52%, #0a0a0a 100%)',
              }}
            >
              <svg
                width="18" height="20" viewBox="0 0 24 24" fill="white"
                className="drop-shadow-[0_0_3px_rgba(255,255,255,0.45)]"
                style={{ animation: 'in-star 0.9s cubic-bezier(0.16,1,0.3,1) 0.28s both' }}
              >
                <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
              </svg>
              <span>Job-Specific AI Matching & Fairness Auditing</span>
            </motion.div>

            {/* H1 with masked line reveals */}
            <h1
              className="flex flex-col items-center text-white font-medium"
              style={{ fontSize: 'var(--h1, 48px)', letterSpacing: '-0.045em', lineHeight: 1.12 }}
            >
              <motion.span
                initial={{ opacity: 0, y: '40%' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.05, ease, delay: 0.42 }}
                className="block overflow-hidden"
                style={{ padding: '0.06em 0.15em 0.14em' }}
              >
                Match candidates to jobs with{' '}
                <em
                  className="font-serif-italic"
                  style={{
                    fontSize: '1.08em',
                    letterSpacing: '-0.03em',
                    color: '#9a9a9a',
                    animation: 'in-em 1.2s cubic-bezier(0.16,1,0.3,1) 0.72s both',
                  }}
                >
                  transparent AI
                </em>
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: '40%' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.05, ease, delay: 0.62 }}
                className="block overflow-hidden"
                style={{ padding: '0.06em 0.15em 0.14em' }}
              >
                and verifiable fairness.
              </motion.span>
            </h1>

            {/* Lede */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.25, ease, delay: 0.82 }}
              style={{
                maxWidth: 'var(--lede-max, 520px)',
                marginTop: 18,
                color: '#9a9a9a',
                fontSize: 'var(--lede, 15.5px)',
                fontWeight: 400,
                lineHeight: 1.55,
                letterSpacing: '-0.015em',
              }}
            >
              SHAP-explainable evidence matching with counterfactual bias auditing — built for HR teams under NYC Local Law 144 and the EU AI Act. No arbitrary rankings.
            </motion.p>

            {/* CTA Row */}
            <div className="flex flex-wrap justify-center gap-2.5 mt-7">
              <motion.button
                initial={{ opacity: 0, y: 18, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.05, ease, delay: 0.96 }}
                onClick={onOpenDashboard}
                className="btn-vesper btn-vesper-solid"
                style={{ height: 'var(--hero-btn-h, 42px)', padding: '0 20px', fontSize: 14 }}
              >
                <Sparkles size={15} className="mr-2" />
                <span>Launch Evidence Analyzer</span>
              </motion.button>

              {onExploreJobs && (
                <motion.button
                  initial={{ opacity: 0, x: 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.05, ease, delay: 1.10 }}
                  onClick={onExploreJobs}
                  className="btn-vesper btn-vesper-ghost"
                  style={{ height: 'var(--hero-btn-h, 42px)', padding: '0 18px', fontSize: 14 }}
                >
                  <span>Explore Job Taxonomy</span>
                  <ArrowRight size={14} className="ml-2" />
                </motion.button>
              )}
            </div>
          </div>
        </main>

        {/* ── Stats Footer ── */}
        <footer
          className="flex flex-col sm:flex-row items-center justify-between gap-6 text-zinc-300"
          style={{
            padding: '0 var(--stats-x, 72px) var(--stats-y, 36px)',
            paddingBottom: 'max(var(--stats-y, 36px), env(safe-area-inset-bottom))',
            fontSize: 'var(--stat-size, 13.5px)',
            letterSpacing: '-0.015em',
          }}
        >
          {/* Stat 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease, delay: 1.12 }}
            className="inline-flex items-center gap-3.5 whitespace-nowrap"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
              <defs>
                <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.38"/>
                  <stop offset="1" stopColor="#3a3a3a" stopOpacity="0.62"/>
                </linearGradient>
                <linearGradient id="gr" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#3a3a3a" stopOpacity="0.38"/>
                  <stop offset="1" stopColor="#fff" stopOpacity="0.62"/>
                </linearGradient>
              </defs>
              <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#gl)"/>
              <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#gr)"/>
              <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a"/>
            </svg>
            <span>Hybrid ML + SHAP Evidence Pipeline</span>
          </motion.div>

          {/* Stat 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease, delay: 1.28 }}
            className="inline-flex items-center gap-3.5 whitespace-nowrap"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
              <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff"/>
              <path d="M12 7.1v7.4M8.15 12.35L12 16.2l3.85-3.85" stroke="#111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span>Counterfactual Bias Audit Harness</span>
          </motion.div>

          {/* Stat 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease, delay: 1.44 }}
            className="inline-flex items-center gap-3.5 whitespace-nowrap"
          >
            <svg width="38" height="21" viewBox="0 0 40 22" className="shrink-0">
              <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b"/>
              <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4"/>
              <circle cx="8.9" cy="11.2" r="0.7" fill="#1a1a1a"/>
              <circle cx="11.5" cy="11.2" r="0.7" fill="#1a1a1a"/>
              <circle cx="20.2" cy="11" r="9.2" fill="#ffffff"/>
              <circle cx="17.7" cy="9.8" r="1.7" fill="#111"/>
              <circle cx="22.7" cy="9.8" r="1.7" fill="#111"/>
              <path d="M17.8 14.2c1.2 1.4 3.6 1.4 4.8 0" stroke="#111" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
              <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d"/>
              <text x="30.2" y="15.1" fontFamily="Inter, sans-serif" fontSize="12.5" fontWeight="700" textAnchor="middle" fill="#fff">e</text>
            </svg>
            <span>NYC LL144 & EU AI Act Compliance-Ready</span>
          </motion.div>
        </footer>
      </div>

      {/* ─────────────────────────────────────────────
          SCROLLABLE FEATURE SECTIONS BELOW THE FOLD
      ───────────────────────────────────────────── */}
      <div className="relative z-10">

        {/* How It Works */}
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-900">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 mb-4">
              <Cpu size={13} />
              <span>How FairMatch Works</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              From job description to<br />
              <em className="font-serif-italic text-zinc-400">evidence-based</em> match report
            </h2>
            <p className="text-zinc-400 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
              A four-step transparent pipeline that produces explainable, auditable candidate-job compatibility reports — not black-box rankings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: '01', title: 'Ingest & Parse', desc: 'Upload PDF/DOCX resumes and paste your job description. Our parser extracts skill taxonomies, experience, and education signals.' },
              { step: '02', title: 'Feature Extraction', desc: 'Compute semantic cosine similarity, Jaccard skill overlap, weighted skill coverage, experience delta, and education rank.' },
              { step: '03', title: 'XGBoost Match Score', desc: 'An XGBoost re-ranker combines extracted features into a transparent 0–100 match score with SHAP per-feature attribution.' },
              { step: '04', title: 'Bias Audit & Report', desc: 'Counterfactual perturbations test name format, institution tier, and career gap score variance. Export compliance CSV reports.' },
            ].map((item, i) => (
              <div key={i} className="fm-glass-card p-5 space-y-3">
                <div className="text-3xl font-black text-zinc-800 font-mono">{item.step}</div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Features */}
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 mb-6">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Transparency by Design</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
                Every score is<br />
                <em className="font-serif-italic text-zinc-400">fully explainable.</em>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                FairMatch never produces opaque percentile tables. Each candidate match includes a complete SHAP feature attribution breakdown — showing exactly which signals drove the score and by how much.
              </p>
              <ul className="space-y-3 text-sm text-zinc-300">
                {[
                  'Per-candidate SHAP contribution values for every feature',
                  'Skill overlap, semantic similarity, and experience delta metrics',
                  'Evidence-based strengths and gap identification',
                  'Counterfactual fairness audit with formatting parity ratio',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <ShieldCheck size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock SHAP Report Preview */}
            <div className="fm-glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">SHAP Attribution</div>
                  <div className="text-2xl font-bold text-white mt-1">88 / 100 Match</div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-900/60 text-emerald-300 text-xs font-medium">
                  Strong Fit
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Technical Skill Overlap', shap: '+22.4', pct: 88 },
                  { label: 'Semantic Cosine Relevance', shap: '+16.1', pct: 74 },
                  { label: 'Experience Delta (6yr vs 5yr)', shap: '+9.5', pct: 52 },
                  { label: 'Education Level Match', shap: '+7.2', pct: 44 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">{item.label}</span>
                      <span className="text-emerald-400 font-medium">{item.shap}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <div className="text-xs text-zinc-400">
                  <span className="text-emerald-300 font-medium">✓ Counterfactual Audit Passed</span> — Max variant score gap: 0.8 pts (threshold: 5.0)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-6xl mx-auto px-6 py-12 border-t border-zinc-900">
          <div className="fm-glass-card p-8 md:p-12 text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300">
              <Scale size={13} />
              <span>Fair Evaluation. Transparent Results.</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-tight">
              Ready to evaluate candidates<br />
              <em className="font-serif-italic text-zinc-400">fairly and transparently?</em>
            </h2>
            <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed">
              Upload a job description and candidate resumes to generate a transparent, SHAP-explainable FairMatch report in seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={onOpenDashboard}
                className="btn-vesper btn-vesper-solid h-12 px-8 text-sm font-semibold"
              >
                <Sparkles size={15} className="mr-2" />
                Launch FairMatch Analyzer
              </button>
              {onExploreJobs && (
                <button
                  onClick={onExploreJobs}
                  className="btn-vesper btn-vesper-ghost h-12 px-6 text-sm"
                >
                  Explore Job Taxonomy →
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 fill-zinc-500" viewBox="0 0 24 24">
              <g transform="rotate(-30 12 12)">
                <circle cx="7.3" cy="3.2" r="1.45"/>
                <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8"/>
                <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8"/>
                <circle cx="16.7" cy="20.8" r="1.45"/>
              </g>
            </svg>
            <span>FairMatch AI — Evidence-Based Candidate Matching</span>
          </div>
          <div className="flex items-center gap-5">
            {onOpenAbout && (
              <button onClick={onOpenAbout} className="hover:text-zinc-300 transition-colors">Platform Architecture</button>
            )}
            {onOpenPrivacy && (
              <button onClick={onOpenPrivacy} className="hover:text-zinc-300 transition-colors">Privacy Policy</button>
            )}
            {onOpenTerms && (
              <button onClick={onOpenTerms} className="hover:text-zinc-300 transition-colors">Terms of Use</button>
            )}
          </div>
        </footer>
      </div>

      {/* CSS Keyframes (injected once inline) */}
      <style>{`
        @keyframes in-star {
          0% { transform: scale(0.2) rotate(-50deg); opacity: 0; }
          65% { transform: scale(1.2) rotate(8deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes in-em {
          0% { opacity: 0.35; filter: blur(4px); }
          100% { opacity: 1; filter: blur(0); }
        }
        @media (min-width: 901px) {
          html, body { height: 100%; overflow: hidden; }
        }
        @media (max-width: 900px) {
          html, body { height: auto; overflow-y: auto; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition: none !important; animation: none !important; }
        }
      `}</style>
    </div>
  );
};
