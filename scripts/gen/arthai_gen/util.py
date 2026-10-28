"""Deterministic helpers: seed parsing, derived RNGs, canonical JSON lines, hashing."""

from __future__ import annotations

import hashlib
import json
import random
from collections.abc import Iterable
from pathlib import Path
from typing import TypeVar

from pydantic import BaseModel

MAX_SEED = 2**63 - 1
M = TypeVar("M", bound=BaseModel)


class SeedError(ValueError):
    """The seed is not a plain non-negative integer in range."""


def parse_seed(raw: object) -> int:
    """Accept an int or a string of ASCII digits, 0..2**63-1. Reject everything else."""
    if isinstance(raw, bool):
        raise SeedError("seed must be an integer, not a bool")
    if isinstance(raw, int):
        value = raw
    elif isinstance(raw, str):
        if not raw or len(raw) > 19 or not raw.isascii() or not raw.isdigit():
            raise SeedError(f"seed must be 1..19 ASCII digits, got {raw!r}")
        value = int(raw)
    else:
        raise SeedError(f"seed must be an integer, got {type(raw).__name__}")
    if not 0 <= value <= MAX_SEED:
        raise SeedError(f"seed must be in 0..{MAX_SEED}")
    return value


def derive_rng(seed: int, stage: str) -> random.Random:
    """One independent RNG per stage, so a change in one stage leaves the others unchanged."""
    digest = hashlib.sha256(f"arthai:{seed}:{stage}".encode()).digest()
    return random.Random(int.from_bytes(digest[:8], "big"))


def canonical_json(model: BaseModel) -> str:
    data = model.model_dump(mode="json")
    return json.dumps(data, sort_keys=True, ensure_ascii=True, separators=(",", ":"))


def write_jsonl(path: Path, rows: Iterable[BaseModel]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [canonical_json(r) for r in rows]
    path.write_text("".join(line + "\n" for line in lines), encoding="utf-8", newline="\n")
    return len(lines)


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, sort_keys=True, ensure_ascii=True, indent=2) + "\n"
    path.write_text(text, encoding="utf-8", newline="\n")


def read_jsonl[M: BaseModel](path: Path, model: type[M]) -> list[M]:
    rows: list[M] = []
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            raise ValueError(f"{path}:{n}: blank line")
        rows.append(model.model_validate_json(line))
    return rows


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()
