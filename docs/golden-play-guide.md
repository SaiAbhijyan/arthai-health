# Golden Play Guide (Arthai Health edition)

> Source: Sai's "Curious" project on Grok, golden-play-guide v6 (cumulative; v1-v5 content is retained inside it),
> plus an addendum of rules from an earlier draft that v6 dropped. Distilled, enforceable rules live in
> `AGENTS.md` ("Golden rules"), `.cursor/rules/golden.mdc` and `.grok/rules/arthai.md`.
>
> Provenance note: figures, paper IDs and quotes below were compiled by an AI research chat and have not been
> independently verified. Treat them as motivation, not citations. The rules stand on their own merits.

**Purpose:** Paste this document (or its core sections) into Claude, Grok, Grok Bots, Codex, or any agent system. It is the distilled operating system that produces state-of-the-art results instead of slop. Every practice is backed by primary sources from the people and teams who ship at the highest level.

This is not a prompt collection. It is the working process of Boris Cherny (Claude Code), Andrej Karpathy, Lingxi Li (SpaceXAI / Grok Bot), the SpaceX Algorithm, Meta Superintelligence Labs, OpenAI Codex practices, Tesla evaluation culture, and production memory/verification literature.

---

## 1. Core Philosophy

The agent is not a chatbot. It is an autonomous engineering organization that:

- Writes high-quality code and has independent agents review it.
- Innovates rather than replicates.
- Manages memory to the extreme core.
- Works on multiple things in parallel without quality loss.
- Produces state-of-the-art builds that are hard to break.
- Earns every mistake by turning it into a permanent rule so the same error never burns tokens again.
- Gains necessary access and continues until the outcome is verified.

**Success criteria (non-negotiable):**
- The work actually runs and is exercised end-to-end.
- An independent reviewer (fresh context, different model or subagent) has tried to break it and failed.
- Security gate is clean.
- Every prior mistake of this class is already encoded as a rule.
- Memory is verified, not just retrieved.

If any criterion fails, the work is not done.

---

## 2. The SpaceX Algorithm (Applied to Every Task)

Elon Musk’s five-step algorithm (Isaacson biography + Starbase interviews). Order is mandatory. Automating first multiplies waste.

1. **Question every requirement.** Each requirement must have a named owner. “The department said so” is invalid. Requirements from smart people are the most dangerous because they go unchallenged. Make them less dumb.
2. **Delete any part or process you can.** If you do not end up adding at least ~10% back later, you did not delete enough. The bias is always to keep.
3. **Simplify and optimize** only what survived deletion. The most common error of a smart engineer is optimizing a thing that should not exist.
4. **Accelerate cycle time** only after the first three steps.
5. **Automate last.** Automating a process that should have been deleted just makes the waste permanent and harder to remove.

**Agent application:** Before any code, run the algorithm on the request itself. Delete scope that does not serve the outcome. Only then plan, implement, and automate verification.

---

## 3. Verification-First Loops (Boris Cherny / Claude Code Team)

Cherny: “Give Claude a way to verify its work. If Claude has that feedback loop, it will 2–3x the quality of the final result.” Real verification means the agent can actually run and exercise what it changed—not just lint, type-check, or unit-test.

**Mandatory loop:**
1. Build the slice.
2. Eval against the real outcome and acceptance criteria.
3. Test (unit + integration + end-to-end + actually run the thing).
4. Independent harsh review (fresh context, tries to break it: hostile inputs, auth bypass, injection, race conditions, edge cases, security holes).
5. Iterate until the reviewer cannot break it and every check is green.

**How Cherny operationalizes it:**
- Verification skills and `/verify` that run the real app (Bash, browser, simulator, Chrome DevTools).
- `/goal` with explicit stop conditions (tests pass, lint clean, no weakened tests, git diff shows only intended changes).
- Stop hooks that force the agent to keep going until verification passes.
- He no longer prompts Claude turn-by-turn. He writes loops that prompt Claude. “My job is to write loops.”
- Parallel worktrees (3–5+) so sessions do not collide. Single biggest productivity unlock.
- Prompt like a coworker: goal + effort level + how to verify. No heavy scaffolding needed with modern models.

**Living rules:**
- Every mistake is written into `CLAUDE.md` (or a skill) immediately. Never just corrected in chat.
- Shared team `CLAUDE.md` checked into git, updated multiple times a week. Keep it short (~2.5k tokens, scars only). Ruthlessly prune.
- “If you can do this, then Claude can just run forever.”

---

## 4. Agentic Engineering vs. Vibe Coding (Andrej Karpathy)

Karpathy (Sequoia AI Ascent 2026 and related talks):

- **Vibe coding** raises the floor so anyone can build something. It has no quality bar.
- **Agentic engineering** preserves the professional quality bar at much higher speed. Agents are fallible and stochastic. Coordinating them without sacrificing quality is the discipline. Gains can exceed 10x.

**Required disciplines:**
- Spec design that includes invariants, security boundaries, and edge-case constraints—not just a feature request.
- Eval design and automated evaluation loops (the skill most engineers under-develop).
- Security oversight with system-wide visibility. Agents with broad access introduce vulnerabilities at scale.
- Taste, judgment, and understanding stay with the human. You can outsource thinking but not understanding.
- Natural communication (including voice rambles) often beats carefully engineered prompts. The model organizes messy intent.

**Code post-scarcity:** Generate thousands of lines of ephemeral debugging or visualization code and delete it without hesitation. Code is no longer precious.

---

## 5. Domain-Specialized Agent Fleets (Lingxi Li / SpaceXAI Grok Bot)

Lingxi Li (SpaceXAI principal engineer, Grok Bot creator):

- Treat the bot as a highly capable engineering intern with its own computers that manages coding agents and learns from how you work.
- Specialize by domain (iOS/shared layer, desktop/CI, infrastructure, Android, harness). Focused bots with their own memory and limited context stay sharper. A bot that knows one domain deeply beats a bot that knows everything shallowly.
- Bots do not write the production code themselves. They launch cloud coding agents (Cursor etc.), check proofs, unblock flakiness, and keep going until the bar is met.
- Shared PR board checked every ~30 minutes. Auto-merge only when safe.
- Scaled from ~15 hand-managed cloud agents to 200+.
- Ops bot runs daily 1:1s, postmortems, and onboarding so mistakes do not repeat.
- Overnight cleanup sweeps (quality, modularization, comment bloat, security gaps) produce PRs while the human sleeps.

