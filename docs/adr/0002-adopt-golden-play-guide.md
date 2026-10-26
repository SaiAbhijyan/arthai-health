# 2. Adopt the Golden Play Guide as agent operating rules
Date: 2026-10-26
## Status
Accepted
## Context
Multiple AI coding tools (Claude Code, Cursor, Grok) contribute to Arthai Health. Without shared rules, quality varies by tool and the same mistakes recur.
## Decision
Store the full guide at docs/golden-play-guide.md. Distill its concrete rules into AGENTS.md ("Golden rules"), .cursor/rules/golden.mdc (alwaysApply) and .grok/rules/arthai.md. Existing repo rules take precedence on conflict. See D-002.
## Consequences
Short always-on context with a single rationale doc. Rules must be pruned and kept in sync; repeated review findings become new rules.
