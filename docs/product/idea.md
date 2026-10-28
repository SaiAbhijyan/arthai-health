# Arthai Health: product idea

Status: research summary, 2026-10-28. This file collects the earlier idea research. It is not a spec.
The project was first named Revora. It is now Arthai Health. Tagline: "AI agents that get you paid."

Sources (see the list at the end): [P1] Idea & Products page, [P2] Build Guide page, [P3] Meta Hackathon Brief page, [P4] RCM Landscape page, [M] Sai's decisions in chat and agent memory.
Market numbers come from the public reports that the pages cite. Each number has its source in `docs/rcm/research.md`.

## 1. Problem

- Insurers deny many claims. The average initial denial rate in 2025 was 11.6% (Kodiak 2025, cited in [P1]).
- A denial costs about $103 to rework. A claim costs about $6.50 to submit (HFMA chapter deck 2025, cited in [P2]).
- Humans still review 90% of denials (Experian State of Claims 2025, cited in [P1]).
- Billing staff spend a long time on hold with payers. Infinitus reports that its payer calls average 34.5 minutes ([P2]).
- The work is split across many systems. Staff repeat steps and find errors only after a claim fails.

## 2. Users

| User | What they need |
|---|---|
| Denials team | Triage of denied claims and appeal letters that cite evidence. |
| AR callers | Less hold time on status calls and benefit calls. |
| Supervisors, QA, compliance | A view of every AI action and control over it. |
| Revenue cycle director, CFO (buyers) | Fewer denials, fewer days in AR, a lower cost to collect. |

Source: [P1] section 2 and section 5.

## 3. Solution

Arthai Health is a set of AI agents for healthcare billing work. It is billing and admin automation. It does not give medical advice ([P3] section 7).

The core loop for the hackathon:

1. A denied claim line arrives in a synthetic 835 remittance, with CARC and RARC codes.
2. A triage agent decides the denial category, whether to appeal, and the priority.
3. A confidence gate decides if the agent is sure. If it is not sure, the claim goes to a human queue.
4. An appeal agent writes an appeal letter. Each statement in the letter must cite a retrieved source (citation gate).
5. A voice agent calls a mock payer representative to follow up. The call outcome updates the claim.
6. The review console shows the claim timeline, the audit trail and the cost for each claim.

Source: [P2] 1.2 and 3.5. The flow and its parts are in `docs/architecture.md`.

### The wedge (analysis from [P2] 1.2 and [P4] section 2)

- Calibrated abstention: a statistical gate (conformal prediction sets, `cci-sdk`) decides which claims go to a human. The gate has a coverage target, not a raw confidence threshold.
- A closed voice loop: a payer call whose outcome updates the claim live.
- The research found no vendor whose public positioning leads with both. This is analysis of marketing pages, not a measured fact.

## 4. Hackathon scope compared with the long-term vision

### 4.1 Hackathon (Oct 26 to Nov 4, 2026): 4 deployables

| App | Contents | What the judges see |
|---|---|---|
| 1. RCM core (modular monolith) | Claims and scrubber, posting, denials and appeals, AR, minimal billing and ledger, audit, review API | A denied claim that the agents triage, gate and appeal with citations |
| 2. Payer and clearinghouse mock | Adjudication, 835 and 277 output, phone persona | A realistic insurer on the other end |
| 3. Voice agent | Payer calls | A live call whose outcome updates the claim |
| 4. Review console | Timelines, queues, approvals | Human oversight, audit trail, cost for each claim |

Source: [P1] section 3, [P2] 3.4, DECISIONS.md D-001.

### 4.2 Long-term vision: full RCM suite

An AI suite that covers the whole revenue cycle, from scheduling to the ledger ([P1] section 1, [P2] 1.1, [M]):

- Every AI action is secured and goes into an immutable audit trail.
- Humans can open any claim at random for QA.
- The AI flags the claims that it is not sure about.
- Reviewer corrections and comments go back into the system. They improve prompts, retrieval and calibration first, and later the models (retraining from human feedback).

The full suite has 18 products. The monolith splits into services along its module boundaries when load, team size or compliance scope require it.

| Product | User | Value | AI parts | Hackathon |
|---|---|---|---|---|
| Eligibility and benefits | Front desk | Know coverage, copay and auth needs before the visit | Decide if a call or auth is necessary; voice agent fills benefit gaps | Fixture or vendor test mode |
| Intake and registration | Patients, front desk | Correct demographics and insurance the first time | Chat or voice intake, card extraction, field checks | Synthea seed data |
| Coding assist | Coders | Faster coding with no invented codes | Catalog retrieval, typed choice, confidence gate to a human coder | Stub |
| Charge capture | Billing | Fewer missed charges | Missed-charge detection | Not in demo |
| Claim builder and scrubber | Billers | Clean claims on the first pass | Denial-risk score and fix suggestions on top of NCCI and MUE rules | In core |
| Clearinghouse gateway | System | 837 out; 999, 277CA and 835 in | Rejection triage | Mock |
| Remit posting | Payment posters | Auto-posting, underpayment detection | Root-cause category for denied lines | In core |
| Denials and appeals | Denials team | Triage and cited appeal letters in minutes | Triage, gate, appeal writer, citation gate | Core of the demo |
| Payer voice agent | AR callers | No hold time on status and benefit calls | Speech to text, LLM turns, text to speech, IVR navigation | Calls the mock payer |
| AR follow-up | AR team | Work the right claims first | Prioritizer, 276/277 reader | In core |
| Patient billing | Patients | Clear bills, payment plans | Plain-language explanations (numbers come from code) | Minimal |
| Accounts and ledger | Finance | Correct balances | None: deterministic double-entry | Minimal |
| Review and oversight console | Supervisors, QA | See and control every AI action | Summaries for reviewers | Own app |
| Audit service | Compliance | Prove who did what and why | None | In core |
| AI gateway | Platform | Cost control, fallbacks, PHI redaction | Routing and guardrail hooks | See note 1 |
| Eval and feedback | AI team | AI improves from reviewer input | LLM-as-judge, calibration | Golden set and one live loop |
| Identity and access | Admins | Correct access to claims | None | Simple login |
| Payer mock (demo only) | Demo | A realistic counterparty | A Meta model plays the payer rep | Own app |

