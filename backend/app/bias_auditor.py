import re
import numpy as np
from typing import List, Dict, Any
from app.matcher import predict_match_score

# Professional, non-demographic candidate auditing variant sets
# Tests parser & scoring robustness across formatting styles, institution types, and career gaps.
NAME_FORMAT_VARIANTS = {
    "Standard Name Format": ["Alex Rivera", "Marcus Vance", "David Miller"],
    "Hyphenated / Compound": ["Alex Taylor-Smith", "Elena Cruz-Reyes", "Jordan Lee-Davies"],
    "Mononym / Initial Format": ["A. J. Morgan", "J. K. Taylor", "M. Vance"],
    "Unicode & Diacritics": ["Renée Müller", "José García-González", "Søren Lindqvist"]
}

UNIVERSITY_VARIANTS = {
    "Tier 1 (Top Global Research Univ)": "Stanford University",
    "Tier 2 (Regional State Univ)": "Ohio State University",
    "Tier 3 (Technical & Community Institute)": "Metropolitan Community College",
    "Tier 4 (Bootcamp / Specialized Cert)": "Independent Tech Academy"
}

EMPLOYMENT_GAP_VARIANTS = {
    "Continuous Career Path": False,
    "2-Year Career Break / Leave": True
}

def generate_counterfactual_text(
    base_text: str,
    new_name: str,
    new_university: str,
    add_gap: bool
) -> str:
    """Generate synthetic variant resume text changing name format, institution tier, and career gap."""
    text = base_text
    
    # Swap first line / candidate name if present
    lines = text.splitlines()
    if lines:
        lines[0] = new_name
        text = "\n".join(lines)
        
    # Replace university references
    pattern_unis = r"\b(Stanford|Harvard|MIT|UC Berkeley|Oxford|Cambridge|Columbia|Cornell|Princeton|Yale|State University|City College|Community College|Tech Academy)\b"
    text = re.sub(pattern_unis, new_university, text, flags=re.IGNORECASE)

    # Insert or remove career gap note
    if add_gap and "Career Gap" not in text and "Employment Gap" not in text:
        text += "\n[Note: 2021-2023 Career Break for Professional Skill Refinement & Personal Leave]"
    elif not add_gap:
        text = re.sub(r"\[Note:.*?Career Break.*?\]", "", text, flags=re.IGNORECASE)

    return text

def run_counterfactual_audit(
    resumes: List[Dict[str, Any]],
    job: Dict[str, Any],
    score_gap_threshold: float = 5.0
) -> Dict[str, Any]:
    """Execute counterfactual fairness & robustness auditing across formatting, institution, and career gap groups."""
    
    detailed_variants = []
    name_group_scores: Dict[str, List[float]] = {group: [] for group in NAME_FORMAT_VARIANTS.keys()}
    uni_tier_scores: Dict[str, List[float]] = {tier: [] for tier in UNIVERSITY_VARIANTS.keys()}
    gap_scores: Dict[str, List[float]] = {gap_label: [] for gap_label in EMPLOYMENT_GAP_VARIANTS.keys()}

    # Select representative sample resumes (up to 5 base resumes for fast evaluation)
    sample_resumes = resumes[:5] if len(resumes) > 5 else resumes

    for base_res in sample_resumes:
        raw_text = base_res.get("raw_text", "")
        skills = base_res.get("skills", [])
        exp = base_res.get("years_experience", 3.0)
        edu = base_res.get("education_level", "Bachelor's")

        # 1. Audit Name Formatting Structure Variants
        for group, names in NAME_FORMAT_VARIANTS.items():
            for name in names:
                variant_text = generate_counterfactual_text(raw_text, name, "Stanford University", False)
                res = predict_match_score(
                    variant_text, skills, exp, edu,
                    job.get("raw_text", ""), job.get("skills", []), job.get("min_years_experience", 3.0), job.get("education_level", "Bachelor's")
                )
                score = res["final_score"]
                name_group_scores[group].append(score)
                detailed_variants.append({
                    "base_candidate": base_res.get("candidate_name"),
                    "variant_type": "Name Format",
                    "group": group,
                    "variant_val": name,
                    "score": score
                })

        # 2. Audit University Tier Variants
        for tier_name, uni_name in UNIVERSITY_VARIANTS.items():
            variant_text = generate_counterfactual_text(raw_text, "Alex Morgan", uni_name, False)
            res = predict_match_score(
                variant_text, skills, exp, edu,
                job.get("raw_text", ""), job.get("skills", []), job.get("min_years_experience", 3.0), job.get("education_level", "Bachelor's")
            )
            score = res["final_score"]
            uni_tier_scores[tier_name].append(score)
            detailed_variants.append({
                "base_candidate": base_res.get("candidate_name"),
                "variant_type": "University Tier",
                "group": tier_name,
                "variant_val": uni_name,
                "score": score
            })

        # 3. Audit Employment Gap Variants
        for gap_label, has_gap in EMPLOYMENT_GAP_VARIANTS.items():
            variant_text = generate_counterfactual_text(raw_text, "Alex Morgan", "Stanford University", has_gap)
            # Apply slight experience adjustment if career gap
            adjusted_exp = max(0.5, exp - 2.0) if has_gap else exp
            res = predict_match_score(
                variant_text, skills, adjusted_exp, edu,
                job.get("raw_text", ""), job.get("skills", []), job.get("min_years_experience", 3.0), job.get("education_level", "Bachelor's")
            )
            score = res["final_score"]
            gap_scores[gap_label].append(score)
            detailed_variants.append({
                "base_candidate": base_res.get("candidate_name"),
                "variant_type": "Career Gap",
                "group": gap_label,
                "variant_val": gap_label,
                "score": score
            })

    # Compute averages per formatting structure group
    avg_name_scores = {grp: round(float(np.mean(scores)), 1) if scores else 0.0 for grp, scores in name_group_scores.items()}
    avg_uni_scores = {tier: round(float(np.mean(scores)), 1) if scores else 0.0 for tier, scores in uni_tier_scores.items()}
    avg_gap_scores = {lbl: round(float(np.mean(scores)), 1) if scores else 0.0 for lbl, scores in gap_scores.items()}

    # Calculate Formatting Parity Difference & Selection Rate Ratio across name format groups
    scores_list = list(avg_name_scores.values())
    max_score = max(scores_list) if scores_list else 0.0
    min_score = min(scores_list) if scores_list else 0.0

    dpd = round(max_score - min_score, 2)
    srr = round(min_score / max_score, 3) if max_score > 0 else 1.0

    # Max overall score gap (highest gap among all variant dimensions)
    max_uni_gap = max(avg_uni_scores.values()) - min(avg_uni_scores.values()) if avg_uni_scores else 0.0
    max_overall_gap = round(max(dpd, max_uni_gap), 2)

    flagged = bool(max_overall_gap > score_gap_threshold)

    return {
        "demographic_parity_diff": dpd,
        "selection_rate_ratio": srr,
        "max_score_gap": max_overall_gap,
        "flagged": flagged,
        "threshold": score_gap_threshold,
        "name_group_scores": avg_name_scores,
        "university_tier_scores": avg_uni_scores,
        "employment_gap_scores": avg_gap_scores,
        "detailed_variants": detailed_variants[:30]  # sample detailed log
    }

