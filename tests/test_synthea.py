"""Slow: run the pinned Synthea twice offline and compare bytes. Needs `make tools`."""

from __future__ import annotations

import hashlib
import os
import shutil
import subprocess

import pytest

from arthai_gen import config

pytestmark = pytest.mark.slow


@pytest.mark.skipif(os.environ.get("ARTHAI_SLOW") != "1", reason="set ARTHAI_SLOW=1")
def test_synthea_runs_offline_and_is_byte_stable() -> None:
    script = config.ROOT / "scripts/run_synthea.sh"
    csv_dir = config.BUILD / "synthea/csv"
    digests = []
    for _ in range(2):
        subprocess.run([str(script), "15", "7"], check=True, capture_output=True, timeout=600)
        digests.append(
            {
                n: hashlib.sha256((csv_dir / n).read_bytes()).hexdigest()
                for n in ("patients.csv", "encounters.csv")
            }
        )
    assert digests[0] == digests[1]
    assert sorted(p.name for p in csv_dir.iterdir()) == ["encounters.csv", "patients.csv"]
    shutil.rmtree(config.BUILD / "synthea")  # leave no partial build behind


def test_run_synthea_rejects_bad_args() -> None:
    script = str(config.ROOT / "scripts/run_synthea.sh")
    for args in (["0"], ["-5"], ["12a"], ["10", "-1"], ["10", "1;rm"], ["10", "9" * 19]):
        r = subprocess.run([script, *args], capture_output=True, timeout=30)
        assert r.returncode == 2, args