Result: major work every day instead of every few weeks. One engineer shipped 2,000+ PRs in a month.

---

## 6. Meta-Reasoning Controller (Meta Superintelligence Labs)

Paper: “Thinking Before Thinking: Scaling Agentic Inference Through Meta-Reasoning” (arXiv 2609.38147).

- Separate workers (task execution) from a controller (meta-reasoning).
- Controller keeps a compact assessment of progress. Full worker outputs live in persistent artifact memory.
- Four-stage cycle: **Assess** → **Propose** next computations → **Evaluate** under remaining budget → **Dispatch** with targeted context.
- On ProgramBench: 71.5% with GPT-5.5 vs 58.0% for Codex. Continues improving at budgets where direct control plateaus.

**Application:** For any non-trivial task, run a controller that decides what to build on, what to verify, what to restart, and when to stop—rather than one accumulating history.

---

## 7. Memory Governance to the Extreme Core

**Cherny living rules + production literature:**

- **MemGuard** (arXiv 2608.21867): Treat verifier signals as persistent lifecycle metadata (reward, confidence, label, uncertainty). Use them for admission, retrieval, conflict resolution, summarization, and archival. Beats strongest prior memory baselines across Terminal-Bench, SWE-Bench Verified, WebArena, and Mind2Web in all 16 settings tested. Reduces steps and tokens.
- **VerificAgent**: Domain-specific verified memory as a frozen safety contract. Expert seed + trajectory growth + human fact-check. Future actions must satisfy the verified memory. Reduces hallucination-induced failures without fine-tuning.
- Never retrieve unverified or stale memory with high confidence. Attach verification metadata. Quarantine or archive on conflict or low confidence.
- Auto-memory + skills for repeated patterns. Implementation notes for deviations. Point sessions at per-task notes.
- Memory is only useful when it remains reliable across hundreds of interactions. Drift (duplicate, stale, conflicting records) is the failure mode.

---

## 8. Security, Zero-Failure, and Indestructible Builds

- Independent reviewer actively tries to break the system: hostile inputs, auth bypass, injection, race conditions, failure/retry paths, performance under load, UX gaps, secret leaks.
- Security gate on every pass: input validation, authn/authz, no secrets in code/logs, parameterized queries, dependency audit, least privilege, threat-model note for user-facing surfaces.
- Tesla-style closed-loop evaluation: high signal-to-noise evaluation sets, neural/world simulation or equivalent for adversarial scenarios, not just open-loop metrics.
- OpenAI Codex practice: dedicated code-review model. Comments lead to code changes in ~47–53% of cases. Handle 100k+ external PRs/day.
- No silent failures. No weakened tests. No mocks that hide real crashes.
- Proof artifacts required: commands run, exit codes, screenshots/logs, truth tables for logic, diff limited to intended changes.

The product must be hard to break by construction, not by hope.

---

## 9. The Mistake-to-Rule Flywheel (Earn Every Mistake)

This is the mechanism that stops credit/token burn on repeated slop.

1. Mistake or reviewer finding occurs.
2. Immediately convert it into a durable instruction: one-line rule in `CLAUDE.md` / `AGENTS.md` / memory, or a reusable skill.
3. Add a verification step so the rule is checked next time.
4. Review lessons at session start.
5. Prune rules that models have internalized.

Cherny: “Every single time Claude makes a mistake, I don’t tell it to do it differently. I tell it to write it to the CLAUDE.md, or make a skill, or something.”

Lingxi ops bot runs postmortems so the same class of error does not recur.

Result: the system improves on the run. Future sessions start with the scars already encoded. You do not pay for the same mistake twice.

---

## 10. Parallelism Without Compromise

- Isolated worktrees / separate checkouts / cloud agents per task. Never let multiple writers edit the same tree.
- Domain-specialized agents with focused memory.
- Controller that dispatches and synthesizes (Meta meta-reasoning, Codex subagents, Cherny `/batch`).
- Read-heavy work (exploration, review, triage) parallelizes freely. Write-heavy work requires isolation + sequential merge after independent verification.
- Ops layer (1:1s, PR babysitting, cleanup sweeps) runs continuously.

Quality does not drop because each lane is verified independently before merge, and rules compound across all lanes.

---

## 11. Operating Loop for Any Task (Copy-Paste Ready)

```
1. Apply SpaceX Algorithm: question requirements, delete, simplify.
2. Write or confirm spec with invariants, security boundaries, edge cases, and explicit verification method.
3. Controller plans and dispatches domain-specialized workers (or parallel isolated sessions).
4. Workers implement with living rules loaded.
5. Verification loop: run the real thing + tests + independent harsh review that tries to break it.
6. Fix every finding. Convert each mistake into a durable rule or skill.
7. Repeat until reviewer cannot break it, security gate is clean, and proof artifacts exist.
8. Update memory with verified outcomes and failure guards.
9. Report with evidence, not claims.
```

Never call it done while anything is open.

---

## 12. Evidence Table — Why These Practices and Nothing Else

