# 3. Third-party agent skills, tools and MCP servers
Date: 2026-10-26
## Status
Accepted
## Context
Sai listed ~17 community skills/tools. Each runs with agent privileges, so each is a supply-chain risk. We scanned all with SkillSpector (static) and checked license, maintenance and install scripts.
## Decision
- Vendor only small, licensed, instruction-only skills that match the Golden rules (agent-skills subset, karpathy-guidelines, caveman as opt-in, apple-motion). No vendored scripts or hooks.
- Write our own where no reputable option exists (ste100-writing, prompt-audit).
- Wire only Context7 as MCP (official npx server, no key committed).
- Document heavier tools (OmniRoute, Headroom, claude-mem, ponytail, graphify, anatomy) in docs/tooling.md for per-developer opt-in with pinned versions and telemetry off.
- Avoid Agent-Reach (browser-cookie reuse), dickwu/apple-design-skill (no license), watermarks-remover (irrelevant, legal risk).
## Consequences
Small attack surface and clear licensing. Some convenience lost; revisit after the hackathon. Vendored skills must be re-scanned when updated. See THIRD_PARTY_NOTICES.md and D-003.
