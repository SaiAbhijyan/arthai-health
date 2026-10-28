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

## Python packages installed in the repo

### cognee (topoteretes/cognee) — installed, project venv only
Apache-2.0, about 33k stars. Version 1.6.5 (pinned in `requirements.txt` as `cognee[gliner]==1.6.5`).
Use: memory for the Arthai agents (payer rules, appeal results per denial code, notes from insurer calls).
Scan: `/workspace/curious/skillspector-cognee.md` (100/100 CRITICAL). We read the flagged lines. All were false positives (key and `.env` mentions, docs).

Rules:
- Install into `.venv` only. Do not install it globally.
- Put only synthetic data into cognee. Do not put real PHI into cognee.
- Set `TELEMETRY_DISABLED=1` before you import cognee. Cognee sends anonymous usage data to `test.prometh.ai` by default.
- Keep all cognee data in the repo. `.cognee_data/` and `.cognee_system/` are git-ignored.
- Do not commit `.env`. Put the Baseten key in `.env` or in your shell only.

Setup:
```bash
uv venv .venv --python 3.12
uv pip install --python .venv/bin/python -r requirements.txt
cp .env.example .env            # then set LLM_API_KEY (Baseten key)
set -a; . ./.env; set +a
.venv/bin/python scripts/cognee_smoke.py
```

Settings (`.env.example`):
- LLM: Muse Spark Open on Baseten. `LLM_PROVIDER=custom`, `LLM_MODEL=openai/meta-models/muse-spark-open-1026`, `LLM_ENDPOINT=https://inference.baseten.co/v1`.
- Embeddings: local fastembed (`BAAI/bge-small-en-v1.5`, 384 dimensions). No key. Text does not leave the box.
- Storage, logs and model cache: `.cognee_data/`, `.cognee_system/` (logs and Hugging Face cache are in `.cognee_system/`).
- `LITELLM_LOCAL_MODEL_COST_MAP=True` stops litellm from downloading its price list from GitHub.
- `AUTO_FEEDBACK=false` stops an extra LLM call on each turn. Set it to `true` only after the key works.

Notes:
- With no LLM key, `cognify` uses the local GLiNER model (about 750 MB, downloaded once from Hugging Face). With the key set, cognee uses Muse.
- Smoke test (2026-10-28, no LLM key): `add`, `cognify` and `search` (CHUNKS) worked on one synthetic payer rule. No telemetry was sent. The only host contacted was `huggingface.co` (model download).
- Cognee ships agent skills (`.agents/skills`, linked from `.claude/skills`), a Claude Code SessionStart hook and `cognee-mcp`. We did not install them. Scans: `skillspector-cognee-skills.md` (80/100 HIGH, false positives), `skillspector-cognee-mcp.md` (100/100 CRITICAL, pinned dependencies with known advisories in its `uv.lock`).

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

## Added 2026-10-26 (evening)

SkillSpector `--no-llm` scores large codebases 100/100 because of volume. The verdicts below use the flagged lines.

| Tool | What it is | Scan (raw) and real findings | Status |
|---|---|---|---|
| Software factory v2 (zazencodes, GPL-3.0) | issue → spec → build → gate → review → PR pipeline for Claude Code | 15/100 CAUTION. 6 MEDIUM AST4 = `subprocess` calls to `git`/`gh` in `factory/bin/*`. Expected. | Wired: `factory/`, `.claude/agents/*`, `/factory` skill. Upstream v2 ships no agent files; ours are written for Arthai. Merge guard added in `factory/bin/job`. |
| pi (earendil-works/pi, was badlogic/pi-mono, MIT), `@earendil-works/pi-coding-agent` 1.4.0 | small terminal coding agent | 100/100. 0 CRITICAL. HIGHs are in CHANGELOG/docs/test fixtures, plus `package-manager-cli.ts` (npm install of extensions) and MCP OAuth. Normal for a coding agent with a bash tool. | Installed under `/workspace/tools/pi`, run with `scripts/pi.sh`, telemetry off. Do not install pi extensions without a scan. |
| LAYA (NandhaKishorM/laya, Apache-2.0), open-source Jev | System 1 decision model, 421M | 100/100. 18 CRITICAL: 15 are `exec(compile())` in tests and research scripts; 2 are env → `urlopen` (timeout value, a ModelScope prefetch script); 1 in a Java dev script. None in the runtime path we use. Weights download from Hugging Face. | venv `/workspace/tools/laya-env`. Plan: `docs/laya-plan.md`. Not a repo dependency yet. |
| REA (morluto/rea, MIT), `rea-agents` | MCP server to reverse-engineer binaries, Electron/JS apps, .NET, websites | 100/100. 7 CRITICAL `exec(compile())` in pwndbg/pwntools debugger bridges; 611 HIGH SC9, mostly docs/translations. Expected for a debugger tool. | NOT wired. It does not help an RCM product, and reverse-engineering payer or vendor software can break their terms. Opt-in only, by hand: `npx rea-agents@6.4.0 setup --client claude_code --dry-run` first, and only on software we own. |

