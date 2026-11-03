# RCM market and competitor research

Status: research summary, 2026-10-28. Most content comes from the "RCM Landscape: Who Won & Why" page [P4] and the Build Guide [P2], both written 2026-10-26.
Facts link to their sources. Columns and lines marked "analysis" are judgment from public positioning. They are not rankings. KLAS (klasresearch.com) publishes rated comparisons.
We did not check these links again on 2026-10-28. Funding numbers can change.

## 1. Market numbers

| Metric | Figure | Source |
|---|---|---|
| Average initial denial rate, 2025 | 11.6% (up from 11.4%) | [Kodiak 2025 via HealthLeaders](https://www.healthleadersmedia.com/revenue-cycle/cash-flow-improves-despite-484-billion-revenue-leakage-2025) |
| Median days in AR | 52.6 (down from 54.9) | Kodiak 2025, same link |
| Net revenue leakage, 2025 | $48.4B | Kodiak 2025, same link |
| Medicare Advantage compared with traditional Medicare, initial denials | 10.1% compared with 4.2% | Kodiak 2025, same link |
| Average time to insurance payment | 55.2 days | Kodiak 2025, same link |
| Point-of-service collections, median compared with top quartile | 16.4% compared with 28.4% | Kodiak 2025, same link |
| Providers with denial rates of 10% or more | 41% (30% in 2022) | [Experian State of Claims 2025](https://www.experian.com/content/dam/noindex/na/us/healthcare/state-of-claims-2025.pdf) |
| Top denial causes | Missing or wrong claim data 50%, authorizations 35%, registration errors 32%, code errors 24% | Experian 2025 |
| Denials that still get human review | 90% | [Experian press release 2025](https://www.experianplc.com/newsroom/press-releases/2025/experian-health-s-3rd-annual-state-of-claims-survey-finds-denial) |
| Cost to rework a denial | About $103, compared with $6.50 to submit a claim | [HFMA chapter deck, fall 2025](https://www.hfma.org/wp-content/uploads/2025/10/fromregistrationtoreimbursement-fallconf2025-greaterheartland.pdf) |
| Benchmark targets | Denials under 5%, clean claims 98% or more, overturns more than 60% | HFMA chapter deck |
| Admin spend that automation can save | $20B of $90B; $11.7B of it in eligibility | [CAQH Index 2024](https://www.caqh.org/hubfs/Index/2024%20Index%20Report/CAQH%5FIndexReport%5F2024%5FFINAL.pdf) |
| Time saved per visit with full automation | 70 minutes | CAQH Index 2024 |
| Average Infinitus payer call | 34.5 minutes | [P2] 2.1 (source line not given; UNVERIFIED) |
| Cost to collect | Not found in a primary 2025 source; check HFMA MAP Keys | UNVERIFIED |

## 2. Leading products: why they won and where the gaps are

Columns 3 and 4 are analysis.

| Product | What it is | Why it won (analysis) | Gap that Arthai can use (analysis) |
|---|---|---|---|
| [Epic Resolute](https://www.epic.com/software/revenue-cycle/) | RCM inside the Epic EHR | Comes with the EHR that many health systems already run | A focused denial and voice layer that plugs in beside it through FHIR |
| [Waystar](https://www.waystar.com) | Cloud RCM platform and clearinghouse (NASDAQ: WAY) | Owns the claim pipe from eligibility to remits across many payers | Calibrated human handoff and live payer calls are not its lead message |
| [Availity](https://www.availity.com) | Provider-payer network and portal | Many payers use it as their front door, so it has network effects | Portals still need humans to click |
| [AKASA](https://akasa.com) | Autonomous inpatient coding | Narrow, high-value task with measurable accuracy | Coding is crowded; the denial and appeal loop is downstream |
| [Infinitus](https://www.infinitus.ai) | Voice agents for payer calls | Picked the most painful manual task and captures structured data | Focus is benefits and prior auth; a written appeal plus a call in one loop is open |
| [Cedar](https://www.cedar.com) | Patient billing and payments | Treats the patient bill as a consumer product | Patient explanations tied to the exact 835 adjustment |
| [Abridge](https://www.abridge.com) | Ambient clinical documentation | Fixes data at the source | Link documentation gaps to specific denials |
| [SmarterDx](https://www.smarterdx.com) | Pre-bill clinical review | Catches issues before billing, when fixes cost least | Post-denial work and payer contact |
| [Candid Health](https://www.candidhealth.com) | API-first claims, posting and denials | Built for digital-health teams with engineers | Calibrated AI decisions and voice on an API-first core |
| [Adonis](https://www.adonis.io) | Denials, AR, orchestration | Focus on the back end, where lost money is visible | Audited, calibrated autonomy and reviewer feedback as the trust story |

## 3. Startup map and funding

"Not verified" means that the research found no primary funding source.

| Company | RCM steps | AI approach | Funding |
|---|---|---|---|
| [AKASA](https://akasa.com) | Hospital coding, auth, claims | GenAI trained on revenue-cycle data | $250M total; $125M Series C 2022 (secondary source) |
| [Infinitus](https://www.infinitus.ai) | Payer calls | Guardrailed voice agents and a payer knowledge graph from 4M+ calls | [$51.5M Series C, $102.9M total](https://www.prnewswire.com/news-releases/infinitus-systems-raises-51-5-million-series-c-funding-on-the-strength-of-ai-guardrails-302283847.html) |
| [Thoughtful AI](https://www.thoughtful.ai) | Eligibility, claims, posting | Agentic automation | [New Mountain growth round, amount not disclosed](https://www.businesswire.com/news/home/20250409471014/en/Thoughtful.ai-Announces-Growth-Investment-from-New-Mountain-Capital) |
| [SmarterDx](https://www.smarterdx.com) | Pre-bill review, CDI | Clinical LLMs over the full chart | [$50M Series B](https://www.smarterdx.com/newsroom/smarterdx-raises-50m-to-bolster-hospital-revenue-integrity-and-quality-with-its-clinical-ai-solution) |
| [CodaMetrix](https://www.codametrix.com) | Autonomous coding | ML and NLP on notes | [About $106M total per SEC filings](https://www.dealdata.net/company-profile/0001959785/) |
| [Fathom](https://www.fathomhealth.com) | Autonomous coding | Deep learning and NLP | Not verified |
| [Cohere Health](https://www.coherehealth.com) | Payer-side prior auth | Clinical intelligence, auto-approval | Not verified |
| [Anterior](https://anterior.com) | Health-plan prior auth, payment integrity | LLMs and clinicians | [$40M (Feb 2026), $64M total](https://anterior.com/insights/announcements/anterior-raises-40m-series/) |
| [Adonis](https://www.adonis.io) | Denials, AR | Monitoring and agents | [$40M Series C (Mar 2026), $95M+ total](https://www.prnewswire.com/news-releases/adonis-raises-40m-series-c-to-equip-healthcare-providers-with-aidriven-revenue-cycle-operations-302722199.html) |
| [Candid Health](https://www.candidhealth.com) | Claims, posting, denials | Rules engine and automation | [$52.5M Series C, $99.5M total](https://candidhealth.com/blog/candid-health-raises-usd52-5-million-series-c) |
| [Waystar](https://www.waystar.com) | End-to-end platform and clearinghouse | Predictive and GenAI features | Public (NASDAQ: WAY) |
| [Notable](https://www.notablehealth.com) | Intake, registration, auth | EHR workflow agents | Not verified |
| [Magical](https://www.getmagical.com) | Admin and RCM tasks | Browser agents | Not verified |

Pattern (analysis): each startup owns one slice. The research found no public positioning that leads with a statistical guarantee for human handoff. It also found none that joins a written appeal and a live payer call in one loop. This is the Arthai wedge.

## 4. Healthcare voice agents

The descriptions come from company sites. We did not check them independently.

| Company | What they built |
|---|---|
| [Infinitus](https://www.infinitus.ai) | Voice agents for payer calls (benefits, prior auth status) |
| [Hippocratic AI](https://www.hippocraticai.com) | Voice agents for patient-facing tasks |
| [Assort Health](https://www.assorthealth.com) | Voice agents for patient phone calls and scheduling |
| [Sohar Health (YC)](https://www.ycombinator.com/companies/sohar-health) | Eligibility and verification APIs |
| [Commure](https://www.commure.com) | RCM, ambient documentation and agents |

## 5. Techniques

| Technique | Use in Arthai | Source |
|---|---|---|
| Agentic RAG | The appeal agent decides what to retrieve next (policy, chart, earlier appeals) | [Agentic RAG survey, arXiv 2501.09136](https://arxiv.org/abs/2501.09136) |
| GraphRAG | A graph of payer, policy, code and CARC to find the policy clause that applies | [Microsoft GraphRAG](https://microsoft.github.io/graphrag/) |
| Structured outputs | Each agent returns a JSON schema; no free-text codes | [Outlines](https://github.com/dottxt-ai/outlines) |
| Reasoning models | For the appeal argument only; too slow for voice turns | [P4] (analysis) |
| Voice agent stacks | STT, LLM, TTS, interruptions, IVR navigation | [Pipecat](https://github.com/pipecat-ai/pipecat), [LiveKit Agents](https://github.com/livekit/agents) |
| Computer-use agents | Payer portals with no API | [browser-use](https://github.com/browser-use/browser-use) |

[P4] also lists paid voice platforms (Vapi, Retell). Sai chose free voice tools only, so the demo does not use them.

## 6. Papers and studies

| Paper | Takeaway |
|---|---|
| [LLMs Are Poor Medical Coders (NEJM AI 2024)](https://ai.nejm.org/doi/full/10.1056/AIdbp2300040) | GPT-4 got 33.9% exact matches on ICD-10-CM and 49.8% on CPT. Llama2-70b got less than 5%. Do not let an LLM pick codes freely. |
| [Code Like Humans (arXiv 2509.05378)](https://arxiv.org/html/2509.05378v3) | Multi-agent coding that follows the official guidelines. Best on rare codes; classifiers still win on common codes. |
| [Reliable Clinical Coding: Verification (arXiv 2510.07629)](https://arxiv.org/html/2510.07629v1) | Many misses are near-misses in the code hierarchy. A verification step fixes many of them. |
| [Deep Claim (arXiv 2007.06229)](https://doi.org/10.48550/arxiv.2007.06229) | Predicts denial probability, reason codes and payment time from 2.9M claims. +22% recall at 95% precision. |
| [ML denial prediction (Frontiers 2026)](https://doi.org/10.3389/frhs.2026.1927175) | PR-AUC 0.777 on 679K lines, but top-3 reason-code accuracy is only 0.498. This supports prediction sets over a single guess. |
| [AGVF appeal generation (arXiv 2609.27844)](https://arxiv.org/abs/2609.27844) | Five agent roles and a citation gate on 1,000 synthetic appeals. |
| [Experian State of Claims 2025](https://www.experian.com/content/dam/noindex/na/us/healthcare/state-of-claims-2025.pdf) | Survey of 250 providers. 67% think that AI helps, but use is low. |
| [AKASA / HFMA Pulse 2024](https://akasa.com/press/genai-impact-medical-coding-operations) | 90% of 284 revenue-cycle leaders expect GenAI to change coding. |
| [CAQH Index 2024](https://www.caqh.org/hubfs/Index/2024%20Index%20Report/CAQH%5FIndexReport%5F2024%5FFINAL.pdf) | $20B of $90B in admin spend can be automated. Eligibility is the largest part. |

## 7. Open-source RCM repos

| Repo | Notes |
|---|---|
| [hamzaabbasai/ai-revenue-cycle-agent](https://github.com/hamzaabbasai/ai-revenue-cycle-agent) | Reference architecture; teardown below |
| [ericg1212/agentic-rcm-pipeline](https://github.com/ericg1212/agentic-rcm-pipeline) | Kafka, NCCI gate, LLM tool use |
| [dschmitz05/denial_navigator](https://github.com/dschmitz05/denial_navigator) | 835 and 837 parsing |
| [Fadil369/HealthLinc](https://github.com/Fadil369/HealthLinc) | FHIR and HL7 RCM with an EHR |
| [rvijaysingh/tribe-rcm-denial-appeals-prototype](https://github.com/rvijaysingh/tribe-rcm-denial-appeals-prototype) | Denial appeals prototype |

### Teardown: hamzaabbasai/ai-revenue-cycle-agent (about 950 lines of Python, from [P4])

| Part | What it does | What Arthai does instead |
|---|---|---|
| Data model | Pydantic chain: request, verified, coded, decision, audited, result | Keep the idea. Add CARC/RARC, payer, lines, amounts and the confidence set. |
| Agents | 3 LLM agents (intake, coding, appeal) with fixed steps between them | Typed decisions for coding and triage |
| Rules | Fixed catalog, fake insurance check, payer mocked with a sleep | X12 837/835 parsing and synthetic payer rules |
| Loop control | Blind retry of the coding step, up to 2 times | Confidence routing: wide sets go to the human queue |
| Ops | SQLite, JSON logs | Postgres and an audit row for each decision |
| Missing | Voice, EDI, policy RAG, calibration, AR follow-up, evals | These are the Arthai differentiators |

## Sources

- [P4] "RCM Landscape: Who Won & Why", Grok Bot Page, 2026-10-26 (private): https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/aecd7038-617d-4b7d-b2a9-2723200ba3e1
- [P2] "Revora Build Guide", Grok Bot Page, 2026-10-26 (private): https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/0d09f3df-55fe-44ed-b292-b147cf442cb6
- The external links in each table.
