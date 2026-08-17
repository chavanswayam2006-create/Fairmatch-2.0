import re
from typing import List, Dict, Any, Tuple
from app.parser import extract_skills, extract_years_experience, extract_education, extract_seniority_level, extract_resume_sections
from app.knowledge_graph import normalize_occupation_title, get_related_skills
from app.rag_engine import RAGEngine
from app.occupation_service import occupation_context_for_analysis


def predict_match_score(
    resume_text: str, resume_skills: List[str], resume_exp: float, resume_edu: str,
    job_text: str, job_skills: List[str], job_exp: float, job_edu: str,
) -> Dict[str, float]:
    """Internal coverage signal for counterfactual robustness tests only.

    It is not returned by the occupation analysis UI and must not be used to
    rank or compare candidates. The application-facing analysis remains
    evidence, gaps, and truthful recommendations.
    """
    requested = {skill.lower() for skill in job_skills}
    demonstrated = {skill.lower() for skill in resume_skills}
    skill_coverage = len(requested & demonstrated) / len(requested) if requested else 0.0
    experience_coverage = min(resume_exp / job_exp, 1.0) if job_exp else 1.0
    return {"final_score": round((skill_coverage * 0.8 + experience_coverage * 0.2) * 100, 2)}

def extract_universal_job_requirements(raw_job: str, job_title: str) -> List[Dict[str, str]]:
    """Extract required, preferred, and contextual requirements from any job description."""
    job_lower = raw_job.lower()
    extracted_skills = extract_skills(raw_job)

    requirements = []
    
    # 1. Technical / Industry Domain Requirements
    for skill in extracted_skills:
        requirements.append({
            "name": skill,
            "category": "Domain Skill / Technology",
            "type": "Required"
        })

    # 2. Key Responsibilities & Capabilities
    if "testing" in job_lower or "jest" in job_lower or "cypress" in job_lower or "pytest" in job_lower:
        if not any(r["name"].lower() == "automated testing" for r in requirements):
            requirements.append({"name": "Automated Testing", "category": "Quality Assurance", "type": "Required"})

    if "deploy" in job_lower or "aws" in job_lower or "cloud" in job_lower or "docker" in job_lower:
        if not any(r["name"].lower() == "cloud deployment" for r in requirements):
            requirements.append({"name": "Production & Cloud Deployment", "category": "DevOps & Infrastructure", "type": "Required"})

    if "api" in job_lower or "rest" in job_lower:
        if not any(r["name"].lower() in ["rest api", "rest apis"] for r in requirements):
            requirements.append({"name": "REST API Development & Integration", "category": "Backend Engineering", "type": "Required"})

    if "agile" in job_lower or "scrum" in job_lower:
        if not any(r["name"].lower() == "agile" for r in requirements):
            requirements.append({"name": "Agile / Scrum Methodology", "category": "Workflow & Process", "type": "Preferred"})

    if "lead" in job_lower or "manage" in job_lower or "mentor" in job_lower:
        if not any(r["name"].lower() == "team leadership" for r in requirements):
            requirements.append({"name": "Team Leadership & Collaboration", "category": "Management & Leadership", "type": "Preferred"})

    # Deduplicate requirement items
    seen = set()
    dedup_reqs = []
    for r in requirements:
        k = r["name"].lower()
        if k not in seen:
            seen.add(k)
            dedup_reqs.append(r)

    # Fallback to ensure at least 4 job-aware requirements exist
    if len(dedup_reqs) < 4:
        for fallback in ["Core Domain Capabilities", "Technical Problem Solving", "System Architecture", "Professional Collaboration"]:
            if fallback.lower() not in seen:
                dedup_reqs.append({"name": fallback, "category": "General Requirement", "type": "Required"})

    return dedup_reqs

