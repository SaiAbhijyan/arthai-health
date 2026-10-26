# Tooling: third-party skills, tools and MCP servers

All candidates were scanned on 2026-10-26 with NVIDIA SkillSpector (`--no-llm`, static rules only) plus a manual sanity check
(license, stars, last push, install/postinstall scripts, hooks, network/telemetry). Reports: `/workspace/curious/skillspector-*.md` on the build box.
SkillSpector's static mode is very noisy: it flags any skill that mentions `.env`, API keys, `curl`, or provider names, so most
large repos score 100/100. Verdicts below weigh the actual flagged lines, not just the score. See ADR 0003.

Rule: project-level only. Nothing here is installed globally by this repo. Never commit API keys; use env vars.

## Wired into this repo
| Item | Where | Why |
|---|---|---|
| Context7 MCP (upstash/context7, MIT) | `.mcp.json`, `.cursor/mcp.json` (`npx -y @upstash/context7-mcp`) | Current library docs before integration code. Key optional: set `CONTEXT7_API_KEY` in your shell for higher rate limits; never commit it. |
| addyosmani/agent-skills (MIT): 6 skills + security-auditor agent | `.claude/skills/*`, `.claude/agents/security-auditor.md`, `.cursor/rules/*.mdc` | Spec, TDD, debugging, review, security, ADR discipline = Golden rules. Flags were false positives (docs that tell agents to *ignore* injected instructions; `.env` mentions). Hooks/scripts not vendored. |
| karpathy-guidelines (multica-ai/andrej-karpathy-skills, MIT in frontmatter) | `.claude/skills/karpathy-guidelines`, `.cursor/rules/karpathy-guidelines.mdc` | Simplicity, surgical changes, verifiable goals. Clean scan (14/100, mediums only). |
| caveman skill (JuliusBrussee/caveman, Apache-2.0) | `.claude/skills/caveman` (`disable-model-invocation: true`), `.cursor/rules/caveman.mdc` | Opt-in `/caveman` for terse chat only. Never for code, docs, commits. Only SKILL.md vendored; compress scripts/proxy/hooks not used. |
| apple-motion (emilkowalski/skills `skills/apple-design`, MIT) | `.claude/skills/apple-motion`, `.cursor/rules/apple-motion.mdc` | Motion/interaction guidance for the reviewer console. Scan CAUTION with 0 issues. |
| ste100-writing (our own) | `.claude/skills/ste100-writing`, `.cursor/rules/ste100-writing.mdc` | Simplified Technical English for docs/prompts/UI strings. Community STE skills exist but none reputable enough; this is an original summary, no spec text. |
| Playwright MCP (microsoft/playwright-mcp, Apache-2.0) | `.mcp.json`, `.cursor/mcp.json` (`npx @playwright/mcp@latest`) | Browser-driven e2e checks of the reviewer console (verify-first). Static flags are in Azure CI pipeline/Dockerfile, not the npx package. Use a clean test profile; never point it at real payer portals. |
| claude-code-security-review (anthropics, MIT) | `.claude/commands/security-review.md` | Run `/security-review` in the Claude Code CLI (signed-in session) before each merge. No GitHub Action and no API key secret. |
| find-skills (vercel-labs/skills, MIT) | `.claude/skills/find-skills`, `.cursor/rules/find-skills.mdc` | Discover skills via `npx skills find`; patched to require SkillSpector scan + project scope. Scan SAFE 12/100. |
| prompt-audit (our own) | `.claude/commands/prompt-audit.md`, `.cursor/rules/prompt-audit.mdc` | Audit checklist for Muse/voice/tool prompts. For Claude API prompts use the built-in `/doctor prompt-audit <path>`. |

