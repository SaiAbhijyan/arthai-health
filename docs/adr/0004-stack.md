# 4. Model, triage, memory and compute stack for the hackathon build
Date: 2026-10-28 (revised the same day after Mini Chief's review)
## Status
Proposed, except Contributor mode, which is Accepted (D-015, Sai 2026-10-28: yes, synthetic data only). The rest waits for Sai's approval and for the answers to the rule questions in `docs/data-plan.md` section 7.
Memory is already decided: `DECISIONS.md` D-004 (Accepted, cognee 1.6.5). This ADR does not re-open D-004.

Note on the number: the brief asked for `docs/adr/0001-stack.md`. ADR 0001 already exists (`0001-modular-monolith.md`), so this ADR uses the next free number, 0004.

## Context
Arthai Health must use Meta models (hackathon theme). Sai's rule: no paid usage beyond free credits. All data is synthetic (`docs/data-plan.md`). The handoff proposed this stack:

1. Meta models as primary, through Baseten model `muse-spark-open-1026`, through OmniRoute at `127.0.0.1:20128`.
2. LAYA for fast triage.
3. cognee as optional runtime memory, telemetry off.
4. Modal for compute.

We checked each part live on 2026-10-28.

### Credits (status 2026-10-28, reported by Mini Chief; we did not see the consoles)

| Provider | Credit | Status |
|---|---|---|
| Meta Model API | $150 | Approved |
| Baseten | $100 | Approved |
| Modal | $100 | Approved. Sai is redeeming it now. |
| Fireworks | $100 | Pending |

Total approved: $350. Sai's rule stays: stop at the credit limit; never add a payment method to go past it.

## Findings

### 1. Meta models
- **Meta Model API (direct).** Base URL `https://api.meta.ai/v1`. OpenAI-, Anthropic- and Responses-compatible surfaces. Models: `muse-spark-1.3`, `muse-spark-1.2`, `muse-spark-1.1`, `muse-wonder-1.0` (preview), Muse Image, Muse Voice Transcribe, SAM 3.1. Source: https://dev.meta.ai/docs/overview, https://dev.meta.ai/docs/pricing-rate-limits. **Verified.**
- Prices per 1M tokens, Standard mode: Muse Spark input $1.25, cached input $0.15, output $4.25. Muse Wonder $4.00 / $0.20 / $20.00. **Verified.**
- **Contributor mode** (`muse-spark-1.3-contributor`, `muse-spark-1.2-contributor`): input $0.10, cached $0.002, output $0.20. In exchange, Meta may use the prompts, code, files and responses to train future Meta models. Rate limit 150 RPM and 3M TPM (Standard: 3,000 RPM, 4M TPM). **Verified.**
- Muse Voice Transcribe: speech to text, $0.18 per audio hour, 256 concurrent streams. **Verified.** We found **no Meta text-to-speech model** in the model list (six model lines). The voice-call agent needs a TTS choice in Phase 2.
- **Baseten, public docs:** Baseten serves Muse Spark Open (816B MoE, 42B active, "Muse Model License") at `https://inference.baseten.co/v1`. The public model list and the 2026-10-15 changelog show the ID `meta-models/muse-spark-open`. Price per 1M: input $1.25, cached $0.15, output $4.25. Baseten says the model is "designed specifically for coding agents". **Verified.**
- **Baseten, Sai's email:** Mini Chief reports that Baseten's 2026-10-26 email to Sai names the model `meta-models/muse-spark-open-1026` and says that the key works only with that model. We did not read the email.
- **Conflict (open):** the public docs show `meta-models/muse-spark-open`; the email shows `meta-models/muse-spark-open-1026`. A dated ID for a hackathon key is plausible, so we do not reject either ID. The repo on `main` already uses the email ID (`.env.example`: `LLM_MODEL=openai/meta-models/muse-spark-open-1026`). **To verify:** when the key is in `.env`, call `GET https://inference.baseten.co/v1/models` with that key and record the returned IDs in `DECISIONS.md`. Use the ID that the call returns.

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

### 4. cognee 1.6.5 (memory, already on `main`)
What `main` shows (commit `c1b87c1`, checked on 2026-10-28):
- `DECISIONS.md` D-004 "Use cognee (local, telemetry off) as agent memory", Status **Accepted**.
- `requirements.txt`: `cognee[gliner]==1.6.5`. Install into the project `.venv` only. The box checkout has `.venv` with cognee 1.6.5 (we read the package version; we did not re-run the smoke test).
- `.env.example`: `TELEMETRY_DISABLED=1`; LLM = Baseten `openai/meta-models/muse-spark-open-1026`; embeddings = local fastembed `BAAI/bge-small-en-v1.5` (384 dimensions); storage in repo-local `.cognee_data/` and `.cognee_system/` (git-ignored); `AUTO_FEEDBACK=false`; `LITELLM_LOCAL_MODEL_COST_MAP=True`.
- `scripts/cognee_smoke.py` and `docs/tooling.md`: the smoke test ran **without an LLM key**. `add`, `cognify` (local GLiNER, about 750 MB) and `search` (CHUNKS) worked. The log says no telemetry was sent and the only host was `huggingface.co`. The LLM path (Muse through Baseten) is **not tested yet**.
- SkillSpector: `/workspace/curious/skillspector-cognee.md` (100/100, flagged lines judged false positives). cognee agent skills, hook and `cognee-mcp` are not installed.

What we verified ourselves in the 1.6.5 wheel source:
- License Apache-2.0. Python `>=3.10,<3.15`. Released 2026-10-16 (UTC).
- `send_telemetry()` returns early when `TELEMETRY_DISABLED` is any non-empty value, or when `ENV` is `test` or `dev`. Otherwise it posts to `https://test.prometh.ai`, with a persistent machine ID and a salted hash of the LLM API key. Telemetry is **on by default**.
- Default stores: relational `sqlite`, vector `lancedb`, graph `ladybug`.

Gaps we found (for follow-up, not blockers):
- `.env.example` uses absolute paths under `/workspace/revora-starter`. In another worktree (for example `/workspace/arthai-phase1`) cognee would write to the main checkout.
- `scripts/cognee_smoke.py` contains a CPT code with a descriptor ("CPT 72148 lumbar MRI"). This conflicts with D-009 (no CPT descriptors in the repo).
- D-004 says nothing about the product runtime path, and nothing about non-Meta embeddings (fastembed `bge-small`) under the hackathon rules.
- `claude-mem` stays **not approved** (`docs/tooling.md`).

### 5. Modal
- Starter plan: $0 per month plus **$30 per month of free credits**, 10 GPU concurrency. Per-second GPU prices: T4 $0.000164/s (about $0.59/h), L4 $0.000222/s (about $0.80/h), A10 $0.000306/s (about $1.10/h). Source: https://modal.com/pricing. **Verified.**
- Hackathon credit: $100, approved (see the credits table). `docs/laya-plan.md` names workspace `sai-abhijyan-t`; we did not log in to check it.

### 6. Cost estimate (ESTIMATE, not measured)
- One typical agent call: about 2,000 input and 600 output tokens. At $1.25 / $4.25 per 1M, one call costs about $0.005.
- Meta $150 covers about 30,000 such calls. Baseten $100 covers about 20,000 such calls. The plan in `docs/data-plan.md` (500 denials, paraphrase plus label check, appeals, transcripts, evals, demo runs) needs about 5,000 to 10,000 calls.
- Modal $100 (plus $30/month Starter credit) covers about 125 L4 hours. The LAYA fine-tune estimate is 0.5 to 1.5 hours.
- Muse Voice Transcribe: $0.18 per hour. Ten hours of test calls cost about $1.80.
- Measure real token use in the first Phase 2 run and replace these numbers.

## Options considered
- A: Handoff stack as written (Baseten `muse-spark-open-1026` through OmniRoute, LAYA, cognee, Modal). Pros: matches the handoff and the cognee config on `main`; uses the Baseten credit. Cons: OmniRoute adds a hop and ToS surface in the product path.
- B: Meta Model API direct as the only primary. Pros: largest credit ($150); same key gives Muse Voice Transcribe. Cons: leaves the Baseten credit unused; cognee on `main` already points at Baseten.
- C: **Two Meta-model providers behind one OpenAI-compatible client, no router.** Baseten Muse Spark Open (ID from the models-list call) and Meta Model API `muse-spark-1.3`. Pros: uses both credits ($250 for text); either provider is the fallback for the other; no extra process. Cons: two keys and two budgets to watch.
- D: LiteLLM proxy instead of OmniRoute. Pros: smaller, widely used; cognee already depends on litellm. Cons: one more process; not needed for two providers.

## Decision
Option C (proposed):

1. **LLM, primary: Baseten Muse Spark Open**, with the model ID that `GET /v1/models` returns for Sai's key (expected `meta-models/muse-spark-open-1026` per the email). Use it for agent text work, batch generation and cognee (already configured on `main`).
2. **LLM, secondary: Meta Model API `muse-spark-1.3`** (Standard mode). Use it as the fallback, and as the primary if the Baseten models-list check fails. Contributor mode is **Accepted** (D-015): use `muse-spark-1.3-contributor` for synthetic-data work only.
3. **Config:** product client vars `ARTHAI_LLM_BASE_URL`, `ARTHAI_LLM_MODEL`, `ARTHAI_LLM_API_KEY`, plus `ARTHAI_LLM_FALLBACK_*`. We use a prefix so that the product does not collide with cognee's `LLM_*` vars. A startup check calls `GET /v1/models` on both providers and fails if a configured model is missing.
4. **OmniRoute:** developer tools only (pi, experiments), as in `docs/tooling.md`. Not in the product runtime path. Never connect consumer or web-session providers.
5. **LAYA:** optional triage behind `TRIAGE_BACKEND=laya|llm`. Default `llm` until the rule question is answered and LAYA beats the LLM on the held-out set.
6. **Memory:** cognee 1.6.5 per D-004 (Accepted). This ADR adds only: keep `TELEMETRY_DISABLED=1` (also set `ENV=dev` as a second guard); put the product's use behind `MEMORY_BACKEND=cognee|none` so the demo still runs if cognee fails; fix the gaps listed in finding 4.
7. **Compute:** Modal for the LAYA fine-tune and any batch job, with `max_containers=1`, a timeout and a spend limit inside the credits.
8. **Voice:** speech to text with Muse Voice Transcribe (Meta key). TTS and telephony: open (Phase 2). The voice agent calls only our mock payer IVR.
9. **Fireworks:** not in the plan until the credit is approved.

## Consequences
- Good: every model call is a Meta model; both approved text credits are usable; one config switch changes provider; no router process on demo day.
- Bad: two keys and two budgets; usage counts against credits.
- Follow-ups:
  1. Load the Baseten key, run the models-list call, and record the real model ID.
  2. Sai confirms the rules (non-Meta embeddings for cognee, LAYA).
  3. Select a TTS option.
  4. Fix the cognee gaps in finding 4 (relative paths, CPT text in the smoke script).
  5. When Sai approves, accept D-011 to D-014 (they are still Proposed, so their status line can change). D-015 (Contributor mode) is already Accepted.

Links: `DECISIONS.md` D-004 (cognee, Accepted), D-011 to D-014, D-015 (Contributor mode, Accepted); `docs/data-plan.md`; `docs/tooling.md`; `docs/laya-plan.md`.
