import json
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import (
    get_db, JobDescriptionModel, ResumeModel, MatchRunModel, MatchResultModel, BiasAuditRunModel,
    JobLibraryModel, OccupationsModel, ISCOMajorGroupModel, ISCOSubMajorGroupModel,
    ISCOMinorGroupModel, ISCOUnitGroupModel, ISCOOccupationTaskModel, ISCOOccupationAliasModel
)
from app.schemas import (
    JobCreate, JobResponse, ResumeCreate, ResumeResponse, MatchRequest, MatchRunResponse,
    CandidateJobAnalysis, RunSummary, BiasAuditResponse, BiasAuditTriggerRequest,
    JobLibraryItem, JobLibraryListResponse, JobRecommendationItem, OccupationClassifyRequest
)
from app.parser import parse_document, extract_skills, extract_years_experience, extract_education, extract_candidate_name
from app.matcher import analyze_job_fit
from app.occupation_service import best_occupation, unit_hierarchy
from app.bias_auditor import run_counterfactual_audit

router = APIRouter(prefix="/api/v1")

from fastapi import Request

# Optional API Key Authentication Dependency
API_KEY = "fairmatch-secret-key"

def verify_api_key(request: Request):
    """Validate X-API-Key header if provided."""
    api_key_sent = request.headers.get("x-api-key") or request.headers.get("X-API-Key")
    if api_key_sent and api_key_sent != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key provided in X-API-Key header"
        )

