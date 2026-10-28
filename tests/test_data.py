"""Committed synthetic data: schema, keys, balance, codes, labels (data-plan 6 validation)."""

from __future__ import annotations

import json
import re
from collections import Counter
from typing import Any

import jsonschema
import pytest
import yaml

from arthai_gen import config, schemas
from arthai_gen.codes import load_catalog
from arthai_gen.generate import dollars
from arthai_gen.util import sha256_file

FILES = {
    "patients": ("patients/patients.jsonl", "patient"),
    "encounters": ("patients/encounters.jsonl", "encounter"),
    "claims": ("claims/claims.jsonl", "claim"),
    "denials": ("denials/denials.jsonl", "denial"),
    "appeals": ("appeals/appeals.jsonl", "appeal"),
    "calls": ("calls/transcripts.jsonl", "call_transcript"),
}
Rows = dict[str, list[dict[str, Any]]]


@pytest.mark.parametrize("name", sorted(FILES))
def test_rows_validate_against_model_and_committed_schema(name: str) -> None:
    rel, schema_name = FILES[name]
    model = schemas.MODELS[schema_name]
    schema = json.loads((config.SCHEMAS / f"{schema_name}.schema.json").read_text())
    validator = jsonschema.Draft202012Validator(schema)
    lines = (config.SYNTH / rel).read_text().splitlines()
    assert lines
    for line in lines:
        model.model_validate_json(line)
        validator.validate(json.loads(line))


def test_reference_entities_validate() -> None:
    synth = config.SYNTH
    schemas.MODELS["practice"].model_validate_json((synth / "practice/practice.json").read_text())
    for p in json.loads((synth / "practice/providers.json").read_text()):
        schemas.MODELS["provider"].model_validate_json(json.dumps(p))
    for p in json.loads((synth / "payers/payers.json").read_text()):
        schemas.MODELS["payer"].model_validate_json(json.dumps(p))


def test_committed_schemas_match_models() -> None:
    """Schema drift gate: change a model, then run `make data` to re-export."""
    for name, model in schemas.MODELS.items():
        committed = (config.SCHEMAS / f"{name}.schema.json").read_text()
        assert committed == schemas.schema_text(model), name
    assert {p.name for p in config.SCHEMAS.iterdir()} == {
        f"{n}.schema.json" for n in schemas.MODELS
    }


def test_no_forbidden_fields_in_any_schema() -> None:
    banned = re.compile(r"ssn|social|mbi|medicare_id|driver|passport|license_no", re.I)
    for p in config.SCHEMAS.iterdir():
        props = re.findall(r'"([a-z_]+)":', p.read_text())
        assert not [k for k in props if banned.search(k)], p.name


def test_foreign_keys_resolve(rows: Rows) -> None:
    patients = {p["patient_id"]: p for p in rows["patients"]}
    encounters = {e["encounter_id"]: e for e in rows["encounters"]}
    claims = {c["claim_id"]: c for c in rows["claims"]}
    denials = {d["denial_id"]: d for d in rows["denials"]}
    payers = {p["payer_id"] for p in json.loads((config.SYNTH / "payers/payers.json").read_text())}
    for kind in ("patients", "encounters", "claims", "denials", "appeals", "calls"):
        key = {
            "patients": "patient_id",
            "encounters": "encounter_id",
            "claims": "claim_id",
            "denials": "denial_id",
            "appeals": "appeal_id",
            "calls": "call_id",
        }[kind]
        ids = [r[key] for r in rows[kind]]
        assert len(ids) == len(set(ids)), f"duplicate {key}"
    for p in rows["patients"]:
        assert p["payer_id"] in payers
    for e in rows["encounters"]:
        assert e["patient_id"] in patients
    for c in rows["claims"]:
        enc = encounters[c["encounter_id"]]
        pat = patients[c["patient_id"]]
        assert enc["patient_id"] == c["patient_id"] and enc["date"] == c["dos"]
        assert (pat["member_id"], pat["payer_id"]) == (c["member_id"], c["payer_id"])
        if c["original_claim_id"]:
            orig = claims[c["original_claim_id"]]
            assert orig["encounter_id"] == c["encounter_id"] and orig["status"] == "paid"
    for d in rows["denials"]:
        c = claims[d["claim_id"]]
        for k in (
            "payer_id",
            "patient_id",
            "member_id",
            "dos",
            "billing_npi",
            "rendering_npi",
            "service_lines",
            "adjustments",
            "icd10cm",
        ):
            assert d[k] == c[k], k
        assert c["status"] in ("denied", "partially_denied")
    for a in rows["appeals"]:
        assert denials[a["denial_id"]]["labels"]["appealable"]
    for k in rows["calls"]:
        assert denials[k["denial_id"]]["payer_id"] == k["payer_id"]


