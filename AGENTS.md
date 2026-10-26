# AGENTS.md  (symlink as CLAUDE.md; mirror key rules in .cursor/rules/core.mdc)

## Project
Revora (AI agents that get you paid): RCM agent suite. Python 3.12, FastAPI, LangGraph, Postgres, React/TS (SSE).
Synthetic data ONLY. Never add real patient data, real payer creds, or PHI to code, tests, logs, prompts or fixtures.

## Commands (run before you say "done")
make lint        # ruff + mypy --strict + eslint + tsc
make test        # pytest -q ; vitest run
make eval        # golden denial/coding sets; fails if metrics drop below thresholds in evals/thresholds.yaml
make e2e         # one synthetic claim end to end against mock payer

## Rules
- Plan first: for any change > ~50 lines, write/refresh a plan in docs/plans/<task>.md and wait for approval.
- Small diffs: one concern per change; no drive-by refactors or renames.
- Tests first: write or update a failing test, then make it pass. Never delete or weaken a test to go green.
- Typed boundaries: every agent/tool returns a Pydantic model. No free-text ICD/CPT codes; codes come from catalog lookup.
- Every AI action writes an audit_event (actor, model, prompt_version, inputs_hash, tools, output, approver).
- High-risk actions (send appeal, place call, post payment, write-off) must go through approvals.require().
- Secrets only from env/secret manager. Never print env vars or tokens.
- Don't touch: migrations already applied, evals/golden/*, .github/workflows/* without asking.
- If unsure, stop and ask. Say what you verified and how; list anything unverified.

## Architecture map
services/ eligibility, intake, coding, claims, clearinghouse_gw, payer_mock, remits, denials, voice, ar, billing, ledger, review, audit, gateway
packages/ rcm_models (Pydantic), x12 (837/835 parse+build), policy_rag, cci_gate
