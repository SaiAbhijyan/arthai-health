---
name: ste100-writing
description: Write or edit prose in Simplified Technical English style (inspired by ASD-STE100). Use for docs, READMEs, ADRs, DECISIONS.md, user-facing UI strings, appeal-letter templates and prompts. Do NOT use for code, identifiers or code comments that follow language conventions.
---
# STE-style writing (Arthai Health)
Own summary of public STE principles. Not the ASD-STE100 specification text; for the official spec see asd-ste100.org.

## Scope
- Yes: *.md docs, ADRs, release notes, UI strings, error messages, agent prompts, letter templates.
- No: source code, identifiers, config keys, quoted regulations, legal citations, payer text you quote verbatim.

## Rules
1. Procedural sentences: max 20 words. Descriptive sentences: max 25 words.
2. One instruction per sentence. One topic per paragraph (max 6 sentences).
3. Use the imperative for procedures: "Run `make test`." not "You should run tests."
4. Use active voice. Name the actor: "The denial agent writes an audit_event."
5. One word, one meaning. Pick a term and keep it (claim, denial, appeal, payer). Define each term once in a glossary if needed.
6. Prefer simple, common words: "use" not "utilize", "start" not "initiate", "help" not "facilitate".
7. Avoid ambiguous -ing forms. Write "To submit the claim, ..." or "When you submit..." not "Submitting the claim, ...".
8. Keep articles (a, an, the) and short connectors; do not write telegraphic text.
9. Use simple verb tenses: present, simple past, simple future.
10. Put conditions first: "If the payer rejects the claim, open a new appeal."
11. Write numbered steps for procedures; put warnings and cautions before the step they apply to.
12. Avoid noun clusters of more than three words. Break them up: "eligibility check response time" -> "the response time of the eligibility check".
13. No idioms, slang, or humor in technical text.

## Check before you finish
- Count words in long sentences; split any over the limit.
- Search for passive constructions ("is/was ... by") and rewrite where the actor is known.
- Confirm terms are consistent across the document.
