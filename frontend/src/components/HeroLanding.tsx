import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  BarChart3, 
  Layers, 
  Search, 
  FileText, 
  Lock, 
  Scale, 
  ChevronRight, 
  Menu, 
  X, 
  Activity, 
  Cpu 
} from 'lucide-react';

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
  onExploreJobs
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'evidence' | 'fairness' | 'taxonomy'>('evidence');

  const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenAbout}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg tracking-tight text-zinc-100">FairMatch AI</span>
              <span className="text-[10px] text-zinc-400 tracking-wider uppercase font-medium">Bias Audit & Job-Match Engine</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <button 
              onClick={onOpenAbout} 
              className="hover:text-zinc-100 transition-colors cursor-pointer"
            >
              Platform Architecture
            </button>
            {onExploreJobs && (
              <button 
                onClick={onExploreJobs} 
                className="hover:text-zinc-100 transition-colors cursor-pointer"
              >
                Global Job Taxonomy
              </button>
            )}
            <button 
              onClick={onOpenDashboard} 
              className="hover:text-zinc-100 transition-colors cursor-pointer"
            >
              Evidence Analyzer
            </button>
          </nav>

          {/* Right Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onOpenDashboard}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Analysis Engine</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100"
            aria-label="Toggle Navigation Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-2xl flex flex-col p-6 pt-24 md:hidden">
          <div className="flex flex-col gap-6 text-lg font-medium text-zinc-300">
            <button 
              onClick={() => { setMenuOpen(false); onOpenDashboard(); }}
              className="text-left py-3 border-b border-zinc-800 text-emerald-400 font-semibold flex items-center justify-between"
            >
              <span>Launch Analysis Engine</span>
              <ArrowRight size={18} />
            </button>
            {onExploreJobs && (
              <button 
                onClick={() => { setMenuOpen(false); onExploreJobs(); }}
                className="text-left py-3 border-b border-zinc-800 flex items-center justify-between"
              >
                <span>Global Job Taxonomy</span>
                <ChevronRight size={18} />
              </button>
            )}
            <button 
              onClick={() => { setMenuOpen(false); onOpenAbout(); }}
              className="text-left py-3 border-b border-zinc-800 flex items-center justify-between"
            >
              <span>Platform Architecture</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          {/* Subtle Monochrome Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeCurve }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400 font-normal">Evidence-Based Matching & Counterfactual Bias Detection</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: easeCurve }}
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-100 leading-[1.1]"
          >
            Candidate Job-Fit Analysis.<br />
            <span className="text-emerald-400">Zero Demographic Bias.</span>
          </motion.h1>

          {/* Subtitle Copy */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeCurve }}
            className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed font-normal"
          >
            Evaluate candidate resumes against target job descriptions using transparent requirement extraction, semantic skill grounding, and counterfactual fairness auditing.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeCurve }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2"
          >
            <button
              onClick={onOpenDashboard}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <span>Analyze Resume Against Job</span>
              <ArrowRight size={16} />
            </button>
            {onExploreJobs && (
              <button
                onClick={onExploreJobs}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search size={15} />
                <span>Explore 2,400+ Job Roles</span>
              </button>
            )}
          </motion.div>

          {/* Trust Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: easeCurve }}
            className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-zinc-800/80 w-full text-left"
          >
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-zinc-100 font-mono">100%</div>
              <div className="text-xs text-zinc-400">Explainable Feature Attribution</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-zinc-100 font-mono">0.00</div>
              <div className="text-xs text-zinc-400">Demographic Variance Impact</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-zinc-100 font-mono">ISCO-08</div>
              <div className="text-xs text-zinc-400">Global Taxonomy Standard</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-zinc-100 font-mono">Real-Time</div>
              <div className="text-xs text-zinc-400">Counterfactual Bias Audit</div>
            </div>
          </motion.div>
        </div>

        {/* 3. Product Preview Card (Interactive SaaS Dashboard Mockup) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: easeCurve }}
          className="mt-16 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          {/* Card Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <span className="ml-2 text-xs font-mono text-zinc-400">fairmatch_engine_v1.0 // Audit Mode</span>
            </div>

            {/* Tab Switching Control */}
            <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab('evidence')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'evidence' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Requirement Evidence
              </button>
              <button
                onClick={() => setActiveTab('fairness')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'fairness' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Counterfactual Fairness
              </button>
              <button
                onClick={() => setActiveTab('taxonomy')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'taxonomy' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ESCO / ISCO Mapping
              </button>
            </div>
          </div>

          {/* Interactive Tab Body */}
          <div className="pt-6">
            {activeTab === 'evidence' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
                    <div>
                      <div className="text-sm font-semibold text-zinc-200">Senior Full-Stack Engineer</div>
                      <div className="text-xs text-zinc-400 mt-0.5">Target Requirement Mapping & Skill Grounding</div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      94.2% Evidence Score
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { req: "Python & FastAPI Microservices", status: "Verified Evidence", source: "Work Experience (Line 14)", score: "100%" },
                      { req: "React & TypeScript Frontend", status: "Verified Evidence", source: "Work Experience (Line 22)", score: "100%" },
                      { req: "Machine Learning / Scikit-Learn", status: "Verified Evidence", source: "Key Projects (Line 38)", score: "90%" },
                      { req: "AWS & Docker Deployment", status: "Partial Context", source: "Skills Section Mention", score: "80%" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-xs">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-medium text-zinc-200">{item.req}</span>
                            <span className="text-zinc-400 block text-[11px] mt-0.5">{item.source}</span>
                          </div>
                        </div>
                        <span className="font-mono text-zinc-300 font-medium">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 bg-zinc-950/60 p-5 rounded-xl border border-zinc-800/80">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">SHAP Feature Impact</div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-300 mb-1">
                        <span>Technical Skill Alignment</span>
                        <span className="font-mono text-emerald-400">+42.5%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[85%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-zinc-300 mb-1">
                        <span>Years Experience Coverage</span>
                        <span className="font-mono text-emerald-400">+28.0%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[70%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-zinc-300 mb-1">
                        <span>Education Qualification</span>
                        <span className="font-mono text-emerald-400">+15.2%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[50%]" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
                     SHAP values strictly measure verifiable skills and experience. Name, age, gender, and school status are excluded.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fairness' && (
              <div className="space-y-4">
                <div className="bg-zinc-950/60 p-5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-emerald-400" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-200">Counterfactual Fairness Audit Status</div>
                      <div className="text-xs text-zinc-400 mt-0.5">Demographic attributes perturbed across 100 iterations</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Passed (0.00% Variance)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { attr: "Candidate Name / Gender Perturbation", delta: "0.00%", status: "Invariant Score" },
                    { attr: "Ethnicity / Name Variation", delta: "0.00%", status: "Invariant Score" },
                    { attr: "Age / Graduation Year Masking", delta: "0.00%", status: "Invariant Score" },
                  ].map((test, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/60 space-y-2">
                      <div className="text-xs font-medium text-zinc-300">{test.attr}</div>
                      <div className="text-lg font-semibold font-mono text-emerald-400">{test.delta}</div>
                      <div className="text-[11px] text-zinc-400">{test.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'taxonomy' && (
              <div className="space-y-4">
                <div className="bg-zinc-950/60 p-5 rounded-xl border border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-200">ISCO-08 Major Group 2: Professionals</span>
                    <span className="text-xs font-mono text-zinc-400">ESCO Taxonomy Standard</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    FairMatch normalizes job requirements into standard occupational families defined by the International Labour Organization (ILO) and European Skills Taxonomy (ESCO).
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* 4. Core Features Grid */}
      <section className="py-20 px-6 border-t border-zinc-800/80 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
              Built for Objective Candidate Evaluation
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Standard resume screeners rely on opaque keyword counting. FairMatch provides transparent evidence mapping and counterfactual audit guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h3 className="text-base font-semibold text-zinc-100">Requirement Extraction</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Parses domain skills, required years of experience, and educational background from raw job description text.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-semibold text-zinc-100">Counterfactual Bias Audit</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Executes automated demographic perturbation testing to verify that candidate scores are independent of protected attributes.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-base font-semibold text-zinc-100">SHAP Feature Attribution</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Breaks down score drivers into explicit percentage contributions, providing complete transparency into match reasoning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800/80 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-emerald-500" />
            <span className="font-semibold text-zinc-300">FairMatch AI</span>
            <span>© {new Date().getFullYear()} FairMatch AI. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            {onOpenPrivacy && (
              <button onClick={onOpenPrivacy} className="hover:text-zinc-200 transition-colors cursor-pointer">
                Privacy Policy
              </button>
            )}
            {onOpenTerms && (
              <button onClick={onOpenTerms} className="hover:text-zinc-200 transition-colors cursor-pointer">
                Terms of Service
              </button>
            )}
            <button onClick={onOpenAbout} className="hover:text-zinc-200 transition-colors cursor-pointer">
              Architecture
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