Source: [P1] section 2.

Note 1: [P1] picked LiteLLM as the gateway. The stack review (`docs/adr/0004-stack.md` on PR #1, Proposed) uses one OpenAI-compatible client and two Meta-model providers instead. OmniRoute is for developer tools only.

### 4.3 Oversight in the product (user view)

| Capability | What the user sees |
|---|---|
| Claim timeline | Every AI and human action, the model, the prompt version and the sources, in order |
| Two review queues | AI-flagged claims (not sure, guardrail hit, high dollar) and a random sample of claims that the AI handled alone |
| Approvals | External or money actions (send appeal, place call, adjust) wait for a click. Write-offs and refunds need two people. |
| Feedback | A reviewer edits or rejects with a reason. The edit becomes a test case and the metrics update. |
| Controls | Supervisors set the sampling rate, the confidence level and a stop switch for each agent |

Source: [P1] section 4.

## 5. Demo story (3-minute video)

Rules for the video ([P3] sections 3 and 7):

- Show only work from the event (Oct 26 to Nov 4).
- In the first 10 seconds, say that this is billing automation for billing staff, not medical advice.
- Show the agents first. Do not open the video on a chart or a dashboard.
- Say on screen: synthetic data only, not HIPAA-certified, AI voice disclosed, every decision auditable ([P2] 4.9).

Story ([P2] 1.2, [P3] section 8):

1. A synthetic 835 arrives with a denied line.
2. The triage agent picks a category and a priority. The confidence gate is sure, so the claim continues with no human.
3. The appeal agent writes a letter. Each statement cites a policy chunk.
4. The voice agent calls the mock payer in the browser. It says that it is an AI. It reads back the reference number.
5. The claim status updates live in the console.
6. A second claim is not clear. The gate sends it to the human queue. A reviewer edits the letter. The edit becomes an eval case, and a rerun shows the metric.

Voice for the demo uses free tools only [M]. The agent calls a mock payer rep in the browser. Speech to text and text to speech run locally with open-source tools. Candidates named in chat: Whisper (speech to text), Piper or Kokoro (text to speech). UNVERIFIED as a final choice: no DECISIONS.md entry exists yet. No paid phone line.

## 6. Buyers, ROI and procurement (general practice, from [P1] section 5)

- Buyers: the VP or director of revenue cycle and the CFO sign. IT, security and compliance must approve.
- Priority: rank use cases by dollars at risk, volume and feasibility. Denials and AR follow-up usually come first.
- Procurement: security questionnaire, BAA, SOC 2 or HITRUST evidence, integration plan, legal review, pilot, contract.
- Pricing models: per claim, per transaction, a percentage of recovered dollars, or a subscription.
- Pilot: one site, one or two payers, a baseline period and agreed exit criteria.

ROI worked example (estimate, not a measurement): a group works 1,000 denials a month at $103 each, so rework costs about $103,000 a month. If the AI handles half of them at a quarter of the cost, the saving is about $38,600 a month before software cost. Use the customer's own numbers.

## 7. Related docs

- `docs/product/hackathon.md`: rules, judging, prizes, fit check, plan.
- `docs/rcm/primer.md`: how RCM works.
- `docs/rcm/research.md`: market, competitors, papers, with links.
- `docs/architecture.md`: the flow and its components.

## Sources

- [P1] "Revora: Idea & Products", Grok Bot Page, 2026-10-26. https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/80ce4a4b-2037-4660-a261-d5602478fcf4 (private: owner access only)
- [P2] "Revora Build Guide", Grok Bot Page, 2026-10-26. https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/0d09f3df-55fe-44ed-b292-b147cf442cb6 (private)
- [P3] "0. Meta Hackathon Brief", Grok Bot Page, 2026-10-26. https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/3ae4ac4c-0964-4471-83cb-753724da2f24 (private)
- [P4] "RCM Landscape: Who Won & Why", Grok Bot Page, 2026-10-26. https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/aecd7038-617d-4b7d-b2a9-2723200ba3e1 (private)
- [M] Sai's messages to Mini Chief (2026-10-21 to 2026-10-28) and saved agent memory: the idea, the long-term vision, free voice only.