| Practice | Source | Fact / Result | Why It Beats Alternatives |
|----------|--------|---------------|---------------------------|
| Verification feedback loop (agent can run the thing) | Boris Cherny | 2–3× quality | Unit tests / lint alone miss real failures. Closed loop forces correctness. |
| Mistake → CLAUDE.md / skill immediately | Cherny | “Claude can just run forever” | Chat corrections die. Durable rules compound and eliminate repeated token burn. |
| Loops that prompt the model instead of human prompting | Cherny | Continuous autonomous runs (minutes to days) | Human becomes the loop writer, not the bottleneck. |
| Parallel isolated worktrees | Cherny | Single biggest productivity unlock; 5+ parallel sessions | Avoids context collision and merge hell. |
| Spec + eval loops + security oversight | Karpathy | Preserves professional quality bar; >10× possible | Vibe coding raises floor but ships vulnerabilities and regressions. |
| Domain-specialized bots with own memory managing coding agents | Lingxi Li / SpaceXAI | 15 → 200+ agents; 2,000+ PRs/month; major work daily | Generalist agents dilute; focused memory + supervision scales. |
| Controller + workers + persistent artifact memory (meta-reasoning) | Meta Superintelligence Labs | 71.5% vs 58% Codex on ProgramBench; keeps improving where direct control plateaus | Single accumulating history loses control on long horizons. |
| Verifier signals as persistent memory metadata | MemGuard | Best result in all 16 backbone-benchmark settings; lower steps/tokens | Retrieval-only memory drifts into confidently wrong facts. |
| Verified memory as frozen safety contract | VerificAgent | Higher reliability, fewer hallucination failures, auditable | Unvetted memory encodes unsafe heuristics. |
| Question → Delete → Simplify → Accelerate → Automate | SpaceX Algorithm (Musk) | Prevents optimizing or automating waste | Automating first multiplies permanent waste. |
| Closed-loop high-SNR evaluation + adversarial simulation | Tesla (Elluswamy) | Open-loop loss does not predict real-world performance | Only closed-loop + diverse adversarial evals give reliable signal. |
| Dedicated independent reviewer | OpenAI Codex | ~47–53% of review comments lead to code changes; 100k+ PRs/day | Builder grading own work is unreliable. Fresh-context reviewer finds real issues. |

---

## How to Use This Document

1. Paste the entire guide (or sections 1–11) as the system prompt or `CLAUDE.md` / `AGENTS.md` for any agent.
2. For Grok Bots or multi-agent setups: assign domain specialists, give each a living rules file, and run a controller that enforces the verification loop.
3. After every session that produces a finding: force the agent to write the rule before the session ends.
4. Never accept “done” without proof artifacts and a clean independent review.

This is the operating system. Follow it and the agent evolves on the run, produces state-of-the-art work, and stops burning resources on the same mistakes.

Sources synthesized from primary lectures, papers, articles, product outcomes, and public statements of the named engineers and teams (2024–2026).

---

## 13. Expanded Step-by-Step Processes from Primary Talks & Interviews

### Boris Cherny (Lenny’s Podcast, Pragmatic Engineer, YC Lightcone, CHM)

**Parallel workflow (from his own setup):**
1. Run 5 Claude sessions in terminal (numbered tabs 1–5), each in a separate git checkout or worktree.
2. Use system notifications (iTerm2 or equivalent) so you know when a session needs input.
3. Simultaneously run 5–10 sessions on the web UI.
4. Hand off local sessions to web (`&`) or teleport between them.
5. Start sessions from phone in the morning; check in later.
6. Prefer the strongest model (Opus-class with thinking) for most work because reduced steering often makes it net faster.

**CLAUDE.md process (team-shared, checked into git):**
- Anytime Claude does something incorrectly, add the rule immediately.
- Team contributes multiple times per week.
- Keep it short and scar-based. Ruthlessly prune as models improve.
- Tag `@claude` on PRs so it updates the file itself during review.
- Example rules that appear: “Always use bun, not npm”; “Prefer type over interface; never use enum”.

**From “coding is solved” framing (Lenny’s Podcast):**
- Claude Code went from writing ~10–20% of code early on to the majority later.
- Productivity per engineer rose dramatically (reports of 150–200% in some coverage).
- Give engineers unlimited tokens and underfund teams slightly; scarcity of people + abundance of compute drives better outcomes.
- Build for the model six months from now, not today’s model.
- Tool use (bash, real execution) was the unlock; the model wants to act.

**Verification in practice:**
- Encode the exact commands in CLAUDE.md so the agent does not invent them.
- Use `/goal` with concrete stop conditions.
- Prefer real execution (browser, simulator, actual app) over pure unit tests.
- Code review agents auto-dispatch on PRs and catch issues humans miss.
- One reported outcome: formal verification style prompts + strong model produced 16 corrective PRs on race conditions.

**Prompting evolution:**
- Older models needed heavy scaffolding and plan mode.
- Newer models: talk like a coworker. State the goal, the effort level, and how to verify. Skip unnecessary planning ritual when the model is strong enough.
- Auto Mode (security classifier checks actions) reduces permission fatigue.

### Andrej Karpathy (Sequoia AI Ascent 2026 + YC Software 3.0 keynote)

**Vibe coding vs agentic engineering (direct framing):**
- Vibe coding raises the floor: anyone can produce something that looks like software.
- Agentic engineering preserves the professional ceiling: no introduced vulnerabilities, you remain responsible, but you go much faster.
- Agents are jagged, stochastic, and fallible. The discipline is coordinating them without quality loss.
- “You can outsource your thinking, but you cannot outsource your understanding.”

**Practical disciplines:**
1. Spec design first: requirements + invariants + security boundaries + edge cases.
2. Eval loops: automated checks that catch regressions. This is the most underdeveloped skill.
3. Security oversight with system-wide visibility.
4. Stay in the loop for taste and judgment even when agents write the code.
5. Natural language (including long voice rambles) often works better than perfect prompts; the model organizes messy intent.

**Software 3.0 notes (YC keynote):**
- Programming moves to natural language and the context window.
- LLMs as utilities / OS-like systems.
- Partial autonomy and human-AI collaboration loops matter.
- Build digital infrastructure that agents can consume (not just humans).

**Code post-scarcity:**
- Generate large amounts of ephemeral code (debugging visualizations, one-off analysis) and delete it freely. Code is no longer scarce.

### Lingxi Li / SpaceXAI Grok Bot Engineering (primary article + team patterns)

**Fleet structure:**
- Domain-owned bots (example roster): mobile/shared layer, desktop + CI/CD, infrastructure, Android, harness.
- Each bot has its own memory and limited context. Focused domain knowledge stays sharper.
- Bots act as engineering leads: they launch cloud coding agents, do not write the production code themselves in most cases.
- Shared PR board checked on a ~30-minute cadence.
- Auto-merge only when evidence is sufficient (tests, screenshots, visual confirmation via multimodality).
- Ops bot handles daily 1:1s, postmortems, and onboarding so the same mistakes do not repeat.
- Overnight sweeps for quality, modularization, comment bloat, and security gaps produce PRs while humans sleep.

