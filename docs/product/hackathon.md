# Meta AI Developer Hackathon: rules, judging and plan

Status: research summary, 2026-10-28. Facts come from the kickoff slides and the event page, as recorded in [P3]. Items marked "analysis" are judgment, not fact.
Event page: https://cerebralvalley.ai/e/meta-ai-developer-hackathon

## 1. Dates (ET)

| When | What |
|---|---|
| Mon Oct 26, 12 PM | Kickoff. The build starts. |
| Tue Oct 27, 12 to 1 PM | Agents 101 |
| Wed Oct 28, 12 to 1 PM | Agents 102 |
| Fri Oct 30, 12 to 1 PM | Fireworks session |
| Weekdays, 10 to 11 AM | Meta office hours |
| Wed Nov 4, 9 PM | Submissions close. The Meta credit form is also due. |
| Nov 5 to 8 | Judging. Most Viral counts X engagement until Nov 8, 11:59 PM. |
| Mon Nov 9, 12 PM | Finals |
| Nov 16 | Community Vote winner |

Entry: Indie category (solo). Track: Build for Your World.

## 2. Rules

- Only new work from Oct 26 to Nov 4 counts. If the demo shows other work, the project is disqualified.
- Teams have up to 4 people. Each member must be an approved participant.
- Submit a public GitHub repo and a 3-minute demo video.
- Nothing illegal or unethical. Do not use code, data or assets without rights to them.

Banned ideas (the list is not complete): AI medical advice (mental health, skin), basic RAG apps, simple image analyzers, Streamlit apps, dashboards as the main feature, AI-for-education chatbots, job application screeners, nutrition coaches, personality analyzers, sports analyzers or coaches.

## 3. Judging criteria

- The four criteria have equal weight: impact, use of Meta AI tooling, technical depth, and the demo.
- The event page says that the Indie track is judged on creativity, technical ambition and whether it works.

## 4. Prizes

| Prize | 1st | 2nd | 3rd | 4th | 5th |
|---|---|---|---|---|---|
| Indie | $150k | $100k | $75k | $50k | $25k |
| Startup | $250k | $150k | $75k | $50k | $25k |

| Bonus prize | Amount | How to win |
|---|---|---|
| Most Viral | $20K | Most X engagement on the demo post |
| Best Build on Meta Open Weights | $10K | Muse Glimmer or Muse Spark Open on own hardware or partner inference; the partner verifies it |
| Community Vote | $10K | Public gallery, one vote per verified account |
| Best Agentic Use-Case | $5K | Autonomy, effectiveness, practical use |
| Best Creative Build | $5K | Muse Image or Muse Wonder |

## 5. Fit check: Arthai Health against the rules (analysis)

| Risk | Fix |
|---|---|
| Judges read it as AI medical advice | Frame it as billing and admin automation for billing staff. No diagnosis, no treatment output, no clinical answers to patients. Say this in the README and in the first 10 seconds of the video. |
| Judges read it as a dashboard | The agents are the product. Lead the demo with the denial, the appeal and the payer call. Show the console second. |
| Judges read it as basic RAG | Show the multi-step agent: typed decisions, the confidence gate, the citation gate, tool calls, a voice call and a state change. |
| Pre-existing work | Use the fresh public repo. Do not use Tekcel or MedRCM code, data or assets. |
| Data rights and PHI | Synthetic data only. Cite the licenses of public code lists. |
| Outside models | Judging rewards Meta tooling. Let Meta models do the visible work. Confirm that non-Meta helper models are allowed. |
| Voice calls to real payers | Call only the mock payer. The agent says that it is an AI. |
| Overspend | Set a spend limit. Log the cost for each claim. |

## 6. Prize plan (analysis)

| Target | Plan |
|---|---|
| Indie main | Hit all four criteria: impact (denial cost data), Meta tooling, depth (calibrated gate, X12, voice loop), a tight demo. |
| Best Agentic Use-Case | One claim goes from 835 denial to appeal to payer call to updated status with no human. A second claim that is not clear goes to the queue. |
| Best on Open Weights | Run denial triage and the citation check on an open-weight Meta model through a partner. Keep the endpoint logs as evidence. |
| Most Viral | A short X clip of the voice agent on hold with the payer, so billers do not have to wait. |

## 7. Day plan from [P3] (planned on Oct 26)

The repo schedule in `docs/hackathon-workflow.md` is the current one. This table is the original plan.

| Day | Build |
|---|---|
| Mon Oct 26 | Repo, AGENTS.md, spend limit, model smoke test, D-001 |
| Tue Oct 27 | Synthetic data, Postgres schema, outbox, audit events |
| Wed Oct 28 | Orchestrator, denial triage, confidence gate, review queue API |
| Thu Oct 29 | Appeal writer with policy retrieval and the citation gate; golden eval set |
| Fri Oct 30 | Mock payer and clearinghouse |
| Sat Oct 31 | Voice agent that calls the mock payer; the outcome event updates the claim |
| Sun Nov 1 | React console: timeline, queues, approvals; end-to-end run |
| Mon Nov 2 | Evals, feedback loop demo, cost per claim, bug fixes; freeze features |
| Tue Nov 3 | README, architecture diagram, video, X clip |
| Wed Nov 4 | Final checks; submit in the afternoon |

## 8. Submission checklist

- [ ] Public GitHub repo, created after Oct 26 12 PM, with no earlier or employer code.
- [ ] README: billing and admin framing, synthetic-data statement, Meta models used, open-weights setup, third-party licenses.
- [ ] 3-minute video with event work only, agents first.
- [ ] X post with the demo, and its link in the submission.
- [ ] Open-weights use flagged in round one, with partner evidence.
- [ ] Track and category set: Build for Your World, Indie.
- [ ] Submitted before Nov 4, 9 PM ET: https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit

## Sources

- [P3] "0. Meta Hackathon Brief", Grok Bot Page, 2026-10-26 (private): https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/3ae4ac4c-0964-4471-83cb-753724da2f24
- Chief of Staff handoff to Mini Chief, 2026-10-26 (rules, banned list, tracks, judging, prizes from the kickoff slides).
- Event page: https://cerebralvalley.ai/e/meta-ai-developer-hackathon
