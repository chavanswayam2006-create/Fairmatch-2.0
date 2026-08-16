import os
import json
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, SessionLocal, JobDescriptionModel, ResumeModel
from app.routes import router as api_router
from app.parser import extract_skills, extract_years_experience, extract_education

app = FastAPI(
    title="FairMatch API",
    description="AI-Powered Resume-to-Job-Description Matching Engine with Built-in Bias & Fairness Auditing Layer",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
def startup_event():
    """Initialize database tables and populate mock seed data if empty."""
    init_db()
    db = SessionLocal()
    try:
        # Check if job descriptions exist
        if db.query(JobDescriptionModel).count() == 0:
            seed_initial_data(db)
    except Exception as e:
        print(f"Startup seed warning: {e}")
    finally:
        db.close()

def seed_initial_data(db):
    """Seed initial sample Job Description and Resumes for quick demonstration."""
    print("Seeding initial demo jobs and candidate resumes...")
    
    # 1. Job Description
    job_text = """
    Senior Full-Stack Engineer — FairMatch AI
    Location: Remote / San Francisco, CA
    
    We are seeking an experienced Senior Full-Stack Engineer to build real-time AI matching platforms.
    Requirements:
    - 5+ years of software engineering experience.
    - Deep mastery of Python, FastAPI, React, TypeScript, and SQL databases (PostgreSQL/SQLite).
    - Hands-on experience with Machine Learning models (Scikit-learn, XGBoost, PyTorch) and NLP libraries (spaCy, Sentence-Transformers).
    - Familiarity with Docker, Kubernetes, AWS, and modern CI/CD pipelines.
    - Strong understanding of REST APIs, system design, microservices, and AI explainability (SHAP/Fairlearn).
    - Bachelor's degree in Computer Science, Data Science, or equivalent practical experience.
    """
    
    j_skills = extract_skills(job_text)
    job_id = "job_demo_01"
    job_obj = JobDescriptionModel(
        id=job_id,
        title="Senior Full-Stack AI Engineer",
        company="FairMatch AI",
        raw_text=job_text,
        skills=json.dumps(j_skills),
        min_years_experience=5.0,
        education_level="Bachelor's"
    )
    db.add(job_obj)

    # 2. Sample Resumes
    sample_candidates = [
        {
            "id": "res_demo_01",
            "name": "Alex Rivera",
            "text": """Alex Rivera
San Francisco, CA | alex.rivera@email.com
Senior Software Engineer with 6 years of experience building scalable backend microservices and modern frontend applications.
Skills: Python, FastAPI, React, TypeScript, PostgreSQL, Docker, AWS, Scikit-learn, XGBoost, System Design, REST APIs, Git.
Education: B.S. in Computer Science, Stanford University (2018).
Experience:
Senior Software Engineer at TechCorp (2021 - Present): Designed REST APIs serving 2M users. Built FastAPI microservices and React dashboards.
Software Engineer at DataLab (2018 - 2021): Implemented ML data pipelines with Python, SQL, and Pandas.""",
        },
        {
            "id": "res_demo_02",
            "name": "Marcus Vance",
            "text": """Marcus Vance
Seattle, WA | marcus.vance@email.com
Full-Stack Developer with 4 years of experience specializing in web applications and cloud integrations.
Skills: JavaScript, TypeScript, React, Node.js, Express, Python, SQL, HTML, CSS, Tailwind, Docker, Git.
Education: Bachelor's in Information Technology, University of Washington (2020).
Experience:
Full-Stack Developer at WebDynamics (2020 - Present): Developed React components and Node.js backend services.""",
        },
        {
            "id": "res_demo_03",
            "name": "Sophia Zhang",
            "text": """Sophia Zhang
Boston, MA | sophia.zhang@email.com
AI Research & Machine Learning Engineer with 7 years experience in NLP, Deep Learning, and predictive modeling.
Skills: Python, PyTorch, Scikit-learn, XGBoost, spaCy, Pandas, NumPy, FastAPI, Docker, SQL, Machine Learning, Deep Learning, NLP, SHAP, Fairlearn.
Education: M.S. in Data Science, MIT (2017).
Experience:
Lead ML Engineer at AI Labs (2020 - Present): Developed NLP ranking engines and Fairlearn bias mitigation algorithms.
Data Scientist at Analytics Solutions (2017 - 2020): Built XGBoost classification models.""",
        },
        {
            "id": "res_demo_04",
            "name": "Jordan Taylor",
            "text": """Jordan Taylor
Austin, TX | jordan.taylor@email.com
Junior Web Developer with 2 years of experience focused on frontend user interfaces.
Skills: HTML, CSS, JavaScript, React, Git, REST APIs, Unit Testing.
Education: Associate's Degree in Computer Information Systems, Austin Community College (2022).
Experience:
Frontend Developer at Local Agency (2022 - Present): Built responsive HTML/CSS/React landing pages.""",
        }
    ]

    for c in sample_candidates:
        skills = extract_skills(c["text"])
        years_exp = extract_years_experience(c["text"])
        edu_lvl, inst = extract_education(c["text"])
        
        res_obj = ResumeModel(
            id=c["id"],
            candidate_name=c["name"],
            raw_text=c["text"],
            skills=json.dumps(skills),
            years_experience=years_exp,
            education_level=edu_lvl,
            institution=inst
        )
        db.add(res_obj)

    db.commit()
    print("Demo dataset seeded successfully!")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "FairMatch Resume-JD Matching & Bias Detection Engine",
        "docs": "/docs",
        "api_v1": "/api/v1"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