def test_codes_come_from_catalog_only(rows: Rows) -> None:
    cat = load_catalog()
    for c in rows["claims"] + rows["denials"]:
        assert {s["code"] for s in c["service_lines"]} <= cat.hcpcs
        assert set(c["icd10cm"]) <= cat.icd10cm
        assert {a["carc"] for a in c["adjustments"]} <= cat.carc
    for d in rows["denials"]:
        assert set(d["rarc"]) <= cat.rarc
        for code in re.findall(r"(?:CAS\*[A-Z]{2}\*)([A-Z0-9]+)", d["text"]["x12"]):
            assert code in cat.carc


def test_dates_in_window(rows: Rows) -> None:
    today = config.DEMO_TODAY.isoformat()
    for d in rows["denials"]:
        assert d["dos"] <= d["received_on"] <= today
    for c in rows["claims"]:
        assert c["dos"] <= c["submitted_on"] <= today


def test_timely_filing_rows_really_are_late(rows: Rows) -> None:
    import datetime as dt

    payers = {
        p["payer_id"]: p for p in json.loads((config.SYNTH / "payers/payers.json").read_text())
    }
    claims = {c["claim_id"]: c for c in rows["claims"]}
    for d in rows["denials"]:
        c = claims[d["claim_id"]]
        late = (dt.date.fromisoformat(c["submitted_on"]) - dt.date.fromisoformat(c["dos"])).days
        limit = payers[d["payer_id"]]["timely_filing_days"]
        if d["labels"]["category"] == "timely_filing":
            assert late > limit
        else:
            assert late <= limit


def test_label_distribution_has_no_category_under_5_percent(rows: Rows) -> None:
    counts = Counter(d["labels"]["category"] for d in rows["denials"])
    scen = yaml.safe_load((config.SYNTH / "scenarios.yaml").read_text())["scenarios"]
    assert set(counts) == {s["category"] for s in scen}
    total = sum(counts.values())
    assert min(counts.values()) / total >= 0.05


def test_labels_come_from_scenario_table(rows: Rows) -> None:
    scen = {
        s["id"]: s
        for s in yaml.safe_load((config.SYNTH / "scenarios.yaml").read_text())["scenarios"]
    }
    for d in rows["denials"]:
        s = scen[d["provenance"]["scenario_id"]]
        lab = d["labels"]
        assert (lab["category"], lab["root_cause"], lab["fix"]) == (
            s["category"],
            s["root_cause"],
            s["fix"],
        )
        assert lab["appealable"] == (s["action"] == "appeal")
        assert d["adjustments"][0]["carc"] == s["carc"] and d["rarc"] == s["rarc"]
        assert d["provenance"]["paraphrased"] is False


def _resolve(obj: Any, path: str) -> Any:
    for part in re.findall(r"[a-z_0-9]+|\[\d+\]", path):
        obj = obj[int(part[1:-1])] if part.startswith("[") else obj[part]
    return obj


def test_appeals_cite_only_record_facts(rows: Rows) -> None:
    denials = {d["denial_id"]: d for d in rows["denials"]}
    for a in rows["appeals"]:
        d = denials[a["denial_id"]]
        for path in a["cited_facts"]:
            value = _resolve(d, path)
            shown = dollars(value) if path.endswith("_cents") else str(value)
            assert shown in a["letter_markdown"], (a["appeal_id"], path)
        for pol in a["policy_refs"]:
            assert pol.startswith(d["payer_id"] + "-POL-")
        if not a["labels"]["has_all_required_facts"]:
            assert a["expected_outcome"] == "uphold"


def test_injection_calls_are_labeled_and_refused(rows: Rows) -> None:
    inj = [k for k in rows["calls"] if k["labels"]["injection_attempt"]]
    assert inj, "need adversarial transcripts"
    for k in rows["calls"]:
        agent_text = " ".join(t["text"] for t in k["turns"] if t["speaker"] == "agent")
        refused = "I can't help with that" in agent_text
        assert refused == k["labels"]["injection_attempt"] == k["labels"]["refusal_required"]


def test_manifest_hashes_match_files() -> None:
    doc = yaml.safe_load((config.DATA / "manifest.yaml").read_text())
    listed = {f["path"]: f["sha256"] for f in doc["files"]}
    on_disk = sorted(
        p.relative_to(config.ROOT).as_posix()
        for base in (config.SYNTH, config.REF_CODES, config.SCHEMAS)
        for p in base.rglob("*")
        if p.is_file()
    )
    assert sorted(listed) == on_disk
    for rel, digest in listed.items():
        assert sha256_file(config.ROOT / rel) == digest, rel
