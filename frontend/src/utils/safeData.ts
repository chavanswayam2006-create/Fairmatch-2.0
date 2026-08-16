/**
 * Safe Data Access & Normalization Utilities
 * Universal data normalization supporting ISCO-08/ESCO taxonomies, requirement matrices, and dual-dimension metrics.
 */

export function safeArray<T>(val: any, fallback: T[] = []): T[] {
  if (Array.isArray(val)) return val;
  return fallback;
}

export function safeObject(val: any, fallback: Record<string, any> = {}): Record<string, any> {
  if (val && typeof val === 'object' && !Array.isArray(val)) return val;
  return fallback;
}

export function safeString(val: any, fallback: string = ''): string {
  if (typeof val === 'string') return val;
  if (val !== null && val !== undefined) return String(val);
  return fallback;
}

export function safeNumber(val: any, fallback: number = 0): number {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
}

export interface NormalizedJobContext {
  job_title: string;
  normalized_occupation: string;
  isco_code: string;
  industry: string;
  seniority: string;
  employment_type: string;
}

export interface NormalizedResumeQuality {
  structure_clarity: string;
  achievement_orientation: string;
  formatting_consistency: string;
  evidence_depth: string;
}

export interface NormalizedJobAlignment {
  requirement_coverage: string;
  domain_fit: string;
  relevant_experience: string;
}

export interface NormalizedRequirementItem {
  job_requirement: string;
  resume_evidence: string;
  evidence_source: string;
  alignment_level: string;
  is_demonstrated: boolean;
  has_measurable_impact: boolean;
  recommendation: string;
  evidence_details: string;
}

export interface NormalizedStrengthItem {
  title: string;
  description: string;
  relevance_reason: string;
}

export interface NormalizedWeaknessItem {
  title: string;
  description: string;
  impact_explanation: string;
}

export interface NormalizedMissingItem {
  title: string;
  requirement: string;
  recommendation: string;
}

export interface NormalizedExplainableRec {
  priority: string;
  weakness_title: string;
  what_ai_found: string;
  why_it_matters: string;
  where_is_evidence: string;
  what_to_improve: string;
  truthfulness_note: string;
}

export interface NormalizedCandidateAnalysis {
  resume_id: string;
  candidate_name: string;
  job_context: NormalizedJobContext;
  overall_understanding: string;
  match_overview: string;
  resume_quality: NormalizedResumeQuality;
  job_alignment: NormalizedJobAlignment;
  strengths: NormalizedStrengthItem[];
  areas_to_strengthen: NormalizedWeaknessItem[];
  missing_evidence: NormalizedMissingItem[];
  highest_priority_improvements: NormalizedExplainableRec[];
  requirement_table: NormalizedRequirementItem[];
}

export interface NormalizedMatchRunResponse {
  run_id: string;
  job_id: string;
  job_title: string;
  candidate_count: number;
  results: NormalizedCandidateAnalysis[];
  created_at: string;
}

