import json
import os
from typing import List, Dict, Any, Optional

# Load Taxonomies
TAXONOMY_DIR = os.path.join(os.path.dirname(__file__), "taxonomies")

def load_json_data(filepath: str) -> Any:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

ISCO_DATA = load_json_data(os.path.join(TAXONOMY_DIR, "isco_08.json"))
ESCO_DATA = load_json_data(os.path.join(TAXONOMY_DIR, "esco_skills.json"))

# Broad Semantic Equivalences Knowledge Graph
SEMANTIC_SKILL_GRAPH = {
    "rest api": {
        "equivalents": ["fastapi", "django", "express", "node.js", "spring boot", "flask", "api", "graphql", "microservices", "web services", "http endpoints"],
        "category": "Backend Engineering",
        "evidence_keywords": ["built", "developed", "endpoint", "created api", "routed", "json", "swagger"]
    },
    "automated testing": {
        "equivalents": ["jest", "cypress", "pytest", "unit testing", "selenium", "mocha", "chai", "junit", "react testing library", "playwright"],
        "category": "Quality Assurance & Testing",
        "evidence_keywords": ["coverage", "unit tests", "integration tests", "test suites", "ci/cd", "e2e"]
    },
    "cloud deployment": {
        "equivalents": ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "vercel", "netlify", "heroku", "ci/cd", "cloud architecture"],
        "category": "Cloud & DevOps",
        "evidence_keywords": ["deployed", "provisioned", "cluster", "container", "pipeline", "lambda", "ec2", "s3"]
    },
    "database": {
        "equivalents": ["postgresql", "mysql", "mongodb", "redis", "sql", "sqlite", "elasticsearch", "dynamodb", "snowflake", "oracle"],
        "category": "Data & Databases",
        "evidence_keywords": ["queries", "schema", "table", "database design", "indexing", "migrations"]
    },
    "machine learning": {
        "equivalents": ["pytorch", "tensorflow", "scikit-learn", "xgboost", "deep learning", "nlp", "pandas", "numpy", "computer vision", "llm"],
        "category": "Data Science & AI",
        "evidence_keywords": ["trained", "model", "accuracy", "predictions", "feature engineering", "pipeline"]
    },
    "data visualization": {
        "equivalents": ["tableau", "power bi", "matplotlib", "seaborn", "plotly", "looker", "d3.js", "dashboards"],
        "category": "Data Analytics & BI",
        "evidence_keywords": ["dashboards", "reports", "insights", "charts", "visualized"]
    },
    "agile": {
        "equivalents": ["scrum", "kanban", "jira", "sprint planning", "user stories", "standups"],
        "category": "Project Management",
        "evidence_keywords": ["sprints", "backlog", "cross-functional", "scrum master"]
    },
    "financial modeling": {
        "equivalents": ["excel", "valuation", "forecasting", "budgeting", "financial analysis", "quickbooks", "sap", "dcf"],
        "category": "Finance & Accounting",
        "evidence_keywords": ["models", "forecasts", "variance", "financial statements"]
    },
    "ui/ux design": {
        "equivalents": ["figma", "sketch", "adobe xd", "wireframing", "prototyping", "user research", "design systems"],
        "category": "Design & UX",
        "evidence_keywords": ["wireframes", "prototypes", "user testing", "components"]
    }
}

def normalize_occupation_title(job_title: str) -> Dict[str, str]:
    """
    Map raw job title to ISCO-08 code, ESCO canonical title, and industry family.
    Supports any job title worldwide via fallback fuzzy matching.
    """
    title_lower = job_title.lower()
    
    # 1. Search ESCO Occupations
    esco_list = ESCO_DATA.get("esco_occupations", [])
    for occ in esco_list:
        all_names = [occ["canonical_title"].lower()] + [a.lower() for a in occ.get("aliases", [])]
        if any(name in title_lower or title_lower in name for name in all_names):
            return {
                "canonical_title": occ["canonical_title"],
                "esco_code": occ["code"],
                "isco_code": f"ISCO-08 Unit Group {occ['code'][:4]}",
                "industry": get_industry_from_code(occ["code"]),
                "matched_alias": job_title
            }

    # 2. Search ISCO-08 Broad Groups
    major_groups = ISCO_DATA.get("major_groups", [])
    for maj in major_groups:
        for sub in maj.get("subgroups", []):
            for ex in sub.get("examples", []):
                if ex.lower() in title_lower or title_lower in ex.lower():
                    return {
                        "canonical_title": job_title.title(),
                        "esco_code": f"{maj['code']}000.1",
                        "isco_code": f"ISCO-08 {sub['code']} ({sub['title']})",
                        "industry": maj["title"],
                        "matched_alias": ex
                    }

    # Fallback for dynamic / custom occupations
    return {
        "canonical_title": job_title.title(),
        "esco_code": "2500.9",
        "isco_code": "ISCO-08 Major Group 2 (Professionals)",
        "industry": "General Professional Services",
        "matched_alias": job_title
    }

def get_industry_from_code(code: str) -> str:
    if code.startswith("25"): return "Information Technology & Software"
    if code.startswith("24") or code.startswith("12"): return "Finance, Business & Administration"
    if code.startswith("21"): return "Engineering & Architecture"
    if code.startswith("22"): return "Healthcare & Medicine"
    return "Professional Services"

def get_related_skills(skill: str) -> List[str]:
    """Retrieve semantically related skills from Knowledge Graph."""
    skill_lower = skill.lower()
    for key, data in SEMANTIC_SKILL_GRAPH.items():
        if key in skill_lower or any(eq in skill_lower for eq in data["equivalents"]):
            return data["equivalents"]
    return []
