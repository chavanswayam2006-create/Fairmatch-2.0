import React, { useState, useEffect } from 'react';

export interface FairMatchWidgetProps {
  apiBaseUrl?: string;
  apiKey?: string;
  jobId?: string;
  themeColor?: string;
  onMatchComplete?: (data: any) => void;
}

export const FairMatchWidget: React.FC<FairMatchWidgetProps> = ({
  apiBaseUrl = 'http://127.0.0.1:8000',
  apiKey = 'fairmatch-secret-key',
  jobId = 'job_demo_01',
  themeColor = '#000000',
  onMatchComplete
}) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ job_id: jobId })
      });
      const data = await res.json();
      if (data.results) {
        setCandidates(data.results);
        if (onMatchComplete) onMatchComplete(data);
      }
    } catch (e) {
      console.error("Widget API match error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [jobId]);

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      border: '1px solid #e4e4e7',
      borderRadius: '12px',
      padding: '20px',
      backgroundColor: '#ffffff',
      maxWidth: '480px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: themeColor }} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>FairMatch Embedded Engine</span>
        </div>
        <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Audited & Explainable</span>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
          Scoring Candidates with XGBoost & SHAP...
        </div>
      ) : candidates.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
          No match candidates scored yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {candidates.slice(0, 3).map((c: any) => (
            <div key={c.resume_id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              backgroundColor: '#f9f9fb',
              borderRadius: '8px',
              border: '1px solid #eee'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#111' }}>{c.candidate_name}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  Skill Overlap: {(c.skill_overlap * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{
                backgroundColor: themeColor,
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {c.final_score.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default FairMatchWidget;