## Added 2026-10-28 (vetting batch, Sai approved "all except watermarks-remover")

All items were scanned with SkillSpector (`--no-llm`) before install; reports are in `/workspace/curious/skillspector-*.md`
(scanned 2026-10-26). Rule reminder: project-level only, except ponytail, which Sai asked to install globally.

| Tool | Source / License | Install location | Guardrails | Status |
|---|---|---|---|---|
| ponytail | DietrichGebert/ponytail, MIT | **Global (user-level):** `~/.claude/skills/ponytail*` and `~/.cursor/skills-cursor/ponytail*` | SKILL.md only; Node hooks, statusline and update check NOT installed, so no telemetry and no network. | Installed globally per Sai. 6 skills: ponytail, -audit, -debt, -gain, -help, -review. |
| graphify | Graphify-Labs/graphify, Apache-2.0 | Skill: `.claude/skills/graphify` + `.cursor/rules/graphify.mdc`. CLI: box venv `/workspace/tools/graphify-env` (`graphifyy` 0.9.97, pip, not global). | Query log OFF (`GRAPHIFY_QUERY_LOG_DISABLE=1`). No telemetry. Never point at real PHI. | Installed project-level. CLI runs from the box venv, not a global `uv tool`. |
| anatomy | wheresryan22/anatomy, MIT | Skill: `.claude/skills/anatomy` + `.cursor/rules/anatomy.mdc`. Example kit stays on the box at `/workspace/tools/anatomy`. | Needs Node 20.10+ and Chrome/Chromium. For demo/pitch figures only. | Installed project-level (skill vendored; ~10-40 MB kit not committed). |
| meta-n | minnesotanlp/meta-n, MIT | Box venv `/workspace/tools/meta-n/.venv` (editable install). | Research tool, NOT a skill. Not wired into Claude Code or Cursor. | Installed as a research tool. `import meta_n` works. |
| REA | morluto/rea, MIT | Clone only: `/workspace/tools/rea`. | NOT added to `.mcp.json` or `.cursor/mcp.json`. **Never point REA at insurer, clearinghouse or any third-party site**; opt-in by hand, only on software we own. | Cloned, not wired. |
| Agent-Reach | Panniantong/Agent-Reach, MIT | Box venv `/workspace/tools/Agent-Reach/.venv`; isolated home `/workspace/tools/agent-reach-home` (`AGENT_REACH_HOME`). | **Login channels are left OFF.** Its default channels (github, youtube, bilibili, v2ex, web) need no login and read no cookies. The login channels (twitter, reddit, facebook, instagram, xiaohongshu, linkedin, boss, xueqiu) copy cookies from the box browser on `agent-reach login <channel>` only; that command is never run. There is no hard flag that guarantees no-cookie-access, so it is installed but unwired and login is disabled by policy. | Installed, isolated, unwired, login disabled. |
| apple-design-skill | dickwu/apple-design-skill, **no license** | Untracked local only: `.claude/skills/apple-design-local/` (git-ignored). | Reproduces Apple HIG text; no license. Never committed to the public repo. | Installed local-only, not committed. |
| claude-red | SnailSploit/Claude-Red, MIT | Clone only on the box: `/workspace/tools/Claude-Red`. | 79 offensive-security skills (exploit dev, EDR evasion, container escape, SSRF/RCE/SQLi, credential access). SkillSpector 100/100, 15 CRITICAL, 512 HIGH (real capabilities, not false positives). | **Not wired into the public repo** (liability for a public healthcare repo). Held for Sai's explicit go. See note below. |

### REA — scope note (repeat)
Never point REA at insurer, clearinghouse or third-party sites. It helps an RCM product in no way; reverse-engineering payer or
vendor software can break their terms. Use only on software we own, opt-in by hand.

