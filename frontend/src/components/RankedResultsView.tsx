import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, ThumbsUp, ThumbsDown, ArrowRight, Zap, Target } from 'lucide-react';

interface CategoryScoreDetail {
  category_name: string;
  score: number;
  max_score: number;
  weight_percent: number;
  status: string;
  explanation: string;
}

interface StrengthItem {
  title: string;
  description: string;
  value_reason: string;
}

interface WeaknessItem {
  title: string;
  description: string;
  score_impact: string;
}

interface RecommendationItem {
  weakness_title: string;
  what_is_missing: string;
  why_it_matters: string;
  what_to_do: string;
  expected_impact: string;
}

interface ShapBreakdown {
  semantic_similarity: number;
  skill_overlap: number;
  weighted_skills: number;
  experience_match: number;
  education_match: number;
}

interface CandidateResult {
  resume_id: string;
  candidate_name: string;
  rank: number;
  final_score: number;
  score_tier?: string;
  score_label?: string;
  cosine_sim: number;
  skill_overlap: number;
  exp_score: number;
  edu_score: number;
  shap_breakdown: ShapBreakdown;
  category_breakdown?: CategoryScoreDetail[];
  strengths?: StrengthItem[];
  weaknesses?: WeaknessItem[];
  recommendations?: RecommendationItem[];
}

interface RankedResultsViewProps {
  runData: {
    run_id: string;
    job_title: string;
    candidate_count: number;
    top_score: number;
    results: CandidateResult[];
    fairness_flagged: boolean;
    max_score_gap: number;
  };
  onTriggerAudit: () => void;
}

export const RankedResultsView: React.FC<RankedResultsViewProps> = ({ runData, onTriggerAudit }) => {
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(
    runData.results.length > 0 ? runData.results[0].resume_id : null
  );

  return (
    <div className="space-y-7 py-2">
      {/* Run Summary Banner */}
      <div className="fm-glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Match Run #{runData.run_id}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            {runData.job_title}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {runData.candidate_count} candidates evaluated with SHAP Feature Explainability & Bias Audit Harness
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          {runData.fairness_flagged ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-200 text-xs font-medium">
              <AlertTriangle size={15} className="text-amber-400" />
              <span>Score Gap: {runData.max_score_gap} pts</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-200 text-xs font-medium">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Counterfactual Parity Verified</span>
            </div>
          )}

          <button
            onClick={onTriggerAudit}
            className="btn-vesper btn-vesper-solid text-xs h-9 px-4"
          >
            <ShieldCheck size={14} className="mr-2" />
            <span>Audit Bias Parity</span>
          </button>
        </div>
      </div>

      {/* Candidate Score Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Evaluated Candidate Rankings ({runData.results.length})
        </h3>

        {runData.results.map((candidate) => {
          const isExpanded = expandedCandidate === candidate.resume_id;

          return (
            <div
              key={candidate.resume_id}
              className="fm-glass-card overflow-hidden transition-all"
            >
              {/* Card Header Row */}
              <div
                onClick={() => setExpandedCandidate(isExpanded ? null : candidate.resume_id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white text-base">
                    #{candidate.rank}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white flex items-center gap-2">
                      {candidate.candidate_name}
                      {candidate.score_label && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-normal">
                          {candidate.score_label}
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-zinc-400 mt-1">
                      <span>Skill Match: {(candidate.skill_overlap * 100).toFixed(0)}%</span>
                      <span>Cosine Sim: {(candidate.cosine_sim * 100).toFixed(0)}%</span>
                      <span>Exp Score: {(candidate.exp_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {candidate.final_score.toFixed(1)}
                      <span className="text-xs font-normal text-zinc-500"> / 100</span>
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-400">Overall Fit</div>
                  </div>
                  <button className="p-2 text-zinc-400 hover:text-white">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Expanded SHAP Breakdown & Evidence Analysis */}
              {isExpanded && (
                <div className="p-6 border-t border-zinc-850 bg-black/40 space-y-6">
                  {/* SHAP Feature Contribution Bars */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                      SHAP Explainability Matrix (Per-Candidate Score Contribution)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
                        <div className="flex justify-between text-xs text-zinc-300 mb-1">
                          <span>Skill Overlap SHAP</span>
                          <span className="text-emerald-400 font-medium">+{candidate.shap_breakdown.skill_overlap.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, candidate.shap_breakdown.skill_overlap * 3)}%` }} />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
                        <div className="flex justify-between text-xs text-zinc-300 mb-1">
                          <span>Semantic Cosine SHAP</span>
                          <span className="text-emerald-400 font-medium">+{candidate.shap_breakdown.semantic_similarity.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, candidate.shap_breakdown.semantic_similarity * 3)}%` }} />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800">
                        <div className="flex justify-between text-xs text-zinc-300 mb-1">
                          <span>Experience Delta SHAP</span>
                          <span className="text-emerald-400 font-medium">+{candidate.shap_breakdown.experience_match.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, candidate.shap_breakdown.experience_match * 3)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown list if present */}
                  {candidate.category_breakdown && candidate.category_breakdown.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                        Detailed Criteria Scoring
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {candidate.category_breakdown.map((cat, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white">{cat.category_name}</div>
                              <div className="text-zinc-400 text-[11px] mt-0.5">{cat.explanation}</div>
                            </div>
                            <div className="font-bold text-white text-sm shrink-0 ml-3">
                              {cat.score} / {cat.max_score}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths & Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidate.strengths && candidate.strengths.length > 0 && (
                      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs space-y-2">
                        <div className="font-semibold text-emerald-300 flex items-center gap-2">
                          <ThumbsUp size={14} />
                          <span>Candidate Key Evidence Strengths</span>
                        </div>
                        {candidate.strengths.map((str, idx) => (
                          <div key={idx} className="text-zinc-300">
                            <strong className="text-white">{str.title}:</strong> {str.description}
                          </div>
                        ))}
                      </div>
                    )}

                    {candidate.weaknesses && candidate.weaknesses.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-2">
                        <div className="font-semibold text-amber-300 flex items-center gap-2">
                          <AlertTriangle size={14} />
                          <span>Identified Evidence Gaps</span>
                        </div>
                        {candidate.weaknesses.map((weak, idx) => (
                          <div key={idx} className="text-zinc-300">
                            <strong className="text-white">{weak.title}:</strong> {weak.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
