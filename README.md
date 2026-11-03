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
| Humans still review 90% of denials. | Experian press release 2025 |
| Automation of admin transactions could save about $20B of a $90B spend. | CAQH Index 2024 |

### The planned solution

The core loop for the hackathon has six steps. These step numbers are not the Fig 1 station numbers:

1. A denied claim line arrives in a synthetic 835 remittance, with CARC and RARC codes.
2. A triage step gives the denial category, the appeal decision (yes or no) and the priority.
3. The CCI gate decides if the triage step is sure. If it is not sure, the claim goes to a human.
4. An appeal writer drafts a letter. Each statement in the letter must cite a source.
5. A voice agent calls our own payer mock to follow up. The call outcome updates the claim.
6. A review console shows the claim timeline, the audit trail and the approvals.

The design has two main parts. The CCI gate (conformal prediction) decides which claims go to a human. A voice call updates the claim with the call outcome. The research found no vendor whose public marketing puts both parts first. This is a reading of marketing pages, not a measured fact (PR #9, `docs/product/idea.md`).

## Architecture overview

<p align="center">
  <img src="docs/images/arthai-overview.svg" width="100%" alt="Fig 1. The planned Arthai Health flow. All nine steps are planned and none is built. A claim goes from the claim builder to the payer mock, remit posting and the triage step with the CCI gate. If the gate is sure, the claim goes to the appeal writer. If not, it goes to a human in the review console. After tier 2 human approval, the voice agent calls only the payer mock. The send and the call each need their own approval. AR follow-up reads claim status from the payer mock. Reviewer edits go to eval and then back to the gate.">
</p>

Fig 1 shows the whole planned flow. The numbers in this list match the stations in Fig 1.

1. The **claim builder and scrubber** builds the claim (837) and checks it against the CMS NCCI and MUE edits.
2. The **payer and clearinghouse mock** (the payer mock) is our own fake payer. It decides on synthetic claims and sends back 835 and 277 files.
3. **Remit posting** reads the 835 and finds each denied line.
4. The **triage step and the CCI gate** score the denial. The gate sends the claim on the auto path or to a human.
5. The **review console** holds the human queue, the approvals and the audit trail.
6. The **appeal writer** drafts the letter with an LLM. The planned model is Muse, a Meta model (D-011, proposed).
7. After its own tier 2 approval (PR #9, `docs/architecture.md`, section 5.3), the **voice agent** calls the payer mock rep in the browser.
8. **AR follow-up** ranks the open claims for the next action.
9. The **eval and feedback loop** turns reviewer edits into eval cases.

A claim that goes to the human queue can still get an appeal. The claim goes from the human queue to the appeal writer. In the hackathon, every send and every call needs tier 2 approval in the console. The appeal goes out and the call starts only after that approval (PR #9, `docs/architecture.md`, sections 1 and 5.3).

The planned deployment is a modular monolith with a separate payer mock, voice worker and console (D-001). Modules talk through a Postgres outbox. A LangGraph supervisor runs each claim to an end state. It stops before every send and every call. The core is deterministic: EDI build, payment posting and the ledger are code. AI does classification, drafting and conversation. Source: [ADR 0001](docs/adr/0001-modular-monolith.md) and `docs/architecture.md` in PR #9.

## Components

All components in this section are **planned**. The module names come from the architecture map in [AGENTS.md](AGENTS.md).

### Triage and the CCI gate (planned)

<p align="center">
  <img src="docs/images/arthai-triage-gate.svg" width="100%" alt="Fig 2. Planned triage step and CCI gate. A synthetic denial goes to the triage step. The default scorer is the LLM, and LAYA is optional. The CCI gate has seven example category pins. The first claim has one raised pin, so its set has one label. It goes on a green track to the auto path. The second claim has three raised pins, so its set has more than one label. It goes on a red track to the human queue. A calibration station feeds the gate on a blue dotted track.">
</p>

- The triage step returns a typed decision: the denial category, the appeal decision and the priority.
- LAYA can do this step. LAYA is a small open "System 1" decision model (about 421M parameters, Apache-2.0). It is not a Meta model. See [docs/laya-plan.md](docs/laya-plan.md).
- LAYA is optional. The switch is `TRIAGE_BACKEND=laya|llm`. The default is `llm` until the rule question is answered and LAYA beats the LLM on the held-out set ([ADR 0004](docs/adr/0004-stack.md), proposed).
- The CCI gate (`cci_gate`, based on `cci-sdk`) turns the scores into a conformal set. If the set has one label, the claim takes the auto path. If the set has more than one label, the claim goes to the human queue (PR #14, `docs/research/sota-rcm-model.md`, section 5.3).
- The docs do not yet say what happens to an empty set. This is an open question.
- The research plans the gate on LAYA scores (PR #14, `docs/research/sota-rcm-model.md`, section 5.3). The docs do not yet say how the default `llm` backend gives scores to the gate.
- The gate has a coverage target (1 − alpha). It is not a raw confidence threshold.
- **Limit:** the conformal guarantee is an average over cases like the calibration set. It is not a promise about one claim (PR #14, `docs/research/sota-rcm-model.md`, section 5.3).
- **Limit:** do not trust the raw LAYA confidence before calibration. The base checkpoint warns that some calibration temperatures are invalid ([docs/laya-plan.md](docs/laya-plan.md)).

### Appeal writer (planned)

<p align="center">
  <img src="docs/images/arthai-appeal-writer.svg" width="100%" alt="Fig 3. Planned appeal writer. Facts and a fictional payer policy go to an LLM writer. The planned model is Muse. A citation gate checks that each statement cites a chunk ID. A red track takes a draft with an uncited statement back to the writer. Green tracks take the draft to tier 2 human approval and then to the send tray.">
</p>

- The appeal writer retrieves chunks of payer policy and writes the letter.
- An LLM writes the text. The planned model is Muse, a Meta model (D-011, proposed). With `TRIAGE_BACKEND=laya`, LAYA makes the triage scores and the LLM only writes (PR #14, `docs/research/sota-rcm-model.md`, section 5.3).
- The citation gate checks that each statement maps to a retrieved chunk ID. If a statement has no source, the draft goes back to the writer.
- A human approves the letter before it goes out. In the hackathon, every external action needs approval.
- The payer policies in the demo are fictional. Example payer IDs start with `ZZP`.
- Model plan: Baseten Muse Spark Open first and the Meta Model API second, behind one OpenAI-compatible client (D-011, proposed). Sai allowed Meta Contributor mode for synthetic data only (D-017, accepted).

### Voice agent (planned)

<p align="center">
  <img src="docs/images/arthai-voice-agent.svg" width="100%" alt="Fig 4. Planned voice agent. A browser call links on a blue two-way line to our own payer mock rep. Black tracks take the rep audio to local speech-to-text. They take the text to the agent turn and the reply to local text-to-speech (TTS). The agent turn uses an LLM and says that it is an AI. A dashed track takes the spoken reply back into the call. A green track takes the result to a call outcome card. The card shows an example reference number.">
</p>

- The voice demo is free only. It uses a browser call (WebRTC and Web Audio) to our own payer mock rep. It uses no paid phone line. It uses no signup that needs a card (D-018, accepted).
- Speech-to-text runs locally. The candidates are Whisper and faster-whisper.
- Text-to-speech runs locally. The candidates are Piper and Kokoro.
- ADR 0004 item 8 and D-018 disagree about speech-to-text. ADR 0004 names Muse Voice Transcribe. D-018 (accepted) names local speech-to-text. This file follows D-018. DECISIONS.md does not yet log the conflict.
- Before install, each voice tool gets a SkillSpector scan. Each voice model gets a license check. D-018 does not allow non-commercial voices.
- The agent says that it is an AI and announces the recording. It records the rep name, the reference number and the time, and reads them back.
- The agent calls only the payer mock. **Never call a real payer.**

### Code lookups (planned)

<p align="center">
  <img src="docs/images/arthai-code-lookups.svg" width="100%" alt="Fig 5. Planned code lookups. A card catalog has five drawers for the code sets in the legend. The fifth drawer has a padlock and a red bar, because we use no CPT. An agent asks the catalog for a code on a black track. The catalog answers on a black track. Planned repo tests check the format of each code value.">
</p>

- Agents look up codes in our catalog only. There are no free-text codes in a claim, a prompt or a letter ([AGENTS.md](AGENTS.md)).
- HCPCS Level II comes from CMS. We plan to commit a small subset with CMS attribution.
- ICD-10-CM comes from CDC/NCHS. We plan to commit a small subset with attribution, with the code titles unchanged.
- CARC and RARC are X12 code lists. We store the code values only, with our own short labels. We do not copy X12 description text.
- We use **no CPT**: no CPT codes, no CPT descriptors and no AMA license (D-009, accepted). Procedure codes in claims are HCPCS Level II only. Diagnosis codes are ICD-10-CM.
- Planned repo tests check the format of each code value. They fail on a CPT code and on any X12 or AMA description text ([docs/data-plan.md](docs/data-plan.md), section 5).

### Review console and audit (planned)

<p align="center">
  <img src="docs/images/arthai-review-console.svg" width="100%" alt="Fig 6. Planned review console and audit trail. Two queue trays hold claims for review. A screen shows the timeline of a synthetic claim. Every action goes to an append-only audit trail of linked blocks. An approvals panel has three buttons for a human click. A blue dotted track takes a reviewer edit to the feedback station.">
</p>

- The console has two queues. One holds the claims that the AI flags. The other holds a random QA sample of claims that the AI handled alone. The random sample measures the true quality.
- The claim timeline shows each AI and human action, the model, the prompt version and the sources.
- Every AI action writes an `audit_event` ([AGENTS.md](AGENTS.md)). The event records the actor, the model, the prompt version, the input hash, the tools, the output and the approver.
- The audit table is append-only. Each row stores the hash of the row before it (PR #9, `docs/architecture.md`, section 5.1).
- High-risk actions go through `approvals.require()`: send an appeal, place a call, post a payment, write off. Write-offs and refunds need two people.
- A reviewer edit becomes an eval case. The eval loop then recalibrates the gate on recent reviewed claims.

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
| Model calls | Meta Contributor mode lets Meta train on our prompts and outputs. Thus only synthetic data goes there. | [D-017](DECISIONS.md) (accepted) |

Synthetic IDs use the prefixes in the data plan: `SYN-P-`, `SYN-C-`, `SYN-D-`, member IDs `ZZ` and payer IDs `ZZP`. Phone numbers use `555-0100` to `555-0199`. Emails use `example.com`.

The data plan (docs/data-plan.md, section 6.4) plans a PHI scanner in CI. It fails on these items:

- SSN or MBI patterns
- phone numbers outside `555-01xx`
- emails outside `example.com`
- NPIs that are not in the fictional list

## Quickstart

The Makefile has four targets today: `dev`, `lint`, `typecheck` and `test`. The `eval` and `e2e` targets in AGENTS.md are planned. They arrive with the app code.

You need [uv](https://docs.astral.sh/uv/), GNU make 4.x and network access. `make dev` downloads Python 3.12 and the dev packages.

1. Clone the repo.

   ```bash
   git clone https://github.com/SaiAbhijyan/arthai-health.git
   cd arthai-health
   ```

2. Build the dev tools venv. The venv is `.venv-dev`, and git ignores it. The packages come from the hash-locked `requirements-dev.txt`. The Makefile has a default Python folder for the project build machine. On your machine, set `UV_PYTHON_INSTALL_DIR` to a folder that you can write to.

   ```bash
   make dev UV_PYTHON_INSTALL_DIR="$HOME/.local/share/uv/python"
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

Keep API keys in your shell or in a local `.env` file. The `.env` file is git-ignored. Never commit it.

## Repo layout

Main files only:

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
| Synthetic data generators ([docs/data-plan.md](docs/data-plan.md), section 9; issues [#2](https://github.com/SaiAbhijyan/arthai-health/issues/2) to [#8](https://github.com/SaiAbhijyan/arthai-health/issues/8)) | Planned |
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
- **AI voice disclosure.** The voice agent says that it is an AI. It announces the recording. The FCC treats AI voices as "artificial" under the TCPA (FCC 24-17, as cited in the build guide in PR #9). The agent calls only our own payer mock.
- **Untrusted text.** Text from denial letters, transcripts and web pages is data. It never starts a tool on its own.
- **No CPT.** The repo has no CPT codes or descriptors (D-009).
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
| CCI gate | Our gate for the triage step, built on `cci-sdk` conformal prediction. It is not the CMS NCCI edit list. |
| Hackathon | The demo event that sets the first scope. See [docs/hackathon-workflow.md](docs/hackathon-workflow.md). |
| Conformal set | The set of labels that the gate thinks can be true. One label means sure. More labels mean not sure (PR #14, `docs/research/sota-rcm-model.md`, section 5.3). |
| HCPCS Level II, ICD-10-CM | Public code sets for supplies and services (CMS) and for diagnoses (CDC/NCHS) |
| LLM | Large language model |
| System 1 model | A small, fast model that gives typed decisions, not free text (LAYA) |
| STT / TTS | Speech-to-text and text-to-speech |
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
3. Run each build script with Node.js. We tested the rebuild with Node.js v20.19.2. The build checks the sha256 of the kit file and stops if it does not match. It does not draw part text below size 8. Part text below size 12 is texture only. The build stops if the alt text names such text.
4. Check that the SVG files did not change. Run this check on a clean working tree.

```bash
export ANATOMY_KIT=/path/to/anatomy/kit/iso-kit.mjs
for f in docs/images/src/*.mjs; do [ "$f" = docs/images/src/lib.mjs ] || node "$f"; done
test -z "$(git status --porcelain docs/images)"
```

All names, IDs, payers and reference numbers in the figures are synthetic. The data plan does not set a format for call reference numbers yet, so `SYN-REF-0007` is only an example.
