"""Turn raw Synthea CSV into synthetic patients and encounters (D-017).

Kept from Synthea: birth date, sex, encounter date and encounter class. Nothing else.
Dropped: Synthea IDs, names, SSN, driver's license, passport, address, geo, income,
provider, organization, payer and every clinical code (SNOMED).
Names, member IDs, addresses, phones and emails come from our own seeded lists.
A header that differs from Synthea v4.0.0 stops the run (schema drift).
"""

from __future__ import annotations

import csv
import datetime as dt
from pathlib import Path

from arthai_gen import config
from arthai_gen.util import derive_rng, write_jsonl
from rcm_models import Address, Encounter, Patient

PATIENT_HEADER = [
    "Id",
    "BIRTHDATE",
    "DEATHDATE",
    "SSN",
    "DRIVERS",
    "PASSPORT",
    "PREFIX",
    "FIRST",
    "MIDDLE",
    "LAST",
    "SUFFIX",
    "MAIDEN",
    "MARITAL",
    "RACE",
    "ETHNICITY",
    "GENDER",
    "BIRTHPLACE",
    "ADDRESS",
    "CITY",
    "STATE",
    "COUNTY",
    "FIPS",
    "ZIP",
    "LAT",
    "LON",
    "HEALTHCARE_EXPENSES",
    "HEALTHCARE_COVERAGE",
    "INCOME",
]
ENCOUNTER_HEADER = [
    "Id",
    "START",
    "STOP",
    "PATIENT",
    "ORGANIZATION",
    "PROVIDER",
    "PAYER",
    "ENCOUNTERCLASS",
    "CODE",
    "DESCRIPTION",
    "BASE_ENCOUNTER_COST",
    "TOTAL_CLAIM_COST",
    "PAYER_COVERAGE",
    "REASONCODE",
    "REASONDESCRIPTION",
]
KEEP_CLASSES = ("wellness", "ambulatory", "outpatient", "urgentcare")
WINDOW_DAYS = 365
MAX_ROWS = 2_000_000

FIRST_NAMES = (
    "Avery",
    "Blair",
    "Casey",
    "Dana",
    "Ellis",
    "Finley",
    "Gray",
    "Harper",
    "Indy",
    "Jules",
    "Kai",
    "Lane",
    "Morgan",
    "Noel",
    "Oakley",
    "Parker",
    "Quinn",
    "Reese",
    "Sage",
    "Tatum",
    "Umber",
    "Vale",
    "Wren",
    "Xen",
    "Yael",
    "Zion",
)
LAST_NAMES = (
    "Alder",
    "Birchwood",
    "Cobble",
    "Driftmoor",
    "Embervale",
    "Fernhollow",
    "Glimmer",
    "Hollowell",
    "Ironbark",
    "Juniperly",
    "Kestrelton",
    "Larkspur",
    "Mossgrove",
    "Nettleby",
    "Oakhaven",
    "Pebbleton",
    "Quillfeather",
    "Rushmere",
    "Saltmarsh",
    "Thistlewood",
)
STREETS = ("Riverbend Way", "Heron Loop", "Millrace Lane", "Old Ferry Road", "Willow Bank")
PAYER_IDS = ("ZZP01", "ZZP02", "ZZP03")
PAYER_WEIGHTS = (5, 3, 2)


class IngestError(ValueError):
    """Synthea output is missing, malformed, or not the v4.0.0 layout."""


def _read(path: Path, header: list[str]) -> list[dict[str, str]]:
    if not path.is_file():
        raise IngestError(f"missing {path}; run scripts/run_synthea.sh first")
    with path.open(encoding="utf-8", newline="") as fh:
        reader = csv.reader(fh, strict=True)
        got = next(reader, None)
        if got != header:
            raise IngestError(f"{path.name}: header drift; expected Synthea {config.SYNTHEA_TAG}")
        rows: list[dict[str, str]] = []
        for n, row in enumerate(reader, start=2):
            if len(row) != len(header):
                raise IngestError(f"{path.name}:{n}: {len(row)} fields, expected {len(header)}")
            rows.append(dict(zip(header, row, strict=True)))
            if len(rows) > MAX_ROWS:
                raise IngestError(f"{path.name}: more than {MAX_ROWS} rows")
    return rows


def _date(value: str, where: str) -> dt.date:
    try:
        return dt.date.fromisoformat(value[:10])
    except ValueError as exc:
        raise IngestError(f"{where}: bad date {value!r}") from exc


def ingest(csv_dir: Path, seed: int, out_dir: Path = config.SYNTH / "patients") -> tuple[int, int]:
    raw_patients = _read(csv_dir / "patients.csv", PATIENT_HEADER)
    raw_encounters = _read(csv_dir / "encounters.csv", ENCOUNTER_HEADER)
    rng = derive_rng(seed, "ingest")

    start = config.DEMO_TODAY - dt.timedelta(days=WINDOW_DAYS)
    alive: list[tuple[dt.date, str, str]] = []
    for r in raw_patients:
        birth = _date(r["BIRTHDATE"], "patients.BIRTHDATE")
        if r["DEATHDATE"].strip() or birth > config.DEMO_TODAY:
            continue
        if r["GENDER"] not in ("F", "M"):
            raise IngestError(f"patients.GENDER: unexpected {r['GENDER']!r}")
        alive.append((birth, r["Id"], r["GENDER"]))
    alive.sort()  # by birth date, then Synthea id (tie-break only; the id is never written)

    id_map: dict[str, str] = {}
    patients: list[Patient] = []
    used_members: set[str] = set()
    for n, (birth, synthea_id, sex) in enumerate(alive, start=1):
        pid = f"SYN-P-{n:06d}"
        id_map[synthea_id] = pid
        first = rng.choice(FIRST_NAMES)
        last = rng.choice(LAST_NAMES)
        member = f"ZZ{rng.randrange(10**9):09d}"
        while member in used_members:
            member = f"ZZ{rng.randrange(10**9):09d}"
        used_members.add(member)
        patients.append(
            Patient(
                patient_id=pid,
                member_id=member,
                payer_id=rng.choices(PAYER_IDS, PAYER_WEIGHTS)[0],
                first_name=first,
                last_name=last,
                birth_date=birth,
                sex=sex,  # type: ignore[arg-type]
                address=Address(
                    line1=f"{rng.randrange(10, 999)} {rng.choice(STREETS)}",
                    city="Riverbend",
                    state="ZZ",
                    zip="00000",
                    fictional=True,
                ),
                phone=f"(555) 555-01{rng.randrange(100):02d}",
                email=f"{first}.{last}{n}@example.com".lower(),
            )
        )

    keyed: set[tuple[str, dt.date, str]] = set()
    for r in raw_encounters:
        owner = id_map.get(r["PATIENT"])
        cls = r["ENCOUNTERCLASS"]
        when = _date(r["START"], "encounters.START")
        if owner is None or cls not in KEEP_CLASSES or not start <= when < config.DEMO_TODAY:
            continue
        keyed.add((owner, when, cls))  # one encounter per patient, day and class
    encounters = [
        Encounter(
            encounter_id=f"SYN-E-{n:06d}",
            patient_id=pid,
            date=when,
            encounter_class=cls,  # type: ignore[arg-type]
        )
        for n, (pid, when, cls) in enumerate(sorted(keyed), start=1)
    ]
    if not patients or not encounters:
        raise IngestError("Synthea output gave no usable patients or encounters")
    write_jsonl(out_dir / "patients.jsonl", patients)
    write_jsonl(out_dir / "encounters.jsonl", encounters)
    return len(patients), len(encounters)
