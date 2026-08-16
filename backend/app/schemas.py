from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

# Job Schemas
class JobCreate(BaseModel):
    title: str = Field(..., example="Senior Full-Stack Engineer")
    raw_text: str = Field(..., example="We are looking for a Senior Full-Stack Engineer with 5+ years of experience in React, Python, PostgreSQL, and AWS.")
    company: Optional[str] = "Acme Corp"
    min_years_experience: Optional[float] = 5.0
    education_level: Optional[str] = "Bachelor's"

class JobResponse(BaseModel):
    id: str
    title: str
    company: str
    skills: List[str]
    min_years_experience: float
    education_level: str
    raw_text: str
    created_at: datetime

    class Config:
        from_attributes = True

# Resume Schemas
class ResumeCreate(BaseModel):
    candidate_name: str = Field(..., example="Alex Morgan")
    raw_text: str = Field(..., example="Alex Morgan. Software Engineer with 6 years experience in Python, FastAPI, React, SQL, and Docker. Graduated from Stanford University with a B.S. in Computer Science.")

class ResumeResponse(BaseModel):
    id: str
    candidate_name: str
    skills: List[str]
    years_experience: float
    education_level: str
    institution: str
    raw_text: str
    created_at: datetime

    class Config:
        from_attributes = True

# Universal Job Context
class JobContextInfo(BaseModel):
    job_title: str
    normalized_occupation: str
    isco_code: str
    industry: str
    seniority: str
    employment_type: str = "Full-time"

# Dual Dimension Metrics
class ResumeQualityMetrics(BaseModel):
    structure_clarity: str = "Well Structured"
    achievement_orientation: str = "High Metric Focus"
    formatting_consistency: str = "Consistent"
    evidence_depth: str = "Substantial Evidence"

class JobAlignmentMetrics(BaseModel):
    requirement_coverage: str = "High Coverage"
    domain_fit: str = "Direct Alignment"
    relevant_experience: str = "Demonstrated"

# Requirement Matrix
class RequirementMatrixRow(BaseModel):
    job_requirement: str
    resume_evidence: str
    evidence_source: str = "Experience"  # "Experience" | "Projects" | "Skills Section" | "No Evidence"
    alignment_level: str  # "Strong Evidence" | "Moderate Evidence" | "Limited Evidence" | "No Evidence Found"
    is_demonstrated: bool = True
    has_measurable_impact: bool = False
    recommendation: str
    evidence_details: Optional[str] = None

class AnalysisStrength(BaseModel):
    title: str
    description: str
    relevance_reason: str

class AnalysisWeakness(BaseModel):
    title: str
    description: str
    impact_explanation: str

class MissingEvidenceItem(BaseModel):
    title: str
    requirement: str
    recommendation: str

class PrioritizedRecommendation(BaseModel):
    priority: str = "High Priority"  # "High Priority" | "Medium Priority" | "Optional"
    weakness_title: str
    what_ai_found: str
    why_it_matters: str
    where_is_evidence: str
    what_to_improve: str
    truthfulness_note: str = "Ensure all added statements represent truthful, authentic experience."

# Universal Candidate Job Analysis Payload
class CandidateJobAnalysis(BaseModel):
    resume_id: str
    candidate_name: str
    job_context: JobContextInfo
    overall_understanding: str
    match_overview: str
    resume_quality: ResumeQualityMetrics
    job_alignment: JobAlignmentMetrics
    strengths: List[AnalysisStrength]
    areas_to_strengthen: List[AnalysisWeakness]
    missing_evidence: List[MissingEvidenceItem]
    highest_priority_improvements: List[PrioritizedRecommendation]
    requirement_table: List[RequirementMatrixRow]

# Match Request / Response Schemas
class MatchRequest(BaseModel):
    job_id: str
    resume_ids: Optional[List[str]] = None
    custom_resumes: Optional[List[ResumeCreate]] = None

class MatchRunResponse(BaseModel):
    run_id: str
    job_id: str
    job_title: str
    candidate_count: int
    results: List[CandidateJobAnalysis]
    created_at: datetime

# Run List Summary
class RunSummary(BaseModel):
    run_id: str
    job_id: str
    job_title: str
    candidate_count: int
    created_at: datetime
