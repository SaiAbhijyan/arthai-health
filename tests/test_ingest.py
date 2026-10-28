"""Ingest keeps only birth date, sex and encounter date/class (D-017)."""

from __future__ import annotations

import csv
import hashlib
from pathlib import Path

import pytest

from arthai_gen.ingest import ENCOUNTER_HEADER, PATIENT_HEADER, IngestError, ingest

SENTINELS = {
    "SSN": "999-12-3456",
    "DRIVERS": "S99912345",
    "PASSPORT": "X99912345X",
    "FIRST": "Sentinelfirst123",
    "LAST": "Sentinellast456",
    "ADDRESS": "77 Sentinel Street",
    "CITY": "Sentinelcity",
    "INCOME": "424242",
    "BIRTHPLACE": "Sentinelplace",
}
ENC_SENTINELS = {
    "ORGANIZATION": "org-sentinel-0001",
    "PROVIDER": "prov-sentinel-0001",
    "PAYER": "payer-sentinel-0001",
    "CODE": "410620009",
    "DESCRIPTION": "Sentinel visit",
    "REASONDESCRIPTION": "Sentinel reason",
}


def _write(path: Path, header: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=header)
        w.writeheader()
        for r in rows:
            w.writerow({h: r.get(h, "") for h in header})


def _fixture(d: Path) -> Path:
    csv_dir = d / "csv"
    csv_dir.mkdir()
    pats = [
        {
            "Id": "aaaaaaaa-0000-0000-0000-000000000001",
            "BIRTHDATE": "1980-01-02",
            "GENDER": "F",
            **SENTINELS,
        },
        {
            "Id": "aaaaaaaa-0000-0000-0000-000000000002",
            "BIRTHDATE": "1990-05-06",
            "GENDER": "M",
            **SENTINELS,
        },
        {
            "Id": "aaaaaaaa-0000-0000-0000-000000000003",
            "BIRTHDATE": "1950-05-06",
            "DEATHDATE": "2020-01-01",
            "GENDER": "M",
            **SENTINELS,
        },
    ]
    encs = [
        {
            "Id": f"bbbbbbbb-0000-0000-0000-00000000000{i}",
            "START": f"2026-0{i + 1}-10T10:00:00Z",
            "PATIENT": pats[i % 3]["Id"],
            "ENCOUNTERCLASS": cls,
            **ENC_SENTINELS,
        }
        for i, cls in enumerate(["wellness", "ambulatory", "emergency", "urgentcare", "inpatient"])
    ]
    _write(csv_dir / "patients.csv", PATIENT_HEADER, pats)
    _write(csv_dir / "encounters.csv", ENCOUNTER_HEADER, encs)
    return csv_dir


def test_ingest_drops_every_forbidden_field(tmp_path: Path) -> None:
    out = tmp_path / "out"
    n_p, n_e = ingest(_fixture(tmp_path), 1, out)
    assert n_p == 2  # the deceased patient is dropped
    assert n_e == 3  # wellness, ambulatory, urgentcare of living patients; not ER/inpatient
    text = (out / "patients.jsonl").read_text() + (out / "encounters.jsonl").read_text()
    for value in [*SENTINELS.values(), *ENC_SENTINELS.values(), "aaaaaaaa", "bbbbbbbb"]:
        assert value not in text


def test_ingest_is_deterministic(tmp_path: Path) -> None:
    src = _fixture(tmp_path)
    digests = []
    for run in ("a", "b"):
        ingest(src, 42, tmp_path / run)
        digests.append(hashlib.sha256((tmp_path / run / "patients.jsonl").read_bytes()).hexdigest())
    assert digests[0] == digests[1]


def test_ingest_rejects_header_drift(tmp_path: Path) -> None:
    src = _fixture(tmp_path)
    p = src / "patients.csv"
    p.write_text(p.read_text().replace("SSN,", "SSN,NEWCOL,", 1))
    with pytest.raises(IngestError, match="header drift"):
        ingest(src, 1, tmp_path / "out")


def test_ingest_rejects_ragged_rows(tmp_path: Path) -> None:
    src = _fixture(tmp_path)
    p = src / "encounters.csv"
    p.write_text(p.read_text() + "x,y\n")
    with pytest.raises(IngestError):
        ingest(src, 1, tmp_path / "out")


def test_ingest_rejects_bad_dates_and_sex(tmp_path: Path) -> None:
    src = _fixture(tmp_path)
    p = src / "patients.csv"
    p.write_text(p.read_text().replace("1980-01-02", "1980-13-40", 1))
    with pytest.raises(IngestError, match="bad date"):
        ingest(src, 1, tmp_path / "out")
    (tmp_path / "two").mkdir()
    src2 = _fixture(tmp_path / "two")
    p2 = src2 / "patients.csv"
    p2.write_text(p2.read_text().replace(",F,", ",X,", 1))
    with pytest.raises(IngestError, match="GENDER"):
        ingest(src2, 1, tmp_path / "out2")


def test_ingest_requires_synthea_output(tmp_path: Path) -> None:
    with pytest.raises(IngestError, match="run_synthea"):
        ingest(tmp_path / "missing", 1, tmp_path / "out")
