@AGENTS.md

# Claude Code specifics
- Use the reviewer subagent (.claude/agents/reviewer.md) before declaring a task done.
- Use /decision to log any library, pattern, schema or tradeoff choice (see DECISIONS.md).
- Prefer Plan Mode for changes over ~50 lines; wait for approval.
- Never run commands that touch prod, real payer endpoints, or real PHI.
