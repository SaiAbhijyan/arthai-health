# Hackathon workflow (Arthai Health)

One workflow for all agents. Deadline: **Nov 4, 9:00 PM ET**. Follow `AGENTS.md` golden rules at all times.
Write docs in ASD-STE100 style (`ste100-writing`). Scan every new skill with SkillSpector before you install it.

## tmux (`tmux attach -t arthai`)
| Window | Use |
|---|---|
| `claude` | Claude Code. Main builder: skills, `/prompt-audit`, `/security-review`, MCPs. |
| `cursor` | cursor-agent. Second builder or reviewer on a different service. |
| `grok` | Grok Build (when installed). Research, PRD review, third opinion. |
| `shell` | Tests, `make`, git, curl to services. |
| `omniroute` | OmniRoute router on `127.0.0.1:20128`. `scripts/omniroute.sh status`. |

Rule: one agent per service at a time. Do not let two agents edit the same files.

## Phases
| Phase | Use | Output |
|---|---|---|
| 1. Idea / spec | `spec-driven-development`, `karpathy-guidelines` (think first, simple), Grok for research | `docs/spec.md`, acceptance tests list |
| 2. Architecture | `documentation-and-adrs`, `/decision`, graphify / anatomy (map the code, read only) | ADR in `docs/adr/`, `DECISIONS.md` entry |
| 3. Build | `test-driven-development`, context7 MCP (read the docs before integration code), OmniRoute for Meta / Fireworks / Baseten calls, `add-x12-segment` | Small commits, tests green |
| 4. Prompts | `/prompt-audit` on every agent, voice, and tool prompt | Prompt passes the checklist |
| 5. Test / fix | `debugging-and-error-recovery`, playwright MCP (click through the UI), `/review` | Bug fixed with a test that shows it |
| 6. UI / design | impeccable (layout, visual), `apple-motion` (animation only) | Clean demo screens |
| 7. Security | `security-and-hardening`, `/security-review` in the CLI before each merge | No HIGH or CRITICAL open. No PHI or keys in git |
| 8. Demo / video | playwright MCP to script the click path, `ste100-writing` for the script | 2-3 min video, demo script |
| 9. Submission | `ste100-writing` for README and form text, `code-review-and-quality` final pass | Submitted before Nov 4, 9 PM ET |

Long sessions: headroom (telemetry off) or `caveman` (opt-in) to cut tokens. New skill needed: `find-skills`, then SkillSpector, then install at project level.

## Daily loop (to Nov 4)
1. **Morning (15 min):** `git pull`. `scripts/omniroute.sh status`. Read `DECISIONS.md`. Pick 1-3 tasks for today.
2. **Build blocks:** for each task: spec line, then test, then code, then `/review`. Commit small. Push.
3. **Midday:** playwright MCP smoke test of the main flow (denial in, appeal out, voice call).
4. **Evening:** `/security-review` on the diff. `/prompt-audit` on changed prompts. Update `DECISIONS.md`.
5. **End of day:** demo must run end to end. If not, fix it before new work.

## Countdown
- **Oct 27-29:** core flow (denial -> fix -> appeal) works with mocks.
- **Oct 30-Nov 1:** voice agent, real model calls through OmniRoute, UI polish.
- **Nov 2-3:** freeze features. Tests, security, demo video.
- **Nov 4:** final review, submit by 6 PM ET (3 h buffer before 9 PM ET).

## Software factory (`/factory`)

The factory builds GitHub issues for you. It runs on this computer, in the Claude Code CLI, on the Claude login. It does not use GitHub Actions.

### Start a job

1. Open a GitHub issue. Write the goal and the acceptance criteria. Use synthetic data only. Do not put PHI or keys in the issue.
2. Add the label `factory` to the issue.
3. In the tmux window `claude`, type `/factory run`.
4. To see all jobs, type `/factory status`. For the dashboard, run `cd factory && python3 -m http.server 8000` and open `http://localhost:8000/dashboard.html`.

### What it does

intake → spec → build (TDD, context7 docs check) → gate (`factory/checks.sh`) → reviewers → approver → PR.

- The code reviewer and the security reviewer always run. The security reviewer applies `/security-review` and the `security-and-hardening` skill.
- The ux and ui reviewers run only when intake marks the job as frontend (`ui`).
- All agents use sonnet. Opus is used only for the builder and security reviewer on `high` risk jobs, and for security-surface jobs (`factory/config.json`).
- One PR for each issue, on branch `factory/<job-id>`.

### When the factory merges, and when it asks you

The factory merges a PR only when all of these are true: the gate passes, all reviews pass, the approver says APPROVE, and no changed file matches `escalate_paths` in `factory/config.json`.

It always ESCALATES to Sai when a change touches PHI or patient data, X12 claims data, auth, insurer or voice calls, deploy, CI, dependencies, `factory/`, `.claude/` or `AGENTS.md`. `factory/bin/job merge` enforces this in code, also when the approver says APPROVE. The issue gets the label `factory:needs-human`.

For an escalated PR:
1. Run `/security-review` in the Claude CLI on the branch.
2. To accept: merge the PR on GitHub.
3. To change it: comment on the PR, then type `/factory rework <issue>`.

### Checks

`factory/checks.sh` runs `make lint` and `make test` (AGENTS.md). Until the Makefile exists, it prints a PLACEHOLDER warning and passes. Remove that branch when the Makefile exists.

Job state is in `factory/jobs/`. Git ignores it.

## pi coding agent (tmux window `pi`)

`pi` is a small open-source coding agent (earendil-works/pi, formerly badlogic/pi-mono, MIT). It is installed under `/workspace/tools/pi`. It is not installed globally.

- Start: `scripts/pi.sh` (interactive) or `scripts/pi.sh -p "<task>"` (one shot).
- Config: `/workspace/tools/pi/agent/models.json`. The script turns off telemetry (`PI_TELEMETRY=0`).
- Model backend: OmniRoute at `http://127.0.0.1:20128/v1` (provider `omniroute`). It works when OmniRoute has provider keys and you export `OMNIROUTE_API_KEY`. Then type `/model` in pi and select the OmniRoute model. Change the model id `auto` to the OmniRoute model or combo name you use.
- Use pi as a fast second builder or for small scripts. Follow `AGENTS.md`. Do not give pi access to `.env`.
