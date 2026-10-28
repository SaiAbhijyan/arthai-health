# DECISIONS.md
Append-only. Never edit an accepted entry's body; supersede it with a new one.
Write an entry when choosing a library, pattern, schema, protocol, model/prompt strategy, or a tradeoff someone may later question.

## Template
### D-NNN: <title>
- Date: YYYY-MM-DD  | Status: Proposed | Accepted | Superseded by D-MMM
- Deciders: <people / agent + reviewer>
- Context: <problem and forces>
- Options considered:
  - A: <pros / cons>
  - B: <pros / cons>
- Decision: <one sentence>
- Consequences: <good> / <bad> / <follow-ups>
- Links: <PR, plan, ADR, docs>

---
### D-001: Modular monolith instead of microservices for the hackathon
- Date: 2026-10-26 | Status: Accepted
- Deciders: Sai (reviewed by second-model review)
- Context: One builder, 9 days, must demo end to end; full vision has ~18 services; PHI scope and audit needed.
- Options considered:
  - A: Microservices from day 1. Pros: independent scaling, physical PHI isolation. Cons: network contracts, infra and debugging cost the schedule can't absorb.
  - B: Modular monolith + separate payer mock, voice worker and console (4 deployables). Pros: one deploy and DB, shared types, fast. Cons: shared failure domain; boundaries enforced only by convention.
- Decision: B, with per-module tables and all cross-module communication through the Postgres outbox.
- Consequences: Fast iteration; outbox events make later extraction cheap. Risk of boundary erosion, mitigated by an import-linter rule and review checklist.
- Links: Build Guide 3.4; docs/adr/0001-modular-monolith.md

### D-002: Adopt the Golden Play Guide as the agent operating rules
- Date: 2026-10-26 | Status: Accepted
- Deciders: Sai (agent-drafted, reviewed by Sai)
- Context: Several coding agents (Claude Code, Cursor, Grok) work this repo; we need one shared way of thinking, prompting, building and debugging so quality doesn't depend on which tool is used.
- Options considered:
  - A: Paste the full guide into every instruction file. Pros: nothing lost. Cons: ~750 lines of always-on context, slower and noisier agents.
  - B: Keep the full guide in docs/, distill enforceable rules into AGENTS.md, golden.mdc and .grok rules. Pros: short always-on context, one source of truth. Cons: distillation can drift from the guide.
- Decision: B. Existing rules win on conflict; the Plan-Mode advice is softened to "plan doc for >50 lines, Plan Mode optional".
- Consequences: Agents get verify-first and mistake-to-rule loops by default. Follow-up: prune rules as they become unnecessary; keep AGENTS.md under ~250 lines.
- Links: docs/golden-play-guide.md; docs/adr/0002-adopt-golden-play-guide.md

### D-003: Curate third-party agent tooling (vendor small skills, document tools, avoid risky ones)
- Date: 2026-10-26 | Status: Accepted
- Deciders: Sai (agent-drafted after SkillSpector scans)
- Context: Many community skills/tools requested; each runs with agent privileges.
- Options considered:
  - A: Install everything globally. Pros: fast. Cons: large unreviewed attack surface, telemetry, license gaps.
  - B: Vendor small licensed instruction-only skills, document tools as opt-in, avoid risky ones. Pros: auditable. Cons: manual curation.
- Decision: B. See docs/tooling.md.
- Consequences: Re-scan on update; prune unused skills after Nov 4.
- Links: docs/adr/0003-third-party-agent-tooling.md, THIRD_PARTY_NOTICES.md

### D-004: Use cognee (local, telemetry off) as agent memory
- Date: 2026-10-28 | Status: Accepted
- Deciders: Sai (agent-installed after SkillSpector scan)
- Context: The appeal and call agents need memory of payer rules, appeal results per denial code and insurer call notes. Data must stay local and synthetic.
- Options considered:
  - A: claude-mem. Pros: popular. Cons: records all agent activity, installs globally, optional cloud sync.
  - B: cognee 1.6.5 in the project venv. Pros: Apache-2.0, local files for storage, local embeddings, works with an OpenAI-compatible endpoint (Baseten Muse). Cons: large dependency tree (torch, GLiNER), telemetry on by default.
- Decision: B, with `TELEMETRY_DISABLED=1`, fastembed embeddings and repo-local storage. Do not install the cognee agent skills, hook or cognee-mcp.
- Consequences: Agents get a local knowledge graph. Follow-up: run the live test with the Baseten key; re-scan on upgrade; pin the version.
- Links: docs/tooling.md (cognee), .env.example, requirements.txt, scripts/cognee_smoke.py

