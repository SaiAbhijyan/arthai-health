---
description: Strict review of the current branch against the plan and AGENTS.md
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(make lint), Bash(make test)
---
Use the reviewer subagent to review `git diff main...HEAD` against docs/plans/ and AGENTS.md.
Report BLOCKERS / SHOULD-FIX / NITS with file:line. Also check: does a significant change have a DECISIONS.md entry?
