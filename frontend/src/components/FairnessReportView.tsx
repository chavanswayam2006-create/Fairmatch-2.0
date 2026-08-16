import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { AlertTriangle, ShieldCheck, Download, RefreshCw } from 'lucide-react';

interface BiasAuditData {
  audit_id: string;
  run_id: string;
  demographic_parity_diff: number;
  selection_rate_ratio: number;
  max_score_gap: number;
  flagged: boolean;
  threshold: number;
  name_group_scores: Record<string, number>;
  university_tier_scores: Record<string, number>;
  employment_gap_scores: Record<string, number>;
  detailed_variants: Array<{
    base_candidate: string;
    variant_type: string;
    group: string;
    variant_val: string;
    score: number;
  }>;
}

interface FairnessReportViewProps {
  auditData: BiasAuditData;
  onRefreshAudit: () => void;
}

export const FairnessReportView: React.FC<FairnessReportViewProps> = ({ auditData, onRefreshAudit }) => {
  // Format data for Recharts
  const nameData = Object.entries(auditData.name_group_scores).map(([group, score]) => ({
    group,
    score
  }));

  const uniData = Object.entries(auditData.university_tier_scores).map(([tier, score]) => ({
    tier,
    score
  }));

  const gapData = Object.entries(auditData.employment_gap_scores).map(([label, score]) => ({
    label,
    score
  }));

  const exportCSV = () => {
    const headers = ["Base Candidate", "Variant Type", "Group", "Variant Name", "Score"];
    const rows = auditData.detailed_variants.map(v => [
      `"${v.base_candidate}"`,
      `"${v.variant_type}"`,
      `"${v.group}"`,
      `"${v.variant_val}"`,
      v.score
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fairmatch_audit_run_${auditData.run_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. Fairness Status Header & Download Actions */}
      <div style={{
        backgroundColor: auditData.flagged ? '#fff5f5' : '#f0fdf4',
        border: `1px solid ${auditData.flagged ? '#fca5a5' : '#86efac'}`,
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: auditData.flagged ? '#ef4444' : '#10b981',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {auditData.flagged ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: auditData.flagged ? '#991b1b' : '#166534' }}>
              {auditData.flagged ? 'Robustness Threshold Exceeded' : 'Fairness & Robustness Audit Passed'}
            </h2>
            <p style={{ fontSize: '13px', color: auditData.flagged ? '#7f1d1d' : '#14532d', marginTop: '2px' }}>
              {auditData.flagged
                ? `Candidate variant score gap (${auditData.max_score_gap} pts) exceeds threshold (${auditData.threshold} pts). Compliance review required.`
                : `Formatting and institution variant score gap (${auditData.max_score_gap} pts) is within allowable threshold (${auditData.threshold} pts).`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onRefreshAudit} className="btn-outline">
            <RefreshCw size={14} /> Re-run Test
          </button>
          <button onClick={exportCSV} className="btn-black">
            <Download size={14} /> Export Audit Log (.CSV)
          </button>
        </div>
      </div>

      {/* 2. Key Fairness Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <MetricCard
          label="Formatting Parity Diff"
          value={`${auditData.demographic_parity_diff} pts`}
          subtext="Max score gap across name structure & unicode variants"
          status={auditData.demographic_parity_diff > 5 ? 'bad' : 'good'}
        />
        <MetricCard
          label="Selection Rate Ratio"
          value={auditData.selection_rate_ratio.toFixed(2)}
          subtext="Disparate Impact ratio (Min group / Max group)"
          status={auditData.selection_rate_ratio < 0.8 ? 'bad' : 'good'}
        />
        <MetricCard
          label="Max Score Gap"
          value={`${auditData.max_score_gap} pts`}
          subtext={`Configured threshold: ${auditData.threshold} pts`}
          status={auditData.max_score_gap > auditData.threshold ? 'bad' : 'good'}
        />
        <MetricCard
          label="Audited Counterfactuals"
          value={auditData.detailed_variants.length.toString()}
          subtext="Synthetic format, tier & career gap perturbations"
          status="neutral"
        />
      </div>

      {/* 3. Recharts Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Name Formatting Structure Group Scores Chart */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e4e4e7',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
            Name & Formatting Structure Group Scores
          </h3>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
            Average match score when swapping candidate name formats & diacritics
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={nameData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="group" tick={{ fontSize: 11 }} angle={-10} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => [`${value} pts`, 'Avg Score']} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {nameData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#000000' : '#444444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* University Prestige Tier Chart */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e4e4e7',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
            Education Tier & Institution Score Impact
          </h3>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
            Score comparison across Research Univ vs State College vs Technical Institute vs Bootcamp
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={uniData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="tier" tick={{ fontSize: 11 }} angle={-10} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => [`${value} pts`, 'Avg Score']} />
                <Bar dataKey="score" fill="#111111" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Detailed Audit Log Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          Counterfactual Audit Log Details
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e4e4e7', color: '#666' }}>
                <th style={{ padding: '10px' }}>Base Candidate</th>
                <th style={{ padding: '10px' }}>Variant Type</th>
                <th style={{ padding: '10px' }}>Group / Category</th>
                <th style={{ padding: '10px' }}>Tested Variant Value</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Predicted Score</th>
              </tr>
            </thead>
            <tbody>
              {auditData.detailed_variants.slice(0, 15).map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f4f4f6' }}>
                  <td style={{ padding: '10px', fontWeight: 500 }}>{row.base_candidate}</td>
                  <td style={{ padding: '10px' }}>{row.variant_type}</td>
                  <td style={{ padding: '10px' }}>{row.group}</td>
                  <td style={{ padding: '10px', color: '#555' }}>{row.variant_val}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>{row.score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; subtext: string; status: 'good' | 'bad' | 'neutral' }> = ({
  label, value, subtext, status
}) => (
  <div style={{
    backgroundColor: '#ffffff',
    border: '1px solid #e4e4e7',
    borderRadius: '14px',
    padding: '18px'
  }}>
    <div style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {label}
    </div>
    <div style={{
      fontSize: '26px',
      fontWeight: 700,
      margin: '6px 0',
      color: status === 'bad' ? '#dc2626' : status === 'good' ? '#16a34a' : '#000000'
    }}>
      {value}
    </div>
    <div style={{ fontSize: '11px', color: '#777' }}>
      {subtext}
    </div>
  </div>
);

