@AGENTS.md

# Claude Code specifics
- Use the reviewer subagent (.claude/agents/reviewer.md) before declaring a task done.
- Use /decision to log any library, pattern, schema or tradeoff choice (see DECISIONS.md).
- For changes over ~50 lines write the plan in docs/plans/ and wait for approval (Plan Mode optional).
- Follow the Golden rules in AGENTS.md; full rationale in docs/golden-play-guide.md.
- Never run commands that touch prod, real payer endpoints, or real PHI.