export function normalizeCandidateAnalysis(raw: any): NormalizedCandidateAnalysis {
  const obj = safeObject(raw);
  const jc = safeObject(obj.job_context);
  const rq = safeObject(obj.resume_quality);
  const ja = safeObject(obj.job_alignment);
  
  return {
    resume_id: safeString(obj.resume_id, `res_${Math.random().toString(36).substring(2, 9)}`),
    candidate_name: safeString(obj.candidate_name, 'Candidate'),
    job_context: {
      job_title: safeString(jc.job_title, 'Target Role'),
      normalized_occupation: safeString(jc.normalized_occupation, 'Professional Services'),
      isco_code: safeString(jc.isco_code, 'ISCO-08 Major Group 2'),
      industry: safeString(jc.industry, 'General Industry'),
      seniority: safeString(jc.seniority, 'Mid-Level'),
      employment_type: safeString(jc.employment_type, 'Full-time')
    },
    overall_understanding: safeString(obj.overall_understanding, 'Classification: ISCO-08 Professional Services'),
    match_overview: safeString(
      obj.match_overview,
      'Your resume is being analyzed against the requirements of your selected job, not ranked against other candidates.'
    ),
    resume_quality: {
      structure_clarity: safeString(rq.structure_clarity, 'Well Structured'),
      achievement_orientation: safeString(rq.achievement_orientation, 'Descriptive'),
      formatting_consistency: safeString(rq.formatting_consistency, 'Consistent'),
      evidence_depth: safeString(rq.evidence_depth, 'Substantial Evidence')
    },
    job_alignment: {
      requirement_coverage: safeString(ja.requirement_coverage, 'Requirements Aligned'),
      domain_fit: safeString(ja.domain_fit, 'Direct Alignment'),
      relevant_experience: safeString(ja.relevant_experience, 'Demonstrated')
    },
    strengths: safeArray(obj.strengths).map((s: any) => ({
      title: safeString(s?.title, 'Key Capability'),
      description: safeString(s?.description, 'Demonstrated relevance to job requirements.'),
      relevance_reason: safeString(s?.relevance_reason, 'Relevant for role baseline.')
    })),
    areas_to_strengthen: safeArray(obj.areas_to_strengthen).map((w: any) => ({
      title: safeString(w?.title, 'Requirement Context'),
      description: safeString(w?.description, 'Provides partial evidence in resume.'),
      impact_explanation: safeString(w?.impact_explanation, 'Additional context strengthens recruiter evaluation.')
    })),
    missing_evidence: safeArray(obj.missing_evidence).map((m: any) => ({
      title: safeString(m?.title, 'Underrepresented Area'),
      requirement: safeString(m?.requirement, 'Requirement listed in job description.'),
      recommendation: safeString(m?.recommendation, 'Document practical projects or coursework if applicable.')
    })),
    highest_priority_improvements: safeArray(obj.highest_priority_improvements).map((r: any) => ({
      priority: safeString(r?.priority, 'High Priority'),
      weakness_title: safeString(r?.weakness_title, 'Resume Improvement'),
      what_ai_found: safeString(r?.what_ai_found, 'Found limited or implicit evidence.'),
      why_it_matters: safeString(r?.why_it_matters, 'Key technical requirement for position.'),
      where_is_evidence: safeString(r?.where_is_evidence, 'Implicit in resume text.'),
      what_to_improve: safeString(r?.what_to_improve, 'Add descriptive bullet points detailing hands-on implementation.'),
      truthfulness_note: safeString(r?.truthfulness_note, 'Ensure all added statements represent truthful, authentic experience.')
    })),
    requirement_table: safeArray(obj.requirement_table).map((req: any) => ({
      job_requirement: safeString(req?.job_requirement, 'Job Requirement'),
      resume_evidence: safeString(req?.resume_evidence, 'No direct evidence found.'),
      evidence_source: safeString(req?.evidence_source, 'Experience'),
      alignment_level: safeString(req?.alignment_level, 'No Evidence Found'),
      is_demonstrated: Boolean(req?.is_demonstrated ?? true),
      has_measurable_impact: Boolean(req?.has_measurable_impact ?? false),
      recommendation: safeString(req?.recommendation, 'Consider highlighting project experience.'),
      evidence_details: safeString(req?.evidence_details, 'Category: Requirement')
    }))
  };
}

export function normalizeMatchRunResponse(raw: any): NormalizedMatchRunResponse {
  const obj = safeObject(raw);

  const rawResults = safeArray(obj.results);
  const normalizedResults = rawResults.length > 0
    ? rawResults.map(normalizeCandidateAnalysis)
    : [normalizeCandidateAnalysis({})];

  return {
    run_id: safeString(obj.run_id, `run_${Math.random().toString(36).substring(2, 9)}`),
    job_id: safeString(obj.job_id, 'job_default'),
    job_title: safeString(obj.job_title, 'Target Position'),
    candidate_count: safeNumber(obj.candidate_count, normalizedResults.length),
    results: normalizedResults,
    created_at: safeString(obj.created_at, new Date().toISOString())
  };
}
