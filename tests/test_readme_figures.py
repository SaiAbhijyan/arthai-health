"""Checks for the README figures in docs/images/."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIGURES = [
    "arthai-overview.svg",
    "arthai-triage-gate.svg",
    "arthai-appeal-writer.svg",
    "arthai-voice-agent.svg",
    "arthai-code-lookups.svg",
    "arthai-review-console.svg",
]


def test_each_figure_exists_and_is_labeled_planned() -> None:
    for name in FIGURES:
        svg = (ROOT / "docs" / "images" / name).read_text(encoding="utf-8")
        assert 'role="img"' in svg, name
        assert re.search(r'aria-label="[^"]{40,}"', svg), name
        assert "PLANNED" in svg, name
        assert "Copyright (c) 2026 Ryan" in svg, name


def test_readme_uses_each_figure_with_alt_text() -> None:
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    for name in FIGURES:
        pattern = rf'<img src="docs/images/{re.escape(name)}"[^>]* alt="[^"]{{40,}}"'
        assert re.search(pattern, readme), name
