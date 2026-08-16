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
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e4e4e7',
      borderRadius: '16px',
      padding: '24px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
        Saved Job Analyses
      </h3>
      <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
        Archive of past job description analysis sessions and requirement evidence evaluations
      </p>

      {runs.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
          No job analyses logged yet. Execute a new job analysis to build your history.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e4e4e7', color: '#666' }}>
                <th style={{ padding: '12px' }}>Analysis ID</th>
                <th style={{ padding: '12px' }}>Target Job Position</th>
                <th style={{ padding: '12px' }}>Resumes Analyzed</th>
                <th style={{ padding: '12px' }}>Analysis Type</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.run_id} style={{ borderBottom: '1px solid #f4f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: 600, fontFamily: 'monospace' }}>
                    {r.run_id}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 500 }}>
                    {r.job_title}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {r.candidate_count} resume(s)
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }}>
                      <ShieldCheck size={12} />
                      Job-Specific Fit Analysis
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => onSelectRun(r.run_id)}
                      className="btn-outline"
                      style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      View Insights <ArrowRight size={11} />
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