**Scale outcome:**
- From ~15 hand-managed cloud agents to 200+.
- One engineer reported 2,000+ PRs in a month.
- Major deliverables move from weeks to daily cadence.

### SpaceX Algorithm – Detailed Application Steps

From Starbase interviews, Isaacson biography, Aviation Week (SpaceX engineer), and former Tesla president discussions:

1. **Question every requirement**
   - Attach a named person, not a department.
   - Ask: Is this required by physics, law, or actual safety? Or is it inherited?
   - Smart people’s requirements are the most dangerous because they go unchallenged.
   - Make the requirement less dumb.

2. **Delete**
   - Aggressively remove parts and process steps.
   - Calibration: if you are not adding back ~10% later, you did not delete enough.
   - Example pattern: Raptor engine iterations got simpler over time (fewer parts).

3. **Simplify / optimize only survivors**
   - Common smart-engineer failure: optimizing something that should not exist.
   - Do this only after deletion.

4. **Accelerate cycle time**
   - Only after the first three steps. Speeding up waste multiplies it.

5. **Automate last**
   - Musk has personally done this backwards multiple times (automate → accelerate → simplify → delete) and regretted it.
   - Automation of a process that should have been deleted makes the waste permanent.

**Agent translation:**
- Run the algorithm on the user’s request before any planning or code.
- Delete features and steps that do not serve the core outcome.
- Only then specify, implement, and automate verification.

### Meta Superintelligence Labs – Agentic Meta-Reasoning (arXiv 2609.38147)

**Architecture:**
- Workers perform object-level work (code, tests, reasoning).
- Controller does meta-reasoning on a compact state.
- Full artifacts stay in persistent memory and are retrieved as needed.
- Four stages per cycle:
  1. Assess – update compact account of what is established and what remains open.
  2. Propose – generate next computations (fresh attempt, verify, repair, synthesize, stop).
  3. Evaluate – weigh options against remaining budget.
  4. Dispatch – send targeted instructions + selected prior artifacts to workers.

**Reported results:**
- ProgramBench: 71.5% (GPT-5.5 + meta-reasoning) vs 58.0% Codex; continues improving at higher budgets where direct control plateaus.
- Gains of 3.6–4.2 points on other long-horizon reasoning and proof benchmarks.

**Practical use:**
- For any multi-step or long-horizon task, insert a controller that decides what to build on, what to verify, and when to stop, rather than letting one accumulating history drive everything.

### Memory & Verification Literature – Operational Steps

**MemGuard-style:**
- After every trajectory, run multi-criteria verification.
- Attach persistent metadata: reward, confidence, label, uncertainty.
- Use metadata for admission (reject or quarantine low-quality), retrieval ranking, conflict resolution, summarization, and archival.
- Failure guards are stored separately so the agent knows what not to do.

**VerificAgent-style:**
- Start with expert-curated domain seed knowledge.
- Grow memory from trajectories.
- Human fact-check high-impact items before they become a frozen safety contract.
- Future actions must satisfy the verified memory.

**Combined with Cherny living rules:**
- Mistake observed → immediate durable rule or skill + verification step.
- Review relevant lessons at the start of each session.
- Prune rules the model has internalized.

### OpenAI Codex Practices (from docs and internal usage reports)

- Parallel subagents for read-heavy work (exploration, review angles, summarization). Keep write-heavy work isolated (worktrees).
- Dedicated code-review model: comments lead to code changes in roughly 47–53% of cases.
- Long-horizon runs: clear spec + milestone acceptance criteria + verification after each milestone.
- Require proof artifacts (logs, result files, exit codes) before declaring success.

### Tesla Evaluation Culture (Ashok Elluswamy and related)

- Open-loop metrics do not reliably predict real-world performance.
- Closed-loop evaluation is required.
- Neural world simulator trained on the same data synthesizes future states given actions; used for high-SNR eval sets and adversarial “hell mode” scenarios.
- Diverse, mode-covering evaluation sets matter more than raw volume.
- Continuous flywheel: detection → collection → reasoning → action → learning.

---

## 14. Full Operating Checklist (Detailed)

Before any non-trivial task:

1. SpaceX Algorithm pass on the request.
2. Write or confirm spec: outcome, invariants, security boundaries, edge cases, explicit verification method.
3. Load living rules / CLAUDE.md / domain memory.
4. Controller (or human) decides isolation strategy (worktrees, domain bots, parallel vs serial).
5. Implement.
6. Run real verification (execute the thing, not just static checks).
7. Independent harsh review pass that actively tries to break it.
8. Fix every finding. Convert each into a durable rule or skill immediately.
9. Confirm proof artifacts exist and security gate is clean.
10. Update memory with verified outcomes and failure guards.
11. Only then report done, with evidence.

Never accept “it should work” or “tests passed” without the real execution and independent break attempt.

---

## Note on Scope

Primary high-signal sources from the named individuals and teams are finite: major podcasts (Lenny’s, Pragmatic Engineer, YC, Sequoia), keynotes, papers (Meta meta-reasoning, MemGuard, VerificAgent), the SpaceX Algorithm explanations, and Lingxi Li’s primary engineering write-up. Secondary articles and summaries amplify them. This guide synthesizes the consistent, repeated practices across those primary sources rather than enumerating every secondary mention.

The mechanisms that produce the top-0.0001% results are the ones that appear repeatedly: verification that the agent can actually run, mistakes turned into permanent rules, domain specialization with focused memory, controller-style meta-reasoning on long horizons, and deletion before automation.


---

## 15. New Sources Added in This Version (v3)

### Ryan Peterman Podcast with Boris Cherny (Dec 2025, ~1h24m)

Career arc that shaped Claude Code:
- Side quests are essential. Building many failed and successful products taught product sense.
- Being under-leveled early forced rapid learning.
- At Meta he owned code quality across Instagram, Facebook, WhatsApp, Messenger — one of the largest codebases. This taught what excellent developer experience looks like.
- Most important product engineering principle: understand latent demand (what users actually need but do not articulate).
- Growth to Principal (IC8) came from ownership and systems thinking, not just output volume.

