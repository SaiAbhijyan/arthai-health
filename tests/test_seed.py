from __future__ import annotations

import pytest

from arthai_gen.cli import main
from arthai_gen.util import MAX_SEED, SeedError, derive_rng, parse_seed


@pytest.mark.parametrize("good", [0, 1, "0", "20261104", str(MAX_SEED), MAX_SEED])
def test_good_seeds(good: object) -> None:
    assert parse_seed(good) == int(str(good))


@pytest.mark.parametrize(
    "bad",
    [
        -1,
        MAX_SEED + 1,
        "-1",
        "+5",
        " 5",
        "5 ",
        "",
        "1e3",
        "0x10",
        "1.0",
        "١٢٣",
        "²",
        "9" * 20,
        True,
        False,
        1.0,
        None,
        [1],
        b"5",
    ],
)
def test_malformed_seeds_rejected(bad: object) -> None:
    with pytest.raises(SeedError):
        parse_seed(bad)


def test_cli_rejects_bad_seed_without_writing(capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["generate", "--seed", "-3"]) == 2
    assert "seed" in capsys.readouterr().err


def test_stage_rngs_are_independent_and_stable() -> None:
    a = derive_rng(7, "claims").random()
    assert a == derive_rng(7, "claims").random()
    assert a != derive_rng(7, "calls").random()
    assert a != derive_rng(8, "claims").random()
