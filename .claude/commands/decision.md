---
description: Record a development decision in DECISIONS.md (or docs/adr)
argument-hint: <short title of the decision>
allowed-tools: Read, Edit, Write, Bash(git log:*), Bash(git diff:*)
---
Record a decision titled: $ARGUMENTS

1. Read DECISIONS.md to get the next number and avoid duplicates.
2. From this session and `git diff`, fill the template exactly: Context, Options considered (with pros/cons), Decision, Consequences (good and bad), Status, Links (PR, plan, related decisions).
3. If the context or rejected options are unclear, ASK me instead of guessing.
4. Append the entry; never edit the body of an accepted entry. If this replaces one, add a new entry and set the old Status to "Superseded by D-NNN".
5. Show me the entry.