### D-005: Plan and benefit data from CMS Exchange PUFs, mapped to fictional payers
- Date: 2026-10-28 | Status: Proposed
- Deciders: Sai (agent-drafted, Phase 1 research)
- Context: The eligibility, denial and appeal agents need realistic plan benefits. Real insurer names in a demo can suggest that a real insurer denied a claim.
- Options considered:
  - A: CMS Exchange PUFs 2026 (free, no signup, "AS IS" disclaimer). Pros: real benefit shapes. Cons: real issuer names; FFE states only.
  - B: CMS Marketplace API. Pros: live data. Cons: API key signup, 60-day key expiry, not for bulk extraction.
  - C: Invent all benefits. Pros: simple. Cons: less realistic.
- Decision: A. Take a one-state subset, map it to fictional payers, add synthetic TiC in-network files validated against the CMS TiC schema.
- Consequences: Realistic numbers with no real insurer in the story. Follow-up: keep the CMS disclaimer; never label altered data as CMS data.
- Links: docs/data-plan.md section 1

### D-006: Providers: fictional practice with Luhn-valid NPIs that NPPES does not know
- Date: 2026-10-28 | Status: Proposed
- Deciders: Sai (agent-drafted)
- Context: Claims need NPIs. NPPES (API v2.1, free, no signup) returns real providers.
- Options considered:
  - A: Use real NPIs from NPPES. Cons: real people in a synthetic denial story.
  - B: Fictional practice; NPIs pass the Luhn check and return zero NPPES results. Pros: realistic format, no real person.
- Decision: B. Use NPPES only to confirm that our NPIs are absent; record the response as a fixture; CI never calls NPPES.
- Consequences: No real provider in data. Follow-up: one manual NPPES check per new NPI.
- Links: docs/data-plan.md section 2

### D-007: Clearinghouse: own X12 payer mock; free vendor sandboxes optional
- Date: 2026-10-28 | Status: Proposed
- Deciders: Sai (agent-drafted)
- Context: We need 270/271, 837, 276/277 and 835. No free sandbox covers all four. Stedi sandbox = mock 270/271 only; Availity Demo = canned 270/271 and 276/277; Optum sandbox = canned values, credentials by request; Claim.MD test = one fixed eligibility response; pVerify and Office Ally = credentials from the vendor.
- Options considered:
  - A: Depend on a vendor sandbox. Cons: signup, partial coverage, canned data only.
  - B: Own payer mock for all flows, plus an optional Stedi 270/271 sandbox call. Pros: full control, synthetic data, no signup needed for the demo.
- Decision: B. Vendor signups only with Sai's yes. No production clearinghouse traffic.
- Consequences: Full end-to-end demo. Cons: we cannot claim TR3 compliance (TR3 guides are paid).
- Links: docs/data-plan.md section 3

### D-008: Patients: seeded Python generator first, Synthea later
- Date: 2026-10-28 | Status: Proposed
- Deciders: Sai (agent-drafted)
- Context: Synthea (Apache-2.0) needs Java 17+; Java is not on the build box; Phase 1 installs no tools.
- Options considered:
  - A: Project-local JDK + Synthea. Pros: rich clinical history. Cons: install approval, SNOMED/CPT content check.
  - B: Synthea on Modal. Cons: uses credits.
  - C: Seeded Python generator for the RCM fields only. Pros: fast, deterministic.
- Decision: C for the demo; A after approval if clinical history matters.
- Consequences: Simple patients. Follow-up: check whether Synthea output contains CPT before any commit.
- Links: docs/data-plan.md section 4

### D-009: Code sets: values only for X12 and CPT; subsets with attribution for HCPCS II and ICD-10-CM
- Date: 2026-10-28 | Status: Proposed
- Deciders: Sai (agent-drafted)
- Context: X12 holds copyright to CARC/RARC (free to view; CSV subscription $295/year, internal use; production embedding needs an X12 license). AMA CPT needs a license for any use in products, and prohibits training or fine-tuning AI on the CPT data file. HCPCS II is CMS. ICD-10-CM is free from CDC/NCHS (WHO holds the base ICD-10 copyright).
- Options considered:
  - A: Commit full code lists with descriptions. Cons: license risk in a public repo.
  - B: Code values plus our own labels for X12 and CPT; small attributed subsets for HCPCS II and ICD-10-CM.
- Decision: B. No CPT content in training data. Ask Sai about the AMA CPT Developer Program.
- Consequences: Lower legal risk. Supersedes the "load the public CARC and RARC code lists" line in docs/laya-plan.md for licensing.
- Links: docs/data-plan.md section 5

