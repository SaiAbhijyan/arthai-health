"""Load and check data/synthetic/scenarios.yaml against the code catalog."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated, Literal

import yaml
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from arthai_gen.codes import Catalog
from rcm_models.models import DenialCategory, GroupCode

Action = Literal["appeal", "corrected_claim", "send_records", "bill_other_payer", "write_off"]


class Scenario(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)
    id: Annotated[str, StringConstraints(pattern=r"^S\d{2}$")]
    category: DenialCategory
    group: GroupCode
    carc: str
    rarc: list[str]
    codes: Annotated[list[str], Field(min_length=1)]
    action: Action
    policy_code: Annotated[str, StringConstraints(pattern=r"^[A-Z]{2,4}$")]
    root_cause: Annotated[str, StringConstraints(min_length=1, max_length=400)]
    fix: Annotated[str, StringConstraints(min_length=1, max_length=400)]
    missing_info: list[str]
    evidence: list[str]


class ScenarioFile(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)
    version: Literal[1]
    scenarios: Annotated[list[Scenario], Field(min_length=12)]


def load_scenarios(path: Path, catalog: Catalog) -> list[Scenario]:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    parsed = ScenarioFile.model_validate(raw)
    ids = [s.id for s in parsed.scenarios]
    cats = [s.category for s in parsed.scenarios]
    if len(set(ids)) != len(ids) or len(set(cats)) != len(cats):
        raise ValueError("scenario ids and categories must be unique")
    for s in parsed.scenarios:
        bad = [c for c in s.codes if c not in catalog.hcpcs]
        bad += [s.carc] if s.carc not in catalog.carc else []
        bad += [r for r in s.rarc if r not in catalog.rarc]
        if bad:
            raise ValueError(f"{s.id}: codes not in catalog: {bad}")
        if s.action == "appeal" and not s.evidence:
            raise ValueError(f"{s.id}: an appeal needs at least one evidence item")
    return parsed.scenarios
