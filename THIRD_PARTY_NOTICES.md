# Third-party notices
Vendored agent skills/agents (copied unmodified unless noted; scanned with NVIDIA SkillSpector --no-llm on 2026-10-26):

| Path | Source | License |
|---|---|---|
| .claude/skills/{debugging-and-error-recovery,test-driven-development,spec-driven-development,code-review-and-quality,security-and-hardening,documentation-and-adrs}, .claude/agents/security-auditor.md | https://github.com/addyosmani/agent-skills (Copyright (c) 2025 Addy Osmani) | MIT |
| .claude/skills/karpathy-guidelines | https://github.com/multica-ai/andrej-karpathy-skills (formerly forrestchang/andrej-karpathy-skills) | MIT (declared in SKILL.md frontmatter; repo has no LICENSE file) |
| .claude/skills/caveman (modified: opt-in only, chat-only scope note) | https://github.com/JuliusBrussee/caveman | Apache-2.0 (see upstream LICENSE/NOTICE) |
| .claude/skills/apple-motion (renamed from apple-design; frontmatter name changed) | https://github.com/emilkowalski/skills/tree/main/skills/apple-design (Copyright Emil Kowalski) | MIT |
| .claude/skills/find-skills (modified: added scan-before-install override) | https://github.com/vercel-labs/skills/tree/main/skills/find-skills | MIT |
| .claude/commands/security-review.md | https://github.com/anthropics/claude-code-security-review | MIT |

## Software factory v2 (zazencodes/zazencodes-season-3)

- Source: https://github.com/zazencodes/zazencodes-season-3/tree/main/src/software-factory-claude-code-v2
- License: GPL-3.0. Files: `factory/bin/job`, `factory/bin/gate`, `factory/bin/route`, `factory/dashboard.html`
  (vendored; `factory/bin/job` modified to add the `escalate_paths` merge guard).
- `factory/config.json`, `factory/checks.sh`, `.claude/agents/{intake,spec-writer,builder,reviewer-*,approver}.md`
  and `.claude/skills/factory/SKILL.md` were written for Arthai Health. Upstream v2 does not ship agent files.

## Python dependencies

- cognee 1.6.5 (https://github.com/topoteretes/cognee), Apache-2.0. Installed with pip into `.venv`. Not vendored.

## Vetting batch added 2026-10-28 (scanned with SkillSpector --no-llm on 2026-10-26)

Vendored agent skills (copied; SKILL.md only unless noted):

| Path | Source | License |
|---|---|---|
| .claude/skills/graphify | https://github.com/Graphify-Labs/graphify | Apache-2.0 |
| .claude/skills/anatomy | https://github.com/wheresryan22/anatomy (Copyright (c) 2026 Ryan) | MIT |

Installed globally per Sai, NOT committed to this repo (user-level `~/.claude/skills` and `~/.cursor/skills-cursor`):

| Path | Source | License |
|---|---|---|
| ponytail, ponytail-audit, ponytail-debt, ponytail-gain, ponytail-help, ponytail-review | https://github.com/DietrichGebert/ponytail (Copyright (c) 2026 DietrichGebert) | MIT |

Installed on the build box only (NOT in this repo):

| Path | Source | License |
|---|---|---|
| /workspace/tools/meta-n (research tool, own venv) | https://github.com/minnesotanlp/meta-n (Copyright (c) 2026 Zae Myung Kim) | MIT |
| /workspace/tools/rea (clone only, not wired) | https://github.com/morluto/rea (Copyright (c) 2026 morluto) | MIT |
| /workspace/tools/Agent-Reach (own venv, isolated, unwired) | https://github.com/Panniantong/Agent-Reach (Copyright (c) 2025 Agent Eyes) | MIT |
| /workspace/tools/graphify-env (graphifyy 0.9.97 CLI, pip venv) | https://github.com/Graphify-Labs/graphify | Apache-2.0 |
| /workspace/tools/Claude-Red (clone only, NOT wired, see docs/tooling.md) | https://github.com/SnailSploit/Claude-Red (Copyright (c) 2024-2025 SnailSploit / Kai Aizen) | MIT |

Local-only, NOT committed (no license; git-ignored):

| Path | Source | License |
|---|---|---|
| .claude/skills/apple-design-local/ (git-ignored) | https://github.com/dickwu/apple-design-skill | None (reproduces Apple HIG text; kept off the public repo) |

## Vetting batch, 2026-10-28

Vendored into this repo (scanned with SkillSpector `--no-llm`; reports in `/workspace/curious/skillspector-*.md`):

| Path | Source | License |
|---|---|---|
| .claude/skills/graphify (SKILL.md only; `.cursor/rules/graphify.mdc` our wrapper) | https://github.com/Graphify-Labs/graphify | Apache-2.0 |
| .claude/skills/anatomy (SKILL.md only; `.cursor/rules/anatomy.mdc` our wrapper) | https://github.com/wheresryan22/anatomy | MIT |

Installed on the build box or in user config, **not vendored into this repo**:
- ponytail (DietrichGebert/ponytail, MIT) — global user skills `~/.claude/skills`, `~/.cursor/skills-cursor`.
- meta-n (minnesotanlp/meta-n, MIT) — research venv `/workspace/tools/meta-n/.venv`.
- Agent-Reach (Panniantong/Agent-Reach, MIT) — box venv, global wrapper, login disabled.
- REA (morluto/rea, MIT) — clone only `/workspace/tools/rea`, not wired.
- Strix / strix-agent (usestrix/strix, MIT) — box venv `/workspace/tools/strix-env`, global wrapper, telemetry off.
- claude-red (SnailSploit/Claude-Red, MIT) — global user skills only; offensive, never committed to a repo.
- apple-design-skill (dickwu, **no license**) — user config + git-ignored local only; never committed.

## everything-claude-code / ECC (affaan-m/ECC), added 2026-10-28 (D-019)

- Source: https://github.com/affaan-m/ECC, commit 25278e7d7b6cf6e6a4e7a6c8e10f14ff22f0eb5b (version 2.2.3).
- License: MIT, Copyright (c) 2026 Affaan Mustafa.
- Paths: `.claude/agents` (71 ECC files), `.claude/skills` (311 ECC folders), `.claude/commands` (97 ECC files), `.claude/rules/ecc`, `.claude/scripts`, `.claude/hooks`, `.claude/.agents`, `.claude/ecc`, `.claude/mcp-configs`, and the ECC files `.claude/AGENTS.md`, `.claude/README.md`, `.claude/plugin.json`, `.claude/marketplace.json`, `.claude/PLUGIN_SCHEMA_NOTES.md`, `.claude/the-security-guide.md`. The same set is under `.cursor/`, without hooks.
- Modified: the hook commands in `.claude/settings.json` use `CLAUDE_PROJECT_DIR`. Some hooks are disabled (see D-019). `.cursor/mcp.json` keeps our servers only.
- SkillSpector scan: 100/100 CRITICAL, 247 HIGH flags. Sai accepted the risk.

