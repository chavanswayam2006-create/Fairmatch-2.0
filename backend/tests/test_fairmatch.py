import pytest
from app.parser import extract_skills, extract_years_experience, extract_seniority_level
from app.matcher import analyze_job_fit, extract_universal_job_requirements
from app.rag_engine import RAGEngine

def test_parser_multi_domain_skill_extraction():
    text = "Experienced Data Scientist with Python, PyTorch, SQL, Financial Modeling, Figma, and AWS."
    skills = extract_skills(text)
    assert any(s.lower() == "python" for s in skills)
    assert any(s.lower() == "pytorch" for s in skills)
    assert any(s.lower() == "sql" for s in skills)
    assert any(s.lower() == "figma" for s in skills)

def test_parser_years_experience():
    text = "Senior Software Engineer with 6+ years of experience in high scale systems."
    years = extract_years_experience(text)
    assert years == 6.0

def test_seniority_level_detection():
    title = "Senior Data Analyst"
    text = "Leading a team of 4 data analysts and architecting reporting pipelines."
    seniority = extract_seniority_level(title, text)
    assert "Senior" in seniority or "Lead" in seniority

def test_universal_job_requirements_extraction():
    raw_job = "Seeking Senior Frontend Engineer skilled in React, TypeScript, REST APIs, automated testing with Jest, and Docker cloud deployment."
    reqs = extract_universal_job_requirements(raw_job, "Frontend Engineer")
    req_names = [r["name"].lower() for r in reqs]
    assert any("react" in r for r in req_names)
    assert any("testing" in r for r in req_names)
    assert any("deployment" in r for r in req_names)

def test_rag_evidence_retrieval():
    raw_resume = "Built full-stack React and FastAPI web applications. Consumed REST APIs and deployed on AWS."
    resume_sections = {
        "experience": ["Built full-stack React and FastAPI web applications. Consumed REST APIs and deployed on AWS."],
        "projects": [],
        "skills": ["React", "FastAPI", "AWS"]
    }
    
    ev_react = RAGEngine.retrieve_evidence_for_requirement("React", raw_resume, resume_sections)
    assert ev_react["direct_match"] == True
    assert ev_react["source_section"] == "Work Experience"

    ev_testing = RAGEngine.retrieve_evidence_for_requirement("Automated Testing", raw_resume, resume_sections)
    assert ev_testing["direct_match"] == False

def test_analyze_job_fit_pipeline():
    analysis = analyze_job_fit(
        raw_resume="Alex Morgan. Software Engineer with 5 years experience in Python, FastAPI, React, and PostgreSQL. Built automated pipelines reducing processing time by 40%.",
        resume_skills=["Python", "FastAPI", "React", "PostgreSQL"],
        resume_exp=5.0,
        resume_edu="Bachelor's",
        raw_job="Looking for a Python Developer experienced in FastAPI, REST APIs, and Docker deployment.",
        job_skills=["Python", "FastAPI", "Docker"],
        job_exp=3.0,
        job_edu="Bachelor's",
        job_title="Python Developer"
    )

    assert "job_context" in analysis
    assert "isco_code" in analysis["job_context"]
    assert "match_overview" in analysis
    assert "Your resume is analyzed against the specific requirements of the Python Developer position" in analysis["match_overview"]
    assert len(analysis["requirement_table"]) >= 3
    assert "resume_quality" in analysis
    assert "job_alignment" in analysis
    assert len(analysis["highest_priority_improvements"]) >= 1

    # Verify 4-part explainable recommendation keys
    rec = analysis["highest_priority_improvements"][0]
    assert "what_ai_found" in rec
    assert "why_it_matters" in rec
    assert "where_is_evidence" in rec
    assert "what_to_improve" in rec
    assert "truthfulness_note" in rec
