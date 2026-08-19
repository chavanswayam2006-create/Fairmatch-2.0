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
    <div className="space-y-7 py-2">
      {/* Fairness Status Banner */}
      <div className={`fm-glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        auditData.flagged ? 'border-red-900/60 bg-red-950/20' : 'border-emerald-900/60 bg-emerald-950/20'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${
            auditData.flagged ? 'bg-red-900/40 border border-red-800' : 'bg-emerald-900/40 border border-emerald-800'
          }`}>
            {auditData.flagged ? <AlertTriangle size={24} className="text-red-400" /> : <ShieldCheck size={24} className="text-emerald-400" />}
          </div>
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${auditData.flagged ? 'text-red-300' : 'text-emerald-300'}`}>
              {auditData.flagged ? 'Robustness Threshold Exceeded' : 'Fairness & Robustness Audit Passed'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {auditData.flagged
                ? `Candidate variant score gap (${auditData.max_score_gap} pts) exceeds allowable threshold (${auditData.threshold} pts). Compliance review required.`
                : `Formatting and institution variant score gap (${auditData.max_score_gap} pts) is within allowable threshold (${auditData.threshold} pts).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
          <button
            onClick={onRefreshAudit}
            className="btn-vesper btn-vesper-ghost text-xs h-9 px-3"
          >
            <RefreshCw size={14} className="mr-1.5" />
            <span>Re-run Audit</span>
          </button>
          <button
            onClick={exportCSV}
            className="btn-vesper btn-vesper-solid text-xs h-9 px-4"
          >
            <Download size={14} className="mr-1.5" />
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* Audit Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="fm-glass-card p-5 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Formatting Parity Diff</div>
          <div className="text-3xl font-bold text-white">{auditData.demographic_parity_diff.toFixed(2)} pts</div>
          <div className="text-[11px] text-zinc-500">Max score variance across name perturbations</div>
        </div>

        <div className="fm-glass-card p-5 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Selection Rate Ratio (SRR)</div>
          <div className="text-3xl font-bold text-white">{auditData.selection_rate_ratio.toFixed(2)}</div>
          <div className="text-[11px] text-zinc-500">Selection parity ratio (&ge; 0.80 benchmark)</div>
        </div>

        <div className="fm-glass-card p-5 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Max Score Gap</div>
          <div className="text-3xl font-bold text-white">{auditData.max_score_gap.toFixed(1)} pts</div>
          <div className="text-[11px] text-zinc-500">Threshold limit: {auditData.threshold}.0 pts</div>
        </div>
      </div>

      {/* Counterfactual Perturbation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="fm-glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">1. Name Format & Diacritics Perturbation</h3>
          <p className="text-xs text-zinc-400">Evaluates score consistency across hyphenated names, diacritics, and initial mononyms.</p>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nameData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="group" stroke="#9a9a9a" fontSize={11} />
                <YAxis stroke="#9a9a9a" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {nameData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#ffffff" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="fm-glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">2. Institution Prestige Tier Perturbation</h3>
          <p className="text-xs text-zinc-400">Evaluates score consistency across tier-1, tier-2, and unranked universities.</p>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={uniData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="tier" stroke="#9a9a9a" fontSize={11} />
                <YAxis stroke="#9a9a9a" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {uniData.map((_, index) => (
                    <Cell key={`cell-uni-${index}`} fill="#d8d8d8" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
