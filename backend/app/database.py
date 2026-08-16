import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fairmatch.db")

# For SQLite, check same thread settings
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class JobDescriptionModel(Base):
    __tablename__ = "job_descriptions"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    company = Column(String(100), default="Acme Corp")
    raw_text = Column(Text, nullable=False)
    skills = Column(Text, nullable=False)  # JSON array string
    min_years_experience = Column(Float, default=0.0)
    education_level = Column(String(100), default="Bachelor's")
    created_at = Column(DateTime, default=datetime.utcnow)

    runs = relationship("MatchRunModel", back_populates="job")

class ResumeModel(Base):
    __tablename__ = "resumes"

    id = Column(String(50), primary_key=True, index=True)
    candidate_name = Column(String(200), nullable=False)
    raw_text = Column(Text, nullable=False)
    skills = Column(Text, nullable=False)  # JSON array string
    years_experience = Column(Float, default=0.0)
    education_level = Column(String(100), default="Bachelor's")
    institution = Column(String(200), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class MatchRunModel(Base):
    __tablename__ = "match_runs"

    id = Column(String(50), primary_key=True, index=True)
    job_id = Column(String(50), ForeignKey("job_descriptions.id"), nullable=False)
    candidate_count = Column(Integer, default=0)
    top_score = Column(Float, default=0.0)
    fairness_flagged = Column(Boolean, default=False)
    max_score_gap = Column(Float, default=0.0)
    status = Column(String(50), default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("JobDescriptionModel", back_populates="runs")
    results = relationship("MatchResultModel", back_populates="run", cascade="all, delete-orphan")
    audit = relationship("BiasAuditRunModel", back_populates="run", uselist=False, cascade="all, delete-orphan")

class MatchResultModel(Base):
    __tablename__ = "match_results"

    id = Column(String(50), primary_key=True, index=True)
    run_id = Column(String(50), ForeignKey("match_runs.id"), nullable=False)
    resume_id = Column(String(50), ForeignKey("resumes.id"), nullable=False)
    candidate_name = Column(String(200), nullable=False)
    rank = Column(Integer, nullable=False)
    final_score = Column(Float, nullable=False)
    cosine_sim = Column(Float, nullable=False)
    skill_overlap = Column(Float, nullable=False)
    exp_score = Column(Float, nullable=False)
    edu_score = Column(Float, nullable=False)
    shap_breakdown = Column(Text, nullable=False)  # JSON object string

    run = relationship("MatchRunModel", back_populates="results")
    resume = relationship("ResumeModel")

class BiasAuditRunModel(Base):
    __tablename__ = "bias_audit_runs"

    id = Column(String(50), primary_key=True, index=True)
    run_id = Column(String(50), ForeignKey("match_runs.id"), nullable=False, unique=True)
    demographic_parity_diff = Column(Float, nullable=False)
    selection_rate_ratio = Column(Float, nullable=False)
    max_score_gap = Column(Float, nullable=False)
    flagged = Column(Boolean, default=False)
    audit_summary = Column(Text, nullable=False)  # JSON object
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("MatchRunModel", back_populates="audit")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