## Tools (not installed in the repo; set up per developer)
### OmniRoute (diegosouzapw/OmniRoute) — use with care
MIT, ~81k stars, very active (pushed today). Model/token gateway across 350+ providers. `postinstall` only rebuilds `better-sqlite3`.
Risks: huge surface (quota pooling, OAuth/subscription providers may break provider ToS), dashboard stores provider keys locally,
release cadence is extreme (pin a version). For the hackathon prefer LiteLLM or direct Meta/Baseten/Fireworks endpoints; if used:
**Live setup (box).** Pinned to npm `omniroute@3.8.52` (latest stable release, 2026-10-19). It needs Node 22.22+ or 24; the script uses a local Node 24 in `/workspace/tools/node24`.
The server binds to `127.0.0.1:20128` only. Data is in `/workspace/tools/omniroute/data`. The dashboard password is in `/workspace/tools/omniroute/.env.local` (outside the repo, mode 600). Update notifier and Next.js telemetry are off. The `omniroute telemetry` command reads local data only.
```bash
scripts/omniroute.sh start     # runs in tmux window arthai:omniroute
scripts/omniroute.sh status    # GET /api/monitoring/health -> {"status":"healthy",...}
scripts/omniroute.sh stop
# API-key providers only. Set the env vars, then:
export LLAMA_API_KEY=...  FIREWORKS_API_KEY=...  BASETEN_API_KEY=...
scripts/omniroute.sh add-keys  # providers: meta-llama, fireworks, baseten
```
OmniRoute does not read provider env vars itself. `add-keys` passes them with `providers add <id> --credential-env <VAR>`. The key is stored encrypted in the local data dir.
`/v1/*` needs an OmniRoute client key: make one with `omniroute keys` (see `--help`) and set `OMNIROUTE_API_KEY`. Base URL for clients: `http://127.0.0.1:20128/v1`.
Use only API-key providers (Meta, Baseten, Fireworks, Modal). Do not connect consumer subscriptions.

### Headroom (headroomlabs-ai/headroom) — use with care
Apache-2.0, ~78k stars. Context compression proxy/MCP. **Anonymous telemetry beacon is ON by default.** Disable before use:
```bash
uv tool install --python 3.13 "headroom-ai[all]"
export HEADROOM_TELEMETRY=off HEADROOM_BEACON=off DO_NOT_TRACK=1
headroom proxy --port 8787        # or: headroom wrap claude ; undo: headroom unwrap claude
```
Not added to `.mcp.json` (installer writes user scope; telemetry default).

### claude-mem (thedotmack/claude-mem) — use with care, not for this repo by default
Apache-2.0, ~103k stars. Captures all session activity, compresses with an LLM, runs a local worker service, optional cloud sync and
Telegram/Discord/Slack feeds. Installs globally (`npx claude-mem install`). Risk: it would store everything agents see; keep cloud sync
and feeds off. We use DECISIONS.md + AGENTS.md as memory instead.

### ponytail (DietrichGebert/ponytail) — use with care
MIT, ~177k stars. "Lazy senior dev" ruleset + hooks (Node scripts, statusline). One HIGH (output parsing regex in metrics, benign).
Project scope: `claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail --scope project`.
Overlaps our Golden rules; try on a branch first.

### graphify (Graphify-Labs/graphify, formerly safishamsi) — use with care
Apache-2.0, ~136k stars. Local AST knowledge graph, `/graphify` skill. PyPI name is `graphifyy` (double y, official per README).
```bash
uv tool install graphifyy && graphify install --project
```
Scan flags are hooks/CLI code that edits agent config dirs (expected for an installer). Review the generated skill before committing.

### anatomy (wheresryan22/anatomy) — use with care
MIT, ~21k stars. Builds interactive isometric SVG/WebGL explainer figures (not a repo map). Good for demo/pitch visuals.
~10-40 MB kit; scanner could not fully inspect it. Project install: `npx skills add wheresryan22/anatomy -a claude-code`.

### claude-code-setup (anthropics/claude-plugins-official) — use
Official Anthropic plugin (automation recommender). Flags are its own docs listing `.env` files to protect.
`claude plugin install claude-code-setup@claude-plugins-official --scope project` when you want setup recommendations.

### everything-claude-code / ECC (affaan-m/ECC) — use with care, cherry-pick only
MIT, ~290k stars, 1,000+ skills. Too broad to vendor; 247 HIGH static flags. Nothing vendored. `skills/prompt-optimizer` scanned clean (15/100).

## Avoid
- **Agent-Reach (Panniantong/Agent-Reach)**: reuses cookies from your logged-in browsers over CDP to scrape X/Reddit/etc.
  Session-hijack and ToS risk. Use official APIs (X API/MCP, `gh`, YouTube Data API) instead.
