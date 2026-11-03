# Plan: README with isometric figures

Status: in review (PR on branch `docs/readme-anatomy`). Sai set the scope on 2026-11-02, relayed by Mini Chief. The figures were built under that scope. D-019 stays Proposed until Sai approves the PR.

## Goal

Write a README that explains Arthai Health to a new reader. Show each planned product with one figure. Label every product "planned", because no product code is built.

## Scope

1. README sections: what it does and why, architecture, components, data policy, quickstart, repo layout, decisions, status, safety and compliance, and the figures.
2. Exactly six figures in `docs/images/`: the overall flow, triage and the CCI gate, the appeal writer, the voice agent, code lookups, and the review console with audit.
3. Use the anatomy kit only through `kit/iso-kit.mjs` and `scripts/capture.mjs`, run locally. Do not run or import `publish.mjs` or `session.mjs` (D-019).
4. Synthetic data only. No secrets. Use only the make targets that exist: `dev`, `lint`, `typecheck` and `test`.
5. Do not change the project licensing decision.

## Checks

1. `make lint test`. `tests/test_readme_figures.py` checks that each station in each figure says "PLANNED", that each figure has alt text, that no forbidden names appear, and that the README relative links and anchors resolve.
2. An external link check of the README URLs (manual, before merge).
3. A fresh-context review for accuracy, overclaims, STE, figure legibility, leaks and visual quality. Fix every HIGH and MEDIUM finding.
4. A secret scan of the diff.

## Out of scope

Product code, data generators and the `eval` and `e2e` targets.
