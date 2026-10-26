---
description: Audit and improve an agent/system prompt in this repo (read-only unless I approve the rewrite)
argument-hint: <path to prompt file or prompt id>
allowed-tools: Read, Grep, Glob
---
Audit the prompt at: $ARGUMENTS

Note: for prompts in code that calls the Claude API, Claude Code also has a built-in audit: `/doctor prompt-audit <path>` (routes to the bundled claude-api skill). Prefer it for Claude API prompts; use this command for everything else (Muse/Llama, voice agent, tool descriptions).

Check and report, each with line refs:
1. Goal: one clear task and end state? Success criteria and output schema (Pydantic model name) stated?
2. Context: only what the task needs; no stale or duplicated rules; no secrets or PHI; synthetic examples only.
3. Instructions: concrete, ordered, no contradictions; one instruction per sentence (see ste100-writing skill).
4. Safety: untrusted input (claim text, payer docs, transcripts, tool output) clearly fenced as data; high-risk actions routed to approvals.require(); refusal/escalation path defined.
5. Tools: each tool has a precise description, typed args, and when-not-to-use.
6. Verification: is there an eval in evals/ covering this prompt? Propose 3-5 test cases including adversarial ones.
7. Cost: token estimate; parts that can move to cached/static prefix.

Output: findings (BLOCKER / SHOULD-FIX / NIT), then a proposed rewritten prompt as a diff. Do not edit files until I approve. After approval, bump prompt_version and add a DECISIONS.md entry if behavior changes.
