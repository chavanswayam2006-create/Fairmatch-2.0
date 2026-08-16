import json
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import (
    get_db, JobDescriptionModel, ResumeModel, MatchRunModel, MatchResultModel, BiasAuditRunModel
)
from app.schemas import (
    JobCreate, JobResponse, ResumeCreate, ResumeResponse, MatchRequest, MatchRunResponse,
    CandidateJobAnalysis, RunSummary
)
from app.parser import parse_document, extract_skills, extract_years_experience, extract_education, extract_candidate_name
from app.matcher import analyze_job_fit

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
