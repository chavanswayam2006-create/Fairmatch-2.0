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

class OccupationsModel(Base):
    __tablename__ = "occupations"

    id = Column(String(50), primary_key=True, index=True)
    canonical_title = Column(String(200), nullable=False, index=True)
    alternative_titles = Column(Text, default="[]")  # JSON array
    occupation_code = Column(String(50), index=True)  # ISCO-08 or ESCO code
    occupation_family = Column(String(100), index=True)
    industry = Column(String(100), index=True)
    description = Column(Text, nullable=False)
    typical_responsibilities = Column(Text, default="[]")  # JSON array
    common_skills = Column(Text, default="[]")  # JSON array
    tools = Column(Text, default="[]")  # JSON array
    certifications = Column(Text, default="[]")  # JSON array

    jobs = relationship("JobLibraryModel", back_populates="occupation")


# ISCO-08 is deliberately modelled separately from the application's curated job
# library.  A classification group is occupational context, not an employer
# vacancy or a candidate-ranking profile.
class ISCOMajorGroupModel(Base):
    __tablename__ = "isco_major_groups"

    code = Column(String(1), primary_key=True)
    title = Column(String(300), nullable=False, index=True)
    definition = Column(Text, default="")
    source_page = Column(Integer, nullable=True)
    source_document = Column(String(100), default="ISCO-08 Volume I")
    source_version = Column(String(20), default="2012")
    source_type = Column(String(20), default="ILO")


class ISCOSubMajorGroupModel(Base):
    __tablename__ = "isco_sub_major_groups"

    code = Column(String(2), primary_key=True)
    major_code = Column(String(1), ForeignKey("isco_major_groups.code"), nullable=False, index=True)
    title = Column(String(300), nullable=False, index=True)
    definition = Column(Text, default="")
    source_page = Column(Integer, nullable=True)
    source_document = Column(String(100), default="ISCO-08 Volume I")
    source_version = Column(String(20), default="2012")
    source_type = Column(String(20), default="ILO")


class ISCOMinorGroupModel(Base):
    __tablename__ = "isco_minor_groups"

    code = Column(String(3), primary_key=True)
    sub_major_code = Column(String(2), ForeignKey("isco_sub_major_groups.code"), nullable=False, index=True)
    title = Column(String(300), nullable=False, index=True)
    definition = Column(Text, default="")
    source_page = Column(Integer, nullable=True)
    source_document = Column(String(100), default="ISCO-08 Volume I")
    source_version = Column(String(20), default="2012")
    source_type = Column(String(20), default="ILO")


class ISCOUnitGroupModel(Base):
    __tablename__ = "isco_unit_groups"

    code = Column(String(4), primary_key=True)
    minor_code = Column(String(3), ForeignKey("isco_minor_groups.code"), nullable=False, index=True)
    title = Column(String(300), nullable=False, index=True)
    definition = Column(Text, default="")
    included_occupations_raw = Column(Text, default="")
    excluded_occupations_raw = Column(Text, default="")
    notes = Column(Text, default="")
    source_page = Column(Integer, nullable=True)
    source_document = Column(String(100), default="ISCO-08 Volume I")
    source_version = Column(String(20), default="2012")
    source_type = Column(String(20), default="ILO")


class ISCOOccupationTaskModel(Base):
    __tablename__ = "isco_occupation_tasks"

    id = Column(String(80), primary_key=True)
    # Tasks occur at every ISCO hierarchy level, not only unit groups.
    isco_code = Column(String(4), nullable=False, index=True)
    task_type = Column(String(40), default="main_tasks")
    task_text = Column(Text, nullable=False)
    source_page = Column(Integer, nullable=True)


class ISCOOccupationAliasModel(Base):
    __tablename__ = "isco_occupation_aliases"

    id = Column(String(80), primary_key=True)
    occupation_title = Column(String(300), nullable=False, index=True)
    isco_code = Column(String(4), ForeignKey("isco_unit_groups.code"), nullable=False, index=True)
    source = Column(String(50), default="ISCO-08")
    relationship = Column(String(40), default="included_example")


class ISCOImportMetadataModel(Base):
    __tablename__ = "isco_import_metadata"

    id = Column(String(40), primary_key=True)
    imported_at = Column(DateTime, default=datetime.utcnow)
    source_pdf = Column(String(500), nullable=False)
    source_workbook = Column(String(500), nullable=False)
    page_count = Column(Integer, nullable=False)
    major_count = Column(Integer, nullable=False)
    sub_major_count = Column(Integer, nullable=False)
    minor_count = Column(Integer, nullable=False)
    unit_count = Column(Integer, nullable=False)
    alias_count = Column(Integer, nullable=False)
    task_count = Column(Integer, nullable=False)
    records_requiring_review = Column(Integer, nullable=False, default=0)

class JobLibraryModel(Base):
    __tablename__ = "job_library"

    id = Column(String(50), primary_key=True, index=True)
    slug = Column(String(200), unique=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    normalized_title = Column(String(200), index=True)
    occupation_id = Column(String(50), ForeignKey("occupations.id"), nullable=True)
    company = Column(String(100), default="Global Employment Partner")
    industry = Column(String(100), nullable=False, index=True)
    location = Column(String(100), default="Global / Remote")
    country = Column(String(100), default="Global", index=True)
    employment_type = Column(String(50), default="Full-time")
    seniority = Column(String(50), default="Mid-Level", index=True)
    description = Column(Text, nullable=False)
    responsibilities = Column(Text, default="[]")  # JSON array
    required_skills = Column(Text, default="[]")  # JSON array
    preferred_skills = Column(Text, default="[]")  # JSON array
    education = Column(String(100), default="Bachelor's Degree")
    experience_years = Column(Float, default=3.0)
    tools = Column(Text, default="[]")  # JSON array
    is_generic_profile = Column(Boolean, default=True)
    source = Column(String(100), default="ISCO-08/ESCO Global Framework")
    created_at = Column(DateTime, default=datetime.utcnow)

    occupation = relationship("OccupationsModel", back_populates="jobs")

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
    # Seed the source-backed classification independently of custom job data.
    # The importer is idempotent and only creates/refreshes isco_* tables.
    try:
        db = SessionLocal()
        needs_isco_import = db.query(ISCOMajorGroupModel).count() == 0
        db.close()
        if needs_isco_import:
            from pathlib import Path
            from scripts.import_isco08 import import_isco08
            source_dir = Path(__file__).resolve().parents[1] / "data" / "sources"
            import_isco08(source_dir / "isco-08-structure-and-definitions.xlsx", source_dir / "isco-08-volume-i.pdf")
    except Exception as e:
        print(f"ISCO-08 import notice: {e}")
    # Seed job library if empty
    try:
        from app.job_library_seeder import seed_job_library
        db = SessionLocal()
        seed_job_library(db)
        db.close()
    except Exception as e:
        print(f"Job library seeding notice: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
