"""Checks for the README and its figures in docs/images/."""

from __future__ import annotations

import html
import re
import xml.etree.ElementTree as ET
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
# Names that must not appear. Built from parts so that this file does not contain them.
FORBIDDEN = re.compile("|".join(["tek" + "cel", "med" + "rcm"]), re.IGNORECASE)


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


def test_readme_alt_text_matches_svg_label() -> None:
    readme = _read("README.md")
    for name in FIGURES:
        label = re.search(r'aria-label="([^"]*)"', _read(f"docs/images/{name}"))
        alt = re.search(rf'<img src="docs/images/{re.escape(name)}"[^>]* alt="([^"]*)"', readme)
        assert label and alt, name
        assert html.unescape(label.group(1)) == html.unescape(alt.group(1)), name


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


def test_svgs_are_well_formed_xml() -> None:
    for name in FIGURES:
        # Our own committed files, not untrusted input.
        ET.fromstring(_read(f"docs/images/{name}"))  # noqa: S314


def test_quickstart_make_targets_exist() -> None:
    makefile = _read("Makefile")
    defined = set(re.findall(r"^([a-z][\w-]*):", makefile, flags=re.MULTILINE))
    used = set(re.findall(r"^\s*make ([a-z][\w-]*)", _read("README.md"), flags=re.MULTILINE))
    assert used, "no make commands found"
    assert used <= defined, used - defined
