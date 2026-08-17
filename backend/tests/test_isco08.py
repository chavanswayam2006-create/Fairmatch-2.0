from pathlib import Path

from app.database import (
    SessionLocal, ISCOMajorGroupModel, ISCOSubMajorGroupModel,
    ISCOMinorGroupModel, ISCOUnitGroupModel,
)
from scripts.import_isco08 import EXPECTED_COUNTS, load_source_rows, validate


ROOT = Path(__file__).resolve().parents[1]


def test_official_ilo_workbook_has_complete_isco_hierarchy():
    rows = load_source_rows(ROOT / "data/sources/isco-08-structure-and-definitions.xlsx")
    validate(rows)
    assert sum(1 for row in rows if row["level"] == "1") == EXPECTED_COUNTS["1"]
    assert sum(1 for row in rows if row["level"] == "2") == EXPECTED_COUNTS["2"]
    assert sum(1 for row in rows if row["level"] == "3") == EXPECTED_COUNTS["3"]
    assert sum(1 for row in rows if row["level"] == "4") == EXPECTED_COUNTS["4"]


def test_imported_isco_records_preserve_parent_relationships():
    db = SessionLocal()
    try:
        assert db.query(ISCOMajorGroupModel).count() == 10
        assert db.query(ISCOSubMajorGroupModel).count() == 43
        assert db.query(ISCOMinorGroupModel).count() == 130
        assert db.query(ISCOUnitGroupModel).count() == 436
        unit = db.get(ISCOUnitGroupModel, "2512")
        assert unit and unit.minor_code == "251"
    finally:
        db.close()
