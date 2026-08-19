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

    let jobId = 'job-custom-1';

    try {
      const createJobRes = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'fairmatch-secret-key'
        },
        body: JSON.stringify({
          title: jobTitle,
          raw_text: jobText,
          department: 'Engineering'
        })
      });

      if (createJobRes.ok) {
        const data = await createJobRes.json();
        if (data && data.id) {
          jobId = data.id;
        }
      }
    } catch (err) {
      console.warn("Backend API unavailable, executing local matching pipeline:", err);
    }

    onRunMatch(jobId, resumeFiles, pastedResumes);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
            <Sparkles size={14} className="text-zinc-300" />
            <span>FairMatch Evidence Ingestion Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Job Description & Resume Matcher
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Ingest job descriptions and candidate resumes to analyze skill coverage, experience deltas, and SHAP explainability matrices.
          </p>
        </div>

        {onExploreJobs && (
          <button
            onClick={onExploreJobs}
            className="btn-vesper btn-vesper-ghost text-xs self-start md:self-auto"
          >
            <Globe size={14} className="mr-2" />
            <span>Browse Job Taxonomy</span>
          </button>
        )}
      </div>

      {/* Selected Job Banner */}
      {libraryJob && (
        <div className="fm-glass-card p-4 flex items-center justify-between gap-4 border-zinc-700 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Taxonomy Preset</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">{libraryJob.soc_code || 'O*NET'}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-0.5">{libraryJob.title || libraryJob.normalized_title}</h3>
            </div>
          </div>
          {onClearLibraryJob && (
            <button
              onClick={onClearLibraryJob}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Clear taxonomy preset"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Job Description Setup */}
        <div className="fm-glass-card p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
              <FileText size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">1. Job Requirement Profile</h2>
              <p className="text-xs text-zinc-400">Target position specifications & required skill taxonomy</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Target Job Title</label>
            <input
              type="text"
              className="w-full fm-input"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Job Description & Requirements</label>
            <textarea
              rows={9}
              className="w-full fm-input font-mono text-xs leading-relaxed resize-none"
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste full job description including required skills, years of experience, and responsibilities..."
            />
          </div>
        </div>

        {/* Right Column: Candidate Resume Attachment */}
        <div className="fm-glass-card p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
              <UploadCloud size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">2. Candidate Resumes</h2>
              <p className="text-xs text-zinc-400">Upload PDF / DOCX resumes or paste raw resume text</p>
            </div>
          </div>

          {/* File Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-zinc-800 hover:border-zinc-500 rounded-xl p-6 text-center bg-zinc-950/40 hover:bg-zinc-900/40 transition-all cursor-pointer group"
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <UploadCloud className="mx-auto h-8 w-8 text-zinc-400 group-hover:text-white transition-colors mb-2" />
              <span className="text-sm font-medium text-white block">Drop resume files here or click to browse</span>
              <span className="text-xs text-zinc-500 block mt-1">Supports PDF, DOCX, and TXT files</span>
            </label>
          </div>

          {/* Attached Files List */}
          {resumeFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Attached Documents ({resumeFiles.length})</div>
              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {resumeFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={14} className="text-zinc-400 shrink-0" />
                      <span className="truncate text-zinc-200">{file.name}</span>
                      <span className="text-[10px] text-zinc-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={() => setResumeFiles(prev => prev.filter((_, i) => i !== index))}
                      className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Resume Input Option */}
          <div className="pt-2 border-t border-zinc-850 space-y-2">
            <label className="block text-xs font-medium text-zinc-300">Or Paste Custom Resume Text</label>
            <div className="flex gap-2">
              <textarea
                rows={2}
                className="w-full fm-input font-mono text-xs resize-none"
                placeholder="Paste candidate resume text here..."
                value={pastedInput}
                onChange={(e) => setPastedInput(e.target.value)}
              />
              <button
                type="button"
                onClick={addPastedResume}
                className="btn-vesper btn-vesper-ghost h-auto px-3 shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Pasted Text Resumes List */}
          {pastedResumes.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Custom Text Resumes ({pastedResumes.length})</div>
              {pastedResumes.map((txt, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800 text-xs">
                  <span className="truncate text-zinc-300">Candidate #{idx + 1}: {txt.substring(0, 45)}...</span>
                  <button
                    onClick={() => setPastedResumes(prev => prev.filter((_, i) => i !== idx))}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {formError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0 text-red-400" />
          <span>{formError}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-4 border-t border-zinc-850 pt-6">
        <button
          onClick={handleStartMatching}
          disabled={isLoading}
          className="btn-vesper btn-vesper-solid h-12 px-8 text-sm font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              <span>Analyzing Match & SHAP Attributes...</span>
            </>
          ) : (
            <>
              <Play size={16} className="mr-2 fill-current" />
              <span>Run FairMatch Evaluation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