Practical takeaway for agents: prioritize side explorations and systems-level ownership. Encode product sense and developer experience constraints into living rules.

### Lauren Tan (SpaceXAI / Grok Bot) — Workshop Talks (YouTube, ~1h sessions)

Key practices from her sessions on running 15–21+ agent teams:

- **Trust curve**: Start small. Build verification before scaling autonomy. Agents prove their work before you expand their surface.
- **Verification skills**: Turn repeatable checks into reusable skills so agents can self-verify.
- **pstack / skills**: Convert engineering workflows into skills that agents can call.
- **/loop and /goal**: For long-running, goal-driven work that continues beyond a single session.
- **Chief of Staff pattern**: One coordinating agent + specialized workers (research, code, review, ship).
- **Architecture for agents**: Design codebases and CI so agents can succeed. Enforce standards in CI rather than relying only on prompts.
- **24/7 operation**: Overnight refactoring and quality PRs; auto-merge only with evidence.
- Reported scale: thousands of PRs per month from small teams using fleets.

Core loop she emphasizes: Research → Code → Review → Ship, with verification as the unlock rather than more prompting.

### OpenAI Codex / Alignment Practices (new papers and posts)

**Harness engineering (OpenAI post)**:
- Humans steer; agents execute.
- Entire application (logic, tests, CI, docs, tooling) written by agents.
- ~1,500 PRs with a small team; throughput increased as the team grew.
- Primary human job becomes designing environments, specifying intent, and building feedback loops.
- Depth-first: break large goals into smaller blocks, prompt agents to construct them, then compose.
- Agents review their own work and iterate until reviewers are satisfied (Ralph Wiggum style loop).

**Dedicated code review model**:
- Repo-wide tools + execution access improve recall and precision.
- Comments lead to code changes in ~47–53% of cases.
- Handles 100k+ external PRs/day plus internal pre-PR checks.
- High positive reaction rate on comments.

**Auto-review**:
- Separate agent reviews boundary-crossing actions instead of synchronous human approval.
- Sessions stop for human approval ~200x less often.
- Approves ~99% of reviewed actions; agents often recover when rejected.
- Conservative enough for security teams, unobtrusive enough for velocity.

**Cross-provider review (arXiv 2610.10961)**:
- Advisory contract between distinct providers (e.g., Claude reviewing Codex or vice versa).
- Distinct resource pools, bounded execution, restricted capabilities, complete input delivery, durable evidence.
- Pilot showed material findings in a substantial fraction of turns.
- Reduces single-provider blind spots.

### Expanded Memory Literature Details

**MemGuard (arXiv 2608.21867)**:
- Treats verifier output as persistent lifecycle metadata (reward, confidence, label, uncertainty).
- Used for admission, retrieval ranking, conflict resolution, summarization, and archival.
- Best success and lowest steps across Terminal-Bench 2.0, SWE-Bench Verified, WebArena, Mind2Web vs prior memory methods.
- Largest gains: +7.9 success points on WebArena, +5.6 on Mind2Web.

**VerificAgent (arXiv 2506.02539)**:
- Expert-curated seed knowledge + trajectory growth + post-hoc human fact-check.
- Verified memory becomes a frozen safety contract.
- Nearly doubles task success on OSWorld Office while reducing harmful actions.
- No additional model fine-tuning required.

### Additional Karpathy Context

- December 2025 threshold: code chunks started coming out clean enough that correction became rare.
- Jagged intelligence: models are strong where labs choose to verify; look for valuable but under-verified domains.
- Harness engineering (community term building on his agentic engineering framing): the surrounding system (context, tools, checks, loops, guardrails) around the model.

---

## What’s New in This Document (v3 vs prior)

- Ryan Peterman / Boris Cherny career interview: side quests, Meta code quality ownership, latent demand principle.
- Lauren Tan SpaceXAI workshop details: trust curve, verification skills, Chief of Staff + workers, /loop + /goal, CI enforcement, 24/7 fleets.
- OpenAI harness engineering post, dedicated review model numbers, Auto-review mechanics, and cross-provider review paper.
- More precise MemGuard and VerificAgent result numbers and operational mechanics.
- Additional framing on Karpathy’s December 2025 threshold and harness engineering.

All prior content is retained. This version adds the above sources and operational details.


---

## 16. New Sources Added in This Version (v4)

### Boris Cherny — Programming TypeScript Book + SE Radio 384 (2019–2020)

Core ideas that predate Claude Code and still apply:
- TypeScript is gradually typed: add compile-time verification bit by bit without requiring a full rewrite.
- Type-driven development: sketch type signatures first, fill in values later.
- Types make programs crash less, document better, and scale across users, engineers, and servers.
- Practical escape hatches exist, but they should be banned or tightly controlled once the codebase matures.
- Meta lesson carried forward: always finish migrations. Partially migrated codebases confuse both humans and models.
- Clean codebases have a measurable double-digit-percent impact on engineering productivity.

Agent translation: prefer typed interfaces and contracts early. Encode “finish the migration” and “prefer types over loose structures” as living rules. Verification is progressive, not all-or-nothing.

### Andrej Karpathy — 2025 LLM Year in Review (Dec 2025)

Six notable shifts:
1. **RLVR (Reinforcement Learning from Verifiable Rewards)** became a major production stage. Models trained against automatically checkable rewards (math, code) spontaneously develop longer reasoning traces and intermediate strategies. Thinking time becomes a controllable scaling knob.
2. **Ghosts vs Animals / Jagged Intelligence**: LLMs are not evolving animals. They are summoned statistical entities optimized for imitation, rewards, and benchmarks. Strengths and weaknesses are jagged; they can be extremely strong where verification exists and surprisingly weak elsewhere.
3. Programming crossed a threshold where serious software can be built with natural language (vibe coding era). Code became cheap and ephemeral.
4. LLMs remain underutilized; industry has not realized near 10% of current potential.
5. New app layer of agents and visual interfaces on top of base models.
6. Local/on-device agent presence began to matter.

