"""Repeatably import the official ILO ISCO-08 hierarchy into SQLite.

The workbook is the authoritative structured extraction companion to Volume I.
The PDF is read in full to attach source PDF page locations.  Its text layer has
known encoding artifacts, so definitions/tasks are never taken from that layer.
"""
from __future__ import annotations

import argparse
import hashlib
import re
import sys
from collections import Counter
from pathlib import Path

import openpyxl
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database import (  # noqa: E402
    Base, engine, SessionLocal,
    ISCOMajorGroupModel, ISCOSubMajorGroupModel, ISCOMinorGroupModel,
    ISCOUnitGroupModel, ISCOOccupationTaskModel, ISCOOccupationAliasModel,
    ISCOImportMetadataModel,
)

EXPECTED_COUNTS = {"1": 10, "2": 43, "3": 130, "4": 436}


def clean(value: object) -> str:
    return "" if value is None else str(value).strip()


def load_source_rows(workbook: Path) -> list[dict[str, str]]:
    sheet = openpyxl.load_workbook(workbook, read_only=True, data_only=True).worksheets[0]
    values = sheet.values
    headers = [clean(value) for value in next(values)]
    required = ["Level", "ISCO 08 Code", "Title EN", "Definition", "Tasks include", "Included occupations"]
    if any(header not in headers for header in required):
        raise ValueError("The workbook does not have the expected ILO structure-and-definitions columns.")

    rows: list[dict[str, str]] = []
    for row_values in values:
        row = dict(zip(headers, row_values))
        level, code, title = clean(row["Level"]), clean(row["ISCO 08 Code"]), clean(row["Title EN"])
        if not level or not code or not title:
            continue
        if level not in EXPECTED_COUNTS or not code.isdigit() or len(code) != int(level):
            raise ValueError(f"Invalid ISCO row: level={level!r}, code={code!r}, title={title!r}")
        rows.append({
            "level": level, "code": code, "title": title,
            "definition": clean(row.get("Definition")), "tasks": clean(row.get("Tasks include")),
            "included": clean(row.get("Included occupations")), "excluded": clean(row.get("Excluded occupations")),
            "notes": clean(row.get("Notes")),
        })
    return rows


def validate(rows: list[dict[str, str]]) -> None:
    counts = Counter(row["level"] for row in rows)
    if dict(counts) != EXPECTED_COUNTS:
        raise ValueError(f"Unexpected ISCO hierarchy counts: {dict(counts)}; expected {EXPECTED_COUNTS}")
    codes = {row["code"] for row in rows}
    if len(codes) != len(rows):
        raise ValueError("Duplicate ISCO code found in the source workbook.")
    for row in rows:
        if row["level"] != "1" and row["code"][:-1] not in codes:
            raise ValueError(f"Missing parent for ISCO code {row['code']}")


def source_pages(pdf: Path, codes: set[str]) -> tuple[dict[str, int], int]:
    """Read every PDF page and locate the explicit group heading when available."""
    reader = PdfReader(str(pdf))
    pattern = re.compile(r"(?:Major Group|Sub-major Group|Minor Group|Unit Group)\s+(\d{1,4})\b")
    pages: dict[str, int] = {}
    for index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        for code in pattern.findall(text):
            if code in codes and code not in pages:
                pages[code] = index
    return pages, len(reader.pages)


def source_aliases(raw: str) -> list[str]:
    """Extract only bullet examples supplied by the ILO workbook; never infer aliases."""
    if not raw:
        return []
    raw = re.sub(r"^Examples of (the )?occupations classified here:\s*", "", raw, flags=re.I)
    aliases = []
    for line in raw.splitlines():
        title = re.sub(r"^[-•]\s*", "", line).strip()
        if title and not title.lower().startswith(("examples of", "included occupations")):
            aliases.append(title)
    return aliases


def stable_id(prefix: str, *parts: str) -> str:
    digest = hashlib.sha1("\x1f".join(parts).encode("utf-8")).hexdigest()[:16]
    return f"{prefix}_{digest}"


def import_isco08(workbook: Path, pdf: Path) -> dict[str, int]:
    if not workbook.exists() or not pdf.exists():
        raise FileNotFoundError("Both the official ILO workbook and the Volume I PDF are required.")
    rows = load_source_rows(workbook)
    validate(rows)
    pages, page_count = source_pages(pdf, {row["code"] for row in rows})
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # These tables are owned solely by this source importer. Existing custom
        # job descriptions and the curated job library are not touched.
        db.query(ISCOOccupationTaskModel).delete()
        db.query(ISCOOccupationAliasModel).delete()
        db.query(ISCOUnitGroupModel).delete()
        db.query(ISCOMinorGroupModel).delete()
        db.query(ISCOSubMajorGroupModel).delete()
        db.query(ISCOMajorGroupModel).delete()
        db.query(ISCOImportMetadataModel).delete()

        alias_count = task_count = 0
        for row in rows:
            page = pages.get(row["code"])
            common = dict(code=row["code"], title=row["title"], definition=row["definition"], source_page=page)
            if row["level"] == "1":
                db.add(ISCOMajorGroupModel(**common))
            elif row["level"] == "2":
                db.add(ISCOSubMajorGroupModel(**common, major_code=row["code"][:-1]))
            elif row["level"] == "3":
                db.add(ISCOMinorGroupModel(**common, sub_major_code=row["code"][:-1]))
            else:
                db.add(ISCOUnitGroupModel(
                    **common, minor_code=row["code"][:-1], included_occupations_raw=row["included"],
                    excluded_occupations_raw=row["excluded"], notes=row["notes"],
                ))
                for alias in source_aliases(row["included"]):
                    db.add(ISCOOccupationAliasModel(
                        id=stable_id("alias", row["code"], alias), occupation_title=alias, isco_code=row["code"],
                    ))
                    alias_count += 1
            if row["tasks"]:
                db.add(ISCOOccupationTaskModel(
                    id=stable_id("task", row["code"]), isco_code=row["code"], task_text=row["tasks"], source_page=page,
                ))
                task_count += 1

        db.add(ISCOImportMetadataModel(
            id="isco08-volume-i", source_pdf=str(pdf), source_workbook=str(workbook), page_count=page_count,
            major_count=EXPECTED_COUNTS["1"], sub_major_count=EXPECTED_COUNTS["2"],
            minor_count=EXPECTED_COUNTS["3"], unit_count=EXPECTED_COUNTS["4"], alias_count=alias_count,
            task_count=task_count, records_requiring_review=len(rows) - len(pages),
        ))
        db.commit()
        return {"pages": page_count, "major": 10, "sub_major": 43, "minor": 130, "unit": 436,
                "aliases": alias_count, "tasks": task_count, "requires_review": len(rows) - len(pages)}
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import official ILO ISCO-08 Volume I data.")
    parser.add_argument("--workbook", type=Path, default=ROOT / "data/sources/isco-08-structure-and-definitions.xlsx")
    parser.add_argument("--pdf", type=Path, default=ROOT / "data/sources/isco-08-volume-i.pdf")
    args = parser.parse_args()
    print(import_isco08(args.workbook, args.pdf))
