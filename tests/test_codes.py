"""Code catalog: licensing guards (D-009) and formats (data-plan section 5)."""

from __future__ import annotations

import csv
import re
from pathlib import Path

import pytest

from arthai_gen import config
from arthai_gen.codes import (
    CARC_COLUMNS,
    HCPCS_COLUMNS,
    ICD_COLUMNS,
    RARC_COLUMNS,
    CatalogError,
    load_catalog,
    read_csv,
)

REF = config.REF_CODES
X12_URLS = {
    "https://x12.org/codes/claim-adjustment-reason-codes",
    "https://x12.org/codes/remittance-advice-remark-codes",
}
SNAKE = re.compile(r"^[a-z][a-z_]{2,40}$")


def test_catalog_loads_and_matches_config_subsets() -> None:
    cat = load_catalog()
    assert cat.hcpcs == set(config.HCPCS_SUBSET)
    assert cat.icd10cm == set(config.ICD10CM_SUBSET)


def test_carc_rarc_hold_values_and_our_labels_only() -> None:
    """No X12 description text: only code, our snake_case category, and the public URL."""
    for name, cols in (("carc.csv", CARC_COLUMNS), ("rarc.csv", RARC_COLUMNS)):
        for row in read_csv(REF / name, cols):
            assert SNAKE.match(row["arthai_category"]), row
            assert row["x12_url"] in X12_URLS
            if "group_hint" in row:
                assert row["group_hint"] in {"CO", "PR", "OA", "PI"}


def test_code_formats() -> None:
    for r in read_csv(REF / "carc.csv", CARC_COLUMNS):
        assert re.fullmatch(r"[1-9]\d{0,2}|[A-Z]\d{1,2}", r["code"])
    for r in read_csv(REF / "rarc.csv", RARC_COLUMNS):
        assert re.fullmatch(r"(MA|M|N)\d{1,3}", r["code"])
    for r in read_csv(REF / "hcpcs_l2_subset.csv", HCPCS_COLUMNS):
        assert re.fullmatch(r"[A-CEGHJ-MP-V]\d{4}", r["code"]), "HCPCS II only; no CPT, no CDT"
        assert r["source"] == "CMS HCPCS Level II"
    for r in read_csv(REF / "icd10cm_fy2027_subset.csv", ICD_COLUMNS):
        assert re.fullmatch(r"[A-TV-Z]\d[0-9A-Z]{1,5}", r["code"])
        assert r["source"].startswith("ICD-10-CM, CDC/NCHS")


def test_no_cpt_or_ama_text_anywhere_in_reference_or_synthetic_data() -> None:
    banned = re.compile(r"\b(CPT|Current Procedural Terminology|American Medical Association)\b")
    for path in list(REF.rglob("*.csv")) + list(config.SYNTH.rglob("*")):
        if path.is_file():
            assert not banned.search(path.read_text(encoding="utf-8")), path


def test_reference_dir_has_only_known_files() -> None:
    names = {p.name for p in REF.iterdir()}
    assert names == {
        "carc.csv",
        "rarc.csv",
        "hcpcs_l2_subset.csv",
        "icd10cm_fy2027_subset.csv",
        "LICENSES.md",
    }


def test_catalog_rejects_column_drift(tmp_path: Path) -> None:
    bad = tmp_path / "carc.csv"
    bad.write_text("code,description\n197,some text\n")
    with pytest.raises(CatalogError):
        read_csv(bad, CARC_COLUMNS)


def test_catalog_rejects_duplicate_codes(tmp_path: Path) -> None:
    bad = tmp_path / "rarc.csv"
    with bad.open("w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(RARC_COLUMNS)
        w.writerow(["N54", "auth_mismatch", "https://x12.org/codes/remittance-advice-remark-codes"])
        w.writerow(["N54", "auth_mismatch", "https://x12.org/codes/remittance-advice-remark-codes"])
    with pytest.raises(CatalogError):
        read_csv(bad, RARC_COLUMNS)
