# SETUP.md

Setup notes for the dev tools. [README.md](README.md#quickstart) has the full quickstart.

## Prerequisites

- [uv](https://docs.astral.sh/uv/). `make dev` uses uv to get Python 3.12 and the dev packages.
- GNU make 4.x. On the project build box, make is in `/workspace/tools/bin`: `export PATH=/workspace/tools/bin:$PATH`.
- Network access for the first `make dev`.

## First run

```bash
cp .env.example .env   # synthetic values only. Never put real PHI or payer credentials in it.
make dev UV_PYTHON_INSTALL_DIR="$HOME/.local/share/uv/python"
make lint              # ruff and mypy --strict
make test              # pytest
```

The Makefile has 4 targets today: `dev`, `lint`, `typecheck` and `test`. There is no `make up`, `make seed`, `make eval` or `make e2e` yet. These targets come with the app code and the synthetic data generators (issues #2 to #8). Do not use a make target that is not in the Makefile.

## Agents

Read `AGENTS.md` first. Claude Code also reads `CLAUDE.md`. Check Grok with `grok inspect`.
