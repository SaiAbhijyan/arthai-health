@AGENTS.md

# Claude Code specifics
- Use the reviewer subagent (.claude/agents/reviewer.md) before declaring a task done.
- Use /decision to log any library, pattern, schema or tradeoff choice (see DECISIONS.md).
- For data sources, code-set licenses and data layout, read docs/data-plan.md (shared with Cursor and Grok). No memory plugin is approved; shared memory is DECISIONS.md, AGENTS.md and docs/data-plan.md.
- For changes over ~50 lines write the plan in docs/plans/ and wait for approval (Plan Mode optional).
- Follow the Golden rules in AGENTS.md; full rationale in docs/golden-play-guide.md.
- Never run commands that touch prod, real payer endpoints, or real PHI.
