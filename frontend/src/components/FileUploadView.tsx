import React, { useState } from 'react';
import { UploadCloud, FileText, Play, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { analytics } from '../utils/analytics';

interface FileUploadViewProps {
  onRunMatch: (jobId: string, resumeFiles: File[], rawResumesText: string[]) => void;
  isLoading: boolean;
}

export const FileUploadView: React.FC<FileUploadViewProps> = ({ onRunMatch, isLoading }) => {
  const [jobTitle, setJobTitle] = useState('Senior Full-Stack AI Engineer');
  const [jobText, setJobText] = useState(`We are seeking an experienced Senior Full-Stack Engineer with 5+ years experience.
Key Requirements:
- Python, FastAPI, React, TypeScript, PostgreSQL, SQL, Docker, AWS.
- Machine Learning models (Scikit-learn, XGBoost) and NLP libraries (spaCy, Sentence-Transformers).
- Strong understanding of REST APIs, system design, and AI explainability (SHAP/Fairlearn).
- Bachelor's degree in Computer Science or Data Science.`);

  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [pastedResumes, setPastedResumes] = useState<string[]>([]);
  const [pastedInput, setPastedInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setResumeFiles(prev => [...prev, ...files]);
      setFormError(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setResumeFiles(prev => [...prev, ...files]);
      setFormError(null);
    }
  };

  const addPastedResume = () => {
    if (pastedInput.trim()) {
      setPastedResumes(prev => [...prev, pastedInput.trim()]);
      setPastedInput('');
      setFormError(null);
    }
  };

  const handleStartMatching = async () => {
    // Form Validation
    if (!jobTitle.trim()) {
      setFormError('Please enter a target Job Title before proceeding.');
      return;
    }

    if (!jobText.trim() || jobText.trim().length < 20) {
      setFormError('Please provide a descriptive Job Description (at least 20 characters) detailing role requirements.');
      return;
    }

    setFormError(null);
    analytics.formSubmit('job_analysis_initiate');

    try {
      const res = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobTitle,
          raw_text: jobText
        })
      });
      const jobData = await res.json();
      onRunMatch(jobData.id, resumeFiles, pastedResumes);
    } catch (err) {
      console.error("Error creating job:", err);
      onRunMatch('job_demo_01', resumeFiles, pastedResumes);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
      
      {/* Form Error Announcement Banner */}
      {formError && (
        <div
          style={{
            gridColumn: '1 / -1',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: '13px',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
          <div>{formError}</div>
        </div>
      )}

      {/* 1. Job Description Inputs */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>1. Job Description</h3>
        
        <div>
          <label htmlFor="job-title-input" style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>
            Job Title <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            id="job-title-input"
            type="text"
            value={jobTitle}
            onChange={e => { setJobTitle(e.target.value); setFormError(null); }}
            placeholder="e.g. Senior Full-Stack Engineer"
            aria-required="true"
            aria-invalid={!jobTitle.trim()}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #e4e4e7',
              marginTop: '4px',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="job-text-input" style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>
              Job Description Text & Requirements <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <span style={{ fontSize: '11px', color: '#888' }}>
              {jobText.length} characters
            </span>
          </div>
          <textarea
            id="job-text-input"
            rows={10}
            value={jobText}
            onChange={e => { setJobText(e.target.value); setFormError(null); }}
            placeholder="Paste role requirements, key skills, responsibilities, and qualifications..."
            aria-required="true"
            aria-invalid={!jobText.trim() || jobText.trim().length < 20}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e4e4e7',
              marginTop: '4px',
              fontSize: '13px',
              fontFamily: 'inherit',
              lineHeight: '1.5'
            }}
          />
        </div>
      </div>

      {/* 2. Batch Resumes Upload */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
            2. Batch Resume Ingestion
          </h3>

          {/* Drag & Drop File Upload Area */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleFileDrop}
            style={{
              border: '2px dashed #d1d5db',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: '#fafafa',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            <UploadCloud size={32} style={{ color: '#666', marginBottom: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>
              Drag & Drop PDF or DOCX Resumes
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
              Supports PDF, DOCX, and TXT resume files
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              id="file-input-field"
            />
            <label
              htmlFor="file-input-field"
              className="btn-outline"
              style={{ marginTop: '12px', fontSize: '12px', padding: '6px 14px', cursor: 'pointer' }}
            >
              Browse Files
            </label>
          </div>

          {/* Selected Files List */}
          {resumeFiles.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>
                Uploaded File Resumes ({resumeFiles.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                {resumeFiles.map((file, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 10px', backgroundColor: '#f4f4f6', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} />
                      <span>{file.name}</span>
                    </div>
                    <button
                      onClick={() => setResumeFiles(prev => prev.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                      aria-label={`Remove file ${file.name}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Option to Paste Text Resume */}
          <div>
            <label htmlFor="pasted-resume-input" style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>
              Or Paste Resume Text
            </label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <textarea
                id="pasted-resume-input"
                rows={3}
                placeholder="Paste candidate resume plain text..."
                value={pastedInput}
                onChange={e => setPastedInput(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e4e4e7', fontSize: '12px' }}
              />
              <button
                onClick={addPastedResume}
                className="btn-outline"
                style={{ alignSelf: 'flex-end', padding: '8px 12px' }}
                aria-label="Add pasted resume text"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {pastedResumes.length > 0 && (
            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '6px', fontWeight: 500 }}>
              ✓ {pastedResumes.length} plain text resumes queued
            </div>
          )}
        </div>

        {/* Action Button & Loading Skeleton */}
        <div>
          {isLoading ? (
            <div style={{
              backgroundColor: '#f4f4f6',
              border: '1px solid #e4e4e7',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155'
            }}>
              <Loader2 size={18} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing Job Requirements & Evidence...</span>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <button
              onClick={handleStartMatching}
              className="btn-black"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '14px'
              }}
            >
              <Play size={16} fill="white" />
              <span>Start Job-Specific Analysis →</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
