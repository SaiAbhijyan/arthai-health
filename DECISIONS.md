# DECISIONS.md
Append-only. Never edit an accepted entry's body; supersede it with a new one.
Write an entry when choosing a library, pattern, schema, protocol, model/prompt strategy, or a tradeoff someone may later question.

## Template
### D-NNN: <title>
- Date: YYYY-MM-DD  | Status: Proposed | Accepted | Superseded by D-MMM
- Deciders: <people / agent + reviewer>
- Context: <problem and forces>
- Options considered:
  - A: <pros / cons>
  - B: <pros / cons>
- Decision: <one sentence>
- Consequences: <good> / <bad> / <follow-ups>
- Links: <PR, plan, ADR, docs>

---
### D-001: Modular monolith instead of microservices for the hackathon
- Date: 2026-10-26 | Status: Accepted
- Deciders: Sai (reviewed by second-model review)
- Context: One builder, 9 days, must demo end to end; full vision has ~18 services; PHI scope and audit needed.
- Options considered:
  - A: Microservices from day 1. Pros: independent scaling, physical PHI isolation. Cons: network contracts, infra and debugging cost the schedule can't absorb.
  - B: Modular monolith + separate payer mock, voice worker and console (4 deployables). Pros: one deploy and DB, shared types, fast. Cons: shared failure domain; boundaries enforced only by convention.
- Decision: B, with per-module tables and all cross-module communication through the Postgres outbox.
- Consequences: Fast iteration; outbox events make later extraction cheap. Risk of boundary erosion, mitigated by an import-linter rule and review checklist.
- Links: Build Guide 3.4; docs/adr/0001-modular-monolith.md