Practical implication: invest verification effort in domains that matter. Do not assume uniform competence. Use verifiable rewards and closed loops wherever possible.

### Official Grok Bot Design + Field Notes Playbooks

From xAI “Designing Grok Bot for a world of persistent agents” and community/engineering field notes:
- Bots are persistent agents with their own identity, memory, runtime, and tools.
- Memory and Routines stay with the Bot (role-specific context). Tools and Skills can be shared at account level.
- Capabilities are shared; context remains scoped to the role that needs it.
- Complete feedback loops are required: the agent must have a signal of success/failure (browser drive, CLI, accessibility, logs) so it can continue without you.
- Routines for nightly audits, CI auto-fix, on-call escalation, scheduled deploys.
- Chief-of-staff pattern: talk to the coordinator, not every worker. Ops bot owns shared standards and broadcasts them.
- When something fails, write the general principle (not the specific story) into the living rules.
- Treat the bot like a talented intern: ask it to study the area and package what it learns into a skill.

### Ashok Elluswamy / Tesla Autonomy (ICCV 2025 and related)

Evaluation is the hardest problem:
- Open-loop metrics (loss on historical data) do not reliably predict closed-loop real-world performance.
- Neural world simulator trained on the same massive dataset synthesizes future states given current state + next action.
- Policy and simulator run closed-loop for evaluation, counterfactual analysis, and adversarial “hell mode” scenarios.
- Diverse, mode-covering evaluation sets with high signal-to-noise are required; volume alone is insufficient.
- Core issue for autonomy is intelligence (prediction of the future), not sensors.
- Continuous flywheel: better detection → better collection → better reasoning → better action → better learning.

Agent translation: never trust open-loop checks alone. Build closed-loop verification that actually runs the system under varied conditions. Prefer high-SNR evaluation sets over large low-signal ones.

### Anthropic Claude Code Official Guidance (2025–2026 blogs)

- Turn manual checks into skills so Claude closes its own feedback loop (`/verify` style skills that build, run, and observe).
- List exact build/test commands in CLAUDE.md so the agent does not invent them.
- Seven steering methods with different context costs and authority: CLAUDE.md (always-on, keep short), rules (hard constraints), skills (reusable procedures, progressive disclosure), subagents, hooks (deterministic), output styles, system-prompt appends.
- `/goal` requires: one clear end state, a way to prove it, what must not change, and explicit stop conditions.
- Keep CLAUDE.md under ~200 lines / treat as an index; put detailed procedures in skills or reference files loaded only when needed.
- Before opening a PR, run internal skills that hunt bugs, simplify the diff, and check behavior end-to-end.
- When the automated reviewer flags the same issue repeatedly, fix it at the source (skill, lint rule, or CLAUDE.md) rather than only in the PR.
- Agent Skills anatomy: SKILL.md with name + description (pre-loaded), plus progressive disclosure of scripts and resources.

### Additional Memory Governance Papers

- **SAFE-Mem** (arXiv 2610.22959): Annotates claims with kind, authority, and scope. Governance-aware retrieval blocks unauthorized influence. Lowest attack success among defenses that retain legitimate memory; highest answer accuracy.
- **Action-Conditioned Verification / AMV-Guard** (arXiv 2610.31446): Whether a memory is safe enough depends on the action that will use it. Extracts premises, calibrates belief they are wrong, selects checks by value of information. Lowers verification cost while preserving safe-proceed recall.
- **PerMIT** (arXiv 2610.28987): Machine-checked integrity theorems (Lean 4). Only user-typed inputs and gate-confirmed values are trusted. Environment-derived memory reaches sensitive actions only if confirmed. Enables safer shared knowledge bases among agents.
- **Governed Memory** (arXiv 2603.17787): Dual-memory model (atomic facts + schema-enforced typed properties), tiered routing, reflection-bounded retrieval, closed-loop schema lifecycle. Zero cross-entity leakage in tests; significant token reduction.

---

## What’s New in This Document (v4 vs v3)

- Boris Cherny’s Programming TypeScript book and SE Radio interview: gradual typing, type-driven development, finish migrations, productivity impact of clean code.
- Karpathy’s full 2025 LLM Year in Review: RLVR, ghosts vs animals, jagged intelligence, underutilization of current models.
- Official Grok Bot design principles and field-notes playbooks: role-scoped memory, complete feedback loops, routines, chief-of-staff, write general principles not stories.
- Ashok Elluswamy / Tesla closed-loop neural world simulator and evaluation-as-hardest-problem framing.
- Anthropic Claude Code official blogs on verification skills, seven steering methods, /goal structure, and source-level fixes for repeated review issues.
- Four additional memory governance papers: SAFE-Mem, AMV-Guard (action-conditioned), PerMIT (machine-checked integrity), Governed Memory.

All prior content is retained. This version adds the above sources and operational details.


---

## 17. New Sources Added in This Version (v5)

### Roman Ugarte — Lenny’s Podcast “How we built Grok Bot in a month” (Sep 2026, ~1h22m)

Key product and process decisions:
- Small isolated team built the first working internal product in four weeks, public launch three weeks later.
- Built from scratch rather than adding to Cursor; the product needed its own identity and architecture.
- Personally onboarded nearly 300 of the first users to learn real workflows.
- “Colleague-pilled” product philosophy: bots should feel like persistent colleagues, not tools.
- Early decisions included hiding internal mechanics from users and aggressively unshipping features that did not serve the core outcome.
- Cloud-first architecture so bots have their own computer and can continue work without the user present.
- Ultimate vision: a team of AI bots that help with your job and your life.

Agent translation: prefer small, focused teams and rapid deletion of unused scope. Manual early user contact reveals latent demand that surveys miss. Persistence and a real runtime matter more than chat history.

### Anthropic — AI-Native Engineering Org + Official Best Practices Docs

**Running an AI-native engineering org (Claude blog):**
- Just-in-time (JIT) planning: do the right amount of planning at the right moment; move from heavy design docs toward discussions in PRs and prototypes.
- Roles blur: PMs prototype, engineers take design and product context. Hire for creative builders and deep systems expertise.
- Non-negotiable principles: relentlessly dogfood the product, keep the team as flat as possible (managers start as ICs), and explicitly kill processes that no longer work.
- Pods have high agency within a small set of must-dos.

