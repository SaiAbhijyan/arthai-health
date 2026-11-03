# Original research pages (Oct 26, 2026 snapshots)

These files are verbatim snapshots of the four research pages written on Oct 26, 2026, when the project was still called **Revora**. They keep the old Revora name and the original wording. They are kept so nothing from the early research is lost.

They are **not maintained**. The maintained, condensed versions are:

- [`docs/product/idea.md`](../../product/idea.md) and [`docs/product/hackathon.md`](../../product/hackathon.md)
- [`docs/rcm/primer.md`](../../rcm/primer.md) and [`docs/rcm/research.md`](../../rcm/research.md)
- [`docs/architecture.md`](../../architecture.md)

When a snapshot and a maintained doc disagree, the maintained doc wins. The writing style rules in `AGENTS.md` do not apply to these snapshots.

| File | Original page | Covers |
| --- | --- | --- |
| [`hackathon-brief.md`](hackathon-brief.md) | 0. Meta Hackathon Brief | Status, dates, rules, prizes, Meta models, fit check, prize strategy, day-by-day plan, submission checklist |
| [`idea-and-products.md`](idea-and-products.md) | Revora: Idea & Products | The idea, the 18-product suite, hackathon cut vs full vision, oversight, demo story |
| [`build-guide.md`](build-guide.md) | Revora Build Guide | RCM end to end, stage-by-stage AI workflow, edge cases, services and architecture, trust layer, demo infrastructure, company practices, interview prep |
| [`rcm-landscape.md`](rcm-landscape.md) | RCM Landscape: Who Won & Why | Market, competitors, papers, open-source repos |

The "1. Elite Builder Playbook" page is not included here.

## How they were converted

The pages were interactive components. The conversion keeps all text, tables, lists, callouts and links, with these format changes only:

- Diagrams are Mermaid flowcharts. Decisions are diamonds, end states are rounded, human steps use a box with double side lines.
- Interactive pickers are expanded so every option is shown:
  - Build Guide section 2.2 had a stage picker that showed one stage at a time. All 11 stages now appear as subsections, each with its diagram and details. The section caption still says "Pick a stage" because it is the original wording.
  - The "9-day hackathon" / "Full vision" toggles (Build Guide 3.4, Idea & Products section 3) show both options one after the other.
- Callouts are GitHub alert blocks. Table of contents links use the original section anchors.
- Links to other research pages (`cursor.com/canvas/...`) point to the private originals and need Sai's login.

## Removed for the public repo

This repo is public, so these items were taken out of `hackathon-brief.md` and replaced with a `[removed ...]` marker:

- The hackathon Discord **team ID** (2 places: section 1 status table and the section 10 checklist).
- **3 Discord channel links** (intro, credits and team search posts) in the section 1 status table.

Nothing else was removed. The pages had no secrets or keys, no real patient data (all examples are synthetic), and no CPT descriptor text (they mention CPT only as a code set, with no code descriptions).
