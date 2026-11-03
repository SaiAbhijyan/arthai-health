# RCM primer

Status: research summary, 2026-10-28. This primer explains healthcare revenue cycle management (RCM) for the people and agents who work on this repo.
Sources: [P2] Build Guide page, `docs/data-plan.md` (PR #1), CMS and eCFR pages that are linked in the text. Every example is synthetic.

## 1. Terms

| Term | Meaning in this repo |
|---|---|
| Provider | The practice or hospital that gives the care and sends the bill. |
| Payer | The insurer that pays the claim. In the demo, all payers are fictional. |
| Clearinghouse | The service between the provider and the payer. It checks and forwards claims and returns acknowledgments. |
| Claim | The bill to the payer, sent as an X12 837 transaction. |
| Remittance (ERA) | The payer's payment answer, sent as an X12 835. It has the adjustment codes for each line. |
| Denial | A claim line that the payer does not pay, or pays at zero, with a reason code. |
| Appeal | A written request to the payer to change a denial decision. |
| AR (accounts receivable) | Money that payers or patients still owe. "Days in AR" measures how fast cash comes in. |

## 2. The RCM steps

1. **Scheduling and registration.** The front desk records demographics and insurance.
2. **Eligibility and benefits.** The provider sends an X12 270. The payer answers with a 271 (coverage, copay, deductible).
3. **Prior authorization.** Some services need approval first (X12 278, a portal or a phone call).
4. **Charge capture and documentation.** The provider records the services. Missing detail causes problems later.
5. **Coding.** Coders assign ICD-10-CM diagnosis codes and procedure codes (CPT or HCPCS).
6. **Scrubbing and submission.** Rules (NCCI, MUE, payer rules) check the claim. The 837 goes to the clearinghouse. The clearinghouse returns a 999 and a 277CA.
7. **Adjudication.** The payer applies its policy and contract. It pays, denies or pends the claim, and sends an 835 and a 277.
8. **Posting.** The billing team posts the 835 payments and adjustments to the account.
9. **Denials and appeals.** The team sorts each denied line, fixes it, sends a corrected claim, or appeals.
10. **AR follow-up.** The team sends a 276 status query, or calls the payer when there is no answer.
11. **Patient billing.** The patient gets a statement for the patient share.

Source: [P2] 2.1.

### What breaks at each step, and where AI helps

| Step | What breaks | Where AI helps |
|---|---|---|
| Registration | Registration errors cause 32% of denials | Chat or voice intake, card extraction, field checks |
| Eligibility | 271 answers often lack detail, so someone must call | Automatic 270/271; a voice agent for missing benefit detail |
| Prior authorization | Authorizations cause 35% of denials | Read payer policy, build the request packet, call for status |
| Documentation | Missed charges, missing detail | Find gaps in the chart |
| Coding | Code errors cause 24% of denials; LLMs invent codes | Choose from a fixed catalog, then verify |
| Scrub and submit | Missing or wrong data causes 50% of denials | A denial-risk score before submission |
| Posting | Unmatched payments | Auto-posting; map each CARC/RARC to a root cause |
| Denials | About $103 to rework each denial | A typed decision (appeal? category? priority?) and a cited appeal letter |
| AR follow-up | Long holds and IVR menus | A voice agent that writes the outcome back to the claim |

Source: [P2] 2.1. The percentages come from Experian State of Claims 2025 (see `docs/rcm/research.md`). One denial can have more than one cause, so the percentages do not add to 100.

## 3. X12 transactions (HIPAA standard, version 005010)

| Transaction | Use |
|---|---|
| 270 / 271 | Eligibility request and answer |
| 278 | Prior authorization |
| 837 (837P professional, 837I institutional) | Claim |
| 999 | Acknowledgment of the file |
| 277CA | Claim acknowledgment from the clearinghouse |
| 276 / 277 | Claim status request and answer |
| 835 | Remittance advice (ERA): payments, adjustments and reason codes |

Source: [P2] 2.1 and 4.9.

## 4. Denial codes

An 835 explains each adjustment with three kinds of code.

| Code type | Format | What it tells you |
|---|---|---|
| Claim Adjustment Group Code | 2 letters: CO, PR, OA, PI | Who carries the adjustment. Our short labels: CO = contractual (the provider absorbs it), PR = patient responsibility, OA = other adjustment, PI = payer-initiated. |
| CARC (Claim Adjustment Reason Code) | 1 to 3 characters, for example `197` | Why the payer adjusted the line |
| RARC (Remittance Advice Remark Code) | `M`, `MA` or `N` plus digits, for example `N54` | More detail about the CARC |

The group labels above are our own short words. Check the official meanings at x12.org.

**License warning.** X12 holds the copyright of the CARC and RARC lists. The lists are free to read online, but not free to copy into a product. Store code values only, for example `CO-197`, with our own category label. Do not copy X12 description text into the repo. Link to the X12 pages for the text. Source: `docs/data-plan.md` section 5 (PR #1).
- CARC list: https://x12.org/codes/claim-adjustment-reason-codes
- RARC list: https://x12.org/codes/remittance-advice-remark-codes

**CPT warning.** The AMA owns CPT. Decision D-009 (Sai, 2026-10-28): no CPT codes or descriptions in the repo, and no training on CPT. Synthetic claims use HCPCS Level II codes only. Source: `docs/data-plan.md` section 5.

### Denial categories in the synthetic data

The scenario table maps each denial pattern to a category, a group code, a CARC value, an action and the evidence that is necessary. The labels are our own words. Source: `data/synthetic/scenarios.yaml` on branch `feat/phase2-synthetic-data` (work in progress, not merged). The data plan lists the full set of 12 to 15 patterns (`docs/data-plan.md` 6.1).

| Category | Group + CARC value | Root cause (our words) | Usual action |
|---|---|---|---|
| Prior auth missing | CO-197 | No authorization on file for a service that needs one | Appeal with the auth record |
| Eligibility terminated | CO-27 | Coverage ended before the date of service | Bill the correct payer or the patient |
| Timely filing | CO-29 | The claim arrived after the filing limit | Appeal with proof of timely submission, or write off |
| Duplicate claim | OA-18 | The service was already billed | Do not rebill; check the first claim |
| Diagnosis does not support the service | CO-11 | Diagnosis and procedure do not match | Send a corrected claim |
| Medical necessity | CO-50 | The payer judged the service not necessary | Appeal with the clinical note and the policy criteria |

## 5. The appeal process

### 5.1 Steps for a denied line

1. Read the group code, the CARC and the RARC on the 835 line.
2. Find the root cause. Decide: corrected claim, appeal, bill another payer, or write off.
3. Find the appeal deadline for the payer. If the deadline is near, raise the priority.
4. Collect the evidence: the claim, the denial, the payer policy section, and the records that the policy asks for. Disclose only the records that the appeal needs (minimum necessary).
5. Write the letter. Each statement must cite a source.
6. Get human approval before you send the appeal (approval tier 2, see `docs/architecture.md`).
7. Send the appeal. Track it. Follow up with a 276 query or a call.

Source: [P2] 2.2 (denials stage), 2.3 and 4.6. A corrected claim uses claim frequency code 7, not a new submission ([P2] 2.3).

### 5.2 Medicare appeal levels (Original Medicare, Parts A and B)

1. Redetermination by a Medicare Administrative Contractor (MAC).
2. Reconsideration by a Qualified Independent Contractor (QIC).
3. Decision by the Office of Medicare Hearings and Appeals (OMHA).
4. Review by the Medicare Appeals Council.
5. Judicial review in Federal District Court.

Source: CMS, "Original Medicare (Fee-for-service) Appeals", read 2026-10-28: https://www.cms.gov/medicare/appeals-grievances/fee-for-service . The deadline for each level is on the CMS level pages. We did not record those deadlines here.

Commercial payers have their own appeal levels and deadlines. The demo uses fictional payer rules (planned in `docs/data-plan.md`). UNVERIFIED: we did not research real commercial appeal rules.

### 5.3 Filing limits

Medicare's limit is 12 months from the date of service (42 CFR 424.44): https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-424/subpart-C/section-424.44 . Other payers set their own limits. Keep the limit for each payer in the claim record and alert before it ends ([P2] 2.3).

## 6. Edge cases to design for

| Area | Edge case | Mitigation |
|---|---|---|
| Patient | Coverage changed between booking and the visit | Run 270/271 again before the visit; block the claim if coverage is inactive |
| Patient | Wrong subscriber or date of birth | Compare the card, the 271 and the registration; flag differences |
| Coding | An invented code | Take codes only from the catalog; verify; send wide confidence sets to a human |
| Secondary claim | The secondary payer needs the primary 835 data | Build the secondary 837 after posting |
| Partial payment | The payer paid less than expected | Compare with the contract rate; add to the underpayment worklist |
| Recoupment | The payer takes money back | Posting handles negative lines and PLB adjustments |
| Duplicate | The same claim goes twice | Use an idempotency key for each claim version |
| Payer | The policy changed mid-year | Keep effective dates on policy chunks; cite the version in appeals |
| Voice | IVR menus, holds, dropped calls | IVR maps per payer, hold detection, a callback, a script that can resume |
| Voice | The rep gives wrong information | Record the rep name, the reference number and the time; read it back; check with 276/277 |
| AI | Prompt injection in denial letters or transcripts | Treat that text as data; untrusted text never triggers a tool |
| AI | Invented citations in an appeal | Citation gate: each statement maps to a retrieved chunk ID |
| AI | Model outage | Fall back, queue the work, never auto-approve on fallback |

Source: [P2] 2.3. Rules without a linked source are standard billing practice. Confirm them for each payer.

## 7. Key metrics

| Metric | Benchmark | Source |
|---|---|---|
| Initial denial rate | 11.6% average (2025) | Kodiak 2025 via HealthLeaders |
| Days in AR | 52.6 median | Kodiak 2025 |
| Clean claim rate | Target 98% or more | HFMA chapter deck 2025 |
| Appeal overturn rate | Target more than 60% | HFMA chapter deck 2025 |
| Denial rework cost | About $103 for each denial | HFMA chapter deck 2025 |
| Cost to collect | Not found in a primary 2025 source | UNVERIFIED |

Links are in `docs/rcm/research.md`.

## Sources

- [P2] "Revora Build Guide", Grok Bot Page, 2026-10-26 (private): https://cursor.com/canvas/store-2f9b6419-214d-4ae3-ba39-6b55775ac5bc/0d09f3df-55fe-44ed-b292-b147cf442cb6
- `docs/data-plan.md`, section 5 and section 6 (Forge, PR #1, not merged): https://github.com/SaiAbhijyan/arthai-health/pull/1
- `data/synthetic/scenarios.yaml` (Forge, branch `feat/phase2-synthetic-data`, work in progress).
- CMS Original Medicare appeals: https://www.cms.gov/medicare/appeals-grievances/fee-for-service
- 42 CFR 424.44: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-424/subpart-C/section-424.44
