"""Read-only ISCO-08 search and normalization services."""
from __future__ import annotations

import re
from difflib import SequenceMatcher
from typing import Any

from sqlalchemy import or_
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.database import (
    ISCOMajorGroupModel, ISCOSubMajorGroupModel, ISCOMinorGroupModel,
    ISCOUnitGroupModel, ISCOOccupationAliasModel,
)


def _terms(text: str) -> set[str]:
    return {term for term in re.findall(r"[a-z0-9]{3,}", text.lower()) if term not in {"and", "the", "for", "with"}}


def unit_hierarchy(unit: ISCOUnitGroupModel, db: Session) -> dict[str, dict[str, str]]:
    minor = db.get(ISCOMinorGroupModel, unit.minor_code)
    sub = db.get(ISCOSubMajorGroupModel, minor.sub_major_code) if minor else None
    major = db.get(ISCOMajorGroupModel, sub.major_code) if sub else None
    return {
        "major_group": {"code": major.code, "title": major.title} if major else {},
        "sub_major_group": {"code": sub.code, "title": sub.title} if sub else {},
        "minor_group": {"code": minor.code, "title": minor.title} if minor else {},
        "unit_group": {"code": unit.code, "title": unit.title},
    }


def best_occupation(query: str, db: Session, limit: int = 3) -> list[dict[str, Any]]:
    """Hybrid title, alias, definition and task-context retrieval without claiming certainty."""
    query = (query or "").strip()
    if not query:
        return []
    tokens = _terms(query)
    units = db.query(ISCOUnitGroupModel).all()
    aliases: dict[str, list[str]] = {}
    for alias in db.query(ISCOOccupationAliasModel).all():
        aliases.setdefault(alias.isco_code, []).append(alias.occupation_title)

    scored: list[tuple[float, ISCOUnitGroupModel, str]] = []
    for unit in units:
        title = unit.title.lower()
        alias_text = " ".join(aliases.get(unit.code, [])).lower()
        corpus = f"{title} {alias_text} {unit.definition}"
        title_ratio = SequenceMatcher(None, query.lower(), title).ratio()
        token_overlap = len(tokens & _terms(corpus)) / max(len(tokens), 1)
        alias_exact = any(query.lower() == value.lower() for value in aliases.get(unit.code, []))
        title_exact = query.lower() == title
        score = (3.0 if title_exact else 0.0) + (2.5 if alias_exact else 0.0) + (1.2 * title_ratio) + token_overlap
        if score > 0.25:
            reason = "Exact ISCO unit-group title" if title_exact else "Source-listed occupation example" if alias_exact else "Title and occupational-context similarity"
            scored.append((score, unit, reason))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [
        {"code": unit.code, "title": unit.title, "hierarchy": unit_hierarchy(unit, db), "match_reason": reason}
        for _, unit, reason in scored[:limit]
    ]


def occupation_context_for_analysis(job_title: str, job_text: str) -> dict[str, str] | None:
    """Return cautious ISCO context for analysis; failures never block custom JD analysis."""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        matches = best_occupation(f"{job_title} {job_text[:1200]}", db, limit=1)
        if not matches:
            return None
        match = matches[0]
        return {
            "canonical_title": match["title"], "isco_code": f"ISCO-08 Unit Group {match['code']}",
            "industry": match["hierarchy"].get("major_group", {}).get("title", "Occupational context"),
        }
    except OperationalError:
        return None
    finally:
        db.close()
