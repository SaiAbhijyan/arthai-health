"""Load the committed code catalog (data/reference/codes). Agents look up codes here only."""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path

from arthai_gen import config

CARC_COLUMNS = ["code", "group_hint", "arthai_category", "x12_url"]
RARC_COLUMNS = ["code", "arthai_category", "x12_url"]
HCPCS_COLUMNS = ["code", "short_desc", "source", "quarter"]
ICD_COLUMNS = ["code", "title", "source", "fiscal_year"]


class CatalogError(ValueError):
    """A catalog file is missing, has the wrong columns, or has a bad row."""


def read_csv(path: Path, columns: list[str]) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh)
        if reader.fieldnames != columns:
            raise CatalogError(f"{path.name}: columns {reader.fieldnames} != {columns}")
        rows = list(reader)
    codes = [r["code"] for r in rows]
    if len(set(codes)) != len(codes):
        raise CatalogError(f"{path.name}: duplicate codes")
    return rows


@dataclass(frozen=True)
class Catalog:
    carc: frozenset[str]
    rarc: frozenset[str]
    hcpcs: frozenset[str]
    icd10cm: frozenset[str]


def load_catalog(root: Path = config.REF_CODES) -> Catalog:
    return Catalog(
        carc=frozenset(r["code"] for r in read_csv(root / "carc.csv", CARC_COLUMNS)),
        rarc=frozenset(r["code"] for r in read_csv(root / "rarc.csv", RARC_COLUMNS)),
        hcpcs=frozenset(r["code"] for r in read_csv(root / "hcpcs_l2_subset.csv", HCPCS_COLUMNS)),
        icd10cm=frozenset(
            r["code"] for r in read_csv(root / "icd10cm_fy2027_subset.csv", ICD_COLUMNS)
        ),
    )
