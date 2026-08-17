import React, { useState, useEffect } from 'react';
import { ResumeAnalysisView } from './ResumeAnalysisView';
import { FileUploadView } from './FileUploadView';
import { AuditHistoryView } from './AuditHistoryView';
import { ShieldCheck, Play, FileText, History, ArrowLeft, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { normalizeMatchRunResponse, NormalizedMatchRunResponse } from '../utils/safeData';

interface FairMatchDashboardProps {
  onBackToHero: () => void;
  onOpenAbout: () => void;
  onExploreJobs?: () => void;
  libraryJob?: any;
  onClearLibraryJob?: () => void;
}

export type WorkflowStep = 'idle' | 'testing' | 'decoding' | 'analyzing' | 'building' | 'success' | 'error';

export const FairMatchDashboard: React.FC<FairMatchDashboardProps> = ({ onBackToHero, onOpenAbout, onExploreJobs, libraryJob, onClearLibraryJob }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'results' | 'history'>('upload');
  const [workflowState, setWorkflowState] = useState<WorkflowStep>('idle');
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [currentRunData, setCurrentRunData] = useState<NormalizedMatchRunResponse | null>(null);
  const [historyRuns, setHistoryRuns] = useState<any[]>([]);

  // Fetch historical runs on load
  const fetchRunsHistory = async () => {
    try {
      const res = await fetch('/api/v1/runs', {
        headers: { 'X-API-Key': 'fairmatch-secret-key' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setHistoryRuns(data);
        }
      }
    } catch (e) {
      console.error("Error fetching runs:", e);
    }
  };

  useEffect(() => {
    fetchRunsHistory();
  }, []);

  const handleRunMatch = async (jobId: string, files: File[], textResumes: string[]) => {
    setWorkflowError(null);
    
    // Workflow Step 1: Testing & Ingestion Validation
    setWorkflowState('testing');

    try {
      // Workflow Step 2: Decoding files and parsing text
      setWorkflowState('decoding');
      const resumeIds: string[] = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/v1/resumes', {
          method: 'POST',
          headers: { 'X-API-Key': 'fairmatch-secret-key' },
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData && uploadData.id) resumeIds.push(uploadData.id);
        }
      }

      const customResumes = textResumes.map((txt, idx) => ({
        candidate_name: `Candidate ${idx + 1}`,
        raw_text: txt
      }));

      // Workflow Step 3: Analyzing job requirements & matching evidence
      setWorkflowState('analyzing');
      const matchRes = await fetch('/api/v1/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'fairmatch-secret-key'
        },
        body: JSON.stringify({
          job_id: jobId,
          resume_ids: resumeIds.length > 0 ? resumeIds : undefined,
          custom_resumes: customResumes.length > 0 ? customResumes : undefined
        })
      });

      if (!matchRes.ok) {
        const errJson = await matchRes.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server responded with status ${matchRes.status}`);
      }

      // Workflow Step 4: Building personalized report
      setWorkflowState('building');
      const rawRunData = await matchRes.json();
      
      // Normalize response data to eliminate missing field white-screens
      const normalizedData = normalizeMatchRunResponse(rawRunData);
      setCurrentRunData(normalizedData);

      fetchRunsHistory();
      setWorkflowState('success');
      setActiveTab('results');
    } catch (err: any) {
      console.error("Workflow Analysis Error:", err);
      setWorkflowError(err.message || 'Unable to complete job analysis. Please verify inputs and try again.');
      setWorkflowState('error');
    }
  };

  const handleSelectHistoryRun = async (runId: string) => {
    setWorkflowState('analyzing');
    setWorkflowError(null);
    try {
      const runRes = await fetch(`/api/v1/runs/${runId}`, {
        headers: { 'X-API-Key': 'fairmatch-secret-key' }
      });

      if (!runRes.ok) {
        throw new Error(`Failed to load analysis detail (Status ${runRes.status})`);
      }

      const rData = await runRes.json();
      const normalizedData = normalizeMatchRunResponse(rData);
      setCurrentRunData(normalizedData);

      setWorkflowState('success');
      setActiveTab('results');
    } catch (e: any) {
      console.error("Error loading run detail:", e);
      setWorkflowError(e.message || 'Failed to load historical analysis run.');
      setWorkflowState('error');
    }
  };

  const isProcessing = ['testing', 'decoding', 'analyzing', 'building'].includes(workflowState);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fcfcfd',
      color: '#09090b',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Top Header Navbar */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e4e4e7',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBackToHero}
            className="btn-outline"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <ArrowLeft size={14} /> Back to Hero
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              onClick={onOpenAbout}
              title="Click to view Platform Details"
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <rect x="6" y="8" width="16" height="8" rx="4" transform="rotate(-35 6 8)" fill="#000000" />
                <rect x="12" y="14" width="16" height="8" rx="4" transform="rotate(-35 12 14)" fill="#000000" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', userSelect: 'none' }}>
              FairMatch Analysis Engine
            </span>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f4f4f6', padding: '4px', borderRadius: '9999px' }}>
          <TabButton
            active={activeTab === 'upload'}
            onClick={() => { setActiveTab('upload'); setWorkflowError(null); }}
            icon={<Play size={13} />}
            label="New Analysis"
          />
          <TabButton
            active={activeTab === 'results'}
            onClick={() => setActiveTab('results')}
            icon={<FileText size={13} />}
            label="Job Analysis Results"
            disabled={!currentRunData}
          />
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            icon={<History size={13} />}
            label="Saved Analyses"
          />
        </div>
      </header>

      {/* Main Tab View Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }} role="main">
        
        {/* Workflow Processing Stepper Overlay */}
        {isProcessing && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Executing Job Analysis Pipeline</h3>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
              <StepBadge step="1. Testing Input" active={workflowState === 'testing'} done={['decoding', 'analyzing', 'building'].includes(workflowState)} />
              <StepBadge step="2. Decoding Resume" active={workflowState === 'decoding'} done={['analyzing', 'building'].includes(workflowState)} />
              <StepBadge step="3. Analyzing Evidence" active={workflowState === 'analyzing'} done={['building'].includes(workflowState)} />
              <StepBadge step="4. Building Report" active={workflowState === 'building'} done={false} />
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Workflow Error Message Display */}
        {workflowState === 'error' && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            color: '#991b1b'
          }} role="alert">
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>Analysis Could Not Be Completed</strong>
              <span style={{ fontSize: '13px', lineHeight: 1.5 }}>{workflowError}</span>
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={() => { setWorkflowState('idle'); setActiveTab('upload'); }}
                  className="btn-black"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  <RefreshCw size={12} /> Retry Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <FileUploadView onRunMatch={handleRunMatch} isLoading={isProcessing} libraryJob={libraryJob} onExploreJobs={onExploreJobs} onClearLibraryJob={onClearLibraryJob} />
        )}

        {activeTab === 'results' && currentRunData && (
          <div>
            <div
              style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: '12px',
                padding: '12px 18px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              role="status"
              aria-live="polite"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#166534" />
                <span>Job-specific evidence analysis completed successfully! Review your insights below.</span>
              </div>
            </div>

            <ResumeAnalysisView
              runData={currentRunData}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <AuditHistoryView
            runs={historyRuns}
            onSelectRun={handleSelectHistoryRun}
          />
        )}
      </main>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}> = ({ active, onClick, icon, label, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      borderRadius: '9999px',
      border: 'none',
      fontSize: '12px',
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      backgroundColor: active ? '#ffffff' : 'transparent',
      color: active ? '#000000' : '#666666',
      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
    }}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StepBadge: React.FC<{ step: string; active: boolean; done: boolean }> = ({ step, active, done }) => (
  <span style={{
    fontSize: '11px',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: '9999px',
    backgroundColor: active ? '#2563eb' : done ? '#dcfce7' : '#f4f4f6',
    color: active ? '#ffffff' : done ? '#166534' : '#888888',
    border: active ? '1px solid #1d4ed8' : done ? '1px solid #86efac' : '1px solid #e4e4e7'
  }}>
    {done ? '✓ ' : ''}{step}
  </span>
);
