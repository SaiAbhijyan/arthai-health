from __future__ import annotations

import json
from typing import Any

from arthai_gen import config
from arthai_gen.npi import npi_is_valid
from tests.conftest import repo_file


def test_fictional_npis_pass_luhn() -> None:
    assert all(npi_is_valid(n) for n in config.FICTIONAL_NPIS)


def test_luhn_rejects_bad_check_digit_and_junk() -> None:
    for bad in ("1999999902", "199999990", "19999999011", "199999990a", "", "１999999901"):
        assert not npi_is_valid(bad)


def test_nppes_fixture_has_zero_records_for_each_npi() -> None:
    data = json.loads(repo_file("tests/fixtures/nppes/empty_result.json").read_text())
    assert set(data["results"]) == set(config.FICTIONAL_NPIS)
    for result in data["results"].values():
        assert result["result_count"] == 0 and result["results"] == []


def _npis(obj: Any) -> list[str]:
    if isinstance(obj, dict):
        return [v for k, v in obj.items() if "npi" in k and isinstance(v, str)] + [
            n for v in obj.values() for n in _npis(v)
        ]
    if isinstance(obj, list):
        return [n for v in obj for n in _npis(v)]
    return []


def test_every_npi_in_data_is_fictional(rows: dict[str, list[dict[str, Any]]]) -> None:
    found = _npis(rows)
    for rel in ("practice/practice.json", "practice/providers.json"):
        found += _npis(json.loads((config.SYNTH / rel).read_text()))
    assert found
    assert set(found) <= set(config.FICTIONAL_NPIS)
