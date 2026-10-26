#!/usr/bin/env bash
# Arthai Health checks for the software factory gate.
# Runs in the job's worktree. Non-interactive. Never rewrites files.
# Commands come from AGENTS.md: make lint, make test, make eval, make e2e.
set -euo pipefail

if [[ ! -f Makefile ]]; then
  # PLACEHOLDER: the repo has no Makefile yet. Remove this branch when
  # `make lint` / `make test` exist, so that the gate is real.
  echo "factory/checks.sh: PLACEHOLDER - no Makefile yet, so no checks ran." >&2
  exit 0
fi

make lint
make test
# Add when the targets exist and are fast enough for every round:
# make eval
# make e2e
