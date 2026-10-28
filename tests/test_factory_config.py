"""Guard the factory merge rules that Sai approved (2026-10-28)."""

from __future__ import annotations

import json
from pathlib import Path

CONFIG = json.loads((Path(__file__).resolve().parents[1] / "factory/config.json").read_text())


def test_human_review_paths_stay_escalated() -> None:
    must = {
        "data/*",
        "scripts/*",
        "*phi*",
        "*patient*",
        "*auth*",
        "*payer*",
        "*insurer*",
        "*voice*",
        "*call*",
        "Makefile",
        "factory/*",
        ".github/*",
    }
    assert must <= set(CONFIG["escalate_paths"])


def test_checks_and_tests_stay_protected() -> None:
    must = {"factory/checks.sh", "factory/config.json", "factory/bin/*", "tests/*"}
    assert must <= set(CONFIG["protected_paths"])
