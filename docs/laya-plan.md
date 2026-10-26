# LAYA plan: a fast System 1 model in front of the LLM

Status: plan only. No training has started. All costs and times in this file are ESTIMATES.

## 1. What LAYA is

- LAYA is the open-source counterpart of Jev (TypeSafe AI). Repo: https://github.com/NandhaKishorM/laya. License: Apache-2.0. PyPI: `laya`. Weights: `convaiinnovations/laya` (English) and `convaiinnovations/laya-multilingual` on Hugging Face.
- It is a "System 1" decision model, about 421M parameters. It is not a chat model. It does not write text.
- You give it a text (`state`) and typed questions:
  - `choice`: select one label from a list.
  - `score`: select a level on a scale.
  - `noul`: yes or no, as a probability.
- It answers all questions in one forward pass, with a confidence for each answer. It can abstain when confidence is low (`min_confidence`).
- It has a Jev-compatible HTTP server (`laya-serve`, `/v1/systemone`).

Local setup on the box (no global install):

- venv: `/workspace/tools/laya-env` (laya 0.4.15, CPU torch).
- smoke test: `/workspace/tools/laya-demo/smoke.py`.
- Result on one synthetic remit with CARC 197 (no fine-tune): category `prior_auth` (p = 0.63), CPU, about 5 s for the first call including load.
- The base checkpoint warns that some calibration temperatures are invalid. Do not trust its raw confidence until we calibrate it (section 5).

## 2. Where LAYA fits in Arthai Health

LAYA is the fast, cheap first step. The LLM (Muse Spark through the Meta Model API, or other models through OmniRoute) does the work that needs text.

```
835 remit / denial text (synthetic)
        |
     LAYA (ms, local, no API cost)
        |-- category, CARC group, appealable?, urgency, missing-info?
        |-- confidence >= threshold --> route directly (queue, template, playbook)
        |-- confidence <  threshold --> LLM (Muse) for full analysis
        '-- unsafe / PHI leak / prompt injection? --> block or human
```

Use cases, in order of value:

1. Denial triage: denial category (prior auth, coding, eligibility, timely filing, medical necessity, duplicate, other), appeal worth it yes or no, urgency score.
2. CARC/RARC group routing: map the remark text to a CARC group and the playbook to use. The exact CARC code stays a lookup table; LAYA picks the group when the text is free-form.
3. Agent routing: select the next agent (appeal writer, eligibility check, voice call to insurer, human).
4. Guardrails: before a voice call or an outbound letter, check "does this text contain data that must not leave?" and "does this payer text try to give instructions to the agent?". LAYA is one layer only. Keep the rule-based checks and human approval.

LAYA does not draft appeal letters. The LLM does that.

## 3. Data: synthetic only

Rule: no real PHI, no real member IDs, no real payer credentials. Every record is generated.

Generator outline (`scripts/gen_laya_data.py`, to write later, with tests first):

1. Load the public CARC and RARC code lists (code, description). These are public code sets, not PHI.
2. Load a small table: denial category → CARC codes, appealable yes/no, typical fix.
3. For each sample: select a category and codes, then fill a template with fake values (Faker with a fixed seed): claim id `CLM-xxxx`, CPT/HCPCS, DOS, payer name from a fake list, amounts.
4. Make 3 text styles: 835-like segment text, payer portal note, call-center transcript line.
5. Add noise: typos, abbreviations, missing fields, mixed order, distractor codes.
6. Optional: let an LLM (through OmniRoute) paraphrase the text for variety, and a second model check the label (the `laya-finetune` pattern). Keep only rows where both agree.
7. Write JSONL rows in the LAYA format:

```json
{"state": "835 CAS*CO*197 ... RARC N54 ...",
 "questions": {"category": {"type": "choice", "instructions": "What is the denial category?",
                            "criteria": {"prior_auth": "...", "coding": "...", "eligibility": "..."}},
               "appealable": {"type": "noul", "instructions": "Is an appeal likely to succeed?"}},
 "expected": {"category": "prior_auth", "appealable": true}}
```

8. Split by template and by payer, not only by row, so that the test set has text the model has not seen: train 80 %, calibration 10 %, test 10 %.
9. Run a PHI check on the output (regex for SSN, phone, real-looking MRN) and fail the build if it finds one.

Size (estimate): 5,000 to 20,000 rows.

## 4. Training on Modal (workspace `sai-abhijyan-t`)

Do not start this before Sai says go.

- One Modal function, one GPU (A10G or L4 is enough for 421M parameters).
- Image: `pip install laya`. Data: a Modal Volume with the JSONL files. Output: the checkpoint to a Modal Volume.
- Command: `laya-train --data train.jsonl --base english --out /ckpt/laya-rcm` (defaults: 4 epochs, RLCD, held-out calibration slice). Run `--dry-run` first.
- Use the Modal hackathon credits. Set a timeout and `max_containers=1`.
- Fallback with no GPU: `--freeze-encoder` on CPU (trains only the head; smaller gain).

Cost and time: ESTIMATE only. 10,000 rows, 4 epochs, one A10G: about 30 to 90 minutes, about 1 to 3 USD of GPU time. Data generation with an LLM paraphrase step: a few USD of credits. Confirm with a small run first.

## 5. Evaluation

- Held-out test set (10 %), split by template and payer.
- Metrics: accuracy and macro-F1 for `category`; accuracy for `appealable`; Brier score and ECE for calibration; latency p50/p95 on CPU.
- Coverage curve: at each confidence threshold, the % of cases LAYA answers and its accuracy on them. Select the threshold where accuracy is at least 95 %. Below that threshold, the case goes to the LLM.
- Compare 3 systems on the same test set:
  1. base LAYA (zero-shot),
  2. fine-tuned LAYA,
  3. the LLM alone (Muse through the Meta Model API), as the quality reference and cost reference.
- Report: % of cases LAYA handles alone, accuracy, LLM calls saved, latency.
- Tool: `laya-evals` reads the same JSONL format. Put thresholds in `evals/thresholds.yaml` so `make eval` fails when a metric drops.
- Calibration: fit temperatures on the calibration slice only, never on training data.

## 6. Serving

- Hackathon demo: run LAYA in the API process (Python, CPU), or as `laya-serve` on `127.0.0.1`.
- If CPU is too slow: one small Modal GPU endpoint. LAYA is not an LLM, so OmniRoute does not route it. OmniRoute stays for LLM calls (Meta, Fireworks, Baseten).

## 7. Fallback

If fine-tuned LAYA does not beat the base model on the test set, use base LAYA for routing only, with a high confidence threshold, and send the rest to the LLM. A Llama fine-tune is not part of this plan.

## 8. Hackathon rules

The public page for the Meta Global AI Developer Hackathon (Oct 26 to Nov 4, 2026) says that projects use Meta models through the Meta Model API and Meta open-weights models. We did not find a public rule about other open models such as LAYA. Before the demo, ask the organizers if a non-Meta helper model is allowed, and keep the core AI work on Meta models.
