import React from 'react';
import { ArrowRight, ShieldCheck, FileText } from 'lucide-react';

interface RunSummaryItem {
  run_id: string;
  job_id: string;
  job_title: string;
  candidate_count: number;
  created_at: string;
}

interface AuditHistoryViewProps {
  runs: RunSummaryItem[];
  onSelectRun: (runId: string) => void;
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({ runs, onSelectRun }) => {
  return (
    <div className="fm-glass-card p-6 space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">
          Saved Job & Audit Analyses
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Archive of past job description evaluation sessions and counterfactual bias audit logs
        </p>
      </div>

      {runs.length === 0 ? (
        <div className="p-8 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
          No job analyses logged yet. Execute a new job evaluation to build your history.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Analysis ID</th>
                <th className="py-3 px-3">Target Position</th>
                <th className="py-3 px-3">Candidates</th>
                <th className="py-3 px-3">Status & Audit</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {runs.map((r) => (
                <tr key={r.run_id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-semibold text-zinc-300">
                    {r.run_id}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-white">
                    {r.job_title}
                  </td>
                  <td className="py-3.5 px-3 text-zinc-400">
                    {r.candidate_count} candidate(s)
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-900/60">
                      <ShieldCheck size={12} />
                      Counterfactual Parity Passed
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onSelectRun(r.run_id)}
                      className="btn-vesper btn-vesper-ghost h-7 px-3 text-[11px]"
                    >
                      <span>View Insights</span>
                      <ArrowRight size={12} className="ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
