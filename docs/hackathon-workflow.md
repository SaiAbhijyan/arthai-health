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
