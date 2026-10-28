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

### D-014: Vetting-batch tool installs (2026-10-28)
- Date: 2026-10-28 | Status: Accepted
- Deciders: Sai (explicit: "except the watermarks install all"; later "install these globally"; ponytail global)
- Context: Sai approved installing the remaining vetted tools, watermarks-remover excluded. Each was scanned with SkillSpector before install.
- Decisions:
  - ponytail: installed GLOBALLY (user-level `~/.claude/skills`, `~/.cursor/skills-cursor`), SKILL.md only, no Node hooks/telemetry.
  - graphify, anatomy: project-level skills in `.claude/skills` + `.cursor/rules`. graphify CLI runs from a box venv (`graphifyy`), not a global `uv tool`; query log off.
  - meta-n: research venv on the box, not a skill.
  - Agent-Reach: isolated box venv + global wrapper that blocks `login`, so it never reads the box browser's cookies. Not wired as an MCP.
  - REA: clone only, not registered as a global MCP and not auto-enabled; never to be pointed at insurer/clearinghouse/third-party sites.
  - apple-design (dickwu): no license, so user-config + git-ignored local only; never committed to any repo.
  - claude-red (offensive, 79 skills): installed to user config only (`~/.claude`, `~/.cursor`), NOT wired into this public repo. Use only against a test deployment Sai owns.
  - Strix (usestrix/strix): installed globally (box venv + wrapper), telemetry off; run only on Sai's own code or local targets. Scan was 100/100 CRITICAL by volume/offensive-by-design; the one CRITICAL is a benign env→urlopen in its Caido proxy client. Needs Docker + an LLM key to run.
  - watermarks-remover: NOT installed (irrelevant, legal/ethical risk).
- Consequences: Offensive tools (claude-red, Strix) stay out of the public repo and are scoped to Sai-owned targets. Telemetry off everywhere.
- Links: docs/tooling.md (sections dated 2026-10-28)

### D-015: Install Headroom (box tool) and claude-mem (global), tracking off
- Date: 2026-10-28 | Status: Accepted
- Deciders: Sai (explicit: "all", for Headroom and claude-mem; he accepted the global claude-mem install)
- Context: Sai wants token savings (Headroom) and session memory across Claude Code sessions (claude-mem). Both send usage data by default. claude-mem installs only at user level.
- Decisions:
  - Headroom 0.42.0: `uv tool` in `/workspace/tools`, not global. Start it only with `scripts/headroom.sh`. The script sets `HEADROOM_TELEMETRY=off`, `HEADROOM_BEACON=off` and `DO_NOT_TRACK=1`. The proxy listens on `127.0.0.1:8787` in tmux window `arthai:headroom`. `headroom wrap claude` is opt-in only and not used, because it changes global config.
  - claude-mem 15.4.0: global Claude Code plugin. Telemetry, cloud sync, TeamBrain, Telegram, Notion, Grok Bot memory writes, CCS Align and Chroma are off. Secret redaction is on. Shell commands that touch secrets are skipped.
- Consequences: Headroom compresses only the sessions that opt in. claude-mem records all Claude Code sessions on the box in `~/.claude-mem` and uses Claude plan quota for summaries. Re-scan with SkillSpector before any upgrade. Keep the versions pinned.
- Links: docs/tooling.md (Headroom, claude-mem), scripts/headroom.sh, .env.example
