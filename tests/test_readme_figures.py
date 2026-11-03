"""Checks for the README and its figures in docs/images/."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Figure file and the number of stations that must carry a PLANNED tag.
FIGURES = {
    "arthai-overview.svg": 9,
    "arthai-triage-gate.svg": 6,
    "arthai-appeal-writer.svg": 5,
    "arthai-voice-agent.svg": 6,
    "arthai-code-lookups.svg": 4,
    "arthai-review-console.svg": 5,
}
FORBIDDEN = re.compile(r"tekcel|medrcm", re.IGNORECASE)


def _read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def test_each_station_is_labeled_planned() -> None:
    for name, stations in FIGURES.items():
        svg = _read(f"docs/images/{name}")
        assert 'role="img"' in svg, name
        assert re.search(r'aria-label="[^"]{40,}"', svg), name
        assert svg.count(">PLANNED<") >= stations, name
        assert "Copyright (c) 2026 Ryan" in svg, name


def test_readme_uses_each_figure_with_alt_text() -> None:
    readme = _read("README.md")
    for name in FIGURES:
        pattern = rf'<img src="docs/images/{re.escape(name)}"[^>]* alt="[^"]{{40,}}"'
        assert re.search(pattern, readme), name


def test_no_forbidden_names() -> None:
    paths = ["README.md", *(f"docs/images/{n}" for n in FIGURES)]
    paths += [str(p.relative_to(ROOT)) for p in (ROOT / "docs/images/src").glob("*.mjs")]
    for rel in paths:
        assert not FORBIDDEN.search(_read(rel)), rel


def _anchor(heading: str) -> str:
    text = re.sub(r"[^\w\- ]", "", heading.strip().lower())
    return text.replace(" ", "-")


def test_readme_relative_links_and_anchors_resolve() -> None:
    readme = _read("README.md")
    anchors = {_anchor(h) for h in re.findall(r"^#+ (.+)$", readme, flags=re.MULTILINE)}
    targets = re.findall(r"\]\(([^)\s]+)\)", readme) + re.findall(r'src="([^"]+)"', readme)
    for target in targets:
        if target.startswith(("http://", "https://")):
            continue
        if target.startswith("#"):
            assert target[1:] in anchors, target
            continue
        assert (ROOT / target.split("#")[0]).exists(), target
