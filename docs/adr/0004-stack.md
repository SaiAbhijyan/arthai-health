# 4. Model, triage, memory and compute stack for the hackathon build
Date: 2026-10-28
## Status
Proposed. Waits for Sai's approval and for the answers to the rule questions in `docs/data-plan.md` section 7.

Note on the number: the brief asked for `docs/adr/0001-stack.md`. ADR 0001 already exists (`0001-modular-monolith.md`), so this ADR uses the next free number, 0004.

## Context
Arthai Health must use Meta models (hackathon theme). Sai's rule: no paid usage beyond free credits. All data is synthetic (`docs/data-plan.md`). The handoff proposed this stack:

1. Meta models as primary, through Baseten model `muse-spark-open-1026`, through OmniRoute at `127.0.0.1:20128`.
2. LAYA for fast triage.
3. cognee as optional runtime memory, telemetry off.
4. Modal for compute.

We checked each part live on 2026-10-28.

## Findings

### 1. Meta models
- **Meta Model API (direct)** exists. Base URL `https://api.meta.ai/v1`. OpenAI-, Anthropic- and Responses-compatible surfaces. Models: `muse-spark-1.3`, `muse-spark-1.2`, `muse-spark-1.1`, `muse-wonder-1.0` (preview), Muse Image, Muse Voice Transcribe, SAM 3.1. Source: https://dev.meta.ai/docs/overview, https://dev.meta.ai/docs/pricing-rate-limits. **Verified.**
- Prices per 1M tokens, Standard mode: Muse Spark input $1.25, cached input $0.15, output $4.25. Muse Wonder $4.00 / $0.20 / $20.00. **Verified.**
- **Contributor mode** (`muse-spark-1.3-contributor`, `muse-spark-1.2-contributor`): input $0.10, cached $0.002, output $0.20. In exchange, Meta may use the prompts, code, files and responses to train future Meta models. Rate limit 150 RPM and 3M TPM (Standard: 3,000 RPM, 4M TPM). **Verified.**
- Muse Voice Transcribe: speech to text, $0.18 per audio hour, 256 concurrent streams. **Verified.** We found **no Meta text-to-speech model** in the model list (six model lines). The voice-call agent needs a TTS choice in Phase 2.
- Hackathon Model API credit of $150: **Third-party** only (blogs). Not on a Meta page.
- **Baseten** serves Muse Spark Open (816B MoE, 42B active, "Muse Model License"). The model ID is **`meta-models/muse-spark-open`** at `https://inference.baseten.co/v1`. Price per 1M: input $1.25, cached $0.15, output $4.25. Baseten says the model is "designed specifically for coding agents". New Baseten accounts get some free credits (amount not stated). The hackathon page lists $100 Baseten credits and 2M TPM for "select participants". **Verified.**
- **`muse-spark-open-1026` is UNVERIFIED.** We did not find this ID in Baseten's model list, the Baseten changelog (2026-10-15) or the OmniRoute 3.8.52 bundle. Treat it as a wrong or private ID until a `GET /v1/models` call with Sai's key shows it.

### 2. OmniRoute
- Exists: `diegosouzapw/OmniRoute`, MIT, npm `omniroute` latest 3.8.52. It runs on the box at `127.0.0.1:20128` (`/api/monitoring/health` returned `{"status":"healthy","setupComplete":true}` today). **Verified.**
- **The "7B free tokens/day" claim is not supported.** The README today claims "~1.62B tokens / month across third-party free tiers". It also says: "This is an estimated aggregate across separately eligible third-party free tiers, not a token grant from OmniRoute. Sign up, obtain credentials where required". So the free tokens come from many separate provider accounts, each with its own terms. Sai's note ("hype and risky") is correct.
- Other risks:
  - The README advertises "TLS fingerprint stealth".
  - The bundle includes a consumer web provider (`muse-spark-web`).
  - New releases come out very often.
  - It adds one more hop and one more process to the demo.

### 3. LAYA
- Exists: `NandhaKishorM/laya`, Apache-2.0, about 34,500 stars, last push 2026-10-28. PyPI `laya` 0.4.17 (the box venv has 0.4.15). Weights `convaiinnovations/laya` on Hugging Face, license apache-2.0. **Verified.**
- It is **not** a Meta model. Whether a non-Meta helper model is allowed is a rule question.
- Cost: free to run on CPU. Fine-tune cost on Modal is an estimate in `docs/laya-plan.md`.