def analyze_job_fit(
    raw_resume: str,
    resume_skills: List[str],
    resume_exp: float,
    resume_edu: str,
    raw_job: str,
    job_skills: List[str],
    job_exp: float,
    job_edu: str,
    job_title: str = "Selected Position"
) -> Dict[str, Any]:
    """
    Universal Job-Aware AI Resume Analyzer.
    Applies ISCO-08 & ESCO taxonomies, RAG retrieval engine, requirement evidence matrix,
    and dual-dimension evaluation (Resume Quality vs Job Alignment).
    """
    # Step 1: Query RAG Engine for Occupation & Taxonomy Context
    rag_context = RAGEngine.retrieve_context_for_job(job_title, raw_job)
    # ISCO is occupational context. If the imported knowledge layer can suggest
    # a unit group, use it for contextual interpretation while retaining every
    # employer-provided requirement in raw_job as the primary analysis source.
    occ_info = occupation_context_for_analysis(job_title, raw_job) or rag_context["occupation_info"]
    seniority_level = extract_seniority_level(job_title, raw_job)

    job_context_data = {
        "job_title": job_title,
        "normalized_occupation": occ_info["canonical_title"],
        "isco_code": occ_info["isco_code"],
        "industry": occ_info["industry"],
        "seniority": seniority_level,
        "employment_type": "Full-time"
    }

    # Step 2: Segment Resume into Evidence Sections
    resume_sections = extract_resume_sections(raw_resume)

    # Step 3: Extract Job Requirements
    job_reqs = extract_universal_job_requirements(raw_job, job_title)

    requirement_matrix = []
    strong_items = []
    moderate_items = []
    missing_items = []
    priority_recs = []

    # Step 4: Evaluate Evidence Matrix for Requirements
    for req in job_reqs:
        req_name = req["name"]
        ev_data = RAGEngine.retrieve_evidence_for_requirement(req_name, raw_resume, resume_sections)
        
        direct_match = ev_data["direct_match"]
        matched_synonyms = ev_data["matched_synonyms"]
        source_sec = ev_data["source_section"]
        has_impact = ev_data["has_impact"]

        is_demonstrated = source_sec in ["Work Experience", "Key Projects"]

        if direct_match and is_demonstrated:
            alignment = "Strong Evidence"
            evidence_text = f"Demonstrated in {source_sec} via hands-on project and work experience."
            recommendation = "Keep this experience prominent near the top of your resume."
        elif matched_synonyms:
            alignment = "Strong Evidence"
            evidence_text = f"Demonstrated in {source_sec} through related technologies ({', '.join(matched_synonyms[:3])})."
            recommendation = f"Explicitly highlight {req_name} alongside {', '.join(matched_synonyms[:2])}."
        elif direct_match:
            alignment = "Moderate Evidence"
            evidence_text = f"Mentioned in resume ({source_sec}), but context or measurable outcomes could be expanded."
            recommendation = f"Add descriptive bullet points detailing practical application of {req_name}."
        elif matched_synonyms and source_sec == "Skills Section":
            alignment = "Limited Evidence"
            evidence_text = f"Listed in skills section ({', '.join(matched_synonyms[:2])})."
            recommendation = f"Detail practical implementation of {req_name} in work experience or projects."
        else:
            alignment = "No Evidence Found"
            evidence_text = "No evidence found in the provided resume."
            recommendation = f"If you have genuine experience with {req_name}, document real projects or coursework."

        requirement_matrix.append({
            "job_requirement": req_name,
            "resume_evidence": evidence_text,
            "evidence_source": source_sec,
            "alignment_level": alignment,
            "is_demonstrated": is_demonstrated,
            "has_measurable_impact": has_impact,
            "recommendation": recommendation,
            "evidence_details": f"Category: {req['category']} ({req['type']})"
        })

        if alignment == "Strong Evidence":
            strong_items.append({
                "title": req_name,
                "description": f"Your resume demonstrates strong evidence for {req_name} in your {source_sec}.",
                "relevance_reason": f"Directly satisfies a core requirement for {job_title} ({occ_info['canonical_title']})."
            })
        elif alignment in ["Moderate Evidence", "Limited Evidence"]:
            moderate_items.append({
                "title": req_name,
                "description": f"Your resume mentions {req_name} or related tools, but could provide clearer context or metric details.",
                "impact_explanation": f"Recruiters look for specific implementation bullet points for {req_name} when evaluating {job_title} positions."
            })
            priority_recs.append({
                "priority": "High Priority" if req["type"] == "Required" else "Medium Priority",
                "weakness_title": f"Expand context for {req_name}",
                "what_ai_found": f"Found mention or related technology in {source_sec}.",
                "why_it_matters": f"Demonstrating practical application of {req_name} validates your readiness for {job_title} roles.",
                "where_is_evidence": evidence_text,
                "what_to_improve": f"Add 1-2 descriptive bullet points in your {source_sec} showing how you applied {req_name}.",
                "truthfulness_note": "Ensure all added statements represent truthful, authentic experience."
            })
        else: # No Evidence Found
            missing_items.append({
                "title": req_name,
                "requirement": f"The job description specifies {req_name}.",
                "recommendation": f"If you possess experience with {req_name}, document real projects or coursework. If absent, consider taking a targeted course."
            })
            priority_recs.append({
                "priority": "High Priority" if req["type"] == "Required" else "Optional",
                "weakness_title": f"Requirement not demonstrated: {req_name}",
                "what_ai_found": f"No evidence found for {req_name} in the provided resume.",
                "why_it_matters": f"{req_name} is listed as a requirement in the {job_title} job description.",
                "where_is_evidence": "No evidence found in the provided resume.",
                "what_to_improve": f"If you have genuine experience with {req_name}, explicitly detail it in your work experience or projects section.",
                "truthfulness_note": "Ensure all added statements represent truthful, authentic experience."
            })

    # Step 5: Synthesize Dual-Dimension Metrics (Resume Quality vs Job Alignment)
    has_metrics = any(r["has_measurable_impact"] for r in requirement_matrix)
    demo_count = sum(1 for r in requirement_matrix if r["is_demonstrated"])

    quality_metrics = {
        "structure_clarity": "Well Structured" if len(resume_sections.get("experience", [])) > 2 else "Standard Structure",
        "achievement_orientation": "High Metric Focus" if has_metrics else "Descriptive Responsibilities",
        "formatting_consistency": "Consistent Formatting",
        "evidence_depth": f"{demo_count} Requirements Demonstrated in Context"
    }

    alignment_metrics = {
        "requirement_coverage": f"{len(strong_items)}/{len(job_reqs)} Requirements Strongly Aligned",
        "domain_fit": f"Mapped to ISCO-08: {occ_info['industry']}",
        "relevant_experience": f"{resume_exp} Years Relevant Experience ({seniority_level} Level)"
    }

    # Step 6: Construct Overall Understanding Overview
    strong_names = [s["title"] for s in strong_items]
    missing_names = [m["title"] for m in missing_items]

    if strong_names and missing_names:
        overview = (
            f"Your resume is analyzed against the specific requirements of the {job_title} position ({occ_info['canonical_title']}). You are not being ranked against other candidates. "
            f"Your background demonstrates strong alignment in core areas including {', '.join(strong_names[:3])}. "
            f"The primary areas where providing additional evidence would strengthen your application include {', '.join(missing_names[:2])}."
        )
    elif strong_names:
        overview = (
            f"Your resume is analyzed against the specific requirements of the {job_title} position ({occ_info['canonical_title']}). You are not being ranked against other candidates. "
            f"Your background shows solid alignment across key requirements for {job_title}, particularly in {', '.join(strong_names[:4])}."
        )
    else:
        overview = (
            f"Your resume is analyzed against the specific requirements of the {job_title} position ({occ_info['canonical_title']}). You are not being ranked against other candidates. "
            f"Your resume provides foundational context. Adding explicit bullet points for target job requirements will significantly strengthen your job suitability."
        )

    if not strong_items:
        strong_items.append({
            "title": "Educational & Professional Foundation",
            "description": f"Your background meets baseline education ({resume_edu}) and experience ({resume_exp} yrs) expectations.",
            "relevance_reason": "Establishes subject-matter foundation for professional roles."
        })

    # Sort priority recommendations (High Priority first)
    priority_recs.sort(key=lambda x: 0 if x["priority"] == "High Priority" else 1 if x["priority"] == "Medium Priority" else 2)

    return {
        "job_context": job_context_data,
        "overall_understanding": f"Classification: {occ_info['isco_code']} | Industry: {occ_info['industry']} | Seniority: {seniority_level}",
        "match_overview": overview,
        "resume_quality": quality_metrics,
        "job_alignment": alignment_metrics,
        "strengths": strong_items,
        "areas_to_strengthen": moderate_items,
        "missing_evidence": missing_items,
        "highest_priority_improvements": priority_recs[:5],
        "requirement_table": requirement_matrix
    }
