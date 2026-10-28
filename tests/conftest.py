from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from arthai_gen import config

SYNTH = config.SYNTH


def load_jsonl(rel: str) -> list[dict[str, Any]]:
    path = SYNTH / rel
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]


@pytest.fixture(scope="session")
def rows() -> dict[str, list[dict[str, Any]]]:
    return {
        "patients": load_jsonl("patients/patients.jsonl"),
        "encounters": load_jsonl("patients/encounters.jsonl"),
        "claims": load_jsonl("claims/claims.jsonl"),
        "denials": load_jsonl("denials/denials.jsonl"),
        "appeals": load_jsonl("appeals/appeals.jsonl"),
        "calls": load_jsonl("calls/transcripts.jsonl"),
    }


def repo_file(rel: str) -> Path:
    return config.ROOT / rel
