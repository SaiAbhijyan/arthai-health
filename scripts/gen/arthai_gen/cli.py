"""CLI: python -m arthai_gen {ingest,refcodes,generate,phi-scan,all} [--seed N]."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from arthai_gen import config, generate, manifest, phi, refcodes, schemas
from arthai_gen.codes import load_catalog
from arthai_gen.ingest import ingest
from arthai_gen.scenarios import load_scenarios
from arthai_gen.util import SeedError, parse_seed, read_jsonl, write_jsonl
from rcm_models import Encounter, Patient


def run_generate(seed: int, synthea_seed: int, synth: Path = config.SYNTH) -> None:
    catalog = load_catalog()
    scenarios = load_scenarios(synth / "scenarios.yaml", catalog)
    patients = read_jsonl(synth / "patients" / "patients.jsonl", Patient)
    encounters = read_jsonl(synth / "patients" / "encounters.jsonl", Encounter)
    out = generate.build(seed, patients, encounters, scenarios, catalog)
    generate.write_reference_entities(synth)
    write_jsonl(synth / "claims" / "claims.jsonl", out.claims)
    write_jsonl(synth / "denials" / "denials.jsonl", out.denials)
    write_jsonl(synth / "appeals" / "appeals.jsonl", out.appeals)
    write_jsonl(synth / "calls" / "transcripts.jsonl", out.calls)
    schemas.export()
    manifest.write(seed, synthea_seed)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="arthai_gen")
    ap.add_argument("command", choices=["ingest", "refcodes", "generate", "phi-scan", "all"])
    ap.add_argument("--seed", default=str(config.DEFAULT_SEED))
    ap.add_argument("--synthea-seed", default=str(config.DEFAULT_SEED))
    ap.add_argument("--synthea-csv", default=str(config.BUILD / "synthea" / "csv"))
    args = ap.parse_args(argv)
    try:
        seed = parse_seed(args.seed)
        synthea_seed = parse_seed(args.synthea_seed)
    except SeedError as exc:
        print(f"arthai_gen: {exc}", file=sys.stderr)
        return 2
    if args.command in ("ingest", "all"):
        n_p, n_e = ingest(Path(args.synthea_csv), seed)
        print(f"ingest: {n_p} patients, {n_e} encounters")
    if args.command == "refcodes":
        refcodes.build()
        print("refcodes: written")
    if args.command in ("generate", "all"):
        run_generate(seed, synthea_seed)
        print("generate: written")
    if args.command in ("phi-scan", "all"):
        findings = phi.scan_tree(config.DATA)
        for f in findings:
            print(f"{f.path}:{f.line}: {f.rule} {f.sample}", file=sys.stderr)
        if findings:
            return 1
        print("phi-scan: clean")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
