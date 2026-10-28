"""Export JSON Schemas for each committed record type (data-plan 6.2)."""

from __future__ import annotations

import json
from pathlib import Path

from pydantic import BaseModel

from arthai_gen import config
from rcm_models import (
    Appeal,
    CallTranscript,
    Claim,
    Denial,
    Encounter,
    Patient,
    Payer,
    Practice,
    Provider,
)

MODELS: dict[str, type[BaseModel]] = {
    "appeal": Appeal,
    "call_transcript": CallTranscript,
    "claim": Claim,
    "denial": Denial,
    "encounter": Encounter,
    "patient": Patient,
    "payer": Payer,
    "practice": Practice,
    "provider": Provider,
}


def schema_text(model: type[BaseModel]) -> str:
    return json.dumps(model.model_json_schema(), sort_keys=True, indent=2) + "\n"


def export(out: Path = config.SCHEMAS) -> None:
    out.mkdir(parents=True, exist_ok=True)
    for name, model in MODELS.items():
        (out / f"{name}.schema.json").write_text(schema_text(model), encoding="utf-8", newline="\n")
