# CONTRIBUTING.md
- Branch: feat/<area>-<short>; one concern per PR; < ~400 changed lines.
- Every PR: linked plan (docs/plans), tests, `make lint test` green, eval diff if prompts/models changed.
- Significant choices need a DECISIONS.md entry (or "No decision: <reason>").
- Review: second-model review + one human approval; CODEOWNERS for services/billing, services/auth.
- AI-written code is held to the same bar; the author owns every line.
- Never commit PHI, secrets, or real payer data.