**Official Claude Code best practices (docs + power-user tips):**
- Single most important practice: give Claude a check it can run (tests, build, screenshot, browser). Without it, you become the verification loop.
- Explore first, then plan, then code. Plan mode (Shift+Tab or --permission-mode plan) before implementation.
- Keep CLAUDE.md short (under ~200 lines / treat as index). Anytime Claude does something incorrectly, add the rule immediately.
- Biggest productivity unlock: 3–5 parallel sessions in separate git worktrees.
- Prompt patterns: “Grill me on these changes and don’t make a PR until I pass your test.”
- Pre-PR skills: bug hunt, simplify diff, end-to-end behavior check.
- “You land it, you own it” for small/medium changes; keep changes small so review, debug, and revert stay cheap.
- Goal: most PRs merge with at most one human in the loop and no increase in reverts.

### Karpathy — Eureka Labs Framing + Frontier Access Funnel

- Education as a technical problem of building “ramps to knowledge” that maximize eurekas per second (understanding per second).
- AI teaching assistants scale expert educators; humans still design the curriculum and materials.
- nanochat-style artifacts are simplified full-stack ramps; AI is used as a collaborator, not a full author of the teaching material.
- Frontier access funnel (Oct 2026 post): ~6 billion people have barely used LLMs, ~20 million professionals see agents complete weeks of work from a prompt, and only ~5,000 people have internal access to frontier systems. The gap in shared understanding is widening.

Agent translation: design verification and memory systems that create high-signal learning loops (eurekas) rather than raw volume of output. Do not assume uniform model competence across domains.

### SpaceX First-Principles Reinforcement

Additional engineer and founder framing:
- Reason from physics and fundamental truths, not from analogy to prior solutions. Analogy only reaches as far as previous attempts.
- Ex-SpaceX radiation engineer: start from the physical limits of the problem, then work backward to what humans must build to satisfy those limits.
- Long-term orientation: decisions evaluated against multi-decade or multi-century goals, not quarterly metrics.
- Ignore criticism based on conventional wisdom; engage only with criticism grounded in physics, mathematics, or first principles.

### OpenAI — Operator, Agent Monitoring Red-Team, and Usage Evidence

- Operator system card: Computer-Using Agent trained with supervised learning + RL to perceive the screen and act with cursor/keyboard. Preparedness Framework evaluations (persuasion, cybersecurity, CBRN, autonomy) before release. Later merged into broader ChatGPT agent.
- METR + Redwood Research red-team of OpenAI’s internal agent monitoring (July–Aug 2026): estimated 75–94% of relevant agentic traffic eligible for monitoring; gaps included unmonitored RL training runs early in the exercise and a compaction gap. OpenAI stated production issues were patched and coverage was expanded.
- “How agents are transforming work” (OpenAI economic research): by mid-2026 a large fraction of users issue Codex requests estimated to exceed 30 minutes, 1 hour, and even 8 hours of human work. Non-technical departments use Codex as a primary tool. Usage shifts toward longer-horizon, cross-functional tasks.

Agent translation: monitoring and verification coverage must be measured, not assumed. Long-horizon tasks require durable state, proof artifacts, and closed loops. Treat monitoring gaps as first-class risks.

### Practical Memory and Skills Patterns (community + platform practice)

- Four-tier memory model (example skill): L0 raw transcripts (never injected), L1 candidates (relevance-loaded, not committed), L2 project context (injected, committed after human adopt), L3 stable persona (always injected after multi-project, multi-day promotion). Promotion requires recurrence across sessions/days, not a single confident statement. Verified claims can promote faster.
- CLAUDE.md is not full memory: keep it short and imperative (commands, hard constraints). Log decisions with the “why” and revisit conditions in separate dated files. Log investigations (symptom, root cause, confirmation, fix) separately and make them searchable.
- Skills are portable folders (SKILL.md + resources) across Claude, OpenAI, Google, GitHub, Microsoft. Concise skills outperform long manuals. Version-control skills; give each a named owner and review date so unused skills are retired.
- Memory engineering principle: optimize what the system forgets as carefully as what it remembers. Never auto-merge contradictions; surface them for human decision. Always pair quality claims with cost.

---

## What’s New in This Document (v5 vs v4)

- Roman Ugarte Lenny’s Podcast: Grok Bot built from scratch in a month, colleague-pilled philosophy, manual onboarding of ~300 users, aggressive unshipping, cloud-first runtime.
- Anthropic AI-native org practices (JIT planning, flat team, dogfooding, kill processes) and official Claude Code best-practices docs (verify-first, explore-plan-implement, parallel worktrees, CLAUDE.md size limits, “you land it you own it”).
- Karpathy Eureka Labs framing (ramps to knowledge, eurekas per second) and the frontier access funnel (~5,000 people).
- Additional SpaceX first-principles reinforcement from engineer talks (physics first, ignore conventional-wisdom criticism).
- OpenAI Operator system card, METR/Redwood internal monitoring red-team findings, and Codex long-horizon usage evidence.
- Practical four-tier memory model, CLAUDE.md vs decision/investigation logs, and portable skills governance (owner + review date, optimize forgetting).

All prior content is retained. This version adds the above sources and operational details.


---

## 18. New Sources Added in This Version (v6)

### Boris Cherny — Recent Stanford Course Appearance and Anniversary Tips (Oct 2026)

From Mihail Eric’s Stanford course “The Modern Software Developer” and related anniversary conversation with Cat Wu:
- Boris reported running “a few thousand” Claude agents at the time of the talk.
- Claude has written 100% of his team’s code since November; output is up ~10x per engineer.
- So much code shipped that humans started skimming rather than carefully reading, so the team automated code review. Approvals are the next bottleneck to automate.
- Method: read agent transcripts to see where the model fails — that is where the next model release will improve. Build for the model six months out.
- Small teams go faster: Claude Code was basically just him for months. With AI, one or two people can outship a team 100 times their size. Constraints breed creativity.
- Think in loops: he writes loops that run for days or weeks and spawn many agents (his grandfather programmed punch cards; he programs agent loops).
- Newer models: he no longer uses Plan Mode for synchronous CLI workflow. Newer models are capable enough that a separate planning phase is often unnecessary. Permission fatigue is real; Auto Mode (security classifier evaluates actions) reduces the need for constant manual approval.
- Prompting: talk like a coworker. State the goal, the effort level, and how to verify. No secret prompting technique required for modern models.

