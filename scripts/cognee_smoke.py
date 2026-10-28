"""Cognee smoke test: local storage + fastembed only, no LLM key, telemetry off.

Run:  set -a; . ./.env.example; set +a; .venv/bin/python scripts/cognee_smoke.py
Synthetic data only.
"""
import asyncio
import os
import socket
import sys

os.environ.setdefault("TELEMETRY_DISABLED", "1")
for var in ("LLM_API_KEY", "OPENAI_API_KEY"):
    os.environ.pop(var, None)

# Record every hostname the process tries to resolve.
HOSTS = []
_orig = socket.getaddrinfo
def _spy(host, *a, **k):
    HOSTS.append(str(host))
    return _orig(host, *a, **k)
socket.getaddrinfo = _spy

import cognee  # noqa: E402
from cognee.shared import utils as cu  # noqa: E402

SENT = []
_orig_send = cu._send_telemetry_request
async def _spy_send(payload):
    SENT.append(payload.get("event_name"))
    return await _orig_send(payload)
cu._send_telemetry_request = _spy_send

NOTE = (
    "SYNTHETIC payer rule (fake payer 'Acme Health Plan', fake data): "
    "CARC 197 denials (precertification/authorization absent) for CPT 72148 lumbar MRI "
    "can be appealed within 60 days if the provider attaches the prior-auth request "
    "and the ordering physician's notes."
)

async def main():
    await cognee.prune.prune_data()
    await cognee.prune.prune_system(metadata=True)
    step = "add"
    try:
        await cognee.add(NOTE, dataset_name="payer_rules_smoke")
        print("add: OK")
        step = "cognify"
        await cognee.cognify(datasets=["payer_rules_smoke"])
        print("cognify: OK")
        step = "search"
        res = await cognee.search(
            query_text="What can I do about a CARC 197 denial on an MRI?",
            query_type=cognee.SearchType.CHUNKS,
            datasets=["payer_rules_smoke"],
            top_k=3,
        )
        print(f"search CHUNKS: {len(res)} result(s)")
        for r in res:
            for item in (r.get("search_result") or []) if isinstance(r, dict) else [r]:
                text = item.get("text") if isinstance(item, dict) else str(item)
                print("  -", (text or "")[:200])
    except Exception as e:  # report and stop
        print(f"{step}: FAILED -> {type(e).__name__}: {str(e)[:600]}")
    finally:
        hit = [h for h in HOSTS if "prometh" in h]
        print("telemetry sends attempted:", SENT)
        print("hosts resolved:", sorted(set(HOSTS)))
        print("prometh.ai contacted:", bool(hit))

asyncio.run(main())
