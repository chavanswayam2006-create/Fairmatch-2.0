import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Play, Plus, Trash2, AlertCircle, Loader2, Globe, Sparkles, X, Layers, MapPin } from 'lucide-react';
import { analytics } from '../utils/analytics';

interface FileUploadViewProps {
  onRunMatch: (jobId: string, resumeFiles: File[], rawResumesText: string[]) => void;
  isLoading: boolean;
  libraryJob?: any;
  onExploreJobs?: () => void;
  onClearLibraryJob?: () => void;
}

export const FileUploadView: React.FC<FileUploadViewProps> = ({
  onRunMatch,
  isLoading,
  libraryJob,
  onExploreJobs,
  onClearLibraryJob
}) => {
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

  // Sync state if a job was selected from the Global Job Library
  useEffect(() => {
    if (libraryJob) {
      setJobTitle(libraryJob.title || libraryJob.normalized_title || 'Selected Job');
      const reqsText = Array.isArray(libraryJob.required_skills) ? libraryJob.required_skills.join(', ') : '';
      const prefText = Array.isArray(libraryJob.preferred_skills) ? libraryJob.preferred_skills.join(', ') : '';
      const respText = Array.isArray(libraryJob.responsibilities) ? libraryJob.responsibilities.join('\n- ') : '';
      
      const fullText = `${libraryJob.description || ''}

Industry: ${libraryJob.industry || 'General'}
Seniority: ${libraryJob.seniority || 'Mid-Level'}
Education: ${libraryJob.education || "Bachelor's"}

Required Skills:
${reqsText}

Preferred Skills:
${prefText}

Key Responsibilities:
- ${respText}`;

      setJobText(fullText.trim());
      setFormError(null);
    }
  }, [libraryJob]);

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

      {/* 1. Job Description Inputs & Global Library Connection */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>1. Job Description</h3>
          {onExploreJobs && (
            <button
              onClick={onExploreJobs}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                border: '1px solid #bfdbfe',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Globe size={13} color="#2563eb" /> Select from Job Library
            </button>
          )}
        </div>

        {/* Library Job Selected Badge Banner */}
        {libraryJob && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: '#166534'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#166534" />
              <div>
                <strong>Selected from Job Library:</strong> {libraryJob.title} ({libraryJob.industry})
              </div>
            </div>
            {onClearLibraryJob && (
              <button
                onClick={onClearLibraryJob}
                title="Clear library selection and enter custom job description"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#166534',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        
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
            placeholder="Paste role requirements, key skills, responsibilities, and qualifications or select from Global Job Library..."
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
              style={{
                display: 'inline-block',
                marginTop: '12px',
                padding: '6px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Browse Files
            </label>
          </div>

          {/* Selected File Badges */}
          {resumeFiles.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>
                Uploaded Resume Files ({resumeFiles.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {resumeFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4f4f6', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="#555" />
                      <span>{f.name}</span>
                    </div>
                    <Trash2 size={14} color="#dc2626" style={{ cursor: 'pointer' }} onClick={() => setResumeFiles(prev => prev.filter((_, idx) => idx !== i))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paste Raw Text Resumes Section */}
          <div style={{ borderTop: '1px solid #f4f4f6', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>
              Or Paste Resume Text
            </div>
            <textarea
              rows={4}
              value={pastedInput}
              onChange={e => setPastedInput(e.target.value)}
              placeholder="Paste candidate resume text here..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e4e4e7',
                fontSize: '12px',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={addPastedResume}
              disabled={!pastedInput.trim()}
              style={{
                marginTop: '8px',
                padding: '6px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Plus size={14} /> Add Text Resume
            </button>

            {pastedResumes.length > 0 && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                ✓ {pastedResumes.length} text resume(s) added
              </div>
            )}
          </div>
        </div>

        {/* Start Job Analysis Action Button */}
        <button
          onClick={handleStartMatching}
          disabled={isLoading}
          style={{
            width: '100%',
            backgroundColor: '#000000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing Job Fit...</span>
            </>
          ) : (
            <>
              <Play size={16} fill="#fff" />
              <span>Run Job-Specific Analysis</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
