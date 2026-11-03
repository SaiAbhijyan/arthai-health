# Arthai Health

AI agents that get you paid.

Arthai Health is a planned set of AI agents for healthcare billing work. The agents help billing staff with denied insurance claims. They sort each denial, write the appeal letter and follow up with the insurer (the payer) by voice. In this file, "payer" means the insurer. A human reviews every claim that the agents are not sure about.

> **Status: plan and tooling only.** The `main` branch holds design documents, agent rules, a software factory and a few tests. No product code is built yet. Every product in this file is **planned**. See [Status](#status-built-and-planned).
>
> Many component details come from research in [PR #9](https://github.com/SaiAbhijyan/arthai-health/pull/9) and [PR #14](https://github.com/SaiAbhijyan/arthai-health/pull/14). These PRs are not merged yet, so those details can change. If a PR document and [DECISIONS.md](DECISIONS.md) do not agree, use DECISIONS.md.

Arthai Health does billing and admin automation. It does not give medical advice. All data is synthetic. The rules forbid real patient data (PHI).

## Contents

- [What it does and why](#what-it-does-and-why)
- [Architecture overview](#architecture-overview)
- [Components](#components)
- [Data policy](#data-policy)
- [Quickstart](#quickstart)
- [Repo layout](#repo-layout)
- [Decisions and ADRs](#decisions-and-adrs)
- [Status: built and planned](#status-built-and-planned)
- [Safety and compliance](#safety-and-compliance)
- [Glossary](#glossary)
- [About the figures](#about-the-figures)

## What it does and why

### The problem

Payers deny many claims. Billing staff must find the cause of each denial, fix it and appeal. They also spend a long time on the phone with payers. The research for this project, in [PR #9](https://github.com/SaiAbhijyan/arthai-health/pull/9), found these numbers in public reports:

| Fact | Source (as cited in PR #9, `docs/rcm/research.md`, section 1) |
|---|---|
| The average initial denial rate in 2025 was 11.6%. | Kodiak 2025 |
| The rework of one denial costs about $103. | HFMA chapter deck 2025 |
| Humans still review 90% of denials. | Experian State of Claims 2025 |
| Automation of admin transactions could save about $20B of a $90B spend. | CAQH Index 2024 |

### The planned solution

The core loop for the hackathon has six steps:

1. A denied claim line arrives in a synthetic 835 remittance, with CARC and RARC codes.
2. A triage step gives the denial category, the appeal decision (yes or no) and the priority.
3. A confidence gate decides if the triage is sure. If it is not sure, the claim goes to a human.
4. An appeal writer drafts a letter. Each statement in the letter must cite a source.
5. A voice agent calls our own mock payer to follow up. The call outcome updates the claim.
6. A review console shows the claim timeline, the audit trail and the approvals.

The design has two main parts. A statistical gate (conformal prediction) decides which claims go to a human. A voice call updates the claim with the call outcome. The research found no vendor whose public marketing puts both parts first. This is a reading of marketing pages, not a measured fact (PR #9, `docs/product/idea.md`).

## Architecture overview

<p align="center">
  <img src="docs/images/arthai-overview.svg" width="100%" alt="Fig 1. The planned Arthai Health flow as nine stations on one bench, every one labeled planned: claim builder, payer mock, remit posting, triage and CCI gate, review console, appeal writer, voice agent, AR follow-up and eval. A green track takes sure claims from the gate to the appeal writer, a red track takes unsure claims to the human queue, and an amber track takes the claim from the console to the writer after a human decides. Black tracks carry the claim from 1 to 4, from the writer to the voice agent after approval, and the call outcome back to the console; a dashed track is the call to the mock payer, and a blue dotted track carries reviewer edits to eval and back to the gate.">
</p>

Fig 1 shows the whole planned flow. The numbers match the stations in the figure.

1. The **claim builder and scrubber** builds the claim (837) and checks it against the CMS NCCI and MUE edits.
2. The **payer and clearinghouse mock** is our own fake payer. It decides on synthetic claims and sends back 835 and 277 files.
3. **Remit posting** reads the 835 and finds each denied line.
4. The **triage step and the CCI gate** score the denial. The gate sends the claim on the auto path or to a human.
5. The **review console** holds the human queue, the approvals and the audit trail.
6. The **appeal writer** drafts the letter with an LLM. The planned model is Muse, a Meta model (D-011, proposed).
7. The **voice agent** calls the mock payer rep in the browser.
8. **AR follow-up** ranks the open claims for the next action.
9. The **eval and feedback loop** turns reviewer edits into eval cases.

A claim that goes to the human queue can still get an appeal. The reviewer decides, then the writer drafts. Every send and every call needs tier-2 approval in the console. The appeal goes out and the call starts only after that approval (PR #9, `docs/architecture.md`, sections 1 and 5.3).

The planned deployment is a modular monolith with a separate payer mock, voice worker and console (D-001). Modules talk through a Postgres outbox. A LangGraph supervisor runs each claim to an end state. It stops before every send and every call. The core is deterministic: EDI build, payment posting and the ledger are code. AI does classification, drafting and conversation. Source: [ADR 0001](docs/adr/0001-modular-monolith.md) and `docs/architecture.md` in PR #9.

## Components

All components in this section are **planned**. The module names come from the architecture map in [AGENTS.md](AGENTS.md).

### Triage and the CCI gate (planned)

<p align="center">
  <img src="docs/images/arthai-triage-gate.svg" width="100%" alt="Fig 2. Planned triage and CCI gate. A synthetic denial goes to a triage scorer (LLM by default, LAYA optional) and then to a gate with seven example category pins. Claim A has one raised pin and goes on a green track to the auto path; claim B has three raised pins and goes on a red track to the human queue, and a calibration station feeds the gate on a blue dotted track.">
</p>

- The triage step returns a typed decision: the denial category, the appeal decision and the priority.
- LAYA can do this step. LAYA is a small open "System 1" decision model (about 421M parameters, Apache-2.0). It is not a Meta model. See [docs/laya-plan.md](docs/laya-plan.md).
- LAYA is optional. The switch is `TRIAGE_BACKEND=laya|llm`. The default is `llm` until the rule question is answered and LAYA beats the LLM on the held-out set ([ADR 0004](docs/adr/0004-stack.md), proposed).
- The CCI gate (`cci_gate`, based on `cci-sdk`) turns the scores into a conformal prediction set. If the set has one label, the claim takes the auto path. If the set has more than one label, the claim goes to the human queue.
- The docs do not yet say what happens to an empty set. This is an open question.
- The research plans the gate on LAYA scores (PR #14, section 5.3). The docs do not yet say how the default `llm` backend gives scores to the gate.
- The gate has a coverage target (1 − alpha). It is not a raw confidence threshold.
- **Limit:** the conformal guarantee is an average over cases like the calibration set. It is not a promise about one claim (PR #14, section 5.3).
- **Limit:** do not trust the raw LAYA confidence before calibration. The base checkpoint warns that some calibration temperatures are invalid ([docs/laya-plan.md](docs/laya-plan.md)).

### Appeal writer (planned)

<p align="center">
  <img src="docs/images/arthai-appeal-writer.svg" width="100%" alt="Fig 3. Planned appeal writer. Facts and a fictional payer policy go to an LLM writer (Muse planned), and a citation gate checks that each statement cites a chunk ID, with a red track back to the writer for a statement with no source. Green tracks take the draft to human approval (tier 2) and then to the send tray.">
</p>

- The appeal writer retrieves chunks of payer policy and writes the letter.
- An LLM writes the text. The planned model is Muse, a Meta model (D-011, proposed). With `TRIAGE_BACKEND=laya`, LAYA makes the triage scores and the LLM only writes (PR #14, section 5.3).
- The citation gate checks that each statement maps to a retrieved chunk ID. If a statement has no source, the draft goes back to the writer.
- A human approves the letter before it goes out. In the hackathon, every external action needs approval.
- The payer policies in the demo are fictional. Example payer IDs start with `ZZP`.
- Model plan: Baseten Muse Spark Open first and the Meta Model API second, behind one OpenAI-compatible client (D-011, proposed). Meta Contributor mode is allowed for synthetic data only (D-017, accepted).

### Voice agent (planned)

<p align="center">
  <img src="docs/images/arthai-voice-agent.svg" width="100%" alt="Fig 4. Planned voice agent. A browser call links on a blue two-way line to our own mock payer rep, and black tracks take the rep audio to local speech-to-text, the text to the agent turn (an LLM, Muse planned, AI disclosed) and the reply to local text-to-speech. A dashed track takes the spoken reply back into the call, and a green track takes the result to a call outcome card with the example reference SYN-REF-0007.">
</p>

- The voice demo is free only. It uses a browser call (WebRTC and Web Audio) to our own mock payer rep. It uses no paid phone line. It uses no signup that needs a card (D-018, accepted).
- Speech-to-text runs locally. The candidates are Whisper and faster-whisper.
- Text-to-speech runs locally. The candidates are Piper and Kokoro.
- ADR 0004 item 8 names Muse Voice Transcribe for speech-to-text. D-018 came later and is accepted. It sets local speech-to-text.
- Before install, each voice tool gets a SkillSpector scan. Each voice model gets a license check. Non-commercial voices are not allowed (D-018).
- The agent says that it is an AI and announces the recording. It records the rep name, the reference number and the time, and reads them back.
- The agent calls only the mock payer. **Never call a real payer.**

### Code lookups (planned)

<p align="center">
  <img src="docs/images/arthai-code-lookups.svg" width="100%" alt="Fig 5. Planned code lookups. A card catalog has drawers for HCPCS Level II, ICD-10-CM, CARC and RARC values, and a locked CPT drawer marked not used. An agent asks the catalog for CARC 197, the catalog answers CARC 197: prior_auth, and a green track takes the answer to a check with format rows for each code set and a red row that rejects CPT.">
</p>

- Agents look up codes in our catalog only. There are no free-text codes in a claim, a prompt or a letter ([AGENTS.md](AGENTS.md)).
- HCPCS Level II comes from CMS. We plan to commit a small subset with CMS attribution.
- ICD-10-CM comes from CDC/NCHS. We plan to commit a small subset with attribution, with the code titles unchanged.
- CARC and RARC are X12 code lists. We store the code values only, with our own short labels. We do not copy X12 description text.
- We use **no CPT**: no CPT codes, no CPT descriptors and no AMA license (D-009, accepted). Claims use HCPCS Level II codes only.
- Planned tests check the format of each code value and fail on any X12 or AMA description text ([docs/data-plan.md](docs/data-plan.md), section 5).

### Review console and audit (planned)

<p align="center">
  <img src="docs/images/arthai-review-console.svg" width="100%" alt="Fig 6. Planned review console and audit. Two queue trays (AI-flagged and random QA) feed a timeline screen for synthetic claim SYN-C-000042, and every action goes to an append-only audit trail of hash-linked blocks. An approvals panel has approve, edit and reject buttons, and a blue dotted track takes a reviewer edit to the feedback station.">
</p>

- The console has two queues. One holds the claims that the AI flags. The other holds a random QA sample of claims that the AI handled alone. The random sample measures the true quality.
- The claim timeline shows each AI and human action, the model, the prompt version and the sources.
- Every AI action writes an `audit_event` ([AGENTS.md](AGENTS.md)). The event records the actor, the model, the prompt version, the input hash, the tools, the output and the approver.
- The audit table is append-only. Each row stores the hash of the row before it (PR #9, `docs/architecture.md`, section 5.1).
- High-risk actions go through `approvals.require()`: send an appeal, place a call, post a payment, write off. Write-offs and refunds need two people.
- A reviewer edit becomes an eval case. The gate is then recalibrated on recent reviewed claims.

### The other planned products

These products appear in Fig 1. They have no figure of their own. Code lookups (Fig 5) is a shared part, not a station in Fig 1. Agents get every code from this catalog ([AGENTS.md](AGENTS.md)).

| Product | What it does (planned) | Source |
|---|---|---|
| Claim builder and scrubber | Builds the 837. Runs the CMS NCCI and MUE edits. Gives a denial-risk score. | PR #9 `docs/architecture.md` section 3 |
| Payer and clearinghouse mock | Decides on synthetic claims. Sends 835 and 277 files. Plays the phone rep. | [D-007](DECISIONS.md), [docs/data-plan.md](docs/data-plan.md) section 3 |
| Remit posting | Reads the 835. Posts payments. Finds each denied line and its root-cause category. | PR #9 `docs/architecture.md` section 3 |
| AR follow-up | Ranks open claims by age and priority. Reads 276/277 status. | PR #9 `docs/product/idea.md` section 4.2 |
| Eval and feedback loop | Keeps golden sets and metrics. Turns reviewer edits into eval cases. Recalibrates the gate. | PR #9 `docs/architecture.md` section 5.4 |

### Supporting parts (planned or proposed)

- **Memory:** cognee 1.6.5 is pinned in `requirements.txt`, with telemetry off (D-004, accepted). A switch, `MEMORY_BACKEND=cognee|none`, controls product use. With `none`, the demo still runs if cognee fails (D-013, proposed).
- **Compute:** Modal for the LAYA fine-tune and batch jobs, inside the free credits (D-016, proposed).
- **Developer tools:** OmniRoute is for developer tools only. It is not in the product path (D-012, proposed).

## Data policy

All data in this project is synthetic. The single source of truth for data sources, licenses and data layout is [docs/data-plan.md](docs/data-plan.md).

Rules:

1. Use synthetic data only. Do not put real PHI in code, tests, logs, prompts, fixtures or model calls.
2. Use only public documents and public APIs. Do not scrape or reverse-engineer payer, clearinghouse or payer-portal sites.
3. Do not commit secrets. Keep API keys in env vars only.
4. Do not sign up for a service or pay for anything without a written "yes" from the owner.

Planned sources and licenses:

| Data | Plan | Decision |
|---|---|---|
| Plans and benefits | CMS Exchange public use files, mapped to fictional payers | [D-005](DECISIONS.md) (proposed) |
| Providers | A fictional practice. NPIs pass the Luhn check and return no NPPES result. | [D-006](DECISIONS.md) (proposed) |
| Clearinghouse | Our own X12 payer mock. Vendor sandboxes are optional. | [D-007](DECISIONS.md) (proposed) |
| Patients | Synthea with a pinned release and a project-local JDK 17 | [D-008](DECISIONS.md) (accepted) |
| Code sets | HCPCS Level II and ICD-10-CM subsets, CARC and RARC values only, no CPT | [D-009](DECISIONS.md) (accepted) |
| Denials, appeals, calls | A hand-written scenario table and a seeded generator | [D-010](DECISIONS.md) (proposed) |
| Model calls | Meta Contributor mode sees synthetic data only | [D-017](DECISIONS.md) (accepted) |

Synthetic IDs use fixed prefixes: `SYN-P-`, `SYN-C-`, `SYN-D-`, member IDs `ZZ` and payer IDs `ZZP`. Phone numbers use `555-0100` to `555-0199`. Emails use `example.com`.

A PHI scanner in CI is planned (docs/data-plan.md, section 6.4). It fails on these items:

- SSN or MBI patterns
- phone numbers outside `555-01xx`
- emails outside `example.com`
- NPIs that are not in the fictional list

## Quickstart

The Makefile has four targets today: `dev`, `lint`, `typecheck` and `test`. The `eval` and `e2e` targets in AGENTS.md are planned. They arrive with the app code.

You need Python 3.12, [uv](https://docs.astral.sh/uv/) and GNU make 4.x.

1. Clone the repo.

   ```bash
   git clone https://github.com/SaiAbhijyan/arthai-health.git
   cd arthai-health
   ```

2. Build the dev tools venv (`.venv-dev`, git-ignored, from the hash-locked `requirements-dev.txt`).

   ```bash
   make dev
   ```

3. Run the lint and type checks (ruff and `mypy --strict`).

   ```bash
   make lint
   ```

4. Run the tests (pytest).

   ```bash
   make test
   ```

`make typecheck` runs `mypy --strict` alone. `make lint` runs it too.

The Makefile sets a default `UV_PYTHON_INSTALL_DIR` for the project build machine. On another machine, set it to a folder that you can write to:

```bash
make dev UV_PYTHON_INSTALL_DIR="$HOME/.local/share/uv/python"
```

Keep API keys in your shell or in a local `.env` file. The `.env` file is git-ignored. Never commit it.

## Repo layout

```
.
├── AGENTS.md            # rules for all coding agents (CLAUDE.md points here)
├── CLAUDE.md            # Claude Code specifics
├── CONTRIBUTING.md
├── DECISIONS.md         # decision log, D-001 to D-019
├── Makefile             # dev, lint, typecheck, test
├── README.md            # this file
├── SETUP.md             # older setup notes
├── THIRD_PARTY_NOTICES.md
├── pyproject.toml       # ruff, mypy and pytest settings
├── requirements.txt     # runtime pins (cognee)
├── requirements-dev.in  # dev tools, input to the hash-locked requirements-dev.txt
├── requirements-dev.txt
├── docs/
│   ├── adr/             # architecture decision records 0001 to 0004
│   ├── data-plan.md     # data sources, licenses and layout (single source)
│   ├── golden-play-guide.md
│   ├── hackathon-workflow.md
│   ├── images/          # README figures (SVG) and their build scripts in src/
│   ├── laya-plan.md
│   ├── plans/           # task plans
│   └── tooling.md       # third-party skills and tools, with scan notes
├── factory/             # software factory: issue -> spec -> build -> gate -> review -> PR
├── scripts/             # dev-tool wrappers (headroom, omniroute, pi) and the cognee smoke test
├── tests/               # pytest: factory merge guard and README figure checks
├── .claude/             # Claude Code agents, commands and vendored skills
├── .cursor/rules/       # Cursor rules that mirror the agent rules
└── .grok/rules/         # Grok reviewer rules
```

The planned product code goes into `services/` and `packages/` (see the architecture map in [AGENTS.md](AGENTS.md)). These folders do not exist yet.

## Decisions and ADRs

Read [DECISIONS.md](DECISIONS.md) for every decision. For data and licensing, [docs/data-plan.md](docs/data-plan.md) is the single source.

| ID | Decision | Status |
|---|---|---|
| D-001 | Modular monolith instead of microservices | Accepted |
| D-002 | The Golden Play Guide is the agent operating rules | Accepted |
| D-003 | Curate third-party agent tooling | Accepted |
| D-004 | cognee (local, telemetry off) as agent memory | Accepted |
| D-005 | Plan and benefit data from CMS Exchange PUFs | Proposed |
| D-006 | Fictional practice with Luhn-valid NPIs | Proposed |
| D-007 | Own X12 payer mock; vendor sandboxes optional | Proposed |
| D-008 | Synthea with a project-local JDK 17 | Accepted |
| D-009 | Free code sets only; HCPCS Level II and code values; no CPT | Accepted |
| D-010 | Synthetic denials, appeals and calls from a scenario table | Proposed |
| D-011 | Baseten Muse Spark Open first, Meta Model API second | Proposed |
| D-012 | OmniRoute only for developer tools | Proposed |
| D-013 | Product use of cognee memory | Proposed |
| D-014 | Vetting-batch tool installs | Accepted |
| D-015 | Headroom and claude-mem, tracking off | Accepted |
| D-016 | Modal for batch and fine-tune jobs | Proposed |
| D-017 | Meta Contributor mode, synthetic data only | Accepted |
| D-018 | Voice: free only, browser call to our own mock insurer | Accepted |
| D-019 | README figures: anatomy kit core only, pinned | Proposed |

ADRs:

- [ADR 0001: modular monolith](docs/adr/0001-modular-monolith.md)
- [ADR 0002: adopt the Golden Play Guide](docs/adr/0002-adopt-golden-play-guide.md)
- [ADR 0003: third-party agent tooling](docs/adr/0003-third-party-agent-tooling.md)
- [ADR 0004: model, triage, memory and compute stack](docs/adr/0004-stack.md) (proposed, except D-017)

Research that is not on `main` yet:

- [PR #9](https://github.com/SaiAbhijyan/arthai-health/pull/9): product idea, RCM primer, market research and architecture.
- [PR #14](https://github.com/SaiAbhijyan/arthai-health/pull/14): healthcare RCM model research (options, build path, data, HIPAA).

## Status: built and planned

| Area | Status |
|---|---|
| Design docs: data plan, ADRs, decision log, LAYA plan | Built (docs only) |
| Agent rules for Claude Code, Cursor and Grok | Built |
| Software factory (`factory/`) with a merge guard that sends data, scripts, PHI, auth and payer paths to a human | Built |
| Makefile gate: `dev`, `lint`, `typecheck`, `test` | Built |
| Tests: pytest files for the factory merge guard and the README figures | Built |
| cognee 1.6.5, pinned in `requirements.txt`, telemetry off | Pinned (D-004). No product code uses it yet. The LLM path is not tested yet. |
| Synthetic data generators ([docs/data-plan.md](docs/data-plan.md), section 9; tracked in GitHub issues [#2](https://github.com/SaiAbhijyan/arthai-health/issues/2) to [#8](https://github.com/SaiAbhijyan/arthai-health/issues/8), titled "Phase 2 (a)" to "Phase 2 (g)" on 2026-11-02) | Planned |
| Claim builder and scrubber | Planned |
| Payer and clearinghouse mock | Planned |
| Remit posting | Planned |
| Triage and the CCI gate | Planned |
| Appeal writer | Planned |
| Voice agent | Planned |
| AR follow-up | Planned |
| Code lookups (code catalog) | Planned |
| Review console and audit | Planned |
| Eval and feedback loop, `make eval`, `make e2e` | Planned |

## Safety and compliance

- **Synthetic data only.** The rules forbid real PHI, real member IDs and real payer credentials in code, tests, logs, prompts and fixtures.
- **No HIPAA claim.** Arthai Health does not claim HIPAA compliance. The demo has no PHI.
- **No medical advice.** Arthai Health is billing and admin automation.
- **Human approval.** External or money actions wait for a human: send an appeal, place a call, post a payment, write off. In the hackathon, every external action needs approval.
- **Audit.** Every AI action writes an `audit_event`.
- **AI voice disclosure.** The voice agent says that it is an AI. It announces the recording. The FCC treats AI voices as "artificial" under the TCPA (FCC 24-17, as cited in PR #9). The agent calls only our own mock payer.
- **Untrusted text.** Text from denial letters, transcripts and web pages is data. It never starts a tool on its own.
- **No CPT.** The repo has no CPT codes or descriptors. No model trains on CPT content.
- **No scraping.** Agents do not scrape or reverse-engineer payer or clearinghouse sites.
- **Secrets.** Secrets come only from env vars or a secret manager. Never commit `.env`.
- **New tools.** Scan each new skill or tool with SkillSpector before install. Install it at project level only.

Third-party files and their licenses are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Glossary

| Term | Meaning |
|---|---|
| 835, 837, 277, 276 | X12 EDI files: remittance (835), claim (837), claim status response (277) and request (276) |
| AR | Accounts receivable: money that payers still owe |
| CARC, RARC | Claim adjustment reason codes and remittance advice remark codes. They tell why a payer paid less or denied. |
| CCI gate | Our confidence gate, built on `cci-sdk` conformal prediction. It is not the CMS NCCI edit list. |
| Hackathon | The demo event that sets the first scope. See [docs/hackathon-workflow.md](docs/hackathon-workflow.md). |
| Conformal set | The set of labels that the gate thinks can be true. One label means sure. More labels mean not sure. |
| HCPCS Level II, ICD-10-CM | Public code sets for supplies and services (CMS) and for diagnoses (CDC/NCHS) |
| LLM | Large language model |
| System 1 model | A small, fast model that gives typed decisions, not free text (LAYA) |
| Tier 2 approval | A human click before an external or money action, such as sending an appeal (PR #9, `docs/architecture.md`, section 5.3) |
| NCCI, MUE | CMS edits that catch code pairs that do not go together, and units that are too high |
| PHI | Protected health information: real patient data |
| Remit | Remittance: the payer's statement of what it paid and why |

## About the figures

The six figures are isometric SVG drawings. We made them with the core kit (`kit/iso-kit.mjs`) of [anatomy](https://github.com/wheresryan22/anatomy) (MIT, Copyright (c) 2026 Ryan). The pinned commit is `1482e8469b0a9e0d8cc18ea2740a01423d29ae80`. The kit stays outside this repo. Each SVG embeds CSS from the kit, so a copy of the kit license notice is in [docs/images/NOTICE-anatomy-MIT.txt](docs/images/NOTICE-anatomy-MIT.txt). The build scripts are in [docs/images/src/](docs/images/src/).

The build uses only `kit/iso-kit.mjs`. The anatomy `capture.mjs` script makes PNG previews for review. Other anatomy scripts are not used (D-019). SkillSpector scanned the kit at the pinned commit. The scan notes and the manual review are in [docs/tooling.md](docs/tooling.md).

To rebuild the figures:

1. Get the anatomy kit at the pinned commit.
2. Set `ANATOMY_KIT` to the path of `kit/iso-kit.mjs`. The build stops if this variable is not set.
3. Run each build script with Node.js 20.10 or later. The build checks the sha256 of the kit file and stops if it does not match.
4. Check that the SVG files did not change. Run this check on a clean working tree.

```bash
export ANATOMY_KIT=/path/to/anatomy/kit/iso-kit.mjs
for f in docs/images/src/*.mjs; do [ "$f" = docs/images/src/lib.mjs ] || node "$f"; done
test -z "$(git status --porcelain docs/images)"
```

All names, IDs, payers and reference numbers in the figures are synthetic. The data plan does not set a format for call reference numbers yet, so `SYN-REF-0007` is only an example.
