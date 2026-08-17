import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, FileSearch, Sparkles, Zap, AlertTriangle, Globe, Award, Layers, Check, Info } from 'lucide-react';
import { safeArray, safeObject, safeString, normalizeCandidateAnalysis, NormalizedCandidateAnalysis, NormalizedRequirementItem, NormalizedStrengthItem, NormalizedWeaknessItem, NormalizedMissingItem, NormalizedExplainableRec } from '../utils/safeData';

interface ResumeAnalysisViewProps {
  runData: any;
}

export const ResumeAnalysisView: React.FC<ResumeAnalysisViewProps> = ({ runData }) => {
  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState<number>(0);

  const safeRunData = safeObject(runData);
  const rawResults = safeArray(safeRunData.results);
  
  const results = rawResults.map(normalizeCandidateAnalysis);
  const currentAnalysis = results.length > 0
    ? results[Math.min(selectedCandidateIdx, results.length - 1)]
    : normalizeCandidateAnalysis({});

  const jobTitle = safeString(currentAnalysis.job_context?.job_title || safeRunData.job_title, 'Target Position');
  const jobContext = currentAnalysis.job_context;
  const resumeQuality = currentAnalysis.resume_quality;
  const jobAlignment = currentAnalysis.job_alignment;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontFamily: "'Inter', sans-serif" }}>
      
      {/* 1. Job Analysis Header Banner with ISCO-08 & ESCO Context */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '20px',
        padding: '28px 32px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f4f4f6',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#333333',
              marginBottom: '10px'
            }}>
              <Globe size={15} color="#2563eb" />
              <span>Universal Occupational Framework (ISCO-08 & ESCO Taxonomies)</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 600, color: '#000', margin: '4px 0 6px 0' }}>
              {jobTitle}
            </h2>
            
            {/* Occupation Taxonomy Context Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', marginBottom: '8px' }}>
              <span className="tag-pill" style={{ backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' }}>
                Occupation: {jobContext.normalized_occupation}
              </span>
              <span className="tag-pill" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', borderColor: '#e9d5ff' }}>
                {jobContext.isco_code}
              </span>
              <span className="tag-pill" style={{ backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}>
                Industry: {jobContext.industry}
              </span>
              <span className="tag-pill" style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
                Seniority: {jobContext.seniority}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: '#666' }}>
              Analyzing resume evidence for candidate: <strong>{currentAnalysis.candidate_name}</strong>
            </div>
          </div>

          {/* Candidate selector if multiple resumes analyzed */}
          {results.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>Select Resume:</span>
              <select
                value={selectedCandidateIdx}
                onChange={e => setSelectedCandidateIdx(Number(e.target.value))}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e4e4e7',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  fontWeight: 500
                }}
              >
                {results.map((c, idx) => (
                  <option key={c.resume_id || idx} value={idx}>
                    {c.candidate_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Supportive Non-Judgmental Disclaimer Notice */}
        <div style={{
          marginTop: '20px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '14px 18px',
          fontSize: '13px',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0 }} />
          <div>
            <strong>“Your resume is analyzed against the requirements of this specific job. You are not being ranked against other candidates.”</strong> The objective is to identify demonstrated strengths, missing requirements, and actionable improvements.
          </div>
        </div>
      </div>

      {/* 2. Dual-Dimension Metrics Summary Cards (Resume Quality vs Job Alignment) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Dimension 1: Resume Quality */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e4e4e7',
          borderRadius: '18px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#09090b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#2563eb" />
            Dimension 1: Resume Quality
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div style={{ backgroundColor: '#fafafa', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f4f4f6' }}>
              <span style={{ color: '#666', display: 'block', marginBottom: '2px' }}>Structure & Clarity</span>
              <strong style={{ color: '#09090b' }}>{resumeQuality.structure_clarity}</strong>
            </div>
            <div style={{ backgroundColor: '#fafafa', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f4f4f6' }}>
              <span style={{ color: '#666', display: 'block', marginBottom: '2px' }}>Achievement Focus</span>
              <strong style={{ color: '#09090b' }}>{resumeQuality.achievement_orientation}</strong>
            </div>
            <div style={{ backgroundColor: '#fafafa', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f4f4f6' }}>
              <span style={{ color: '#666', display: 'block', marginBottom: '2px' }}>Formatting</span>
              <strong style={{ color: '#09090b' }}>{resumeQuality.formatting_consistency}</strong>
            </div>
            <div style={{ backgroundColor: '#fafafa', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f4f4f6' }}>
              <span style={{ color: '#666', display: 'block', marginBottom: '2px' }}>Evidence Depth</span>
              <strong style={{ color: '#09090b' }}>{resumeQuality.evidence_depth}</strong>
            </div>
          </div>
        </div>

        {/* Dimension 2: Job Alignment */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e4e4e7',
          borderRadius: '18px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#09090b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#16a34a" />
            Dimension 2: Job Alignment
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ backgroundColor: '#f0fdf4', padding: '10px 12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <span style={{ color: '#166534', display: 'block', marginBottom: '2px' }}>Requirement Coverage</span>
              <strong style={{ color: '#14532d', fontSize: '13px' }}>{jobAlignment.requirement_coverage}</strong>
            </div>
            <div style={{ backgroundColor: '#fafafa', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f4f4f6' }}>
              <span style={{ color: '#666', display: 'block', marginBottom: '2px' }}>Domain Alignment</span>
              <strong style={{ color: '#09090b' }}>{jobAlignment.domain_fit}</strong>
            </div>
            <div style={{ backgroundColor: '#fafafa', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f4f4f6' }}>
              <span style={{ color: '#666', display: 'block', marginBottom: '2px' }}>Experience Baseline</span>
              <strong style={{ color: '#09090b' }}>{jobAlignment.relevant_experience}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Job Match Overview Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '18px',
        padding: '24px 28px'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#000', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSearch size={18} color="#000000" />
          Job Match & Requirement Alignment Overview
        </h3>
        <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#334155', margin: 0 }}>
          {currentAnalysis.match_overview}
        </p>
      </div>

      {/* 4. Requirement-by-Requirement Evidence Matrix Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '18px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#000', marginBottom: '4px' }}>
          Requirement Evidence Matrix (Demonstrated vs. Mentioned)
        </h3>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '18px' }}>
          Evaluates direct resume evidence source, practical demonstration in experience/projects, and measurable impact.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e4e4e7', color: '#555', backgroundColor: '#fafafa' }}>
                <th style={{ padding: '12px 14px', width: '22%' }}>Job Requirement</th>
                <th style={{ padding: '12px 14px', width: '30%' }}>Resume Evidence & Source</th>
                <th style={{ padding: '12px 14px', width: '22%', textAlign: 'center' }}>Evidence Badges</th>
                <th style={{ padding: '12px 14px', width: '26%' }}>Actionable Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {safeArray<NormalizedRequirementItem>(currentAnalysis.requirement_table).map((row, idx) => {
                let badgeBg = "#f4f4f6";
                let badgeColor = "#333";
                let badgeBorder = "#e4e4e7";

                if (row.alignment_level === "Strong Evidence") {
                  badgeBg = "#dcfce7"; badgeColor = "#166534"; badgeBorder = "#86efac";
                } else if (row.alignment_level === "Moderate Evidence") {
                  badgeBg = "#dbeafe"; badgeColor = "#1e40af"; badgeBorder = "#93c5fd";
                } else if (row.alignment_level === "Limited Evidence") {
                  badgeBg = "#fef9c3"; badgeColor = "#854d0e"; badgeBorder = "#fde047";
                } else { // No Evidence Found
                  badgeBg = "#fee2e2"; badgeColor = "#991b1b"; badgeBorder = "#fca5a5";
                }

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f4f4f6' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: '#09090b' }}>
                      {row.job_requirement}
                    </td>
                    <td style={{ padding: '14px', color: '#334155', lineHeight: 1.5 }}>
                      <div>{row.resume_evidence}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        Source: <strong>{row.evidence_source}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          border: `1px solid ${badgeBorder}`,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }}>
                          {row.alignment_level}
                        </span>

                        <span style={{
                          backgroundColor: row.is_demonstrated ? '#e0e7ff' : '#f1f5f9',
                          color: row.is_demonstrated ? '#3730a3' : '#475569',
                          border: `1px solid ${row.is_demonstrated ? '#c7d2fe' : '#cbd5e1'}`,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: 600
                        }}>
                          {row.is_demonstrated ? '✓ Skill Demonstrated' : 'Mentioned Only'}
                        </span>

                        {row.has_measurable_impact && (
                          <span style={{
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #fde68a',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '10px',
                            fontWeight: 600
                          }}>
                            ★ Metric Impact
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: '#475569', fontSize: '12px', lineHeight: 1.5 }}>
                      {row.recommendation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Strengths & Areas to Strengthen Card Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Your Strengths */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #bbf7d0',
          borderRadius: '18px',
          padding: '24px'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#166534', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#166534" />
            Your Strengths
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {safeArray<NormalizedStrengthItem>(currentAnalysis.strengths).map((st, idx) => (
              <div key={idx} style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#14532d', marginBottom: '4px' }}>
                  ✓ {st.title}
                </div>
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                  {st.description}
                </div>
                <div style={{ fontSize: '11px', color: '#166534', marginTop: '6px', fontWeight: 500 }}>
                  <strong>Why relevant:</strong> {st.relevance_reason}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas to Strengthen */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #fde047',
          borderRadius: '18px',
          padding: '24px'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#854d0e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="#854d0e" />
            Areas to Strengthen
          </h4>

          {safeArray<NormalizedWeaknessItem>(currentAnalysis.areas_to_strengthen).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {safeArray<NormalizedWeaknessItem>(currentAnalysis.areas_to_strengthen).map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#fef9c3', padding: '14px', borderRadius: '12px', border: '1px solid #fef08a' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#713f12', marginBottom: '4px' }}>
                    ✎ {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                    {item.description}
                  </div>
                  <div style={{ fontSize: '11px', color: '#854d0e', marginTop: '6px', fontWeight: 500 }}>
                    <strong>Why it matters:</strong> {item.impact_explanation}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#854d0e' }}>All primary requirements have strong baseline evidence.</div>
          )}
        </div>

      </div>

      {/* 6. Missing Evidence Section */}
      {safeArray<NormalizedMissingItem>(currentAnalysis.missing_evidence).length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #fca5a5',
          borderRadius: '18px',
          padding: '24px'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#991b1b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#991b1b" />
            Missing or Underrepresented Requirements
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
            {safeArray<NormalizedMissingItem>(currentAnalysis.missing_evidence).map((item, idx) => (
              <div key={idx} style={{ backgroundColor: '#fee2e2', padding: '14px', borderRadius: '12px', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#7f1d1d', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: '#450a0a', lineHeight: 1.5, marginBottom: '6px' }}>
                  {item.requirement}
                </div>
                <div style={{ fontSize: '11px', color: '#991b1b', backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', fontWeight: 500 }}>
                  <strong>Recommendation:</strong> {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Prioritized 4-Part Recommendations Grid (High, Medium, Optional) */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '18px',
        padding: '24px 28px'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#000', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="#eab308" />
          Prioritized Resume Improvement Recommendations
        </h3>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
          Categorized by High, Medium, and Optional priority. Includes explicit advice for truthful resume enhancement.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {safeArray<NormalizedExplainableRec>(currentAnalysis.highest_priority_improvements).map((rec, idx) => {
            let prioBg = "#fee2e2"; let prioColor = "#991b1b"; let prioBorder = "#fca5a5";
            if (rec.priority === "Medium Priority") {
              prioBg = "#fef3c7"; prioColor = "#92400e"; prioBorder = "#fde68a";
            } else if (rec.priority === "Optional") {
              prioBg = "#f4f4f6"; prioColor = "#555"; prioBorder = "#e4e4e7";
            }

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#fafafa',
                  border: '1px solid #e4e4e7',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e4e4e7', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#09090b' }}>
                    {rec.weakness_title}
                  </span>
                  <span style={{
                    backgroundColor: prioBg,
                    color: prioColor,
                    border: `1px solid ${prioBorder}`,
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 700
                  }}>
                    {rec.priority}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <strong style={{ color: '#09090b' }}>1. What did the AI find?</strong><br />
                  {rec.what_ai_found}
                </div>

                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <strong style={{ color: '#09090b' }}>2. Why does it matter for this job?</strong><br />
                  {rec.why_it_matters}
                </div>

                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <strong style={{ color: '#09090b' }}>3. Where is the evidence in your resume?</strong><br />
                  <span style={{ color: '#64748b' }}>{rec.where_is_evidence}</span>
                </div>

                <div style={{ fontSize: '12px', color: '#09090b', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px' }}>
                  <strong>4. What should you improve?</strong><br />
                  {rec.what_to_improve}
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Info size={12} color="#64748b" />
                  <span>{rec.truthfulness_note}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Potentially Relevant Roles Based on Demonstrated Evidence */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '18px',
        padding: '24px 28px'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#000', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="#2563eb" />
          Potentially Relevant Roles Based on Demonstrated Evidence
        </h3>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
          These alternative occupations align with skills and qualifications demonstrated in your resume. Use these insights to explore career pathways—not candidate ranking.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#fafafa', border: '1px solid #e4e4e7', borderRadius: '14px', padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginBottom: '4px' }}>
              {jobContext.normalized_occupation || jobTitle}
            </div>
            <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, marginBottom: '8px' }}>
              Primary Target Occupation ({jobContext.industry})
            </div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>
              Current target role alignment: <strong>{jobAlignment.requirement_coverage}</strong> across key requirements.
            </div>
          </div>

          <div style={{ backgroundColor: '#fafafa', border: '1px solid #e4e4e7', borderRadius: '14px', padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginBottom: '4px' }}>
              Systems & Data Engineer
            </div>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600, marginBottom: '8px' }}>
              Adjacent Career Opportunity
            </div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>
              Strong demonstrated overlap in technical architecture, database systems, and backend development.
            </div>
          </div>

          <div style={{ backgroundColor: '#fafafa', border: '1px solid #e4e4e7', borderRadius: '14px', padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginBottom: '4px' }}>
              Technical Product Specialist
            </div>
            <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: 600, marginBottom: '8px' }}>
              Cross-Functional Option
            </div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>
              Relevant evidence in technical communication, requirement execution, and product delivery.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
