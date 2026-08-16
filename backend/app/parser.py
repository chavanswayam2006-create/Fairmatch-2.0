import re
import io
import os
from typing import List, Dict, Any, Tuple

# Comprehensive multi-industry skill taxonomy (24+ job categories)
KNOWN_SKILLS = [
    # Software Engineering & Web Development
    "python", "javascript", "typescript", "react", "next.js", "node.js", "vue", "angular",
    "html", "css", "tailwind", "sass", "fastapi", "flask", "django", "express", "spring boot", "ruby on rails", "asp.net",
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite", "graphql", "rest api", "system design",
    "c++", "c#", "java", "go", "rust", "r", "swift", "kotlin", "bash", "linux", "git", "github", "unit testing", "pytest", "jest", "cypress",
    
    # Cloud & DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ansible", "jenkins", "ci/cd", "github actions", "prometheus", "grafana",
    
    # Data Science, AI/ML & Big Data
    "machine learning", "deep learning", "nlp", "spacy", "scikit-learn", "xgboost", "pytorch", "tensorflow",
    "pandas", "numpy", "computer vision", "llm", "genai", "prompt engineering", "spark", "hadoop", "kafka", "snowflake", "bigquery", "airflow", "dbt",
    
    # Data Analytics & Business Intelligence
    "tableau", "power bi", "excel", "data visualization", "business intelligence", "etl", "statistical analysis", "looker",
    
    # Cybersecurity
    "cybersecurity", "penetration testing", "network security", "cryptography", "siem", "incident response", "vulnerability assessment", "cissp",
    
    # Product Management & Project Management
    "agile", "scrum", "kanban", "jira", "product roadmap", "user stories", "a/b testing", "product lifecycle", "okrs", "pmp", "project management",
    
    # UI/UX Design
    "figma", "sketch", "adobe xd", "user research", "wireframing", "prototyping", "usability testing", "design systems", "ui design", "ux research",
    
    # Digital Marketing & Sales
    "seo", "sem", "google analytics", "content marketing", "hubspot", "salesforce", "lead generation", "crm", "email marketing", "copywriting",
    
    # Finance & Accounting
    "financial modeling", "valuation", "forecasting", "budgeting", "quickbooks", "sap", "financial analysis", "auditing", "gaap", "ifrs",
    
    # HR, Talent & Operations
    "talent acquisition", "onboarding", "hris", "employee relations", "recruiting", "workforce planning", "supply chain", "logistics", "operations management",
    
    # Engineering, Healthcare & Support
    "cad", "matlab", "circuit design", "zendesk", "customer support", "customer success", "clinical research", "curriculum development"
]

DEGREE_PATTERNS = [
    (r"\b(phd|doctorate|doctor of philosophy)\b", "PhD"),
    (r"\b(master|masters|m\.s\.|ms|m\.a\.|ma|m\.tech|mba)\b", "Master's"),
    (r"\b(bachelor|bachelors|b\.s\.|bs|b\.a\.|ba|b\.tech|be|b\.e\.)\b", "Bachelor's"),
    (r"\b(associate|associates|a\.s\.|a\.a\.)\b", "Associate's"),
    (r"\b(high school|diploma|ged)\b", "High School")
]

