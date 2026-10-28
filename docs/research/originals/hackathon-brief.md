> Verbatim snapshot of the "0. Meta Hackathon Brief" research page as of Oct 26, 2026. Not maintained. See [README](README.md) for what was changed for the public repo.

# 0. Meta Hackathon Brief

*Revora: AI agents that get you paid. Read this first. Sai's status, dates, rules, prizes, Meta model facts, a fit check of the Revora plan against the rules, prize strategy, a day-by-day plan and the submission checklist. Facts cite the kickoff slides or the linked page; anything marked analysis is my judgment.*

Reading order: 0. this Brief, then 1. Playbook (primary doc for building), then 2. Idea & Products, 3. Build Guide, 4. Landscape.

- [1. Elite Builder Playbook (PRIMARY doc for building)](https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/b7d4e5e1-54f1-46ce-b2af-97c24289a648) (cursor.com)
- [2. Revora: Idea & Products](https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/80ce4a4b-2037-4660-a261-d5602478fcf4) (cursor.com)
- [3. RCM Hackathon Build Guide](https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/0d09f3df-55fe-44ed-b292-b147cf442cb6) (cursor.com)
- [4. RCM Landscape: Who Won & Why](https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/aecd7038-617d-4b7d-b2a9-2723200ba3e1) (cursor.com)

**Contents**

