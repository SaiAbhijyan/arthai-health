# Arthai Health dev commands (AGENTS.md "Commands"). factory/checks.sh runs `make lint` and `make test`.
# Tools live in .venv-dev (gitignored), built from the hash-locked requirements-dev.txt.
# eslint, tsc, vitest, eval and e2e targets arrive with the app code.
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
export UV_PYTHON_INSTALL_DIR ?= /workspace/tools/python

VENV := .venv-dev
PY := $(VENV)/bin/python
# Pre-existing dev-tool scripts, not product code. Not linted until someone cleans them up.
LEGACY := scripts/cognee_smoke.py scripts/hooks/decision_reminder.py
PYFILES = $(filter-out $(LEGACY),$(shell git ls-files -co --exclude-standard -- '*.py'))

.PHONY: dev lint typecheck test

$(VENV)/.stamp: requirements-dev.txt
	uv venv --clear --python 3.12 -q $(VENV)
	uv pip install -q --python $(PY) --require-hashes -r requirements-dev.txt
	touch $@

dev: $(VENV)/.stamp

lint: $(VENV)/.stamp typecheck
	@if [[ -z "$(strip $(PYFILES))" ]]; then echo "lint: no Python files"; else \
	  $(PY) -m ruff check $(PYFILES) && $(PY) -m ruff format --check $(PYFILES); fi

typecheck: $(VENV)/.stamp
	@if [[ -z "$(strip $(PYFILES))" ]]; then echo "typecheck: no Python files"; else \
	  $(PY) -m mypy --strict $(PYFILES); fi

test: $(VENV)/.stamp
	$(PY) -m pytest
