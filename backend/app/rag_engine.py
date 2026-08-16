import re
from typing import List, Dict, Any
from app.knowledge_graph import normalize_occupation_title, get_related_skills, SEMANTIC_SKILL_GRAPH, ESCO_DATA

class RAGEngine:
    """
    Retrieval-Augmented Generation (RAG) Engine.
    Retrieves relevant occupational context, skill taxonomies, and benchmark data
    prior to synthesis.
    """

    @staticmethod
    def retrieve_context_for_job(job_title: str, job_text: str) -> Dict[str, Any]:
        occ_info = normalize_occupation_title(job_title)
        
        # Retrieve ESCO skills
        esco_essential = []
        esco_optional = []
        for occ in ESCO_DATA.get("esco_occupations", []):
            if occ["canonical_title"] == occ_info["canonical_title"]:
                esco_essential = occ.get("essential_skills", [])
                esco_optional = occ.get("optional_skills", [])
                break

        # Semantic skill expansion
        text_lower = job_text.lower()
        expanded_skills = set(esco_essential + esco_optional)

        for key, graph_data in SEMANTIC_SKILL_GRAPH.items():
            if key in text_lower or any(eq in text_lower for eq in graph_data["equivalents"]):
                expanded_skills.add(key)
                for eq in graph_data["equivalents"]:
                    expanded_skills.add(eq)

        return {
            "occupation_info": occ_info,
            "esco_essential_skills": esco_essential,
            "esco_optional_skills": esco_optional,
            "expanded_skill_taxonomy": list(expanded_skills)
        }

    @staticmethod
    def retrieve_evidence_for_requirement(requirement_name: str, resume_text: str, resume_sections: Dict[str, str]) -> Dict[str, Any]:
        req_lower = requirement_name.lower()
        r_lower = resume_text.lower()

        # Check direct mentions
        direct_match = req_lower in r_lower

        # Retrieve related equivalents
        related = get_related_skills(requirement_name)
        matched_related = [r.title() for r in related if r in r_lower]

        # Determine evidence source section
        source_section = "General Text"
        found_in_exp = any(req_lower in exp.lower() or any(rel in exp.lower() for rel in related) for exp in resume_sections.get("experience", []))
        found_in_proj = any(req_lower in proj.lower() or any(rel in proj.lower() for rel in related) for proj in resume_sections.get("projects", []))
        found_in_skills = any(req_lower in s.lower() for s in resume_sections.get("skills", []))

        if found_in_exp:
            source_section = "Work Experience"
        elif found_in_proj:
            source_section = "Key Projects"
        elif found_in_skills:
            source_section = "Skills Section"

        # Determine measurable impact
        metrics_terms = ["%", "percent", "$", "k", "m", "scaled", "reduced", "increased", "built", "implemented", "optimized", "managed", "led"]
        has_impact = any(term in r_lower for term in metrics_terms) and (found_in_exp or found_in_proj)

        return {
            "requirement": requirement_name,
            "direct_match": direct_match,
            "matched_synonyms": matched_related,
            "source_section": source_section,
            "has_impact": has_impact
        }