- [1. Sai's status](#st)
- [2. Dates (ET)](#dt)
- [3. Rules and banned ideas](#ru)
- [4. Tracks, judging, prizes](#pr)
- [5. Meta models and partners (verified)](#mm)
  - [Credits and partner resources](#cr)
- [6. Billing](#bi)
- [7. Fit check: Revora plan vs rules](#fit)
- [8. Prize strategy](#ps)
- [9. Day-by-day plan](#plan)
- [10. Submission checklist](#sub)

<a id="st"></a>
## 1. Sai's status

*Source: kickoff slides*

| Field | Value |
| --- | --- |
| Category | Accepted, Indie |
| Discord | Builders role |
| Team ID | [removed for the public repo] |
| Meta Model API credits ($150) | Form submitted Oct 26; credits pending. Form deadline Nov 4, 9pm ET |
| Discord posts | [3 Discord channel links removed for the public repo: intro, credits, team search] |

<a id="dt"></a>
## 2. Dates (ET)

*Source: kickoff slides; build window confirmed on the event page*

| When | What |
| --- | --- |
| Mon Oct 26, 12pm | Kickoff; build starts |
| Tue Oct 27, 12 to 1pm | Agents 101 |
| Wed Oct 28, 12 to 1pm | Agents 102 |
| Fri Oct 30, 12 to 1pm | Fireworks session |
| Weekdays 10 to 11am | Meta office hours |
| Wed Nov 4, 9pm | Submission closes ([submit page](https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit)) and credit form due |
| Nov 5 to 8 | Judging. Most Viral engagement counted until Nov 8, 11:59pm |
| Mon Nov 9, noon | Finals |
| Nov 16 | Community Vote winner announced |

<a id="ru"></a>
## 3. Rules and banned ideas

*Source: kickoff slides*

- Only new work built Oct 26 to Nov 4. The demo may show only event work, or the project is disqualified.
- Teams of up to 4, and every member must be an approved participant. Registration is full.
- Public GitHub repo, plus a required 3-minute demo video.
- Nothing illegal or unethical, and no code, data or assets you don't have rights to.

> [!WARNING]
> **Banned (the list isn't exhaustive)**
>
> AI medical advice (mental health, skin), basic RAG apps, simple image analyzers, Streamlit apps, dashboards as the main feature, AI-for-education chatbots, job application screeners, nutrition coaches, personality analyzers, and sports analyzers or coaches.

<a id="pr"></a>
## 4. Tracks, judging, prizes

*Source: kickoff slides and the event page*

- Themes: Build for Your World (bring Meta's models into a domain you know firsthand) or Push the Frontier ([event page](https://cerebralvalley.ai/e/meta-ai-developer-hackathon)).
- Judging gives equal weight to impact, use of Meta AI tooling, technical depth and the demo.
- The event page says the Indie track is judged on creativity, technical ambition and whether it works. The total prize pool is $1M, with up to 20,000 accepted applicants ([event page](https://cerebralvalley.ai/e/meta-ai-developer-hackathon)).

| Prize | 1st | 2nd | 3rd | 4th | 5th |
| --- | --- | --- | --- | --- | --- |
| Indie | $150k | $100k | $75k | $50k | $25k |
| Startup | $250k | $150k | $75k | $50k | $25k |

| Bonus prize ($50K total) | Amount | How it's won |
| --- | --- | --- |
| Most Viral | $20K | The demo with the most X engagement. Post it on X and submit the link; likes, reposts and comments count until Nov 8, 11:59pm ET |
| Best Build on Meta Open Weights | $10K | Muse Glimmer or Muse Spark Open on your own hardware or partner inference. The infra partner verifies it; flag it in round one |
| Community Vote | $10K | Public gallery, one vote per verified account; winner announced Nov 16 |
| Best Agentic Use-Case | $5K | Autonomy, effectiveness, practical usefulness |
| Best Creative Build | $5K | Muse Image or Muse Wonder; originality, execution, use of the model |

<a id="mm"></a>
## 5. Meta models and partners (verified)

| Model | What it is | Where it runs | Source |
| --- | --- | --- | --- |
| Muse Wonder | Meta's most capable model, for complex coding and long-horizon agents. Takes text, image, video, audio and PDF; 1,048,576-token context; reasoning effort from minimal to max. In preview | Model API and Muse Code | [Models](https://dev.meta.ai/docs/models) |
| Muse Spark | Agentic work, coding and reasoning | Model API | [Models](https://dev.meta.ai/docs/models) |
| Muse Image / Voice Transcribe / SAM | Image generation, speech to text, segmentation | Model API | [Models](https://dev.meta.ai/docs/models) |
| Muse Glimmer | 30B dense open-weight multimodal model (text and image in, text out), distilled from Muse Spark, built for local agentic work. 128K default context. Apache 2.0. bf16 needs about 72 GB of VRAM; quantized builds are 17 to 20 GB | Self-host with vLLM, SGLang, llama.cpp, Ollama, LM Studio and others; launch partners include Fireworks, Together, OpenRouter and Hugging Face | [overview](https://dev.meta.ai/docs/muse-glimmer), [deploy](https://dev.meta.ai/docs/muse-glimmer/deploy) |
| Muse Spark Open | Open-weight Muse Spark: a sparse mixture of experts with 816B total and 42B active parameters, a 1,048,576-token context, and text, image, audio and video input. NVFP4 is about 537 GB (one 4-GPU Blackwell node); BF16 needs about 2 TB of VRAM. Muse Model License plus the Acceptable Use Policy | A hosted provider or a big GPU cluster: SGLang, vLLM, TensorRT-LLM | [overview](https://dev.meta.ai/docs/muse-spark-open), [deploy](https://dev.meta.ai/docs/muse-spark-open/deploy) |
| Muse Code | Meta's coding agent, built for Muse Spark | Terminal/CI | [Docs home](https://dev.meta.ai/docs) |

<a id="cr"></a>
### Credits and partner resources

*Source: kickoff slide 'Credits and partner resources'; partner details also on the event page*

| Provider | Offer | Cap | Use in Revora |
| --- | --- | --- | --- |
| Meta | $150 Model API credits | Every participant | Muse Wonder appeals, Muse Spark voice turns, Voice Transcribe. Sai's form was submitted Oct 26 and is pending |
| Baseten | $100 credits plus 2M TPM rate limits | Up to 2,000 participants | Primary Muse Glimmer endpoint for denial triage and citation checks (Best on Open Weights) |
| Modal | $100 credits for Meta open-weights models | Up to 1,000 participants | Second Glimmer endpoint or backup, plus Modal Sandboxes for agent code |
| Fireworks | $25 credits plus a workshop with Sinan Ozdemir (Fri Oct 30 noon) | Select participants | Hosted Glimmer fallback route in the gateway |

How to claim: request forms open in #resources on Discord at kickoff.

- [ ] TODAY: claim Modal in #resources (capped at 1,000, the tightest)
- [ ] TODAY: claim Baseten in #resources (capped at 2,000)
- [ ] Claim Fireworks $25 (select participants)
- [ ] Meta $150 form: submitted Oct 26; confirm the credits land before Nov 4, 9pm ET
- [ ] Card on file at dev.meta.ai (not debit) and a spend limit set
- [ ] Deploy Muse Glimmer on Baseten or Modal; save the endpoint, model ID and usage logs as evidence for the partner to verify
- [ ] Add the Glimmer routes to the LiteLLM gateway with Fireworks as fallback; tag calls 'open-weights' for the demo
- [ ] Flag Best on Open Weights in round one of the submission

Status as of Oct 26, 12:20pm ET: only the Meta form is submitted. Analysis: if both Modal and Baseten are already full, Fireworks-hosted Glimmer still qualifies as partner inference.

> [!NOTE]
> **Analysis**
>
> Glimmer is the realistic open-weights pick. A quantized build fits on one Modal or Baseten GPU, or you can call it through Fireworks. Spark Open is too big to self-host, so use it only through a hosted provider. Since Glimmer is Apache 2.0 and built for agents, it can take over Laya's typed decisions, which removes an outside model.

<a id="bi"></a>
## 6. Billing

*Source: kickoff slides*

- A card must be on file at dev.meta.ai. Debit cards reportedly fail.
- Expect a temporary pre-auth hold.
- Spend can go past the $150 in credits, so set a spend limit before building. Route all calls through the gateway with a per-claim cost log.

<a id="fit"></a>
## 7. Fit check: Revora plan vs rules

*Analysis against the rules in section 3*

| Risk | Why it matters | Fix |
| --- | --- | --- |
| Read as 'AI medical advice' | Healthcare is close to a banned category | Frame it as billing and admin automation for billing staff. No diagnosis or treatment output, and no patient-facing clinical answers. Put that line in the README and in the video's first 10 seconds |
| Read as 'dashboard as the main feature' | The review console looks like a dashboard | Agents are the product: the demo leads with an autonomous denial, appeal and live payer call. The console appears second, as the oversight layer. Never open the video on a chart |
| Read as 'basic RAG' | The appeal writer uses policy retrieval | Show the multi-step agent: typed decisions, the confidence gate, a citation-verification gate, tool calls, a voice call and a state change. Retrieval is one tool among many |
| Pre-existing work | Only Oct 26 to Nov 4 work counts, and showing other work means DQ | A fresh public repo created after kickoff. No Tekcel or MedRCM code, data or assets. Commit history shows the build days |
| Data rights / PHI | No data without rights | Synthetic data only (Synthea, generated 837/835). Public CMS/X12 code lists are fine; cite the licenses |
| Outside models (Laya, cci-sdk) | Judging rewards use of Meta tooling; outside pieces need license rights | Laya is Apache-2.0 and cci-sdk is open source, but consider swapping Laya for Muse Glimmer. Keep cci-sdk as a statistics library, not a model. Muse does all the visible work |
| Streamlit | Banned | React/TS console as planned |
| Voice calls to real payers | Unethical and illegal risk | Calls go only to the mock payer, and the agent discloses that it's AI |
| Overspend | Billing can go past the credits | Spend limit plus cached prompts plus Glimmer for high-volume calls |

<a id="ps"></a>
## 8. Prize strategy

*Analysis*

| Target | Play |
| --- | --- |
| Indie main | Build for Your World: Sai knows RCM firsthand. Hit all four criteria: impact (denial cost stats), Meta tooling (Wonder, Spark, Voice Transcribe, Glimmer, Muse Code), depth (calibrated gating, X12, a voice loop) and a tight demo |
| Best Agentic Use-Case | Show autonomy with guardrails: one claim goes from 835 denial to appeal to payer call to updated status with no human, while an unsure one goes to the queue |
| Best on Open Weights | Run denial triage and the citation checker on Muse Glimmer via Modal/Baseten/Fireworks. Log the endpoint, flag it in round one, and keep the partner verification evidence |
| Most Viral | A short X clip of the voice agent sitting through payer hold music so billers don't have to. Post on Nov 4, engage until Nov 8 |
| Community Vote | Clear gallery thumbnail and title; ask Discord and X followers to vote once each |

X drafts (text only, Sai's voice; nothing posted):

> [!NOTE]
> **Draft post**
>
> Insurance companies built a phone tree so deep it has its own weather. So I built an AI that waits on hold, argues the denial, writes the appeal and updates the claim. Billers can finally go outside. Built in 9 days on Meta Muse. #MetaHackathon

> [!NOTE]
> **Alt draft**
>
> Hospitals lose billions to denied claims. I lost 9 days of sleep. Fair trade. AI agent that fights insurance denials and calls the payer for you, on Muse + open-weight Glimmer.

<a id="plan"></a>
## 9. Day-by-day plan

*Analysis; build details in the Build Guide, build process in the Playbook*

| Day | Sessions | Build |
| --- | --- | --- |
| Mon Oct 26 | Kickoff noon | Fresh public repo, AGENTS.md/CLAUDE.md, spend limit, LiteLLM gateway, Muse API smoke test, DECISIONS D-001 |
| Tue Oct 27 | Office hours 10am; Agents 101 noon | Synthetic data (Synthea, 837/835 generator), Postgres schema, outbox, audit_events |
| Wed Oct 28 | Office hours; Agents 102 noon | LangGraph supervisor, denial triage (Glimmer on Modal/Baseten), CCI gate, review queue API |
| Thu Oct 29 | Office hours | Appeal writer (Muse Wonder) with policy retrieval and the citation gate; golden eval set |
| Fri Oct 30 | Office hours; Fireworks noon | Mock payer and clearinghouse; Glimmer via Fireworks as a fallback route |
| Sat Oct 31 | none | Voice agent (Voice Transcribe, Muse Spark, TTS) calling the mock payer; outcome event updates the claim |
| Sun Nov 1 | none | React console: claim timeline, queues, approvals; end-to-end run |
| Mon Nov 2 | Office hours: ask about open-weights verification and rule fit | Evals, feedback loop demo, cost per claim, bug bash; freeze features at night |
| Tue Nov 3 | Office hours | README, architecture diagram, record the 3-minute video, cut the X clip |
| Wed Nov 4 | Office hours | Final checks, submit by afternoon (not 8:59pm), post on X, check the credit form |

<a id="sub"></a>
## 10. Submission checklist

*Status as of Oct 26: nothing below is done yet*

- [ ] Public GitHub repo, created after Oct 26 12pm, with no pre-existing or Tekcel/MedRCM code
- [ ] README: billing/admin framing, synthetic-data statement, Meta models used, open-weights setup, licenses for third-party pieces
- [ ] 3-minute demo video showing only event work, agents first
- [ ] X post with the demo published, link included in the submission
- [ ] Open-weights use flagged in round one, with partner endpoint evidence
- [ ] Track: Build for Your World; category: Indie; team ID [removed for the public repo]
- [ ] Submitted at cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit before Nov 4, 9pm ET
- [ ] $150 credit form confirmed (due Nov 4, 9pm ET) and spend limit checked