# ----------------------------------------------------
# 1. POST /api/v1/jobs — Create job description
# ----------------------------------------------------
@router.post("/jobs", response_model=JobResponse, dependencies=[Depends(verify_api_key)])
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    skills = extract_skills(job_in.raw_text)
    years_exp = job_in.min_years_experience or extract_years_experience(job_in.raw_text)
    edu_level, _ = extract_education(job_in.raw_text)

    db_job = JobDescriptionModel(
        id=job_id,
        title=job_in.title,
        company=job_in.company or "Acme Corp",
        raw_text=job_in.raw_text,
        skills=json.dumps(skills),
        min_years_experience=years_exp,
        education_level=job_in.education_level or edu_level
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    return JobResponse(
        id=db_job.id,
        title=db_job.title,
        company=db_job.company,
        skills=json.loads(db_job.skills),
        min_years_experience=db_job.min_years_experience,
        education_level=db_job.education_level,
        raw_text=db_job.raw_text,
        created_at=db_job.created_at
    )

# ----------------------------------------------------
# 2. POST /api/v1/resumes — Upload a resume (file or text)
# ----------------------------------------------------
@router.post("/resumes", response_model=ResumeResponse, dependencies=[Depends(verify_api_key)])
async def upload_resume(
    file: Optional[UploadFile] = File(None),
    candidate_name: Optional[str] = Form(None),
    raw_text: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    resume_id = f"res_{uuid.uuid4().hex[:8]}"
    
    if file:
        content = await file.read()
        parsed = parse_document(content, file.filename or "resume.pdf")
        name = candidate_name or parsed["candidate_name"]
        text = parsed["raw_text"]
        skills = parsed["skills"]
        years_exp = parsed["years_experience"]
        edu_level = parsed["education_level"]
        institution = parsed["institution"]
    elif raw_text:
        text = raw_text
        skills = extract_skills(text)
        years_exp = extract_years_experience(text)
        edu_level, institution = extract_education(text)
        name = candidate_name or extract_candidate_name(text)
    else:
        raise HTTPException(status_code=400, detail="Must provide either file or raw_text")

    db_resume = ResumeModel(
        id=resume_id,
        candidate_name=name,
        raw_text=text,
        skills=json.dumps(skills),
        years_experience=years_exp,
        education_level=edu_level,
        institution=institution
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    return ResumeResponse(
        id=db_resume.id,
        candidate_name=db_resume.candidate_name,
        skills=json.loads(db_resume.skills),
        years_experience=db_resume.years_experience,
        education_level=db_resume.education_level,
        institution=db_resume.institution,
        raw_text=db_resume.raw_text,
        created_at=db_resume.created_at
    )

# ----------------------------------------------------
# 3. POST /api/v1/match — Match job against resumes
# ----------------------------------------------------
@router.post("/match", response_model=MatchRunResponse, dependencies=[Depends(verify_api_key)])
def run_match(req: MatchRequest, db: Session = Depends(get_db)):
    job = db.query(JobDescriptionModel).filter(JobDescriptionModel.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")

    job_skills = json.loads(job.skills)

    resumes_to_match = []
    if req.resume_ids:
        resumes_to_match = db.query(ResumeModel).filter(ResumeModel.id.in_(req.resume_ids)).all()
    else:
        # If no specific IDs passed, match against all resumes in database
        resumes_to_match = db.query(ResumeModel).all()

    if not resumes_to_match and not req.custom_resumes:
        raise HTTPException(status_code=400, detail="No resumes available to match against")

    # Add custom resumes if provided in payload
    if req.custom_resumes:
        for c_res in req.custom_resumes:
            rid = f"res_{uuid.uuid4().hex[:8]}"
            skills = extract_skills(c_res.raw_text)
            years_exp = extract_years_experience(c_res.raw_text)
            edu_lvl, inst = extract_education(c_res.raw_text)
            db_res = ResumeModel(
                id=rid,
                candidate_name=c_res.candidate_name,
                raw_text=c_res.raw_text,
                skills=json.dumps(skills),
                years_experience=years_exp,
                education_level=edu_lvl,
                institution=inst
            )
            db.add(db_res)
            db.commit()
            resumes_to_match.append(db_res)

    run_id = f"run_{uuid.uuid4().hex[:8]}"
    analysis_results = []

    for res in resumes_to_match:
        res_skills = json.loads(res.skills)
        analysis_data = analyze_job_fit(
            res.raw_text, res_skills, res.years_experience, res.education_level,
            job.raw_text, job_skills, job.min_years_experience, job.education_level,
            job.title
        )

        cand_analysis = CandidateJobAnalysis(
            resume_id=res.id,
            candidate_name=res.candidate_name,
            job_context=analysis_data["job_context"],
            overall_understanding=analysis_data["overall_understanding"],
            match_overview=analysis_data["match_overview"],
            resume_quality=analysis_data["resume_quality"],
            job_alignment=analysis_data["job_alignment"],
            strengths=analysis_data["strengths"],
            areas_to_strengthen=analysis_data["areas_to_strengthen"],
            missing_evidence=analysis_data["missing_evidence"],
            highest_priority_improvements=analysis_data["highest_priority_improvements"],
            requirement_table=analysis_data["requirement_table"]
        )
        analysis_results.append(cand_analysis)

        db_res_item = MatchResultModel(
            id=f"resitem_{uuid.uuid4().hex[:8]}",
            run_id=run_id,
            resume_id=res.id,
            candidate_name=res.candidate_name,
            rank=1,
            final_score=0.0,
            cosine_sim=0.0,
            skill_overlap=0.0,
            exp_score=0.0,
            edu_score=0.0,
            shap_breakdown=json.dumps({})
        )
        db.add(db_res_item)

    # Save run record
    db_run = MatchRunModel(
        id=run_id,
        job_id=job.id,
        candidate_count=len(resumes_to_match),
        top_score=0.0,
        fairness_flagged=False,
        max_score_gap=0.0
    )
    db.add(db_run)
    db.commit()

    return MatchRunResponse(
        run_id=run_id,
        job_id=job.id,
        job_title=job.title,
        candidate_count=len(analysis_results),
        results=analysis_results,
        created_at=db_run.created_at
    )

# ----------------------------------------------------
# 4. POST /api/v1/bias-audit/{run_id} — Trigger counterfactual bias audit
# ----------------------------------------------------
@router.post("/bias-audit/{run_id}", response_model=BiasAuditResponse, dependencies=[Depends(verify_api_key)])
def trigger_bias_audit(run_id: str, req: Optional[BiasAuditTriggerRequest] = None, db: Session = Depends(get_db)):
    run = db.query(MatchRunModel).filter(MatchRunModel.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Match run not found")

    job = db.query(JobDescriptionModel).filter(JobDescriptionModel.id == run.job_id).first()
    results = db.query(MatchResultModel).filter(MatchResultModel.run_id == run_id).all()

    resumes_list = []
    for r in results:
        res_obj = db.query(ResumeModel).filter(ResumeModel.id == r.resume_id).first()
        if res_obj:
            resumes_list.append({
                "candidate_name": res_obj.candidate_name,
                "raw_text": res_obj.raw_text,
                "skills": json.loads(res_obj.skills),
                "years_experience": res_obj.years_experience,
                "education_level": res_obj.education_level
            })

    threshold = req.score_gap_threshold if req and req.score_gap_threshold is not None else 5.0
    job_dict = {
        "raw_text": job.raw_text if job else "",
        "skills": json.loads(job.skills) if job else [],
        "min_years_experience": job.min_years_experience if job else 3.0,
        "education_level": job.education_level if job else "Bachelor's"
    }

    audit_res = run_counterfactual_audit(resumes_list, job_dict, score_gap_threshold=threshold)

    # Update or insert bias audit record
    existing_audit = db.query(BiasAuditRunModel).filter(BiasAuditRunModel.run_id == run_id).first()
    if existing_audit:
        existing_audit.demographic_parity_diff = audit_res["demographic_parity_diff"]
        existing_audit.selection_rate_ratio = audit_res["selection_rate_ratio"]
        existing_audit.max_score_gap = audit_res["max_score_gap"]
        existing_audit.flagged = audit_res["flagged"]
        existing_audit.audit_summary = json.dumps(audit_res)
        audit_model = existing_audit
    else:
        audit_model = BiasAuditRunModel(
            id=f"audit_{uuid.uuid4().hex[:8]}",
            run_id=run_id,
            demographic_parity_diff=audit_res["demographic_parity_diff"],
            selection_rate_ratio=audit_res["selection_rate_ratio"],
            max_score_gap=audit_res["max_score_gap"],
            flagged=audit_res["flagged"],
            audit_summary=json.dumps(audit_res)
        )
        db.add(audit_model)

    run.fairness_flagged = audit_res["flagged"]
    run.max_score_gap = audit_res["max_score_gap"]
    db.commit()

    return BiasAuditResponse(
        audit_id=audit_model.id,
        run_id=run_id,
        demographic_parity_diff=audit_res["demographic_parity_diff"],
        selection_rate_ratio=audit_res["selection_rate_ratio"],
        max_score_gap=audit_res["max_score_gap"],
        flagged=audit_res["flagged"],
        threshold=threshold,
        name_group_scores=audit_res["name_group_scores"],
        university_tier_scores=audit_res["university_tier_scores"],
        employment_gap_scores=audit_res["employment_gap_scores"],
        detailed_variants=audit_res["detailed_variants"],
        created_at=audit_model.created_at
    )

# ----------------------------------------------------
# 5. GET /api/v1/bias-audit/{run_id} — Get fairness report
# ----------------------------------------------------
@router.get("/bias-audit/{run_id}", response_model=BiasAuditResponse, dependencies=[Depends(verify_api_key)])
def get_bias_audit(run_id: str, db: Session = Depends(get_db)):
    audit = db.query(BiasAuditRunModel).filter(BiasAuditRunModel.run_id == run_id).first()
    if not audit:
        # Trigger on-the-fly audit if none exists yet
        return trigger_bias_audit(run_id, None, db)

    summary = json.loads(audit.audit_summary)
    return BiasAuditResponse(
        audit_id=audit.id,
        run_id=run_id,
        demographic_parity_diff=audit.demographic_parity_diff,
        selection_rate_ratio=audit.selection_rate_ratio,
        max_score_gap=audit.max_score_gap,
        flagged=audit.flagged,
        threshold=summary.get("threshold", 5.0),
        name_group_scores=summary.get("name_group_scores", {}),
        university_tier_scores=summary.get("university_tier_scores", {}),
        employment_gap_scores=summary.get("employment_gap_scores", {}),
        detailed_variants=summary.get("detailed_variants", []),
        created_at=audit.created_at
    )

# ----------------------------------------------------
# 6. GET /api/v1/runs — List historical job analysis runs
# ----------------------------------------------------
@router.get("/runs", response_model=List[RunSummary], dependencies=[Depends(verify_api_key)])
def list_runs(db: Session = Depends(get_db)):
    runs = db.query(MatchRunModel).order_by(MatchRunModel.created_at.desc()).all()
    output = []
    for r in runs:
        job = db.query(JobDescriptionModel).filter(JobDescriptionModel.id == r.job_id).first()
        job_title = job.title if job else "Position"
        output.append(
            RunSummary(
                run_id=r.id,
                job_id=r.job_id,
                job_title=job_title,
                candidate_count=r.candidate_count,
                created_at=r.created_at
            )
        )
    return output

# ----------------------------------------------------
# 7. GET /api/v1/runs/{run_id} — Get full job analysis detail
# ----------------------------------------------------
@router.get("/runs/{run_id}", response_model=MatchRunResponse, dependencies=[Depends(verify_api_key)])
def get_run_detail(run_id: str, db: Session = Depends(get_db)):
    r = db.query(MatchRunModel).filter(MatchRunModel.id == run_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Run not found")

    job = db.query(JobDescriptionModel).filter(JobDescriptionModel.id == r.job_id).first()
    results = db.query(MatchResultModel).filter(MatchResultModel.run_id == run_id).all()

    res_items = []
    job_skills = json.loads(job.skills) if job else []
    for item in results:
        res_obj = db.query(ResumeModel).filter(ResumeModel.id == item.resume_id).first()
        raw_res = res_obj.raw_text if res_obj else ""
        res_skills = json.loads(res_obj.skills) if res_obj else []
        res_exp = res_obj.years_experience if res_obj else 3.0
        res_edu = res_obj.education_level if res_obj else "Bachelor's"

        analysis_data = analyze_job_fit(
            raw_res, res_skills, res_exp, res_edu,
            job.raw_text if job else "", job_skills, job.min_years_experience if job else 3.0, job.education_level if job else "Bachelor's",
            job.title if job else ""
        )

        res_items.append(
            CandidateJobAnalysis(
                resume_id=item.resume_id,
                candidate_name=item.candidate_name,
                job_context=analysis_data["job_context"],
                overall_understanding=analysis_data["overall_understanding"],
                match_overview=analysis_data["match_overview"],
                resume_quality=analysis_data["resume_quality"],
                job_alignment=analysis_data["job_alignment"],
                strengths=analysis_data["strengths"],
                areas_to_strengthen=analysis_data["areas_to_strengthen"],
                missing_evidence=analysis_data["missing_evidence"],
                highest_priority_improvements=analysis_data["highest_priority_improvements"],
                requirement_table=analysis_data["requirement_table"]
            )
        )

    return MatchRunResponse(
        run_id=r.id,
        job_id=r.job_id,
        job_title=job.title if job else "Position",
        candidate_count=r.candidate_count,
        results=res_items,
        created_at=r.created_at
    )

# ============================================================
# ISCO-08 occupation knowledge layer
# ============================================================
def _serialize_isco_group(group, level: int) -> dict:
    parent = None
    if level == 2:
        parent = group.major_code
    elif level == 3:
        parent = group.sub_major_code
    elif level == 4:
        parent = group.minor_code
    return {
        "code": group.code, "title": group.title, "level": level, "parent_code": parent,
        "definition": group.definition or "", "source_document": group.source_document,
        "source_version": group.source_version, "source_type": group.source_type, "source_page": group.source_page,
    }


@router.get("/occupations")
def list_occupations(
    level: int = Query(1, ge=1, le=4),
    parent_code: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    model_by_level = {1: ISCOMajorGroupModel, 2: ISCOSubMajorGroupModel, 3: ISCOMinorGroupModel, 4: ISCOUnitGroupModel}
    model = model_by_level[level]
    query = db.query(model)
    if parent_code:
        parent_field = {2: "major_code", 3: "sub_major_code", 4: "minor_code"}.get(level)
        if not parent_field:
            raise HTTPException(status_code=400, detail="Major groups do not have a parent group.")
        query = query.filter(getattr(model, parent_field) == parent_code)
    total = query.count()
    records = query.order_by(model.code).offset((page - 1) * limit).limit(limit).all()
    return {"total": total, "page": page, "limit": limit, "items": [_serialize_isco_group(record, level) for record in records]}


@router.get("/occupations/search")
def search_occupations(
    query: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    term = f"%{query.strip()}%"
    units = db.query(ISCOUnitGroupModel).filter(or_(
        ISCOUnitGroupModel.title.ilike(term), ISCOUnitGroupModel.definition.ilike(term),
        ISCOUnitGroupModel.included_occupations_raw.ilike(term),
    )).order_by(ISCOUnitGroupModel.title).limit(limit).all()
    alias_units = db.query(ISCOUnitGroupModel).join(
        ISCOOccupationAliasModel, ISCOOccupationAliasModel.isco_code == ISCOUnitGroupModel.code
    ).filter(ISCOOccupationAliasModel.occupation_title.ilike(term)).limit(limit).all()
    seen = {unit.code for unit in units}
    units.extend(unit for unit in alias_units if unit.code not in seen)
    semantic = best_occupation(query, db, limit=limit)
    by_code = {unit.code: unit for unit in units}
    for suggestion in semantic:
        unit = db.get(ISCOUnitGroupModel, suggestion["code"])
        if unit:
            by_code.setdefault(unit.code, unit)
    # Keep source-text matches, but put contextual title/definition retrieval
    # first so broad queries do not bury their best ISCO unit group.
    ordered_codes = [suggestion["code"] for suggestion in semantic] + [code for code in by_code if code not in {s["code"] for s in semantic}]
    items = []
    for code in ordered_codes[:limit]:
        unit = by_code[code]
        item = _serialize_isco_group(unit, 4)
        item["hierarchy"] = unit_hierarchy(unit, db)
        items.append(item)
    return {"query": query, "total": len(items), "items": items}


@router.post("/occupations/classify-job")
def classify_job(request: OccupationClassifyRequest, db: Session = Depends(get_db)):
    # Suggestions are intentionally non-absolute. A custom JD remains the primary analysis source.
    return {"title": request.title, "suggestions": best_occupation(f"{request.title} {request.job_description}", db)}


@router.get("/occupations/{code}/tasks")
def occupation_tasks(code: str, db: Session = Depends(get_db)):
    if not db.get(ISCOUnitGroupModel, code):
        raise HTTPException(status_code=404, detail="This occupation record is currently unavailable.")
    return {"code": code, "tasks": [
        {"task_type": task.task_type, "task_text": task.task_text, "source_page": task.source_page}
        for task in db.query(ISCOOccupationTaskModel).filter_by(isco_code=code).all()
    ]}


@router.get("/occupations/{code}")
def occupation_detail(code: str, db: Session = Depends(get_db)):
    unit = db.get(ISCOUnitGroupModel, code)
    if not unit:
        raise HTTPException(status_code=404, detail="This occupation record is currently unavailable.")
    item = _serialize_isco_group(unit, 4)
    item.update({
        "hierarchy": unit_hierarchy(unit, db),
        "main_tasks": [task.task_text for task in db.query(ISCOOccupationTaskModel).filter_by(isco_code=code).all()],
        "included_occupations": [alias.occupation_title for alias in db.query(ISCOOccupationAliasModel).filter_by(isco_code=code).all()],
        "excluded_occupations": unit.excluded_occupations_raw or "",
        "notes": unit.notes or "",
    })
    return item


# ----------------------------------------------------
# Analyze a resume against a specific ISCO unit group
# ----------------------------------------------------
@router.post("/occupations/{code}/analyze")
def analyze_resume_against_isco(
    code: str,
    resume_id: Optional[str] = Form(None),
    raw_text: Optional[str] = Form(None),
    candidate_name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    unit = db.get(ISCOUnitGroupModel, code)
    if not unit:
        raise HTTPException(status_code=404, detail="This occupation record is currently unavailable.")

    # Obtain resume text
    if resume_id:
        res = db.query(ResumeModel).filter(ResumeModel.id == resume_id).first()
        if not res:
            raise HTTPException(status_code=404, detail="Resume not found")
        resume_text = res.raw_text
        res_skills = json.loads(res.skills)
        res_exp = res.years_experience
        res_edu = res.education_level
        cand_name = res.candidate_name
    elif raw_text:
        resume_text = raw_text
        res_skills = extract_skills(raw_text)
        res_exp = extract_years_experience(raw_text)
        res_edu, _ = extract_education(raw_text)
        cand_name = candidate_name or "Candidate"
    else:
        raise HTTPException(status_code=400, detail="Provide either a resume_id or raw_text for analysis.")

    # Build a job-context from the ISCO unit-group definition and tasks
    job_title = f"ISCO-08 Unit Group {unit.code} — {unit.title}"
    parts = [unit.definition or ""]
    tasks = [t.task_text for t in db.query(ISCOOccupationTaskModel).filter_by(isco_code=code).all()]
    if tasks:
        parts.append('\n\nMain tasks:\n' + '\n'.join(tasks))
    included = [a.occupation_title for a in db.query(ISCOOccupationAliasModel).filter_by(isco_code=code).all()]
    if included:
        parts.append('\n\nIncluded occupations / examples:\n' + '; '.join(included))

    raw_job = '\n\n'.join(parts)

    # Run the existing analyzer (it will treat the ISCO context cautiously)
    analysis = analyze_job_fit(
        resume_text, res_skills, res_exp, res_edu,
        raw_job, [], 0.0, "",
        job_title
    )

    return {
        "occupation_code": code,
        "occupation_title": unit.title,
        "candidate_name": cand_name,
        "analysis": analysis
    }

# ============================================================
# 8. GET /api/v1/job-library — Search & Filter Global Job Library
# ============================================================
def _serialize_job_library(job: JobLibraryModel) -> JobLibraryItem:
    """Convert a JobLibraryModel ORM instance into a JobLibraryItem Pydantic model."""
    return JobLibraryItem(
        id=job.id,
        slug=job.slug or "",
        title=job.title,
        normalized_title=job.normalized_title or job.title,
        industry=job.industry,
        seniority=job.seniority or "Mid-Level",
        location=job.location or "Global",
        country=job.country or "Global",
        employment_type=job.employment_type or "Full-time",
        description=job.description or "",
        responsibilities=json.loads(job.responsibilities) if job.responsibilities else [],
        required_skills=json.loads(job.required_skills) if job.required_skills else [],
        preferred_skills=json.loads(job.preferred_skills) if job.preferred_skills else [],
        tools=json.loads(job.tools) if job.tools else [],
        education=job.education or "",
        experience_years=job.experience_years or 0.0,
        is_generic_profile=job.is_generic_profile if job.is_generic_profile is not None else True,
        source=job.source or "",
        created_at=job.created_at
    )


@router.get("/job-library", response_model=JobLibraryListResponse)
def search_job_library(
    query: Optional[str] = Query(None, description="Search jobs by title, skill, or keyword"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    seniority: Optional[str] = Query(None, description="Filter by seniority level"),
    employment_type: Optional[str] = Query(None, description="Filter by employment type"),
    country: Optional[str] = Query(None, description="Filter by country"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Results per page"),
    db: Session = Depends(get_db)
):
    q = db.query(JobLibraryModel)

    # Keyword search across title, description, required_skills, preferred_skills
    if query:
        search_term = f"%{query.strip()}%"
        q = q.filter(
            (JobLibraryModel.title.ilike(search_term)) |
            (JobLibraryModel.normalized_title.ilike(search_term)) |
            (JobLibraryModel.description.ilike(search_term)) |
            (JobLibraryModel.required_skills.ilike(search_term)) |
            (JobLibraryModel.preferred_skills.ilike(search_term)) |
            (JobLibraryModel.industry.ilike(search_term))
        )

    if industry:
        q = q.filter(JobLibraryModel.industry.ilike(f"%{industry}%"))
    if seniority:
        q = q.filter(JobLibraryModel.seniority.ilike(f"%{seniority}%"))
    if employment_type:
        q = q.filter(JobLibraryModel.employment_type.ilike(f"%{employment_type}%"))
    if country:
        q = q.filter(JobLibraryModel.country.ilike(f"%{country}%"))

    total = q.count()
    offset = (page - 1) * limit
    jobs = q.order_by(JobLibraryModel.title).offset(offset).limit(limit).all()

    # Compute available filter options from full database
    all_industries = [r[0] for r in db.query(JobLibraryModel.industry).distinct().all() if r[0]]
    all_seniority = [r[0] for r in db.query(JobLibraryModel.seniority).distinct().all() if r[0]]

    return JobLibraryListResponse(
        total=total,
        page=page,
        limit=limit,
        jobs=[_serialize_job_library(j) for j in jobs],
        industries=sorted(all_industries),
        seniority_levels=sorted(all_seniority)
    )


# ============================================================
# 9. GET /api/v1/job-library/{id_or_slug} — Job Details
# ============================================================
@router.get("/job-library/{id_or_slug}", response_model=JobLibraryItem)
def get_job_library_detail(id_or_slug: str, db: Session = Depends(get_db)):
    job = db.query(JobLibraryModel).filter(
        (JobLibraryModel.id == id_or_slug) | (JobLibraryModel.slug == id_or_slug)
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job profile not found in library.")
    return _serialize_job_library(job)


# ============================================================
# 10. POST /api/v1/jobs/recommend — Recommend jobs by resume skills
# ============================================================
@router.post("/jobs/recommend", response_model=List[JobRecommendationItem])
def recommend_jobs_for_resume(
    resume_text: str = Form(...),
    top_n: int = Form(5),
    db: Session = Depends(get_db)
):
    resume_skills = extract_skills(resume_text)
    resume_skills_lower = {s.lower() for s in resume_skills}

    all_jobs = db.query(JobLibraryModel).all()
    scored: List[dict] = []

    for job in all_jobs:
        job_required = json.loads(job.required_skills) if job.required_skills else []
        job_preferred = json.loads(job.preferred_skills) if job.preferred_skills else []
        all_job_skills = job_required + job_preferred
        all_job_skills_lower = {s.lower() for s in all_job_skills}

        overlap = resume_skills_lower & all_job_skills_lower
        if len(overlap) > 0:
            matching_display = [s for s in resume_skills if s.lower() in overlap]
            scored.append({
                "job": job,
                "overlap_count": len(overlap),
                "matching_skills": matching_display[:6],
                "match_reason": f"Resume demonstrates evidence in {len(overlap)} relevant skill areas for this role."
            })

    scored.sort(key=lambda x: x["overlap_count"], reverse=True)
    top_results = scored[:top_n]

    return [
        JobRecommendationItem(
            job_id=item["job"].id,
            slug=item["job"].slug or "",
            title=item["job"].title,
            industry=item["job"].industry,
            seniority=item["job"].seniority or "Mid-Level",
            matching_skills=item["matching_skills"],
            match_reason=item["match_reason"]
        )
        for item in top_results
    ]