- **apple-design-skill (dickwu)**: no license and it reproduces Apple's HIG text. Not vendored into a public repo.
  If wanted locally: clone into your own `~/.claude/skills/apple-look` (personal use only).
- **watermarks-remover (guillaumemeyer)**: irrelevant to Arthai Health; stripping AI watermarks is legally/ethically risky and
  conflicts with hackathon disclosure norms. Not used.

## gstack (garrytan/gstack) — use with care, opt-in per developer
MIT, ~138k stars, very active. 40+ role skills (plan-eng-review, review, investigate, cso, qa, ship) plus a compiled headless
browser (`browse`, built by `./setup` with Bun) and `setup-browser-cookies`, which imports cookies from your real Chromium browser.
Skills are tightly coupled to gstack binaries (`gstack-*` preamble, update check on by default, opt-in telemetry), so they are
**not vendored**; our equivalents are review/security/debugging skills from agent-skills plus `.claude/agents/reviewer.md`.
If you want gstack, install for Claude Code only and turn off the network extras:
```bash
git clone --depth 1 https://github.com/garrytan/gstack ~/gstack && cd ~/gstack && ./setup --host claude
gstack-config set update_check false
gstack-config set codex_reviews disabled
```
Never run `/setup-browser-cookies` against a browser that holds real accounts or PHI.

## impeccable (pbakaus/impeccable) — use with care, opt-in
Apache-2.0, ~89k stars, very active. Frontend design skill with ~20 verbs (audit, critique, polish, typeset, harden...).
Its launcher downloads a native engine binary on first run into `~/.impeccable/bin/` (SHA-256 verified against
`engine-checksums.txt`), and ships live-browser scripts. Not vendored (2.3 MB per host + runtime binary). To try it in this repo:
```bash
npx impeccable install      # from repo root; project-level skill copies
```
Coexistence with our design skills: **impeccable** = overall UI quality, layout, typography, color, copy and audits;
**apple-motion** = motion/gesture/spring behavior only. If both are loaded, impeccable owns visual design decisions and
apple-motion owns animation timing/physics. apple-look (dickwu HIG) is not vendored (no license); impeccable's
native iOS guidance covers that ground.

## Not wired: "meta^n" (ambiguous)
Several candidates; none is a ready Claude Code/Cursor skill, so nothing was wired:
- https://github.com/minnesotanlp/meta-n : research code for the paper "Meta^n: Recursive Self-Improvement through Emergent Depth" (arXiv 2608.24735, MIT, ~74 stars). Python research harness, not a skill.
- https://github.com/alex-1q84/Meta_Kim : "meta-theory" governance skill + agents for Claude Code (dispatcher/warden pattern).
- https://github.com/gitkb/meta : multi-repo "meta" CLI with Claude Code skills (meta-workspace, meta-git...).

## Not wired: claude-red (SnailSploit/Claude-Red) — offensive security, do not add to this repo
`claude.red` redirects to https://github.com/SnailSploit/Claude-Red (MIT, ~9.4k stars): 79 **offensive** security skills
(exploit dev, EDR evasion, container escape, post-exploitation, social engineering, SQLi/RCE/SSRF, etc.).
SkillSpector: 100/100 DO NOT INSTALL — 15 CRITICAL, 512 HIGH (credential access, cloud-metadata SSRF, container escape, exploit chains).
These are real attack capabilities, not false positives.

Decision: **not vendored and not wired in.** Putting an offensive toolkit into a public healthcare repo is a liability (it would run
with agent privileges and could be pointed anywhere, and PHI/compliance context makes misuse worse). For security testing of Arthai
Health we already have the defensive `security-and-hardening` skill, `security-auditor` agent, `/security-review` command, and the
Claude PR security workflow. If Sai wants active pentesting of *our own* staging app only, install claude-red **outside this repo**,
opt-in per category, against a dedicated test deployment he owns, never prod or anything with real data:
```bash
git clone https://github.com/SnailSploit/Claude-Red ~/claude-red
~/claude-red/install.sh --category web --target ~/.claude/skills/claude-red   # web/api/auth only; review each SKILL first
```
