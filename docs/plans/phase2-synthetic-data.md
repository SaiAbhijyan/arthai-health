# Plan: Phase 2 synthetic data pipeline

Status: approved by Sai on 2026-10-28 (Step 2 of "Sai's picks"). Branch `feat/phase2-synthetic-data`.

## Outcome

One command (`make data`) rebuilds every synthetic file under `data/` from a seed. The same seed gives byte-identical output.

## Steps

1. `scripts/fetch_tools.sh`: pinned Temurin JDK 17 and Synthea v4.0.0 into `/workspace/tools` (sha256 checked, D-016).
2. `scripts/run_synthea.sh`: run Synthea offline (`unshare -rn`), single thread, fixed seed and reference date. Raw CSV stays in `build/` (gitignored).
3. `arthai_gen ingest`: keep only birth date, sex and encounter dates and classes. Replace every identifier. Drop everything else (D-017).
4. `arthai_gen refcodes` (manual, needs `scripts/fetch_refdata.sh`): build the HCPCS Level II and ICD-10-CM subsets from the CMS files.
5. `arthai_gen generate`: practice, payers, claims, denials, appeals, call transcripts, JSON Schemas, `data/manifest.yaml`.

## Invariants (each has a test)

- No real PHI, no CPT, no X12 description text, no Synthea provider or organization data, no real NPIs.
- Every row validates against its Pydantic model and its committed JSON Schema.
- Every foreign key resolves. Each service line balances: charge minus adjustments equals paid.
- No denial category is under 5 % of rows.

## Out of scope

- X12 files (`data/synthetic/x12/`) and the payer mock: later phase, not needed for the data.
- LLM paraphrase (data-plan 6.1 step 4): off. No model key is loaded, so cost is $0.
- NUCC taxonomy codes: license not verified, so provider rows omit them.
- Layout change: claims go to `data/synthetic/claims/claims.jsonl` (no X12 yet).
