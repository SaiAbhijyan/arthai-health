# REA teardown: how the leading RCM companies build the features that Arthai builds

Status: research, 2026-10-28. Not a decision. Decisions go in `DECISIONS.md` and ADRs.
Writing style: ASD-STE100 (short sentences, active voice, one idea per sentence).

## 0. Read this first

### 0.1 Purpose

This document shows how live RCM companies build each Arthai feature. It uses public evidence only.
It then lists what the Arthai stack needs, and the gaps compared with `docs/adr/0004-stack.md`.

### 0.2 Rules that we followed

1. We used public sources only: company sites, engineering blogs, public API docs, job posts, patents, papers and open-source code.
2. We did not log in, sign up, or fill in a form. We did not open a payer, insurer or clearinghouse portal.
3. We did not decompile, capture or probe any vendor app or vendor website (`docs/data-plan.md` rule 3).
4. We used no code and no material from an employer of the project owner. This document does not describe any employer internals.
5. We used free tools only. Model spend for this work: $0.
6. Each claim has a link. A claim with no source has the mark **UNVERIFIED**.

### 0.3 Labels

| Label | Meaning |
|---|---|
| **Vendor** | The company says this on its own site, blog, docs or press release. We did not test it. |
| **Third-party** | A site that is not the company says this. |
| **REA** | We got this from an REA run on open-source code (section 1). |
| **Analysis** | Our judgment from the evidence. It is not a fact. |
| **UNVERIFIED** | We found no source. |

Vendor numbers (overturn rate, accuracy, time saved) are marketing claims. Nobody audited them for us.

## 1. What REA ran on

REA (`morluto/rea`) reverse-engineers shipped software: binaries, Electron and JavaScript apps, .NET and web pages.
Rule 3 of `docs/data-plan.md` forbids REA on insurer or vendor software. So REA cannot look at Waystar, Infinitus or other vendor apps.
We used REA in two ways:

1. **REA tool runs on open-source equivalents.** We ran the REA static analyzer on 3 open-source projects that do the same jobs as the vendor features.
2. **REA evidence method on public pages.** For each vendor, we followed the REA evidence workflow by hand: claim, source, authority, limits, unknowns. REA did not touch those pages.

### 1.1 REA tool runs

Command (static analysis only; REA parses code as inert text and does not run it):

```bash
npx -y rea-agents@6.8.0 analyze-javascript-application /workspace/rea-runs/<repo> --json
```