### claude-red — why it is not wired into this repo
Sai approved installing "all except watermarks-remover". For claude-red the batch install was done as an **outside-the-repo clone only**
(`/workspace/tools/Claude-Red`), not a project-level wire-in. Putting 79 offensive-security skills into a **public** healthcare repo is a
real liability: they would load with agent privileges in a repo that also holds PHI/compliance context, and the repo is public. For
security testing of Arthai Health we already have the defensive `security-and-hardening` skill, the `security-auditor` agent, and the
`/security-review` command. To use claude-red, install it OUTSIDE this repo, opt-in per category, against a dedicated test deployment
Sai owns, never prod or anything with real data:
```bash
~/claude-red/install.sh --category web --target ~/.claude/skills/claude-red   # web/api/auth only; review each SKILL first
```

## Added 2026-10-28 (global / user-level installs, Sai approved)

Sai asked for these at user level (`~/.claude` and Cursor user config) so every project gets them, not only this repo.
Telemetry is off for all. None of this is committed to the repo; it lives in the box user config and `/workspace/tools`.

| Tool | Source / License | Global location | Guardrails / telemetry |
|---|---|---|---|
| ponytail | DietrichGebert/ponytail, MIT | `~/.claude/skills/ponytail*`, `~/.cursor/skills-cursor/ponytail*` (6 skills) | SKILL.md only; no Node hooks, statusline or update check, so no telemetry/network. |
| Agent-Reach | Panniantong/Agent-Reach, MIT | CLI on PATH via `~/.local/bin/agent-reach` (box venv). Isolated home `/workspace/tools/agent-reach-home`. | Wrapper hard-blocks the `login` subcommand, so it never reads the box browser's cookies/profiles. Only no-login channels (github, youtube, bilibili, v2ex, web) work. Not auto-wired as an MCP. |
| REA | morluto/rea, MIT | NOT registered as a global MCP. Clone only: `/workspace/tools/rea`. | Not auto-enabled for any project. **Never point REA at insurer, clearinghouse or any third-party site**; opt-in by hand, only on software we own. |
| apple-design | dickwu/apple-design-skill, **no license** | `~/.claude/skills/apple-design-local`, `~/.cursor/skills-cursor/apple-design-local` | Reproduces Apple HIG text; no license. Never committed to any repo. User-config only. |
| claude-red | SnailSploit/Claude-Red, MIT | `~/.claude/skills/claude-red`, `~/.cursor/skills-cursor/claude-red` (24 categories, offensive) | 79 offensive-security skills. User-config only, never committed to a repo. Use only against a dedicated test deployment Sai owns, never prod/PHI. |
| Strix | usestrix/strix (`strix-agent` 1.7.0), MIT | CLI on PATH via `~/.local/bin/strix` (box venv `/workspace/tools/strix-env`). | Wrapper sets `STRIX_TELEMETRY=0` (opt-out of PostHog). **Run only against Sai's own code or local targets.** Needs Docker (sandbox image) and an LLM key to run. |

### Strix — SkillSpector scan (2026-10-28), real findings
Report: `/workspace/curious/skillspector-strix-2026-10-28.md`. Raw verdict: **100/100 CRITICAL, "DO NOT INSTALL"** — driven by volume
(563 components) and by the fact that Strix is an offensive pentest agent, so the scanner flags its intended capabilities.
- **1 CRITICAL (TT3)**: `strix/tools/proxy/caido_api.py:78` — a value from `os.environ.get` flows into `urllib.request.urlopen`.
  This is Strix's client talking to its own local Caido proxy using an env-configured URL/token. Benign in context, not a backdoor.
- **239 HIGH**: mostly PE3 (82, process/command execution), SSRF1 (21), RA1 (20), SC2 (18, subprocess/shell), TM1/TM2 (tool misuse),
  E2 (eval/exec). These are the pentest tool's own features (it runs exploits, probes SSRF, drives a browser and a proxy), not hidden malware.
- **148 MEDIUM**: output handling, deserialization, YAML rules, config-dir writes — expected for a CLI agent with a sandbox.
- **Verdict**: like claude-red, the score reflects that Strix is offensive by design. No sign of a supply-chain backdoor in the flagged
  lines. Installed globally for Sai, telemetry off, to be used only on his own code or local targets.
