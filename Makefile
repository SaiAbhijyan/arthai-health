# Phase 2 targets (AGENTS.md "Commands"). eslint/tsc/vitest/eval/e2e arrive with the app code.
PY := .venv/bin/python
SRC := packages/rcm_models scripts/gen tests
export PYTHONPATH := packages/rcm_models:scripts/gen

.PHONY: venv lint test test-slow tools data data-check phi-scan

venv:
	uv venv --python 3.12 .venv
	uv pip install --python $(PY) --require-hashes -r requirements-dev.txt

lint:
	$(PY) -m ruff check $(SRC)
	$(PY) -m ruff format --check $(SRC)
	$(PY) -m mypy --strict $(SRC)

test:
	$(PY) -m pytest

test-slow:
	ARTHAI_SLOW=1 $(PY) -m pytest -m slow

tools:
	scripts/fetch_tools.sh fetch

# Full rebuild: Synthea (offline) -> ingest -> generate -> schemas -> manifest -> PHI scan.
data:
	scripts/run_synthea.sh
	$(PY) -m arthai_gen all

# Rebuild and fail if any committed data file changes (determinism gate).
data-check: data
	git diff --exit-code -- data/

phi-scan:
	$(PY) -m arthai_gen phi-scan
