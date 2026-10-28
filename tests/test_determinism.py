"""Same seed, same bytes. Different seed, different data (data-plan 6 validation step 6)."""

from __future__ import annotations

from arthai_gen import config, generate
from arthai_gen.codes import load_catalog
from arthai_gen.scenarios import load_scenarios
from arthai_gen.util import canonical_json, read_jsonl
from rcm_models import Encounter, Patient

OUT = {
    "claims": "claims/claims.jsonl",
    "denials": "denials/denials.jsonl",
    "appeals": "appeals/appeals.jsonl",
    "calls": "calls/transcripts.jsonl",
}


def _build(seed: int) -> dict[str, str]:
    cat = load_catalog()
    out = generate.build(
        seed,
        read_jsonl(config.SYNTH / "patients/patients.jsonl", Patient),
        read_jsonl(config.SYNTH / "patients/encounters.jsonl", Encounter),
        load_scenarios(config.SYNTH / "scenarios.yaml", cat),
        cat,
    )
    return {k: "".join(canonical_json(r) + "\n" for r in getattr(out, k)) for k in OUT}


def test_same_seed_same_bytes_and_matches_committed() -> None:
    a, b = _build(config.DEFAULT_SEED), _build(config.DEFAULT_SEED)
    assert a == b
    for key, rel in OUT.items():
        assert a[key] == (config.SYNTH / rel).read_text(encoding="utf-8"), rel


def test_other_seed_changes_output() -> None:
    a, c = _build(config.DEFAULT_SEED), _build(config.DEFAULT_SEED + 1)
    assert a["denials"] != c["denials"]


def test_seed_zero_and_max_build() -> None:
    for seed in (0, 2**63 - 1):
        assert _build(seed)["denials"]
