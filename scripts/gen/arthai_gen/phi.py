"""PHI and leak scanner for data/ (data-plan 6.4 step 5). Fails closed: any hit is an error.

Flags: SSN patterns, phones outside 555-01xx, emails outside example.com, MBI patterns,
10-digit numbers that are not our fictional NPIs, UUIDs (Synthea IDs), Synthea-style
names (word + digits), real payer names Synthea ships, and CPT-like 5-digit codes.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

from arthai_gen import config

SSN = re.compile(r"(?<!\d)\d{3}[- ]\d{2}[- ]\d{4}(?!\d)")
PHONE = re.compile(r"(?<!\d)(?:\(?\d{3}\)?[-. ]?)?(\d{3})[-. ](\d{4})(?!\d)")
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})")
# CMS MBI format: C A AN N A AN N A A N N (letters exclude S, L, O, I, B, Z).
_A = "[AC-HJKMNP-RT-Y]"
_AN = "[AC-HJKMNP-RT-Y0-9]"
MBI = re.compile(rf"(?<![A-Z0-9])[1-9]{_A}{_AN}\d-?{_A}{_AN}\d-?{_A}{_A}\d\d(?![A-Z0-9])")
TEN_DIGITS = re.compile(r"(?<![\w.])\d{10}(?![\w.])")
UUID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I)
SYNTHEA_NAME = re.compile(r"\b[A-Z][a-z]+\d{2,3}\b")
CPT_LIKE = re.compile(r"(?<![\w.\-])\d{4}[0-9FTU](?![\w.\-])")
REAL_PAYERS = re.compile(
    r"\b(Aetna|Humana|Cigna|Anthem|UnitedHealth\w*|Blue Cross|Blue Shield|Kaiser|Medicaid|"
    r"Medicare|Tricare|Dual Eligible)\b",
    re.I,
)
ALLOWED_EMAIL_DOMAINS = {"example.com"}
TEXT_SUFFIXES = {".json", ".jsonl", ".yaml", ".yml", ".csv", ".md", ".txt"}


@dataclass(frozen=True)
class Finding:
    path: str
    line: int
    rule: str
    sample: str


class _Hits:
    """Record a finding without echoing the full matched value."""

    def __init__(self, found: list[Finding], where: str, line: int) -> None:
        self.found, self.where, self.line = found, where, line

    def __call__(self, rule: str, sample: str) -> None:
        self.found.append(Finding(self.where, self.line, rule, sample[:4] + "..."))


def scan_text(text: str, where: str = "<text>", check_payers: bool = True) -> list[Finding]:
    found: list[Finding] = []
    for n, line in enumerate(text.splitlines(), start=1):
        hit = _Hits(found, where, n)

        for m in SSN.finditer(line):
            hit("ssn", m.group())
        for m in PHONE.finditer(line):
            if not (m.group(1) == "555" and m.group(2).startswith("01")):
                hit("phone", m.group())
        for m in EMAIL.finditer(line):
            if m.group(1).lower() not in ALLOWED_EMAIL_DOMAINS:
                hit("email", m.group())
        for m in MBI.finditer(line):
            hit("mbi", m.group())
        for m in TEN_DIGITS.finditer(line):
            if m.group() not in config.FICTIONAL_NPIS:
                hit("npi", m.group())
        for m in UUID.finditer(line):
            hit("uuid", m.group())
        for m in SYNTHEA_NAME.finditer(line):
            hit("synthea_name", m.group())
        for m in CPT_LIKE.finditer(line):
            if m.group() != "00000":  # our fictional ZIP
                hit("cpt_like", m.group())
        if check_payers:
            for m in REAL_PAYERS.finditer(line):
                hit("real_payer", m.group())
    return found


def _strings(value: object) -> list[str]:
    """Every string (keys and values) inside parsed JSON. Numbers are not text, so skip them."""
    if isinstance(value, str):
        return [value]
    if isinstance(value, dict):
        return [s for k, v in value.items() for s in [str(k), *_strings(v)]]
    if isinstance(value, list):
        return [s for v in value for s in _strings(v)]
    return []


def scan_file(path: Path, rel: str, check_payers: bool) -> list[Finding]:
    text = path.read_text(encoding="utf-8")
    if path.suffix not in (".json", ".jsonl"):
        return scan_text(text, rel, check_payers)
    docs = [text] if path.suffix == ".json" else text.splitlines()
    found: list[Finding] = []
    for n, doc in enumerate(docs, start=1):
        try:
            parsed = json.loads(doc)
        except json.JSONDecodeError:
            found.append(Finding(rel, n, "unparsable_json", ""))
            continue
        for hit in scan_text("\n".join(_strings(parsed)), rel, check_payers):
            found.append(Finding(rel, n, hit.rule, hit.sample))
    return found


def scan_tree(root: Path) -> list[Finding]:
    found: list[Finding] = []
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES:
            continue
        rel = (
            path.relative_to(config.ROOT).as_posix()
            if path.is_relative_to(config.ROOT)
            else str(path)
        )
        # Docs about licensing may name payers; synthetic rows may not.
        check_payers = "synthetic" in path.parts
        if "reference" in path.parts:
            continue  # public code tables; checked by their own tests
        found += scan_file(path, rel, check_payers)
    return found
