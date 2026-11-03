# Arthai Health

AI agents that get you paid.

Arthai Health is a planned set of AI agents for healthcare billing work. The agents help billing staff with denied insurance claims. They sort each denial, write the appeal letter and follow up with the insurer (the payer) by voice. In this file, "payer" means the insurer. A human reviews every claim that the agents are not sure about.

> **Status: plan and tooling only.** The `main` branch holds design documents, agent rules, a software factory and one test file. No product code is built yet. Every product in this file is **planned**. See [Status](#status-built-and-planned).

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
- [About the figures](#about-the-figures)

## What it does and why

### The problem

Insurers deny many claims. Billing staff must find the cause of each denial, fix it and appeal. They also spend a long time on the phone with insurers. The research for this project, in [PR #9](https://github.com/SaiAbhijyan/arthai-health/pull/9), found these numbers in public reports:

| Fact | Source (as cited in PR #9) |
|---|---|
| The average initial denial rate in 2025 was 11.6%. | Kodiak 2025 |
| The rework of one denial costs about $103. | HFMA chapter deck 2025 |
| Humans still review 90% of denials. | Experian State of Claims 2025 |
| Infinitus reports that its payer calls average 34.5 minutes. | Infinitus |

### The planned solution

The core loop for the hackathon has six steps:

1. A denied claim line arrives in a synthetic 835 remittance, with CARC and RARC codes.
2. A triage step gives the denial category, the appeal decision (yes or no) and the priority.
3. A confidence gate decides if the triage is sure. If it is not sure, the claim goes to a human.
4. An appeal writer drafts a letter. Each statement in the letter must cite a source.
5. A voice agent calls our own mock payer to follow up. The call outcome updates the claim.
6. A review console shows the claim timeline, the audit trail and the approvals.

The design has two main parts. A statistical gate (conformal prediction) decides which claims go to a human. A closed voice loop updates the claim from the call outcome. The research found no vendor whose public marketing leads with both. This is a reading of marketing pages, not a measured fact (PR #9, `docs/product/idea.md`).

## Architecture overview

<p align="center">
  <img src="docs/images/arthai-overview.svg" width="100%" alt="Fig 1. Arthai Health planned flow, drawn as nine stations on one bench. 1 claim builder and scrubber, 2 payer and clearinghouse mock, 3 remit posting, 4 triage (LLM by default, LAYA optional) with the CCI confidence gate, 5 review console and audit, 6 appeal writer, 7 voice agent, 8 AR follow-up, 9 eval and feedback loop. Chevrons on each track show the direction. Black tracks carry work from 1 to 2 to 3 to 4. Green track: the gate is sure, 4 to 6. Red track: the gate is not sure, 4 to the human queue in 5. Black tracks in front: 5 to 6 after a human decision, 6 to 5 for tier-2 approval, 5 to 7 after approval, and 7 to 8 with the call outcome. Dashed track: the call goes only to the mock payer in 2. Blue dotted track: reviewer edits go from 5 to 9, then recalibrate 4. Every station is planned. None is built.">
</p>

Fig 1 shows the whole planned flow. The numbers match the stations in the figure.

1. The **claim builder and scrubber** builds the claim (837) and checks it against the CMS NCCI and MUE edits.
2. The **payer and clearinghouse mock** is our own fake payer. It decides on synthetic claims and sends back 835 and 277 files.
3. **Remit posting** reads the 835 and finds each denied line.
4. The **triage step and the CCI gate** score the denial. The gate sends the claim on the auto path or to a human.
5. The **review console** holds the human queue, the approvals and the audit trail.
6. The **appeal writer** drafts the letter with Muse, a Meta model.
7. The **voice agent** calls the mock payer rep in the browser.
8. **AR follow-up** ranks the open claims for the next action.
9. The **eval and feedback loop** turns reviewer edits into eval cases.

A claim that goes to the human queue can still get an appeal. The reviewer decides, then the writer drafts. Every draft comes back to the console for tier-2 approval. The appeal goes out and the call starts only after that approval (PR #9, `docs/architecture.md`, sections 1 and 5.3).

The planned deployment is a modular monolith with a separate payer mock, voice worker and console (D-001). Modules talk through a Postgres outbox. A LangGraph supervisor runs each claim to an end state. It stops before every send and every call. The core is deterministic: EDI build, payment posting and the ledger are code. AI does classification, drafting and conversation. Source: [ADR 0001](docs/adr/0001-modular-monolith.md) and `docs/architecture.md` in PR #9.

## Components

All components in this section are **planned**. The module names come from the architecture map in [AGENTS.md](AGENTS.md).

### Triage and the CCI gate (planned)

<p align="center">
  <img src="docs/images/arthai-triage-gate.svg" width="100%" alt="Fig 2. Planned triage and CCI gate. A synthetic denied line enters a tray. A triage scorer, LAYA or the LLM, gives three scores: category, appeal yes or no, and priority. The CCI conformal gate shows two rows of seven category pins. For claim A one pin is raised, so the prediction set has one label and the claim goes on the green track to the auto path. For claim B three pins are raised, so the claim goes on the red track to the human queue. A calibration slice of synthetic data sets the gate for a target coverage of 1 minus alpha. Planned, not built.">
</p>

- The triage step returns a typed decision: the denial category, the appeal decision and the priority.
- LAYA can do this step. LAYA is a small open "System 1" decision model (about 421M parameters, Apache-2.0). It is not a Meta model. See [docs/laya-plan.md](docs/laya-plan.md).
- LAYA is optional. The switch is `TRIAGE_BACKEND=laya|llm`. The default is `llm` until the rule question is answered and LAYA beats the LLM on the held-out set ([ADR 0004](docs/adr/0004-stack.md), proposed).
- The CCI gate (`cci_gate`, based on `cci-sdk`) turns the scores into a conformal prediction set. If the set has one label, the claim takes the auto path. If the set has more than one label, the claim goes to the human queue.
- The gate has a coverage target (1 − alpha). It is not a raw confidence threshold.
- **Limit:** the conformal guarantee is an average over cases like the calibration set. It is not a promise about one claim (PR #14, section 5.3).
- **Limit:** do not trust the raw LAYA confidence before calibration. The base checkpoint warns that some calibration temperatures are invalid ([docs/laya-plan.md](docs/laya-plan.md)).

### Appeal writer (planned)

<p align="center">
  <img src="docs/images/arthai-appeal-writer.svg" width="100%" alt="Fig 3. Planned appeal writer. Facts from a synthetic denial record and chunks of a fictional payer policy, ZZP01, go into the Muse writer, a Meta model that drafts the letter. A citation gate with two rollers checks that each statement cites a chunk ID. A statement with no source goes back to the writer on a red track. A green track takes a passed draft to human approval in the review console, tier 2. A second green track takes the approved letter to the send tray. Chevrons show the direction. Planned, not built.">
</p>

- The appeal writer retrieves chunks of payer policy and writes the letter.
- Muse, a Meta model, writes the text. Muse does not make the triage decision (PR #14, section 5.3).
- The citation gate checks that each statement maps to a retrieved chunk ID. If a statement has no source, the draft goes back to the writer.
- A human approves the letter before it goes out. In the hackathon, every external action needs approval.
- The payer policies in the demo are fictional. Example payer IDs start with `ZZP`.
- Model plan: Baseten Muse Spark Open first and the Meta Model API second, behind one OpenAI-compatible client (D-011, proposed). Meta Contributor mode is allowed for synthetic data only (D-017, accepted).

### Voice agent (planned)

<p align="center">
  <img src="docs/images/arthai-voice-agent.svg" width="100%" alt="Fig 4. Planned voice agent. 1 a browser call, using WebRTC and Web Audio. 2 local speech-to-text, candidate Whisper or faster-whisper. 3 the agent turn: Muse picks the next line, and the agent says that it is an AI. 4 local text-to-speech, candidate Piper or Kokoro. Black tracks link 1 to 2 to 3 to 4. A dashed track takes the audio of the agent back into the call. A blue track is the call line to 5, our own mock payer rep, never a real payer. There is no phone line. A green track takes the result to 6, the call outcome card with the synthetic reference SYN-REF-0007, read back and logged. Planned, not built.">
</p>

- The voice demo is free only. It uses a browser call (WebRTC and Web Audio) to our own mock payer rep. It uses no paid phone line. It uses no signup that needs a card (D-018, accepted).
- Speech-to-text runs locally. The candidates are Whisper and faster-whisper.
- Text-to-speech runs locally. The candidates are Piper and Kokoro.
- Before install, each voice tool gets a SkillSpector scan. Each voice model gets a license check. Non-commercial voices are not allowed (D-018).
- The agent says that it is an AI and announces the recording. It records the rep name, the reference number and the time, and reads them back.
- The agent calls only the mock payer. **Never call a real payer.**

### Code lookups (planned)

<p align="center">
  <img src="docs/images/arthai-code-lookups.svg" width="100%" alt="Fig 5. Planned code lookups. A card catalog cabinet holds five drawers: HCPCS Level II from CMS, ICD-10-CM from CDC/NCHS, CARC values and RARC values with our own labels, and a locked CPT drawer marked not used. An agent asks for the CARC value CO-197 from a synthetic denial. The catalog answers with the value and our own label, prior_auth. A catalog check has five stepped rows: the format rules for HCPCS Level II, ICD-10-CM, CARC and RARC, and a red row that rejects CPT. Planned, not built.">
</p>

- Agents look up codes in our catalog only. There are no free-text codes in a claim, a prompt or a letter ([AGENTS.md](AGENTS.md)).
- HCPCS Level II comes from CMS. We plan to commit a small subset with CMS attribution.
- ICD-10-CM comes from CDC/NCHS. We plan to commit a small subset with attribution, with the code titles unchanged.
- CARC and RARC are X12 code lists. We store the code values only, with our own short labels. We do not copy X12 description text.
- We use **no CPT**: no CPT codes, no CPT descriptors and no AMA license (D-009, accepted). Claims use HCPCS Level II codes only.
- Planned tests check the format of each code value and fail on any X12 or AMA description text ([docs/data-plan.md](docs/data-plan.md), section 5).

### Review console and audit (planned)

<p align="center">
  <img src="docs/images/arthai-review-console.svg" width="100%" alt="Fig 6. Planned review console and audit trail. Two queue trays hold AI-flagged claims and a random QA sample. A console screen shows the timeline of synthetic claim SYN-C-000042: the LLM triage, the CCI gate sending it to a human, the reviewer sending it to the writer, the appeal draft with four of four statements cited, and an approval that waits for the reviewer. An append-only audit trail of linked blocks stores the hash of each previous block. An approvals panel has approve, edit and reject buttons. A blue dotted track takes a reviewer edit to the feedback station, where it becomes an eval case. Planned, not built.">
</p>

- The console has two queues. One holds the claims that the AI flags. The other holds a random QA sample of claims that the AI handled alone. The random sample measures the true quality.
- The claim timeline shows each AI and human action, the model, the prompt version and the sources.
- Every AI action writes an `audit_event` ([AGENTS.md](AGENTS.md)). The event records the actor, the model, the prompt version, the input hash, the tools, the output and the approver.
- The audit table is append-only. Each row stores the hash of the row before it (PR #9, `docs/architecture.md`, section 5.1).
- High-risk actions go through `approvals.require()`: send an appeal, place a call, post a payment, write off. Write-offs and refunds need two people.
- A reviewer edit becomes an eval case. The gate is then recalibrated on recent reviewed claims.

### The other planned products

These products appear in Fig 1. They have no figure of their own.

| Product | What it does (planned) | Source |
|---|---|---|
| Claim builder and scrubber | Builds the 837. Runs the CMS NCCI and MUE edits. Gives a denial-risk score. | PR #9 `docs/architecture.md` section 3 |
| Payer and clearinghouse mock | Decides on synthetic claims. Sends 835 and 277 files. Plays the phone rep. | [D-007](DECISIONS.md), [docs/data-plan.md](docs/data-plan.md) section 3 |
| Remit posting | Reads the 835. Posts payments. Finds each denied line and its root-cause category. | PR #9 `docs/architecture.md` section 3 |
| AR follow-up | Ranks open claims by age and priority. Reads 276/277 status. | PR #9 `docs/product/idea.md` section 4.2 |
| Eval and feedback loop | Keeps golden sets and metrics. Turns reviewer edits into eval cases. Recalibrates the gate. | PR #9 `docs/architecture.md` section 5.4 |

### Supporting parts (planned or proposed)

- **Memory:** cognee 1.6.5 is pinned in `requirements.txt`, with telemetry off (D-004, accepted). Product use goes behind `MEMORY_BACKEND=cognee|none`, so that the demo still runs if cognee fails (D-013, proposed).
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

The Makefile sets `UV_PYTHON_INSTALL_DIR` to `/workspace/tools/python` by default. On another machine, set it to a folder that you can write to:

```bash
make dev UV_PYTHON_INSTALL_DIR="$HOME/.local/share/uv/python"
```

On the build box, GNU make is in `/workspace/tools/bin`. Add it to your `PATH` before you run `make`.

Keep API keys in your shell or in a local `.env` file. The `.env` file is git-ignored. Never commit it.

## Repo layout

```
.
├── AGENTS.md            # rules for all coding agents (CLAUDE.md points here)
├── CLAUDE.md            # Claude Code specifics
├── DECISIONS.md         # decision log, D-001 to D-018
├── Makefile             # dev, lint, typecheck, test
├── README.md            # this file
├── SETUP.md             # older setup notes
├── THIRD_PARTY_NOTICES.md
├── docs/
│   ├── adr/             # architecture decision records 0001 to 0004
│   ├── data-plan.md     # data sources, licenses and layout (single source)
│   ├── golden-play-guide.md
│   ├── hackathon-workflow.md
│   ├── images/          # README figures (SVG) and their build scripts in src/
│   ├── laya-plan.md
│   └── tooling.md       # third-party skills and tools, with scan notes
├── factory/             # software factory: issue -> spec -> build -> gate -> review -> PR
├── scripts/             # dev-tool wrappers (headroom, omniroute, pi) and the cognee smoke test
├── tests/               # pytest: factory merge-guard test
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
| Tests: one pytest file for the factory merge guard | Built |
| cognee 1.6.5, pinned in `requirements.txt`, telemetry off | Pinned (D-004). No product code uses it yet. The LLM path is not tested yet. |
| Synthetic data generators ([issues #2 to #8](https://github.com/SaiAbhijyan/arthai-health/issues?q=is%3Aissue+%22Phase+2%22)) | Planned |
| Claim builder and scrubber | Planned |
| Payer and clearinghouse mock | Planned |
| Remit posting | Planned |
| Triage and the CCI gate | Planned |
| Appeal writer | Planned |
| Voice agent | Planned |
| AR follow-up | Planned |
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

## About the figures

The six figures are isometric SVG drawings. They were made with the core kit (`kit/iso-kit.mjs`) of [anatomy](https://github.com/wheresryan22/anatomy) (MIT, Copyright (c) 2026 Ryan). The pinned commit is `1482e8469b0a9e0d8cc18ea2740a01423d29ae80`. The kit stays outside this repo. Each SVG embeds CSS from the kit, so a copy of the kit license is in [docs/images/LICENSE-anatomy.txt](docs/images/LICENSE-anatomy.txt). The build scripts are in [docs/images/src/](docs/images/src/).

The build uses only `kit/iso-kit.mjs`. The anatomy `capture.mjs` script makes PNG previews for review. Other anatomy scripts are not used. The kit had a SkillSpector scan at the pinned commit before use (see [docs/tooling.md](docs/tooling.md)).

To rebuild the figures:

1. Get the anatomy kit at the pinned commit.
2. Set `ANATOMY_KIT` to the path of `kit/iso-kit.mjs`. The build stops if this variable is not set.
3. Run each build script with Node.js 20.10 or later. The build checks the sha256 of the kit file and stops if it does not match.
4. Check that the SVG files did not change.

```bash
export ANATOMY_KIT=/path/to/anatomy/kit/iso-kit.mjs
for f in docs/images/src/*.mjs; do [ "$f" = docs/images/src/lib.mjs ] || node "$f"; done
git diff --exit-code docs/images
```

All names, IDs, payers and reference numbers in the figures are synthetic.
