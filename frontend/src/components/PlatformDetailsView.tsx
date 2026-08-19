import React from 'react';
import { ArrowLeft, ShieldCheck, Target, Cpu, Users, Award, FileSearch, CheckCircle2, Sparkles, Scale, AlertTriangle } from 'lucide-react';

interface PlatformDetailsViewProps {
  onBack: () => void;
  onOpenDashboard: () => void;
}

export const PlatformDetailsView: React.FC<PlatformDetailsViewProps> = ({ onBack, onOpenDashboard }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 selection:text-white">
      <div className="grain-overlay" />
      <div className="hero-photo-bg" />

      <div className="relative z-10">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-900/80 bg-black/80">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="btn-vesper btn-vesper-ghost h-8 px-3 text-xs">
                <ArrowLeft size={13} className="mr-1.5" />
                <span>Back</span>
              </button>
              <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
              <div className="flex items-center gap-2.5 hidden sm:flex">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <g transform="rotate(-30 12 12)">
                    <circle cx="7.3" cy="3.2" r="1.45"/>
                    <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8"/>
                    <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8"/>
                    <circle cx="16.7" cy="20.8" r="1.45"/>
                  </g>
                </svg>
                <span className="font-semibold text-sm tracking-tight">FairMatch <span className="text-zinc-400 font-normal">Platform</span></span>
              </div>
            </div>
            <button onClick={onOpenDashboard} className="btn-vesper btn-vesper-solid h-9 px-4 text-xs font-semibold">
              Launch Dashboard →
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 mb-6">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Job-Specific Evidence Analysis — No Ranking, No Black-Box Scores</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.1] text-white mb-6 max-w-4xl">
            Transparent AI Candidate Matching with{' '}
            <em className="font-serif-italic not-italic font-normal text-zinc-400">evidence-based</em>{' '}
            Fairness Auditing
          </h1>

          <p className="text-base text-zinc-400 max-w-2xl leading-relaxed mb-8">
            FairMatch uses SHAP-explainability and counterfactual perturbation testing to provide transparent, actionable candidate-job fit analysis — without arbitrary rankings or protected attribute collection.
          </p>

          <button
            onClick={onOpenDashboard}
            className="btn-vesper btn-vesper-solid h-11 px-6 text-sm font-semibold"
          >
            <Sparkles size={15} className="mr-2" />
            Try the Evidence Analyzer
          </button>
        </section>

        {/* Feature Pillars Grid */}
        <section className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Target size={20} />,
                title: 'Job-Specific Evidence Matching',
                desc: 'Every match is evaluated purely against the specific job description you provide — not a generic model trained on historical hiring bias.',
              },
              {
                icon: <Cpu size={20} />,
                title: 'SHAP Explainability Engine',
                desc: 'Per-candidate SHAP values break down every score contribution: skill overlap, semantic similarity, experience delta, and education level.',
              },
              {
                icon: <ShieldCheck size={20} />,
                title: 'Counterfactual Bias Audit Harness',
                desc: 'Automated synthetic perturbation across name formats, university prestige tiers, and career gap representations — no protected attribute collection.',
              },
              {
                icon: <Scale size={20} />,
                title: 'No Arbitrary Candidate Rankings',
                desc: 'FairMatch does not produce black-box percentile tables. Match outputs are structured evidence profiles, not opaque scores.',
              },
              {
                icon: <FileSearch size={20} />,
                title: 'Global O*NET Job Taxonomy',
                desc: 'Integrated ISCO-08 occupation taxonomy browser with 1,000+ normalized job profiles for standardized requirement mapping.',
              },
              {
                icon: <Award size={20} />,
                title: 'Compliance-Ready Architecture',
                desc: 'Built for HR teams under NYC Local Law 144, EU AI Act, and Fairlearn benchmarks. Audit logs are exportable as CSV compliance reports.',
              },
            ].map((item, i) => (
              <div key={i} className="fm-glass-card p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ML Pipeline Architecture */}
        <section className="max-w-6xl mx-auto px-6 py-10 border-t border-zinc-900">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">ML Pipeline Architecture</h2>
          <p className="text-sm text-zinc-400 mb-8 max-w-2xl">
            FairMatch's hybrid pipeline combines semantic embeddings, structured skill taxonomy matching, and XGBoost reranking to produce transparent, explainable match scores.
          </p>

          <div className="fm-glass-card p-6 overflow-x-auto">
            <pre className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre">{`Resume & JD Input
       │
       ├── Document Parser (PDF / DOCX / TXT)
       │     ├── Text & Contact Extraction
       │     ├── Skill Taxonomy Normalizer (Tech & Domain)
       │     └── Years of Experience & Education Rank Classifier
       │
       ├── Feature Extraction Vector
       │     ├── Semantic Cosine Similarity (SentenceTransformers)
       │     ├── Jaccard Skill Overlap Ratio
       │     ├── Weighted Skill Coverage Ratio
       │     ├── Experience Match Delta Score
       │     └── Education Level Rank Score
       │
       ├── XGBoost Re-Ranker Model (0–100 Match Score)
       │
       ├── SHAP Explainability Engine (Per-candidate Attribution)
       │
       └── Counterfactual Bias Audit Harness (Synthetic Perturbation & Fairlearn)`}</pre>
          </div>
        </section>

        {/* Compliance & Fairness Disclosure */}
        <section className="max-w-6xl mx-auto px-6 py-10 border-t border-zinc-900">
          <div className="fm-glass-card p-6 border-amber-900/40 bg-amber-950/10 space-y-4">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <AlertTriangle size={18} />
              <span>Synthetic Proxy Testing Disclaimer</span>
            </div>
            <div className="text-sm text-zinc-300 leading-relaxed space-y-3">
              <p>The counterfactual bias detection module in FairMatch relies on <strong className="text-white">synthetic name and institution variants</strong> generated dynamically for audit testing purposes.</p>
              <ul className="space-y-1.5 pl-4 border-l-2 border-zinc-700">
                <li><span className="text-white font-medium">No Protected Attribute Collection:</span> FairMatch never collects, infers, or uses real demographic attributes (race, gender, age, disability) from actual candidate profiles.</li>
                <li><span className="text-white font-medium">Synthetic Proxies as Benchmarks:</span> Name lists and university classifications represent statistical proxy benchmarks to test whether model feature weights accidentally penalize specific naming structures or prestige tiers.</li>
                <li><span className="text-white font-medium">Human-in-the-Loop Requirement:</span> An audit flag indicates counterfactual score variations exceeded allowable thresholds, requiring HR compliance review under <strong className="text-white">NYC Local Law 144</strong> or the <strong className="text-white">EU AI Act</strong>. It does not constitute a legal determination.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-6xl mx-auto px-6 py-12 border-t border-zinc-900">
          <div className="fm-glass-card p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Ready to run a fair candidate match?</h2>
              <p className="text-sm text-zinc-400 mt-1">Upload a job description and resumes to generate a transparent SHAP-explainable evaluation in seconds.</p>
            </div>
            <button onClick={onOpenDashboard} className="btn-vesper btn-vesper-solid h-12 px-8 text-sm font-semibold shrink-0">
              Launch Evidence Analyzer →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