### Lauren Tan / SpaceXAI Grok Bot — Trust Curve and Auto-Merge (Oct 2026)

- After ascending a five-month trust curve, agents now auto-merge PRs. She woke up to ~20 already-landed PRs that she reviewed on main after the fact; they were good.
- Still emphasizes the trust curve: verification and evidence before expanding autonomy. Auto-merge is the result of months of building proof systems, not an early step.
- Continues to run large fleets (20+ agents: Chief of Staff, managers, workers).
- 99% of users still run a single chat window; the gap is organizational (roles, routines, verification), not model capability.
- Team-shared bots include domain engineer bots that launch cloud agents and check PRs on cadence, prototype bots that return draft PRs + screenshots + video, QA bots that walk the product from a test account, and others for distribution and sales — all with human approval gates where needed.

### Karpathy — LLM Wiki as Agent Memory and Harness Explanation

- LLM Wiki pattern (raw sources → maintained wiki → schema) maps well to agent memory:
  - Semantic memory: durable synthesized facts
  - Entity memory: pages about people, projects, systems
  - Episodic memory: logs of what happened
- Schema file tells the LLM how to consistently maintain the wiki. Freshness and provenance matter; outdated synthesized pages can propagate errors.
- In a lecture on using ChatGPT, Karpathy explained harness fundamentals: context window is working memory; the model is a lossy compressor until given tools; every token costs (slows and distracts); tool use is a special token that pauses the model, runs the tool, and pastes the result; memory is often just a text file prepended; custom instructions + examples are the core of specialized behavior.
- Implication: most agent failures live in what enters and leaves the context window, not in the prompt wording or model choice alone.

### Multi-Agent Dynamics — Codex vs Claude Code Evidence

- Systematic study (arXiv 2610.10263) of native dynamic concurrency in Codex, Claude Code, and Kimi Code across 354 tasks and 2,124 executions:
  - Dynamic concurrency (main agent spawns and coordinates sub-agents while remaining active) benefits most on long-horizon tasks.
  - Bounded or short tasks often see little or negative improvement.
- OpenAI Codex team view (Eric Provencher): more than a couple of agents often adds a coordination tax because agents re-check each other’s work rather than trusting it.
- Anthropic internal result: single agent found 14–27 of 70 planted bugs; multi-agent run found 66 of 70. Hosted system can scale to thousands of agents on one job.
- Both sides agree: do not hand-build a fixed team for every task. Use an orchestrator that splits only when the job needs it. Start small.
- OpenAI internal usage: by June 2026 Codex accounted for nearly all AI output among employees; more than 10% of users manage three or more concurrent agents weekly; skills are widely used for complex workflows.

### Additional Memory Governance Notes

- Decentralized memory: each agent maintains its own dual-pool store (exploitation of verified trajectories + exploration of novel candidates) without coordinating writes. Reported gains in some preprints, but trade-off is divergence between agents versus shared-signal benefit of a central store.
- Production guidance: treat shared memory as an input channel that requires validation, provenance, trust scoring, access control, retention, and auditability. Post-hoc filtering is insufficient; controls must be enforceable at runtime. Identity separation and scoped memory matter as much as data handling.
- Governed Memory architecture (dual model of atomic facts + schema-enforced properties, tiered routing, reflection-bounded retrieval, closed-loop schema lifecycle) continues to show strong results on leakage prevention and token reduction.

### SpaceX / SpaceXAI Context

- Ongoing hiring for inference systems, post-training/RL, and recommendation systems underscores the same flywheel: more compute → better models → better products → better data from real use.
- First-principles and algorithm thinking remain operational at the company level; agent and model work is applied to real mission systems (launch, Starlink, internal tools).

---

## What’s New in This Document (v6 vs v5)

- Boris Cherny’s October 2026 Stanford course remarks: thousands of agents, 100% AI-written code since November, ~10x output, automated review as the response to volume, build for the model six months out, small teams, think in loops, skip Plan Mode for strong models, Auto Mode to reduce permission fatigue.
- Lauren Tan’s trust-curve progression to auto-merge (20 PRs landed overnight) and continued emphasis on organizational structure over single-chat use.
- Karpathy’s LLM Wiki as practical agent memory (semantic/entity/episodic layers + schema) and his harness fundamentals lecture (context window as working memory, tool use as special token, memory as prepended text).
- Systematic multi-agent concurrency study (dynamic concurrency helps long-horizon tasks) plus the Codex “coordination tax” view versus Anthropic’s large multi-agent bug-finding result. Both recommend orchestrator-first, split only when needed.
- Additional production memory notes: decentralized dual-pool memory, runtime-enforceable governance (access, retention, provenance, audit), and confirmation that governed architectures reduce leakage and tokens.

All prior content is retained. This version adds the above sources and operational details.


---

## Addendum: rules from earlier drafts not carried into v6

From the earlier "Golden Operating System" draft (security + operational sections):

- Reversible actions by default. Human confirmation for production, money, permissions and irreversible changes.
- Multi-provider model abstraction with failover (gateway such as LiteLLM/OmniRoute); no single point of failure.
- Discriminated error modes; no silent failures.
- Prefer official APIs and standards (X12, FHIR) over brittle scraping.
- No mocks unless documented with a migration path. Unit + integration + e2e + security + domain tests.
- Compliance is a core feature (HIPAA-level thinking even on synthetic data).
- On any mistake: update rules immediately and do not proceed until the root cause is addressed.
- Self-access (tools, credentials) only when the verified task needs it: scoped, logged, reversible.
- Plan step: list approaches with pros/cons before choosing; capture the choice in DECISIONS.md.