| Target (license, commit) | Same job as | REA evidence ID (prefix) | Scope |
|---|---|---|---|
| [rvijaysingh/tribe-rcm-denial-appeals-prototype](https://github.com/rvijaysingh/tribe-rcm-denial-appeals-prototype) (MIT, `46a8831`) | Denial triage, root cause, cited appeal letter, review queue | `ev_a8ae7bebeffd75ab` | 118 JS/TS files, 1,896 findings, 0 parse failures, 5 routes |
| [livekit/agents-js](https://github.com/livekit/agents-js) (Apache-2.0, `22da3e8`, 2026-10-28) | Voice agent (payer call) | `ev_7931383a13393639` | 811 JS/TS files, 11,651 findings, 51 parse failures, coverage partial |
| [aaronhuggins/node-x12](https://github.com/aaronhuggins/node-x12) (MIT, `168ce75`, last push 2022-04-30) | X12 parse and build (835, 276/277) | `ev_08fdc5a85ebd7142` | 33 TS files, 370 findings, 1 parse failure |

Setup facts:

- The repos are cloned to `/workspace/rea-runs/`, outside the Arthai repo. The raw REA JSON is there too (90 MB, 225 MB, 20 MB). We did not commit it.
- `npx` fetched `rea-agents@6.8.0` into a scratch npm cache (`/workspace/rea-runs/.npm`). REA is not registered as an MCP server and is not in the repo. We used Node 24 from `/workspace/tools/node24`.
- REA limits (from its own output): graph coverage is partial; static imports and endpoints do not prove runtime behavior; a missing fact is not proof of absence.

### 1.2 What REA could not do

- REA cannot see any vendor's back end. All vendor architecture in this document comes from what the vendors publish.
- REA has no Python analyzer for source trees. Pipecat and the Python open-source RCM repos were read as normal source and docs, not with REA.
- REA skill guidance says to "skip REA for ordinary source-repository architecture analysis". So we used REA output to find structure fast, and then confirmed each fact in the source files.

## 2. Features and companies covered

| # | Arthai feature (from `docs/product/idea.md`) | Companies (public evidence) | Open-source reference |
|---|---|---|---|
| F1 | Denial intake and triage | Experian Health, Waystar, Candid Health | tribe prototype (REA), Imaginesoftware patent |
| F2 | Root-cause analysis | Adonis, Experian Health, Waystar | Imaginesoftware patent, tribe prototype (REA) |
| F3 | Appeal letter generation | Waystar, SmarterDx (Smarter Technologies), R1 | tribe prototype (REA) |
| F4 | Voice follow-up with a payer rep | Infinitus, SuperDial, R1 | LiveKit Agents (REA), Pipecat |
| F5 | Human review queue and audit trail | AKASA, Infinitus, R1 | tribe prototype (REA) |
| F6 | Claim status (276/277), remits (835) and AR follow-up | Candid Health, SuperDial, Thoughtful AI (now inside Smarter Technologies) | node-x12 (REA), LinuxForHealth x12 |
| F7 | Denial prevention (scrubber risk score) | Experian Health, Waystar | Imaginesoftware patent |

Coding assist is a stub in the hackathon. Section 10 covers it in a short note only.

## 3. F1: Denial intake and triage

### 3.1 What the leaders do

| Company | What the product does | Source |
|---|---|---|
| Experian Health, AI Advantage Denial Triage | Puts each remit into 2 to 10 customer-defined categories by likelihood of payment. Routes each one to the correct specialist. Puts probability scores into the existing work queues. | Vendor: [Schneck case study](https://www.experian.com/content/dam/marketing/na/healthcare/case-studies/schneck-medical-center-case-study.pdf), [Experian blog](https://www.experian.com/blogs/healthcare/using-ai-in-claims-processing-for-healthcare/); Third-party: [MedCity News](http://medcitynews.com/2023/07/transforming-claims-denial-with-ai/) |
| Waystar, Denial + Appeal Management | Uses AI and predictive analytics to rank the denials that are most likely to be overturned and paid. Routes them to work groups automatically. Integrates with the EHR, HIS or PM system. | Vendor: [product page](https://www.waystar.com/our-platform/denial-prevention-recovery/denial-appeal-management/) |
| Candid Health | API-first billing. Its public API returns each 835 adjudication with service-line CARCs, RARCs, amounts in cents, and an optional `denial_reason` enum with 32 values (for example `Authorization Required`, `Timely Filing`, `Not Medically Necessary`). | Vendor: [API reference, insurance adjudications](https://docs.joincandidhealth.com/api-reference/insurance-adjudications/v-1/get.md) |

### 3.2 How they build it (public evidence)

- **Model type.** Experian says the model learns from the customer's own historic payment data and payer behavior. It is "continuously learning". The setup started from the customer's top denial CARCs ([Schneck case study](https://www.experian.com/content/dam/marketing/na/healthcare/case-studies/schneck-medical-center-case-study.pdf)). The model family is **UNVERIFIED**.
- **Pattern from a granted patent.** US 12,387,275 B2 (Imaginesoftware, granted 2025-08-12) describes the same pipeline in detail ([Google Patents](https://patents.google.com/patent/US12387275B2/en)):
  1. Extract two feature sets: payer features and claim features (diagnosis code, procedure code and more).
  2. A classifier gives the likelihood that the denial will be reversed.
  3. Below a threshold, the claim goes to a review or disposal queue. Above it, the claim goes to a remediation queue.
  4. A second model gives the likely denial type and the proposed claim changes.
  5. Training data: sequences of an original claim, each resubmission and the outcome of each one.
  This patent is from one company. It shows a common design. It does not prove how Experian or Waystar build their products (Analysis).
- **Data.** Waystar says its AI uses data from "over 7.5 billion healthcare payment transactions" a year ([Waystar, 2026-03-05](https://www.waystar.com/news/waystar-advances-ai-innovation-with-google-cloud-to-accelerate-the-autonomous-revenue-cycle/)). Arthai cannot copy this data advantage (Analysis).
- **Integration.** All three take the 835 (ERA) as input. Experian runs inside its own clearinghouse (ClaimSource) ([product sheet](https://www.experian.com/content/dam/marketing/na/healthcare/brochures/ai-advantage-predictive-denials-product-sheet.pdf)). Candid exposes the 835 as JSON through a REST API with OAuth bearer tokens ([Candid docs](https://docs.joincandidhealth.com/api-reference/insurance-adjudications/v-1/get.md)).
- **Open-source reference (REA).** The tribe prototype runs "Stage A Triage" as deterministic rules over amount, win rate, deadline and eligibility, in integer cents. Stage A stops a do-not-appeal case before any LLM call. REA found the route labels `ready`, `needs_review`, `needs_docs` and `do_not_appeal` as literals in the source ([README](https://github.com/rvijaysingh/tribe-rcm-denial-appeals-prototype)).

### 3.3 What this means for Arthai

| Need | Hackathon version | Later version |
|---|---|---|
| 835 parser | Parse synthetic 835 into Pydantic models (`packages/x12`). See F6. | Same parser, plus 999 and 277CA. |
| Denial taxonomy | Map CARC + RARC + group code to a small category list. Use Candid's 32-value enum as a shape reference. Do not copy it word for word (Analysis). | Payer-specific categories learned from outcomes. |
| Triage model | Rules first (amount, deadline, appealability). Then a small classifier (scikit-learn or XGBoost) for the overturn likelihood on synthetic data. | Gradient-boosted model per payer, retrained from outcomes. |
| Gate | `cci-sdk` conformal set over the denial category. A wide set goes to the human queue. | Same, with per-payer calibration. |
| Priority | Expected value = amount x overturn likelihood, with a deadline boost. | Add staff capacity and payer turnaround. |

## 4. F2: Root-cause analysis

### 4.1 What the leaders do

| Company | What the product does | Source |
|---|---|---|
| Adonis, Adonis Intelligence | Combines data from many systems. Uses clustering to find the root cause. Example from the vendor: denials up 79% week over week because one payer now requires a modifier for one ICD and CPT pair. It tells the team what, why, and what to do. | Vendor: [Adonis blog, 2024-02-06](https://adonis.io/resources/introducing-adonis-intelligence) |
| Experian Health, AI Advantage Predictive Denials | Detects payer rule changes "even if those changes are undocumented", from historic payment data. | Vendor: [product sheet](https://www.experian.com/content/dam/marketing/na/healthcare/brochures/ai-advantage-predictive-denials-product-sheet.pdf) |
| Waystar | "Advanced analytics + root-cause reporting" inside Denial + Appeal Management. | Vendor: [product page](https://www.waystar.com/our-platform/denial-prevention-recovery/denial-appeal-management/) |

### 4.2 How they build it

- **Two levels of root cause.** Level 1 is per claim: which field caused this denial. Level 2 is per population: which payer rule changed this week. The vendors above mostly sell level 2 (Analysis).
- **Per claim.** The Imaginesoftware patent describes a model that "decodes" a vague payer code into an explainable denial type, and points at the likely defective claim fields. The UI highlights those fields ([US 12,387,275 B2](https://patents.google.com/patent/US12387275B2/en)).
- **Per population.** Adonis says it uses clustering over unified data, with integrations to athenahealth, DrChrono, Change Healthcare, Office Ally and eClinicalWorks ([Adonis](https://adonis.io/resources/introducing-adonis-intelligence)). The clustering method is **UNVERIFIED**.
- **Open-source reference (REA).** The tribe prototype "Stage B Classify" uses an LLM with structured output for the denial category, root cause, key facts and a confidence. Its eval shows category accuracy 94.1% and root-cause accuracy 88.2% on 17 synthetic cases. Its confidence calibration was poor: mean 0.88 on correct answers and 0.92 on the one wrong answer ([README](https://github.com/rvijaysingh/tribe-rcm-denial-appeals-prototype)). This supports a statistical gate instead of a raw LLM confidence (Analysis).

### 4.3 What this means for Arthai

| Need | Hackathon version | Later version |
|---|---|---|
| Per-claim root cause | LLM with a JSON schema: category, root-cause field, evidence pointers. Codes come only from the catalog (AGENTS.md rule). | Classifier trained on reviewer labels; LLM explains only. |
| Population root cause | One SQL view: denials by payer x CARC x week, with a simple spike rule. | Clustering (for example HDBSCAN) and change-point alerts. |
| Data | Synthetic scenario table (D-010) must include a "payer rule changed" story so the demo can show it. | Real outcome data under a BAA. |

## 5. F3: Appeal letter generation

### 5.1 What the leaders do

| Company | What the product does | Source |
|---|---|---|
| Waystar, AltitudeCreate (in AltitudeAI) | Generative AI drafts appeal letters and packages. Uses a library of "1K+ prepopulated payer-specific forms". Batch submit, tracking and proof of delivery. Vendor claims: 92% letter accuracy, 3x faster package creation, 40% higher overturn rate. | Vendor: [product page](https://www.waystar.com/our-platform/denial-prevention-recovery/denial-appeal-management/), [success story](https://www.waystar.com/insights-resources/videos/success-story-billing-services-provider-streamlines-rcm-to-better-support-ascs/), [launch 2025-01-13](https://www.waystar.com/news/announcing-generative-ai/); Third-party: [CNBC](https://www.cnbc.com/2025/01/13/health-waystar-generative-ai-new-tool-will-help-fight-health-insurance-denials.html) |
| SmarterDx, SmarterDenials (part of Smarter Technologies) | Extracts data from the denial, even from a fax or a bad scan. Reads the full record in the EHR (notes, labs, meds, orders, vitals). Writes a letter with in-line clinical evidence and coding references. Staff review, edit and send. Vendor claim: 36% average overturn rate for medical-necessity and DRG-downgrade denials. | Vendor: [SmarterDenials page](https://www.smarterdx.com/smarterdenials). Smarter Technologies = SmarterDx + Thoughtful.ai + Access Healthcare: [New Mountain Capital](https://www.newmountaincapital.com/new-mountain-capital-forms-smarter-technologies-through-combination-of-smarterdx-thoughtful-ai-and-access-healthcare/) |
| R1, Phare OS (Phare Flow, Denials Management) | Analyzes records and supporting data to write evidence-backed appeals. Clinicians "move from writing to rapid review and editing". Vendor claims: appeal time cut up to 50%; "more than 40% of denials" fully resolved autonomously in select use cases. | Vendor: [R1, 2026-04-14](https://www.r1rcm.com/newsroom/r1-announces-phare-os-expansion-to-help-providers-navigate-growing-complexity-and-margin-pressure), [R1, 2025-10-22](https://www.r1rcm.com/newsroom/r1-launches-phare-healthcare-s-first-revenue-operating-system) |

### 5.2 How they build it

- **Human sends.** In all three, a human reviews and sends the letter (Vendor). Third-party notes on a Waystar customer story say the same: staff pull the package and submit it ([agentusecaseindex](https://agentusecaseindex.com/use-cases/teamhealth-waystar-altitudeai-denial-appeal-letters/)).
- **Models and cloud.** Waystar works with Google Cloud and "Gemini large language models" ([Waystar, 2026-03-05](https://www.waystar.com/news/waystar-advances-ai-innovation-with-google-cloud-to-accelerate-the-autonomous-revenue-cycle/)). Whether AltitudeCreate itself uses Gemini is **UNVERIFIED**.
- **Job post stack hints (Waystar, Senior ML Engineer, posted 2026-06-20, now inactive).** OCR and document layout analysis; NER and relation extraction; nested JSON schemas; vector embeddings for RAG; open models (Phi-3, Mistral, Llama, Nemotron-H) with LoRA, QLoRA and distillation; an orchestrator that routes to "specialized LM tools" with structured outputs; Vertex AI, GKE, Cloud Functions, Cloud Run; PHI/PII masking ([Simplify copy of the post](https://simplify.jobs/p/a79e590d-8cb6-4ada-9fec-290a5d1e6ac4/Senior-Machine-Learning-Engineer-2)). The post names "medical necessity tasks". It does not name AltitudeCreate.
- **R1.** R1 says Phare uses "large language models, voice models, and computer use models" ([R1, 2025-10-22](https://www.r1rcm.com/newsroom/r1-launches-phare-healthcare-s-first-revenue-operating-system)). Model names are **UNVERIFIED**.
- **Open-source reference (REA).** The tribe prototype shows a complete, measurable design:
  - Stage C: retrieve payer criteria clauses and overturned precedents with Voyage `voyage-3.5` embeddings in Postgres pgvector (HNSW). Required clauses are forced in.
  - Stage D: the LLM writes a **structured draft** where each assertion cites chart lines and clauses. A deterministic renderer turns the JSON into the letter. The model never writes free prose.
  - Stage E: deterministic citation checks first, then an LLM judge, then a route.
  - REA found config keys `MODEL_CLASSIFY`, `MODEL_DRAFT`, `MODEL_VERIFY` (one model per stage), `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY` and `DATABASE_URL`, and API routes `/api/pipeline/:denialId` and `/api/feedback/:runId`.
  - Measured on 20 synthetic cases: citation validity 100% (860 of 860), criteria coverage 91.5%, judge agreement 58.3%, cost $0.18 per case median, 69 s median ([README](https://github.com/rvijaysingh/tribe-rcm-denial-appeals-prototype)).
  - Stack (from `package.json`): Next.js 16, React 19, Drizzle ORM, `postgres`, Zod, Anthropic SDK, Vitest. Arthai does not use this code. It is a reference only.

### 5.3 What this means for Arthai

| Need | Hackathon version | Later version |
|---|---|---|
| Policy corpus | Synthetic payer policies (D-005) plus public CMS coverage text ([Medicare Coverage Database downloads](https://www.cms.gov/medicare-coverage-database/downloads/downloads.aspx)). Chunk with stable IDs. | Payer policy feeds and contract terms. |
| Retrieval | One vector store. Choose: cognee (LanceDB, D-004) or Postgres pgvector. Local embeddings (`bge-small`, already in `.env.example`). | Hybrid search (BM25 + vectors) and a re-ranker. |
| Draft | Muse Spark returns a JSON draft: each claim has `chunk_id` citations. Render with a Jinja template. | Payer-specific form templates (Waystar has 1K+). |
| Citation gate | Code check: every cited ID exists in the retrieved set, and every sentence has at least one citation. | Add an LLM-judge for faithfulness, and track judge agreement with humans. |
| Send | Human approval through `approvals.require()`. Send only to the payer mock. | Fax, portal or X12 275 attachment channels. |
| Rules | Appeal levels and time limits from public rules: [CMS Medicare appeals](https://www.cms.gov/medicare/appeals-grievances/fee-for-service), [29 CFR 2560.503-1](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XXV/subchapter-F/part-2560/section-2560.503-1). | Per-payer rules table. |

## 6. F4: Voice follow-up with a payer rep

### 6.1 What the leaders do

| Company | What the product does | Source |
|---|---|---|
| Infinitus | Voice AI agents call payers for benefits and prior-auth data. Calls are "often over an hour" and collect "over 200 call outputs". A copilot (FastTrack) navigates the IVR, waits on hold, and drops a human in when a rep joins. It writes call notes. | Vendor: [AI review blog](https://www.infinitus.ai/blog/guardians-of-healthcare-calls-ai-review-in-action/), [FastTrack GA](https://www.infinitus.ai/blog/new-fasttrack-ai-copilot-general-availability/) |
| SuperDial | Calls payers for claim status and other tasks through an API. `POST /v1/requests` with a schema ID and inputs. A webhook fires at `SUCCESS`, `PARTIAL` or `FAILURE`. The result has structured fields plus transcript, recording URL and summary. It resolves a payer name to a phone number. It has a sandbox that places no real calls. | Vendor: [SuperDial API docs](https://docs.superdial.com/introduction) |
| R1, Phare Flow | Uses "conversational AI" for payer calls. R1 expected "over 70% of payer calls" done this way (forecast, 2025-10-22). | Vendor: [R1, 2025-10-22](https://www.r1rcm.com/newsroom/r1-launches-phare-healthcare-s-first-revenue-operating-system) |

### 6.2 How they build it

Infinitus publishes the most detail:

- **Transport.** A VoIP layer with long-lived WebSocket and WebRTC connections. One connection carries recording, transcription, NLP and speech synthesis ([Infinitus tech blog](https://www.infinitus.ai/blog/technology-at-infinitus/)).
- **Speech to text.** A third-party STT with a domain vocabulary. A custom model ranks the n-best transcripts ([tech blog](https://www.infinitus.ai/blog/technology-at-infinitus/)). A Neo4j case study says Infinitus chose Google Cloud for the low latency of Google speech-to-text (Third-party: [Neo4j](https://neo4j.com/customer-stories/infinitus/)).
- **Dialog.** The engine uses the last utterance plus dialog state (inputs, outputs collected, last N utterances). Several models handle different phases of the call ([tech blog](https://www.infinitus.ai/blog/technology-at-infinitus/)). A "discrete action space" keeps the agent inside approved SOPs ([PR Newswire, 2025-04-24](https://www.prnewswire.com/news-releases/infinitus-launches-first-trusted-voice-ai-agents-for-healthcare-302436349.html)).
- **Knowledge graph.** Rules mined daily from 3M+ calls, with a minimum sample size ([knowledge graph blog](https://www.infinitus.ai/blog/knowledge-is-power-how-infinitus-systematically-increases-accuracy-of-data-outputs/)). Neo4j AuraDB on Google Cloud. A tool call checks the graph first. If a verified answer exists, no call is placed ("deflect"). If not, the agent calls ("dial") and updates the graph (Third-party: [Neo4j](https://neo4j.com/customer-stories/infinitus/)).
- **After the call.** The AI review pipeline checks each call (see F5).
- **Stack hints from a job post.** React, TypeScript, Python, Go, Java or C++; AWS or GCP; SQL and NoSQL; LLM integration, RAG and evals ([Ashby job post](https://jobs.ashbyhq.com/infinitus/56b14fe7-5a07-48c5-bb07-28b625c576fd)).

A related public paper (patient calls, not payer calls): Hippocratic AI Polaris uses ASR, then a primary LLM agent plus specialist agents, then TTS. Agents emit structured outputs. Code, not the LLM, runs the message passing. The system restarts its work when new speech arrives. It keeps PHI out of the prompt until identity is verified ([arXiv 2403.13313](https://arxiv.org/abs/2403.13313)).

Open-source equivalents:

- **LiveKit Agents (REA run on agents-js, then confirmed in source).** Modules for VAD, turn and interruption detection, answering-machine detection (`voice/amd.ts`) and a `send_dtmf` tool (beta) for keypad tones. It has **a Meta plugin for Muse Voice Transcribe realtime STT** (`wss://api.meta.ai/v1/asr/realtime`) and **a Baseten plugin** (LLM, STT, TTS) ([plugins folder](https://github.com/livekit/agents-js/tree/main/plugins)). The Python packages exist too: `livekit-plugins-meta` 1.8.10 and `livekit-plugins-baseten` 1.8.10, Apache-2.0 (PyPI, checked 2026-10-28). REA also found config keys for LiveKit's hosted inference and observability (`LIVEKIT_INFERENCE_*`, `LIVEKIT_OBSERVABILITY_URL`). Those are hosted services. Do not set them.
- **Pipecat (BSD-2-Clause, `pipecat-ai` 1.14.0).** Has an `IVRNavigator`: it detects IVR or human, sends DTMF or speech toward a goal, and reports `COMPLETED`, `STUCK` or `WAIT` ([Pipecat IVR docs](https://docs.pipecat.ai/pipecat/fundamentals/ivr)).

### 6.3 What this means for Arthai

| Need | Hackathon version | Later version |
|---|---|---|
| Transport | Browser WebRTC call to our own payer mock (D-018). No phone line. | SIP trunk and a real number, with consent rules. |
| Framework | Pick one: LiveKit Agents (Meta STT and Baseten plugins exist) or Pipecat (IVR navigator exists). Both are free and open source. LiveKit needs a self-hosted LiveKit server for WebRTC (Analysis). | Same framework, scaled. |
| STT | Conflict to resolve: D-018 says local Whisper; ADR 0004 says Muse Voice Transcribe ($0.18 per hour). | Domain vocabulary and n-best re-ranking (Infinitus pattern). |
| TTS | **Kokoro** (`kokoro` 0.9.4, Apache-2.0). **Piper is now GPL-3.0** (`piper-tts` 1.8.0, repo `OHF-voice/piper1-gpl`). That is a license gap in D-018. Voice model licenses still need a check per voice. | Paid or custom voice if allowed. |
| Dialog control | A small state machine with a fixed action set (ask status, read reference number, confirm, end). The LLM fills slots only. This copies the "discrete action space" idea. | Specialist sub-agents (Polaris pattern). |
| Payer memory | cognee graph (D-004) stores rules learned from mock calls. Check memory first, then call ("deflect or dial"). | Rule mining with a minimum sample size. |
| Disclosure | The agent says it is an AI at the start ([P2] rule in `docs/product/idea.md`). | State law review. |

## 7. F5: Human review queue and audit trail

### 7.1 What the leaders do

| Company | What the product does | Source |
|---|---|---|
| AKASA, "Unified Automation" | Samples 2 to 5% of cases at random for human check. Sends low-confidence cases to a human. Human labels go back into training. Random samples run daily or hourly. | Vendor: [AKASA blog (TechCrunch talk)](https://akasa.com/blog/how-machine-learning-and-human-in-the-loop-approaches-are-expanding-automation-capabilities-a-techcrunch-talk), [AKASA GenAI page](https://akasa.com/generative-ai-in-healthcare-revenue-cycle) |
| Infinitus, AI review | A 7-layer pipeline checks 100% of calls before results go to the customer. Experts are assigned to calls at random. Review can be partial (only the flagged outputs). | Vendor: [AI review blog](https://www.infinitus.ai/blog/guardians-of-healthcare-calls-ai-review-in-action/) |
| R1, Phare OS | "Understands when it is necessary to route to humans", with "a full audit trail and history". Human-in-the-loop model. | Vendor: [R1, 2025-10-22](https://www.r1rcm.com/newsroom/r1-launches-phare-healthcare-s-first-revenue-operating-system) |

### 7.2 How they build it

Infinitus AI review layers ([blog](https://www.infinitus.ai/blog/guardians-of-healthcare-calls-ai-review-in-action/)):

1. Deflection and rule guardrails send complex or regulated cases to a human.
2. Rule-based auto-correctors fix format first.
3. OpenAI and Google LLM APIs read transcripts and audio segments and return JSON features with reasons.
4. Feature extraction, including BERT embeddings.
5. An XGBoost classifier decides pass or human review at call level.
6. Small XGBoost classifiers per output predict "human correction needed", trained on past reviewer corrections.
7. ML auto-correctors. The call auto-approves only if all layers agree.

Key result: when Infinitus removed the classifiers and used LLMs only, "the system's accuracy dropped significantly" (Vendor, same blog).

AKASA design: random sample plus confidence threshold plus retrain loop (Vendor, same blog).

Open-source reference (REA): the tribe prototype has tables `pipeline_runs`, `stage_outputs`, `reviewer_feedback`, `eval_runs` and `ground_truth`. Each run writes stage inputs, outputs, latency, tokens and cost. A reviewer can approve, edit or escalate ([schema](https://github.com/rvijaysingh/tribe-rcm-denial-appeals-prototype/blob/main/src/lib/db/schema.ts)).

Rule: HIPAA requires "mechanisms that record and examine activity" in systems with ePHI ([45 CFR 164.312(b)](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312)). The rule does not set fields or a format.

### 7.3 What this means for Arthai

| Need | Hackathon version | Later version |
|---|---|---|
| Queues | Two queues, as `docs/product/idea.md` 4.3 already says: (1) gate-flagged, (2) random sample of auto-handled claims. Set the sample rate in config (AKASA uses 2 to 5%). | Per-agent rates set by supervisors. |
| Gate | `cci-sdk` conformal sets. Optional cross-check with MAPIE (BSD-3-Clause, 1.6.0). | Per-payer calibration and drift alarms. |
| Post-check | Code checks first, then one LLM judge. Use LLM outputs as features, not as the final decision (Infinitus result). | XGBoost "needs correction" model trained on reviewer edits. |
| Audit | Append-only `audit_event` with a hash chain, per `docs/architecture.md` 5.1. Postgres with no UPDATE or DELETE grant. | WORM storage export and access reviews. |
| Feedback | Reviewer edit becomes an eval case (`make eval`). | Retraining pipeline on Modal. |

## 8. F6: Claim status (276/277), remits (835) and AR follow-up

### 8.1 What the leaders do

| Company | What the product does | Source |
|---|---|---|
| Candid Health | REST API for encounters, claim status, ERAs (835), eligibility and payers. Encounters carry `claim_status`, clearinghouse claim ID, payer claim ID and ERAs. | Vendor: [Candid docs](https://docs.joincandidhealth.com/introduction/integration-guide); Third-party OpenAPI copies: [api-evangelist](https://github.com/api-evangelist/candid-health) |
| SuperDial | Phone calls for claim status when no electronic answer exists. Structured results through API and webhooks. | Vendor: [SuperDial API](https://docs.superdial.com/introduction) |
| Thoughtful AI (now inside Smarter Technologies) | Named agents: EVA (eligibility), CAM (claims), PHIL (payment posting). Combines LLMs, OCR and RPA on payer portals and EHR screens. | Third-party only: [MD Clarity](https://www.mdclarity.com/alternatives/thoughtful-ai), [RevCycleAI](https://revcycleai.com/pro/resources/deep-dives/thoughtful-ai-vendor-deep-dive/). On 2026-10-28, `thoughtful.ai` showed an Access Healthcare page. Agent details are **UNVERIFIED** on a vendor page. |

### 8.2 How they build it

- **Channel order (Analysis).** Use X12 276/277 or a payer API first. Use a phone call when the electronic answer is missing or unclear. Use a portal bot last. SuperDial and R1 sell the phone step. Thoughtful sells the portal step.
- **X12 libraries (REA and source).**
  - node-x12 (MIT, TypeScript, Deno): REA found a parser, a query engine, a transaction map (X12 to JSON), a generator and a validation engine. Last push 2022-04-30. Treat it as unmaintained.
  - [LinuxForHealth/x12](https://github.com/LinuxForHealth/x12) (Apache-2.0, Python, Pydantic models for 270/271, 276/277, 835 and 837). The repo had a push on 2026-09-19.
  - `x12sdk` 2.2.0 on PyPI (Apache-2.0) is a new fork of LinuxForHealth x12 by one maintainer (`owgreen-dev`), first released 2026-09-20. It has a short history. Scan it with SkillSpector before any use.
- **Operating rules.** CAQH CORE publishes the operating rules for claim status and remits ([CAQH CORE](https://www.caqh.org/core/operating-rules)). CARC and RARC lists are public on [x12.org (CARC)](https://x12.org/codes/claim-adjustment-reason-codes) and [x12.org (RARC)](https://x12.org/codes/remittance-advice-remark-codes).
- **FHIR.** CMS-0057-F requires impacted payers to run FHIR APIs (Patient Access, Provider Access, Payer-to-Payer and Prior Authorization), mostly by 2027-01-01 ([CMS fact sheet](https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-prior-authorization-final-rule-cms-0057-f)). Claim status and remits stay X12 under HIPAA (Analysis).

### 8.3 What this means for Arthai

| Need | Hackathon version | Later version |
|---|---|---|
| X12 | `packages/x12` wraps LinuxForHealth x12 (pin a version, scan first). The payer mock emits 835 and 277 (D-007). | Real clearinghouse through a sandbox (optional, D-007). |
| AR worklist | Rank open claims by amount, age and payer turnaround. 276 first, then a voice call if the 277 is unclear. | Learned payer turnaround times. |
| Portal bots | None. Rule 2 of `docs/data-plan.md` forbids scraping payer portals. | Only with written payer permission. |
| FHIR | Not in the demo. | FHIR R4 `Claim`, `ClaimResponse`, `ExplanationOfBenefit` for EHR links and CMS-0057-F prior-auth APIs. |

## 9. F7: Denial prevention (scrubber risk score)

| Company | What it does | Source |
|---|---|---|
| Experian Health, Predictive Denials | Scores each claim before submission against a customer-set threshold. Routes high-risk claims to a biller. Customer reports a 4.6% average monthly drop in denials in 6 months. | Vendor: [product sheet](https://www.experian.com/content/dam/marketing/na/healthcare/brochures/ai-advantage-predictive-denials-product-sheet.pdf), [Schneck case study](https://www.experian.com/content/dam/marketing/na/healthcare/case-studies/schneck-medical-center-case-study.pdf) |
| Waystar | Says AltitudeAI prevented "more than $15 billion in denied claims in less than a year". Learns from downstream payment outcomes ("self-learning revenue cycle"). | Vendor: [Waystar, 2026-03-05](https://www.waystar.com/news/waystar-advances-ai-innovation-with-google-cloud-to-accelerate-the-autonomous-revenue-cycle/) |

The Imaginesoftware patent also claims a pre-submission block: if the approval probability is below a threshold, the system stops the submission and shows the reasons and fixes ([US 12,387,275 B2](https://patents.google.com/patent/US12387275B2/en)).

For Arthai (hackathon): NCCI and MUE edits as code, plus the same classifier as F1 run before the 837 is sent. Later: train on outcomes. Note: the data loop (outcomes back into prevention) is the moat for Waystar and Experian. Arthai can show the loop on synthetic data only (Analysis).

## 10. Short note: coding assist (stub in the hackathon)

R1 says Phare Claim reaches "as high as 97%" autonomous coding accuracy for some service lines and "over 30% automation" for inpatient coding ([R1, 2025-10-22](https://www.r1rcm.com/newsroom/r1-launches-phare-healthcare-s-first-revenue-operating-system)). AKASA trains custom LLMs per health system and keeps human review ([AKASA](https://akasa.com/generative-ai-in-healthcare-revenue-cycle)). The NEJM AI paper in `docs/rcm/research.md` shows that free LLM code choice is unsafe. Keep the Arthai rule: codes come only from catalog lookup. D-009 forbids CPT descriptors in the repo.

## 11. Cross-feature patterns (Analysis)

1. **Scores come from classical ML. Text work comes from LLMs.** Infinitus uses XGBoost on LLM-made features. The Imaginesoftware patent uses classifiers for routing. Experian and Waystar describe predictive models. LLMs read documents, draft letters and run dialog.
2. **Humans send.** No leader in this set says it sends an appeal with no human review. R1 says it resolves some denials autonomously, but inside a human-in-the-loop model.
3. **Structured output, then deterministic render.** The tribe prototype, Polaris and Infinitus all ask models for JSON and let code decide the next step.
4. **A memory of payer behavior.** Infinitus uses a knowledge graph. Waystar and Experian use network data. Adonis aggregates insights across its client base.
5. **Every result is checked before it leaves.** Infinitus checks 100% of calls. AKASA samples 2 to 5%. Arthai plans both: a gate and a random sample.
6. **Data scale is the moat.** Arthai cannot match it in a hackathon. The Arthai pitch stays: calibrated abstention, an audited loop, and a written appeal plus a call in one flow.

## 12. Stack requirements for Arthai

### 12.1 Consolidated table

Status: **Have** = in `main` or decided; **Gap** = not in ADR 0004 or any decision yet; **Conflict** = two decisions disagree.

| Area | Component | Hackathon choice (proposed) | License / cost | Feature | Status vs ADR 0004 |
|---|---|---|---|---|---|
| LLM | Muse Spark Open (Baseten) primary, Muse Spark 1.3 (Meta) fallback | As ADR 0004 option C | Credits | F1 to F5 | Have (Proposed, D-011) |
| Structured output | Pydantic models + JSON schema mode | Pydantic v2 | MIT, free | All | Have (AGENTS.md) |
| Orchestration | LangGraph supervisor with step and cost limits | As `docs/architecture.md` | MIT, free | All | Have (architecture), not in ADR 0004 |
| Triage and scores | scikit-learn or XGBoost classifier | XGBoost or `HistGradientBoosting` | Apache-2.0 / BSD-3, free | F1, F2, F5, F7 | **Gap** |
| Calibrated gate | `cci-sdk` conformal sets; MAPIE as a cross-check | cci-sdk | Own; BSD-3 | F1, F5 | Have (`cci_gate` in architecture), MAPIE **Gap** |
| Optional triage model | LAYA behind `TRIAGE_BACKEND` | Default off | Apache-2.0 | F1 | Have (ADR 0004 item 5) |
| X12 | LinuxForHealth x12 (Python, Pydantic) | Pin + SkillSpector scan | Apache-2.0 | F1, F6 | **Gap** |
| Code sets | CARC/RARC lists from x12.org; HCPCS II; no CPT text | As D-009 | Public | F1, F2 | Have (D-009) |
| Policy RAG store | cognee (LanceDB + graph) or Postgres pgvector | One store only | Apache-2.0 / PostgreSQL | F3, F4 | **Gap**: ADR 0004 has cognee for memory, not policy RAG |
| Embeddings | `BAAI/bge-small-en-v1.5` via fastembed (local) | As `.env.example` | MIT, free | F3 | Have, but rule question open (non-Meta model) |
| Letter render | Jinja2 templates from the JSON draft | Jinja2 | BSD-3 | F3 | **Gap** |
| Citation gate | Code check plus one LLM judge | Own code | Free | F3 | Have (architecture), judge **Gap** |
| Voice framework | LiveKit Agents or Pipecat | Decide in ADR 0005 | Apache-2.0 / BSD-2 | F4 | **Gap** |
| STT | Muse Voice Transcribe or local faster-whisper | Decide | $0.18/h or MIT | F4 | **Conflict**: ADR 0004 vs D-018 |
| TTS | Kokoro | Kokoro | Apache-2.0 (check each voice) | F4 | **Gap**; D-018 also names Piper, now GPL-3.0 |
| VAD / turns | Silero VAD (LiveKit and Pipecat both support it) | Silero | MIT | F4 | **Gap** |
| IVR mock | Payer mock with a DTMF menu and an LLM rep | Own service | Free | F4 | Have (D-007 mock), voice part **Gap** |
| Payer memory | cognee graph, "deflect or dial" | cognee | Apache-2.0 | F4, F6 | Have (D-004), use case **Gap** (D-013 Proposed) |
| Database | Postgres: claims, outbox, audit, review queues | Postgres 16 | PostgreSQL | All | Have (architecture), not in ADR 0004 |
| Audit | Append-only hash-chained `audit_event` | Own code | Free | F5 | Have (architecture 5.1) |
| Review console | React + TS, SSE | React | MIT | F5 | Have (AGENTS.md) |
| Evals | Golden sets, `make eval`, thresholds file | pytest + own harness | Free | All | Have (AGENTS.md); sets not built |
| Compute | Modal for batch and fine-tune | As D-016 | Credits | F1, F5 | Have (Proposed) |
| FHIR | Not in hackathon | `fhir.resources` later | BSD | Later | Later |

### 12.2 Gaps compared with ADR 0004

1. ADR 0004 covers models, memory and compute only. It does not choose the voice framework, TTS, VAD, X12 library, classifier library or policy RAG store.
2. STT conflict: ADR 0004 says Muse Voice Transcribe. D-018 says local Whisper or faster-whisper.
3. TTS license gap: D-018 names Piper. `piper-tts` 1.8.0 is GPL-3.0 now. Kokoro is Apache-2.0.
4. No classical ML library is named. The evidence (Infinitus, the patent) says scores and routing work best with classifiers.
5. Policy RAG has no store decision. cognee (D-004) and pgvector (`docs/architecture.md` table) both appear.
6. Embeddings and LAYA are non-Meta models. The rule question in ADR 0004 is still open.

### 12.3 Hackathon scope compared with a later version

| Feature | Hackathon (Oct 26 to Nov 4) | Later |
|---|---|---|
| F1 Triage | Rules + one classifier + conformal gate on synthetic 835 | Per-payer models from real outcomes |
| F2 Root cause | LLM JSON per claim; one spike rule per payer x CARC | Clustering and change-point alerts |
| F3 Appeal | JSON draft with citations, template render, code citation gate, human send to mock | Payer form library, attachments (X12 275), judge calibrated to humans |
| F4 Voice | Browser call to mock payer, fixed action set, STT + LLM + Kokoro, AI disclosure | SIP calls, n-best STT re-rank, payer knowledge graph from many calls |
| F5 Review and audit | 2 queues, random sample, hash-chained audit, edit to eval case | XGBoost "needs correction" model, retraining loop |
| F6 Status and remits | 276/277 and 835 from mock; AR ranking | Clearinghouse connection, FHIR links |
| F7 Prevention | NCCI/MUE edits + risk score before 837 | Outcome-trained risk model |

## 13. Open questions for Sai

1. **REA scope.** `docs/tooling.md` says to use REA "only on software we own". We ran it on 3 open-source repos (MIT and Apache-2.0), static only. Is this acceptable, or do you want REA kept to Arthai code only?
2. **REA package fetch.** `npx` fetched `rea-agents@6.8.0` into a scratch cache outside the repo. Rule 5 says no new tool installs in Phase 1. Do you accept this, or do you want the cache deleted?
3. **STT.** Muse Voice Transcribe (Meta model, $0.18 per hour, LiveKit plugin exists) or local faster-whisper (free, slower on CPU)?
4. **TTS.** Replace Piper with Kokoro in D-018, because Piper is now GPL-3.0?
5. **Voice framework.** LiveKit Agents (Meta and Baseten plugins) or Pipecat (IVR navigator)? LiveKit needs a self-hosted LiveKit server for WebRTC.
6. **Classifier.** Do you approve XGBoost or scikit-learn for triage scores, next to the LLM?
7. **Policy RAG store.** cognee only, or Postgres pgvector for policies and cognee for payer memory?
8. **X12 library.** LinuxForHealth x12 (pin an older release) or the new `x12sdk` fork (newer, one maintainer)?
9. **Root-cause demo story.** Add a "payer rule changed this week" scenario to the synthetic data (D-010)?
10. **Non-Meta models.** The rule question in ADR 0004 is still open for embeddings, LAYA and any classifier.

## 14. What we could not find

- The model types inside Experian AI Advantage and Waystar AltitudeAI. **UNVERIFIED**.
- Whether AltitudeCreate uses Gemini. Waystar names Gemini for the platform only. **UNVERIFIED**.
- Infinitus STT vendor. The vendor blog says "third-party". Google STT comes from a Neo4j case study (Third-party).
- SuperDial internal voice stack. Its docs show the API only.
- Thoughtful AI agent details on a vendor page. The vendor site now shows Access Healthcare.
- Any patent from Experian, Waystar or Infinitus on these features. Our search found the Imaginesoftware patent only.
- The Adonis clustering method and the R1 model names.
- A primary source for the "34.5 minute average Infinitus call" in `docs/rcm/research.md`. Infinitus says calls are "often over an hour". Still **UNVERIFIED**.
- We did not read any SEC filing in full for this document.
