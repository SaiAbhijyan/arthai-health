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
