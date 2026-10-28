"""Fixed inputs for the pipeline. Change a value here, then rebuild with `make data`."""

from __future__ import annotations

import datetime as dt
from pathlib import Path

GENERATOR_VERSION = "0.1.0"
DEMO_TODAY = dt.date(2026, 10, 28)  # must match REF_DATE in scripts/run_synthea.sh
DEFAULT_SEED = 20261104
SYNTHEA_POPULATION = 200
SYNTHEA_TAG = "v4.0.0"
SYNTHEA_JAR_SHA256 = "ed43c20ad40ba5c3bc724503a5af032715fe3c491620b766148e7c2361e6ecc1"
JDK_VERSION = "17.0.21+9"
JDK_SHA256 = "8b9b611d917e3dfd8419d3566b5949226f69b052fed7e109c1368add1dfe8711"

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "data"
REF_CODES = DATA / "reference" / "codes"
SYNTH = DATA / "synthetic"
SCHEMAS = DATA / "schemas"
BUILD = ROOT / "build"

# Fictional NPIs: Luhn-valid (prefix 80840) and absent from NPPES on 2026-10-28
# (data-plan section 2.2; fixture tests/fixtures/nppes/empty_result.json).
FICTIONAL_NPIS = ("1999999901", "1999999919", "1999999927")
BILLING_NPI = "1999999927"
RENDERING_NPIS = ("1999999901", "1999999919")

# HCPCS Level II subset (CMS October 2026 file). Each code was checked in the file.
# No D-codes (CDT belongs to the ADA) and no CPT (D-009).
HCPCS_SUBSET = (
    "A4565",
    "A6216",
    "E0114",
    "E0143",
    "E0607",
    "G0008",
    "G0009",
    "G0136",
    "G0438",
    "G0439",
    "G0442",
    "G0444",
    "J0696",
    "J1100",
    "J1885",
    "J3420",
    "J7030",
    "L3908",
    "Q2035",
)

# ICD-10-CM FY2027 subset (CMS/CDC code descriptions file). Stored without the dot.
ICD10CM_SUBSET = (
    "D519",
    "E119",
    "E6609",
    "E785",
    "F32A",
    "G4733",
    "I10",
    "J069",
    "J45909",
    "K219",
    "L03115",
    "M25561",
    "M5450",
    "N390",
    "R519",
    "R7303",
    "S63501A",
    "S93401A",
    "Z0000",
    "Z0001",
    "Z1331",
    "Z23",
)

# Fictional fee schedule in cents (our own numbers, not a Medicare rate).
FEE_CENTS = {
    "A4565": 2_500,
    "A6216": 800,
    "E0114": 6_500,
    "E0143": 14_000,
    "E0607": 9_000,
    "G0008": 3_500,
    "G0009": 3_500,
    "G0136": 2_800,
    "G0438": 22_000,
    "G0439": 16_000,
    "G0442": 2_600,
    "G0444": 2_400,
    "J0696": 1_800,
    "J1100": 600,
    "J1885": 900,
    "J3420": 700,
    "J7030": 1_500,
    "L3908": 7_500,
    "Q2035": 3_200,
}

# Codes that suit each HCPCS code (for a plausible claim). Mismatch scenarios break this.
DX_FOR_CODE = {
    "A4565": ("S63501A",),
    "A6216": ("L03115",),
    "E0114": ("S93401A",),
    "E0143": ("M25561",),
    "E0607": ("E119", "R7303"),
    "G0008": ("Z23",),
    "G0009": ("Z23",),
    "G0136": ("Z0000",),
    "G0438": ("Z0000", "Z0001"),
    "G0439": ("Z0000", "Z0001"),
    "G0442": ("Z0000",),
    "G0444": ("Z1331",),
    "J0696": ("N390", "L03115"),
    "J1100": ("J45909", "M5450"),
    "J1885": ("R519", "M5450"),
    "J3420": ("D519",),
    "J7030": ("R519",),
    "L3908": ("S63501A",),
    "Q2035": ("Z23",),
}
