"""Build the HCPCS Level II and ICD-10-CM subsets from the public CMS files.

Manual step: run scripts/fetch_refdata.sh first (files land in build/ref, gitignored).
CMS text is copied as-is (CDC asks users not to change ICD-10-CM titles).
"""

from __future__ import annotations

import csv
import re
from pathlib import Path

from arthai_gen import config

HCPCS_FILE = config.BUILD / "ref" / "hcpcs" / "HCPC2026_OCT_ANWEB_09232026.txt"
ICD_FILE = config.BUILD / "ref" / "icd10cm" / "Code Descriptions" / "icd10cm_codes_2027.txt"
HCPCS_L2 = re.compile(r"^[A-CEGHJ-MP-V]\d{4}$")  # no D (CDT, ADA) and no numeric CPT


def hcpcs_rows(raw: Path, wanted: tuple[str, ...]) -> list[dict[str, str]]:
    found: dict[str, dict[str, str]] = {}
    for line in raw.read_text(encoding="latin-1").splitlines():
        code = line[0:5].strip()
        # Record layout (HCPC2026_recordlayout.txt): seq 6-10, rec id 11,
        # short description 92-119, termination date 285-292.
        if code not in wanted or line[5:10] != "00100" or line[10] != "3":
            continue
        if line[284:292].strip():
            raise ValueError(f"HCPCS {code} is terminated in the CMS file")
        found[code] = {
            "code": code,
            "short_desc": line[91:119].strip(),
            "source": "CMS HCPCS Level II",
            "quarter": "2026-10",
        }
    missing = sorted(set(wanted) - set(found))
    if missing:
        raise ValueError(f"HCPCS codes not in the CMS file: {missing}")
    for code in wanted:
        if not HCPCS_L2.match(code):
            raise ValueError(f"{code} is not a HCPCS Level II code we allow")
    return [found[c] for c in sorted(found)]


def icd_rows(raw: Path, wanted: tuple[str, ...]) -> list[dict[str, str]]:
    found: dict[str, dict[str, str]] = {}
    for line in raw.read_text(encoding="utf-8").splitlines():
        code, _, title = line.partition(" ")
        if code in wanted:
            found[code] = {
                "code": code,
                "title": title.strip(),
                "source": "ICD-10-CM, CDC/NCHS (CMS code descriptions file)",
                "fiscal_year": "2027",
            }
    missing = sorted(set(wanted) - set(found))
    if missing:
        raise ValueError(f"ICD-10-CM codes not in the FY2027 file: {missing}")
    return [found[c] for c in sorted(found)]


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def build(out: Path = config.REF_CODES) -> None:
    write_csv(out / "hcpcs_l2_subset.csv", hcpcs_rows(HCPCS_FILE, config.HCPCS_SUBSET))
    write_csv(out / "icd10cm_fy2027_subset.csv", icd_rows(ICD_FILE, config.ICD10CM_SUBSET))
