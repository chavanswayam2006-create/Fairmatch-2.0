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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Run Summary Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '18px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Match Run #{runData.run_id}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#000', margin: '4px 0' }}>
            {runData.job_title}
          </h2>
          <div style={{ fontSize: '13px', color: '#555' }}>
            {runData.candidate_count} candidates scored with 8-Criteria Dynamic Weighting & SHAP Attribution
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            backgroundColor: runData.fairness_flagged ? '#fee2e2' : '#dcfce7',
            border: `1px solid ${runData.fairness_flagged ? '#fca5a5' : '#86efac'}`,
            color: runData.fairness_flagged ? '#991b1b' : '#166534',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {runData.fairness_flagged ? (
              <>
                <AlertTriangle size={15} />
                <span>Bias Flagged (Gap: {runData.max_score_gap} pts)</span>
              </>
            ) : (
              <>
                <ShieldCheck size={15} />
                <span>Fairness Audited (Pass)</span>
              </>
            )}
          </div>

          <button onClick={onTriggerAudit} className="btn-black" style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            View Bias Report →
          </button>
        </div>
      </div>

      {/* Score Range Scale Reference Card */}
      <div style={{
        backgroundColor: '#fafafa',
        border: '1px solid #e4e4e7',
        borderRadius: '16px',
        padding: '18px 24px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.04em' }}>
          Calibrated 0–100 Score Ranges & Status Tiers:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
          <ScoreTierBadge range="90 – 100" label="Excellent Match" color="#166534" bg="#dcfce7" border="#86efac" />
          <ScoreTierBadge range="75 – 89" label="Strong Match" color="#1e40af" bg="#dbeafe" border="#93c5fd" />
          <ScoreTierBadge range="60 – 74" label="Moderate Match" color="#854d0e" bg="#fef9c3" border="#fde047" />
          <ScoreTierBadge range="40 – 59" label="Needs Improvement" color="#9a3412" bg="#ffedd5" border="#fdba74" />
          <ScoreTierBadge range="0 – 39" label="Low Match" color="#991b1b" bg="#fee2e2" border="#fca5a5" />
        </div>
      </div>

      {/* Ranked Candidate List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Evaluated Candidate Rankings</h3>

        {runData.results.map((candidate) => {
          const isExpanded = expandedCandidate === candidate.resume_id;
          const finalScore = candidate.final_score;

          // Determine status tier badge
          let tierLabel = candidate.score_tier || "Strong Match";
          let tierColor = "#1e40af";
          let tierBg = "#dbeafe";
          let tierBorder = "#93c5fd";

          if (finalScore >= 90) {
            tierLabel = "Excellent Match";
            tierColor = "#166534"; tierBg = "#dcfce7"; tierBorder = "#86efac";
          } else if (finalScore >= 75) {
            tierLabel = "Strong Match";
            tierColor = "#1e40af"; tierBg = "#dbeafe"; tierBorder = "#93c5fd";
          } else if (finalScore >= 60) {
            tierLabel = "Moderate Match";
            tierColor = "#854d0e"; tierBg = "#fef9c3"; tierBorder = "#fde047";
          } else if (finalScore >= 40) {
            tierLabel = "Needs Improvement";
            tierColor = "#9a3412"; tierBg = "#ffedd5"; tierBorder = "#fdba74";
          } else {
            tierLabel = "Low Match";
            tierColor = "#991b1b"; tierBg = "#fee2e2"; tierBorder = "#fca5a5";
          }

          return (
            <div
              key={candidate.resume_id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '18px',
                padding: '24px',
                transition: 'all 0.2s ease',
                boxShadow: isExpanded ? '0 8px 30px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              {/* Header Row */}
              <div
                onClick={() => setExpandedCandidate(isExpanded ? null : candidate.resume_id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: candidate.rank === 1 ? '#000000' : '#f4f4f6',
                    color: candidate.rank === 1 ? '#ffffff' : '#333333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '15px'
                  }}>
                    #{candidate.rank}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#000' }}>
                      {candidate.candidate_name}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span>Skill Overlap: <strong>{(candidate.skill_overlap * 100).toFixed(0)}%</strong></span>
                      <span>•</span>
                      <span>Semantic Fit: <strong>{(candidate.cosine_sim * 100).toFixed(0)}%</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {/* Status Tier Badge */}
                  <div style={{
                    backgroundColor: tierBg,
                    border: `1px solid ${tierBorder}`,
                    color: tierColor,
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {tierLabel}
                  </div>

                  {/* 0-100 Score Metric */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#000', lineHeight: 1 }}>
                      {finalScore.toFixed(1)}<span style={{ fontSize: '16px', color: '#888' }}>/100</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#888', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
                      Overall Match Score
                    </div>
                  </div>

                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                    {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                  </button>
                </div>
              </div>

              {/* Expanded Detailed Analysis */}
              {isExpanded && (
                <div style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid #f0f0f2',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '28px'
                }}>

                  {/* 1. Important UX Principle: 3 Candidate Questions Banner */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <HelpCircle size={16} color="#2563eb" />
                      <span>Transparent Candidate Guidance (3 Core Questions)</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>
                          1. Where does my resume stand?
                        </div>
                        <div style={{ fontSize: '13px', color: '#334155' }}>
                          Your overall score is <strong>{finalScore.toFixed(1)}/100</strong>, placing your application in the <strong>{tierLabel}</strong> tier for this role.
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>
                          2. Why did I receive this score?
                        </div>
                        <div style={{ fontSize: '13px', color: '#334155' }}>
                          Evaluated dynamically across 8 weighted criteria tailored specifically to the requirements of the <strong>{runData.job_title}</strong> role.
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>
                          3. What should I improve first?
                        </div>
                        <div style={{ fontSize: '13px', color: '#334155' }}>
                          {candidate.recommendations && candidate.recommendations.length > 0 ? (
                            <span>Prioritize: <strong>{candidate.recommendations[0].weakness_title}</strong> to gain score points.</span>
                          ) : (
                            <span>Maintain quantitative achievement bullets and skill alignment.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Structured 8-Criteria Score Breakdown Table */}
                  <div>
                    <h5 style={{ fontSize: '15px', fontWeight: 600, color: '#000', marginBottom: '14px' }}>
                      8-Criteria Score Breakdown & Role-Adaptive Weights
                    </h5>

                    {candidate.category_breakdown && candidate.category_breakdown.length > 0 ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e4e4e7', color: '#666', backgroundColor: '#fafafa' }}>
                              <th style={{ padding: '10px 14px' }}>Category</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Score (0–100)</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Role Weight</th>
                              <th style={{ padding: '10px 14px' }}>Evaluation Detail</th>
                            </tr>
                          </thead>
                          <tbody>
                            {candidate.category_breakdown.map((cat, idx) => {
                              const s = cat.score;
                              let statusBg = "#f4f4f6";
                              let statusColor = "#333";
                              if (s >= 90) { statusBg = "#dcfce7"; statusColor = "#166534"; }
                              else if (s >= 75) { statusBg = "#dbeafe"; statusColor = "#1e40af"; }
                              else if (s >= 60) { statusBg = "#fef9c3"; statusColor = "#854d0e"; }
                              else if (s >= 40) { statusBg = "#ffedd5"; statusColor = "#9a3412"; }
                              else { statusBg = "#fee2e2"; statusColor = "#991b1b"; }

                              return (
                                <tr key={idx} style={{ borderBottom: '1px solid #f4f4f6' }}>
                                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#111' }}>
                                    {cat.category_name}
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>
                                    {cat.score.toFixed(1)}/100
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <span style={{
                                      backgroundColor: statusBg,
                                      color: statusColor,
                                      padding: '3px 10px',
                                      borderRadius: '9999px',
                                      fontSize: '11px',
                                      fontWeight: 600
                                    }}>
                                      {cat.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 500, color: '#555' }}>
                                    {cat.weight_percent.toFixed(0)}%
                                  </td>
                                  <td style={{ padding: '12px 14px', color: '#555', fontSize: '12px' }}>
                                    {cat.explanation}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#666' }}>Standard 8-criteria breakdown active.</div>
                    )}
                  </div>

                  {/* 3. Resume Insights: Pros & Cons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    {/* Strengths / Pros */}
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '16px',
                      padding: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#166534', fontWeight: 700, fontSize: '14px' }}>
                        <ThumbsUp size={18} />
                        <span>Candidate Strengths & Positive Factors</span>
                      </div>

                      {candidate.strengths && candidate.strengths.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {candidate.strengths.map((item, idx) => (
                            <div key={idx} style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#14532d', marginBottom: '4px' }}>
                                ✓ {item.title}
                              </div>
                              <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
                                {item.description}
                              </div>
                              <div style={{ fontSize: '11px', color: '#166534', marginTop: '6px', fontWeight: 500, backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                                <strong>Why valuable:</strong> {item.value_reason}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#166534' }}>Solid overall resume alignment.</div>
                      )}
                    </div>

                    {/* Weaknesses / Cons */}
                    <div style={{
                      backgroundColor: '#fff5f5',
                      border: '1px solid #fecaca',
                      borderRadius: '16px',
                      padding: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#991b1b', fontWeight: 700, fontSize: '14px' }}>
                        <ThumbsDown size={18} />
                        <span>Identified Weaknesses & Score Penalties</span>
                      </div>

                      {candidate.weaknesses && candidate.weaknesses.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {candidate.weaknesses.map((item, idx) => (
                            <div key={idx} style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #fee2e2' }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#7f1d1d', marginBottom: '4px' }}>
                                ⚠ {item.title}
                              </div>
                              <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
                                {item.description}
                              </div>
                              <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '6px', fontWeight: 600, backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                                Score Impact: {item.score_impact}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#991b1b' }}>No major weaknesses flagged.</div>
                      )}
                    </div>
                  </div>

                  {/* 4. Actionable Improvement Recommendations */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '15px', fontWeight: 600, color: '#000' }}>
                      <Zap size={18} color="#eab308" />
                      <span>Actionable Improvement Recommendations</span>
                    </div>

                    {candidate.recommendations && candidate.recommendations.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                        {candidate.recommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e4e4e7',
                              borderRadius: '14px',
                              padding: '18px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#000', borderBottom: '1px solid #f4f4f6', paddingBottom: '8px' }}>
                              Recommendation #{idx + 1}: {rec.weakness_title}
                            </div>

                            <div style={{ fontSize: '12px', color: '#444' }}>
                              <strong>What is missing or weak:</strong> {rec.what_is_missing}
                            </div>

                            <div style={{ fontSize: '12px', color: '#444' }}>
                              <strong>Why it matters:</strong> {rec.why_it_matters}
                            </div>

                            <div style={{ fontSize: '12px', color: '#111', backgroundColor: '#f4f4f6', padding: '10px', borderRadius: '8px' }}>
                              <strong>What candidate should do:</strong><br />
                              {rec.what_to_do}
                            </div>

                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '6px 12px', borderRadius: '9999px', alignSelf: 'flex-start', marginTop: '4px' }}>
                              Expected Impact: {rec.expected_impact}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#555' }}>No immediate action items required. Candidate strongly matches role requirements.</div>
                    )}
                  </div>

                  {/* 5. SHAP Feature Attribution Detail */}
                  <div style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #e4e4e7',
                    borderRadius: '14px',
                    padding: '18px'
                  }}>
                    <h5 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#555', marginBottom: '12px' }}>
                      SHAP Explainability & Feature Contribution
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                      <ShapBar label="Skill Overlap" value={candidate.shap_breakdown?.skill_overlap || 0} />
                      <ShapBar label="Semantic Match" value={candidate.shap_breakdown?.semantic_similarity || 0} />
                      <ShapBar label="Weighted Skills" value={candidate.shap_breakdown?.weighted_skills || 0} />
                      <ShapBar label="Experience Fit" value={candidate.shap_breakdown?.experience_match || 0} />
                      <ShapBar label="Education Rank" value={candidate.shap_breakdown?.education_match || 0} />
                    </div>
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

const ScoreTierBadge: React.FC<{ range: string; label: string; color: string; bg: string; border: string }> = ({ range, label, color, bg, border }) => (
  <div style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '6px 10px', textAlign: 'center' }}>
    <div style={{ fontSize: '12px', fontWeight: 700, color }}>{range}</div>
    <div style={{ fontSize: '10px', fontWeight: 600, color }}>{label}</div>
  </div>
);

const ShapBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const isPositive = value >= 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
      <span style={{ color: '#444' }}>{label}</span>
      <span style={{
        fontWeight: 700,
        color: isPositive ? '#16a34a' : '#dc2626',
        backgroundColor: isPositive ? '#f0fdf4' : '#fef2f2',
        padding: '2px 8px',
        borderRadius: '6px'
      }}>
        {isPositive ? `+${value.toFixed(1)}` : `${value.toFixed(1)}`}
      </span>
    </div>
  );
};
