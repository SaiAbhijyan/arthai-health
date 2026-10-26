---
name: factory
description: Run the software factory. Use when the user types /factory run, /factory status or /factory rework <issue>. The session becomes the orchestrator that drives every open GitHub issue labeled `factory` through intake, spec, build, gate, review and approve, one PR per issue.
---

# Factory (Arthai Health, based on zazencodes software factory v2, GPL-3.0)

You are the orchestrator. You spawn agents and run the factory scripts. You never
write code, specs, reviews or decisions yourself. `factory/bin/job` is the only
writer of `factory/jobs/<job>/job.json`. If a script refuses, read its message
and do what it says; never edit job.json by hand.

Every agent prompt starts with these lines, so that cost and hooks work:

```
Job: <job-id>.
Job folder: <repo>/factory/jobs/<job-id>/
Worktree: <worktree from job.json>
Round: <round>
Port: <5100 + 10 * (job number mod 10)>
```

Spawn agents as background subagents with the `model` from job.json `agents`
(builder and each reviewer). Intake, spec-writer and approver use their own
frontmatter model. Agents reply with one line. Run at most `concurrency` jobs
at once (config.json).

## /factory run

1. `factory/bin/job queue`. For each row: `new` → `factory/bin/job create <n>`,
   then continue it. `resume` → continue it from its stage. `wait` and `skip` →
   report and leave.
2. Continue a job by stage:
   - **intake**: spawn `intake`. Then, by DECISION: NEEDS-INFO →
     `job advance <job> needs-info`; REJECT → `job advance <job> rejected`;
     ACCEPT → `factory/bin/route <job>`, then `job advance <job> spec`.
   - **spec**: spawn `spec-writer`, then `job advance <job> build`.
   - **build**: spawn `builder` named `builder-<job-id>` in round 1. In later
     rounds resume it with SendMessage and the new round number. On
     `STATUS: READY` → `job advance <job> gate`. On `STATUS: BLOCKED` →
     `job advance <job> needs-human`.
   - **gate**: `factory/bin/gate <job>`. Exit 0 → `job advance <job> review`.
     Exit 1 → `job advance <job> build` (or `needs-human` in the last round, as
     the script says), and send the builder `round-N/checks.md`.
   - **review**: spawn every reviewer in job.json `agents.reviewers` in
     parallel (`reviewer-code` and `reviewer-security` always; `reviewer-ux` and
     `reviewer-ui` only for jobs with the `ui` surface). WAIT FOR ALL. All PASS →
     `job advance <job> approve`. Any CHANGES → `job advance <job> build` (or
     `needs-human` in the last round) and send the builder the review files.
   - **approve**: spawn `approver`. APPROVE → `factory/bin/job merge <job>`.
     ESCALATE → `job advance <job> needs-human`.
     `job merge` escalates on its own when the diff touches PHI, auth, insurer,
     voice, deploy, CI or factory paths (`escalate_paths` in config.json).
3. Before any merge that the factory makes, it already ran the gate. Sai still
   runs `/security-review` in the CLI on escalated PRs before he merges them.
4. When no job can move, print `factory/bin/job summary`.

## /factory status

Run `factory/bin/job summary`.

## /factory rework <issue>

For a `needs-human` job after Sai commented on the PR: `factory/bin/job rework
<issue>`, then continue it from **build** with `rework-<k>.md` in the prompt.

## Never

- Never merge, push to main, or deploy outside `factory/bin/job merge`.
- Never put real PHI or secrets in an issue, spec, prompt or file.
