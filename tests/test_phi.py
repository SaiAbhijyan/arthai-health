"""The PHI scanner must catch each leak class and must pass on committed data."""

from __future__ import annotations

import pytest

from arthai_gen import config
from arthai_gen.phi import scan_text, scan_tree


@pytest.mark.parametrize(
    ("text", "rule"),
    [
        ("ssn 123-45-6789", "ssn"),
        ("call 617-555-1234", "phone"),
        ("call (617) 555-2000", "phone"),
        ("mail jane@gmail.com", "email"),
        ("mbi 1EG4-TE5-MK73", "mbi"),
        ("mbi 1EG4TE5MK73", "mbi"),
        ("npi 1234567893", "npi"),
        ("id bcfe263a-a27a-c6b3-29ba-01c589801de3", "uuid"),
        ("name Frankie174 Howell947", "synthea_name"),
        ("code 99213 billed", "cpt_like"),
        ("code 0001F billed", "cpt_like"),
        ("payer Aetna", "real_payer"),
    ],
)
def test_scanner_catches(text: str, rule: str) -> None:
    rules = {f.rule for f in scan_text(text)}
    assert rule in rules


@pytest.mark.parametrize(
    "text",
    [
        "(555) 555-0142",
        "jo.alder1@example.com",
        "NPI 1999999901",
        "ZZ123456789",
        "SYN-C-000123",
        "ZZREF1234567",
        "zip 00000",
        "amount 125.00",
        "2026-10-28",
    ],
)
def test_scanner_allows_synthetic_forms(text: str) -> None:
    assert scan_text(text) == []


def test_scanner_never_echoes_full_value() -> None:
    (f,) = scan_text("123-45-6789")
    assert "6789" not in f.sample


def test_committed_data_is_clean() -> None:
    assert scan_tree(config.DATA) == []