### D-010: Synthetic denials, appeals and call transcripts from a scenario table
- Date: 2026-10-28 | Status: Proposed
- Deciders: Sai (agent-drafted)
- Context: No public denial or call data exists without PHI.
- Options considered:
  - A: LLM-only generation. Cons: labels drift; hard to verify.
  - B: Hand-written scenario table + seeded generator for ground truth; optional Meta-model paraphrase with a second-model label check; 50-row human audit.
- Decision: B. Synthetic ID prefixes, 555-01xx phones, example.com emails, no SSN/MBI fields, PHI scanner in CI. Calls go only to our mock IVR.
- Consequences: Verifiable labels. Follow-up: golden set goes to evals/golden/ only after Sai approves.
- Links: docs/data-plan.md section 6

### D-011: LLM: Baseten Muse Spark Open primary, Meta Model API secondary, one client
- Date: 2026-10-28 | Status: Proposed
- Deciders: Sai (agent-drafted, revised after Mini Chief review)
- Context: Credits approved: Meta $150, Baseten $100. Baseten's 2026-10-26 email to Sai (reported by Mini Chief, not read by us) names `meta-models/muse-spark-open-1026` and says the key works only with that model. Baseten's public docs list `meta-models/muse-spark-open`. `main` already configures cognee with the `-1026` ID.
- Options considered:
  - A: Baseten through OmniRoute. Cons: extra hop and ToS surface.
  - B: Meta Model API only. Cons: Baseten credit unused.
  - C: Baseten primary + Meta secondary behind one OpenAI-compatible client. Pros: both credits; mutual fallback.
- Decision: C. The model ID is whatever `GET /v1/models` returns for Sai's key; record it here when checked. Meta becomes primary if that check fails.
- Consequences: Two budgets to watch. Follow-up: run the models-list call once the key is in `.env`.
- Links: docs/adr/0004-stack.md

### D-012: OmniRoute only for developer tools, not in the product path
- Date: 2026-10-28 | Status: Proposed
- Deciders: Sai (agent-drafted)
- Context: OmniRoute 3.8.52 (MIT) runs on the box. The "7B free tokens/day" claim is not in its README; the README claims about 1.62B tokens/month as an aggregate of separate third-party free tiers that each need their own account.
- Options considered:
  - A: Route all product calls through OmniRoute. Cons: ToS surface, extra process, fast release cadence.
  - B: Developer tools only (pi, experiments).
- Decision: B. Never connect consumer or web-session providers.
- Consequences: Product depends only on Meta and Baseten endpoints.
- Links: docs/adr/0004-stack.md, docs/tooling.md

### D-013: Product use of cognee memory (follows D-004)
- Date: 2026-10-28 | Status: Proposed
- Deciders: Sai (agent-drafted)
- Context: D-004 (Accepted, commit c1b87c1) installs cognee 1.6.5 in `.venv` with `TELEMETRY_DISABLED=1`, local fastembed and repo-local storage. The smoke test ran without an LLM key. D-004 does not cover the product runtime path. `.env.example` uses absolute paths under `/workspace/revora-starter`, and `scripts/cognee_smoke.py` contains a CPT descriptor (conflicts with D-009).
- Options considered:
  - A: Product depends on cognee directly. Cons: demo fails if cognee fails.
  - B: Product reads memory behind `MEMORY_BACKEND=cognee|none`. Pros: demo still runs without memory.
- Decision: B. Keep `TELEMETRY_DISABLED=1`, also set `ENV=dev`. Make storage paths relative to the repo root. Remove the CPT descriptor from the smoke text. Ask Sai whether non-Meta embeddings are allowed under the rules.
- Consequences: D-004 stays as is. Follow-up: run the LLM path of the smoke test with the Baseten key.
- Links: DECISIONS.md D-004, docs/adr/0004-stack.md, docs/tooling.md

### D-014: Compute: Modal for batch and fine-tune jobs, inside free credits
- Date: 2026-10-28 | Status: Proposed
- Deciders: Sai (agent-drafted)
- Context: LAYA fine-tune and optional Synthea batch need a GPU or a container. Modal Starter gives $30/month free credits. The $100 hackathon Modal credit is approved; Sai is redeeming it. L4 costs about $0.80/hour, so $100 is about 125 L4 hours.
- Options considered:
  - A: Modal. Pros: per-second billing, credits. Cons: account needed.
  - B: Local CPU only. Pros: free. Cons: slow fine-tune.
- Decision: A with `max_containers=1`, a timeout and a spend limit; B as fallback.
- Consequences: Follow-up: confirm the Modal credit shows in the workspace before the first run.
- Links: docs/adr/0004-stack.md, docs/laya-plan.md