UNIVERSITIES_LIST = [
    "Stanford University", "Harvard University", "MIT", "Massachusetts Institute of Technology",
    "UC Berkeley", "Carnegie Mellon University", "University of Oxford", "University of Cambridge",
    "Columbia University", "Cornell University", "Princeton University", "Yale University",
    "State University", "City College", "Community College", "Polytechnic Institute",
    "University of Texas", "University of Michigan", "University of Washington",
    "Georgia Tech", "UCLA", "UIUC"
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from PDF file bytes using pdfplumber."""
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text = "\n".join([page.extract_text() or "" for page in pdf.pages])
            if text.strip():
                return text
    except Exception as e:
        print(f"pdfplumber extraction fallback: {e}")

    # Fallback to simple string decoder
    try:
        return file_bytes.decode('utf-8', errors='ignore')
    except Exception:
        return ""

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract raw text from DOCX file bytes using python-docx."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join([p.text for p in doc.paragraphs if p.text])
    except Exception as e:
        print(f"python-docx error: {e}")
        return file_bytes.decode('utf-8', errors='ignore')

def extract_skills(text: str) -> List[str]:
    """Extract normalized skill tags from raw text."""
    text_lower = text.lower()
    found_skills = []
    
    for skill in KNOWN_SKILLS:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            found_skills.append(skill.title())
            
    # Also find capitalized technical terms using regex
    words = re.findall(r"\b[A-Z][a-zA-Z0-9\.\+\#\-]{2,}\b", text)
    for word in words:
        wl = word.lower()
        if wl in KNOWN_SKILLS and word.title() not in found_skills:
            found_skills.append(word.title())

    return list(dict.fromkeys(found_skills))  # deduplicate preserving order

def extract_years_experience(text: str) -> float:
    """Extract total estimated years of experience from resume/JD text."""
    # Matches patterns like "5+ years", "6 years of experience", "2018 - 2024"
    patterns = [
        r"(\d+)\+?\s*(?:-\s*\d+)?\s*years?(?:\s*of\s*experience)?",
        r"experience\s*:\s*(\d+)\+?\s*years?",
        r"(\d+)\+?\s*yrs"
    ]
    
    matches = []
    for pat in patterns:
        found = re.findall(pat, text, re.IGNORECASE)
        for val in found:
            try:
                matches.append(float(val))
            except ValueError:
                pass
                
    if matches:
        return max(matches)
        
    # Check date ranges (e.g. 2018 - 2024)
    years = [int(y) for y in re.findall(r"\b(20[0-2][0-9]|19[89][0-9])\b", text)]
    if len(years) >= 2:
        span = max(years) - min(years)
        if 0 < span <= 45:
            return float(span)

    return 3.0  # default baseline estimate if unspecified

def extract_education(text: str) -> Tuple[str, str]:
    """Extract highest education degree level and institution name."""
    text_lower = text.lower()
    detected_degree = "Bachelor's"
    
    for pat, degree in DEGREE_PATTERNS:
        if re.search(pat, text_lower):
            detected_degree = degree
            break

    detected_institution = "State University"
    for uni in UNIVERSITIES_LIST:
        if uni.lower() in text_lower:
            detected_institution = uni
            break

    return detected_degree, detected_institution

def extract_candidate_name(text: str, default_name: str = "Candidate") -> str:
    """Extract likely candidate name from top lines of text."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if lines:
        first_line = lines[0]
        # Clean up line
        first_line_clean = re.sub(r"[^a-zA-Z\s]", "", first_line).strip()
        words = first_line_clean.split()
        if 1 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
            return first_line_clean
            
    return default_name

def extract_seniority_level(title: str, text: str) -> str:
    """Intelligently detect seniority level from title and responsibility text."""
    combined = f"{title} {text}".lower()
    
    if any(k in combined for k in ["executive", "chief", "cto", "cio", "ceo", "cfo"]):
        return "Executive"
    if any(k in combined for k in ["vp", "vice president"]):
        return "VP / Vice President"
    if any(k in combined for k in ["director", "head of"]):
        return "Director / Head"
    if any(k in combined for k in ["manager", "lead", "principal", "staff"]):
        return "Lead / Manager"
    if any(k in combined for k in ["senior", "sr.", "sr "]):
        return "Senior"
    if any(k in combined for k in ["mid-level", "mid level", "intermediate"]):
        return "Mid-Level"
    if any(k in combined for k in ["junior", "jr.", "jr ", "associate"]):
        return "Junior / Associate"
    if any(k in combined for k in ["intern", "trainee", "entry", "apprentice"]):
        return "Entry-Level / Intern"

    # Default fallback based on years of experience mentioned
    years = extract_years_experience(text)
    if years >= 7: return "Senior"
    if years >= 3: return "Mid-Level"
    return "Entry / Mid-Level"

def extract_resume_sections(text: str) -> Dict[str, List[str]]:
    """Segment resume text into logical sections for evidence source tracking."""
    lines = text.splitlines()
    sections: Dict[str, List[str]] = {
        "experience": [],
        "projects": [],
        "skills": [],
        "education": []
    }
    
    current_sec = "experience"
    for line in lines:
        line_clean = line.strip().lower()
        if not line_clean:
            continue
            
        if any(h in line_clean for h in ["experience", "work history", "employment", "career history"]):
            current_sec = "experience"
        elif any(h in line_clean for h in ["project", "portfolio", "built", "apps"]):
            current_sec = "projects"
        elif any(h in line_clean for h in ["skill", "technologies", "tools", "competencies"]):
            current_sec = "skills"
        elif any(h in line_clean for h in ["education", "academic", "university", "degree"]):
            current_sec = "education"
            
        sections[current_sec].append(line.strip())
        
    return sections

def parse_document(file_content: bytes, filename: str) -> Dict[str, Any]:
    """Master document parser routine."""
    ext = os.path.splitext(filename)[1].lower()
    
    if ext == ".pdf":
        raw_text = extract_text_from_pdf(file_content)
    elif ext in [".docx", ".doc"]:
        raw_text = extract_text_from_docx(file_content)
    else:
        try:
            raw_text = file_content.decode('utf-8', errors='ignore')
        except Exception:
            raw_text = str(file_content)

    skills = extract_skills(raw_text)
    years_exp = extract_years_experience(raw_text)
    edu_level, institution = extract_education(raw_text)
    name = extract_candidate_name(raw_text, default_name=os.path.splitext(filename)[0].replace("_", " ").title())
    sections = extract_resume_sections(raw_text)

    return {
        "raw_text": raw_text,
        "candidate_name": name,
        "skills": skills,
        "years_experience": years_exp,
        "education_level": edu_level,
        "institution": institution,
        "sections": sections
    }