### 4. cognee 1.6.5 (proposed runtime memory)
- PyPI `cognee` 1.6.5 is the latest release, uploaded 2026-10-16 (UTC). License **Apache-2.0** (PyPI license expression and GitHub). Python `>=3.10,<3.15`. **Verified.**
- Telemetry: in the 1.6.5 wheel, `cognee/shared/utils.py` `send_telemetry()` returns early when `TELEMETRY_DISABLED` is set to any non-empty value, or when `ENV` is `test` or `dev`. Otherwise it posts events to `https://test.prometh.ai`, with a persistent machine ID and a salted hash of the LLM API key. So `TELEMETRY_DISABLED=1` works, but telemetry is **on by default**. **Verified** (source read, not run).
- Local storage defaults in 1.6.5: relational `sqlite`, vector `lancedb`, graph `ladybug` (not Kuzu). So "local SQLite/LanceDB" is **verified**; the graph store is a third local engine.
- Weight: many dependencies (litellm, lancedb, pylance, fastembed, onnxruntime, dlt, fastapi-users, and more). It needs an LLM and an embedding model, so each memory write costs tokens or local CPU.
- Not installed. A source clone exists at `/workspace/tools/cognee` (not installed). A SkillSpector scan is required before install.
- `claude-mem` is **not approved** (see `docs/tooling.md`).

### 5. Modal
- Exists. Starter plan: $0 per month plus **$30 per month of free credits**, 10 GPU concurrency. Per-second GPU prices: T4 $0.000164/s (about $0.59/h), L4 $0.000222/s (about $0.80/h), A10 $0.000306/s (about $1.10/h). Source: https://modal.com/pricing. **Verified.**
- The hackathon page lists $100 Modal credits for "select participants". **Verified** (Cerebral Valley page).
- `docs/laya-plan.md` names workspace `sai-abhijyan-t`; we did not log in to check it.

## Options considered
- A: Handoff stack as written (Baseten `muse-spark-open-1026` through OmniRoute, LAYA, cognee, Modal). Pros: matches the handoff. Cons: the model ID is unverified; OmniRoute adds a hop and ToS surface in the product path; cognee adds weight before a memory feature exists.
- B: **Meta Model API direct** as primary (`muse-spark-1.3`), Baseten `meta-models/muse-spark-open` as fallback, one OpenAI-compatible client with `base_url` and `model` from env. OmniRoute optional for developer tools only. LAYA behind a flag. cognee proposed behind a flag. Modal for batch jobs only. Pros: fewest hops; clear Meta-model story; provider swap is a config change. Cons: two provider accounts to manage; no free-tier pooling.
- C: LiteLLM proxy instead of OmniRoute. Pros: smaller, widely used, cognee already depends on litellm. Cons: one more process; not needed for two providers.
- Memory alternatives: (i) cognee 1.6.5 local; (ii) Postgres tables plus pgvector in the existing database; (iii) no runtime memory, only `DECISIONS.md` and `AGENTS.md` for agent dev memory.

## Decision
Option B (proposed):

1. **LLM:** Meta Model API direct, `muse-spark-1.3` (Standard mode). Use Contributor mode only if Sai agrees, and only with synthetic data. Fallback: Baseten `meta-models/muse-spark-open`. Config: `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY` from env. A startup check calls `GET /v1/models` and fails if the model is missing.
2. **OmniRoute:** keep for developer tools (pi, local experiments) as documented in `docs/tooling.md`. Not in the product runtime path. Never connect consumer or web-session providers.
3. **LAYA:** optional triage step behind `TRIAGE_BACKEND=laya|llm`. Default `llm` until the rule question is answered and LAYA beats the LLM on the held-out set.
4. **Memory:** propose **cognee 1.6.5** as the agents' runtime memory, behind `MEMORY_BACKEND=cognee|none`, default `none`. Run it with `TELEMETRY_DISABLED=1` and `ENV=dev` both set, local SQLite, LanceDB and the default local graph store, data dir inside the project. Install only after Sai says yes and after a SkillSpector scan. Our view: memory is not on the critical demo path; if time is short, use option (ii) Postgres.
5. **Compute:** Modal for the LAYA fine-tune and any batch job (for example Synthea option B), with `max_containers=1`, a timeout, and a spend limit inside the free credits.
6. **Voice:** speech to text with Muse Voice Transcribe. TTS and telephony: open (Phase 2 decision). The voice agent calls only our mock payer IVR.

## Consequences
- Good: every model call is a Meta model; one config switch changes provider; fewer moving parts on demo day.
- Bad: no free-tier pooling; usage counts against credits; two accounts (Meta, Baseten) to watch.
- Follow-ups:
  1. Sai confirms the credits and the rules.
  2. Confirm the model list with a real key.
  3. Select a TTS option.
  4. Run SkillSpector on cognee before any install.
  5. When Sai approves, add new DECISIONS.md entries that accept D-010 to D-013 (the log is append-only).

Links: `DECISIONS.md` D-010 to D-013, `docs/data-plan.md`, `docs/tooling.md`, `docs/laya-plan.md`.
