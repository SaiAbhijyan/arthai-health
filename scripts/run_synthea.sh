#!/usr/bin/env bash
# Run the pinned Synthea jar offline and deterministically (D-016, D-017).
# Output: build/synthea/csv/{patients,encounters}.csv (gitignored, raw, never committed).
# The run has no network: `unshare -rn` puts it in an empty network namespace.
# Usage: scripts/run_synthea.sh [population] [seed]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
POP="${1:-200}"
SEED="${2:-20261104}"
REF_DATE="20261028"   # fixed "demo today"; must match arthai_gen.config.DEMO_TODAY
OUT="$ROOT/build/synthea"

[[ "$POP" =~ ^[1-9][0-9]{0,3}$ ]] || { echo "run_synthea: population must be 1..9999" >&2; exit 2; }
[[ "$SEED" =~ ^[0-9]{1,18}$ ]] || { echo "run_synthea: seed must be 1..18 digits" >&2; exit 2; }

eval "$("$ROOT/scripts/fetch_tools.sh" paths)"
"$ROOT/scripts/fetch_tools.sh" verify >/dev/null

command -v unshare >/dev/null || { echo "run_synthea: unshare not found; refusing to run with network" >&2; exit 3; }
unshare -rn true 2>/dev/null || { echo "run_synthea: cannot create an offline namespace; refusing to run" >&2; exit 3; }

rm -rf "$OUT"
mkdir -p "$OUT"
cd "$OUT"   # Synthea writes ./output and logs relative to cwd
unshare -rn "$JAVA" -Xmx2g -jar "$SYNTHEA_JAR" \
  -s "$SEED" -cs "$SEED" -r "$REF_DATE" -p "$POP" \
  --generate.thread_pool_size=1 \
  --generate.terminology_service_url= \
  --exporter.baseDirectory="$OUT" \
  --exporter.years_of_history=2 \
  --exporter.csv.export=true \
  --exporter.csv.included_files=patients.csv,encounters.csv \
  --exporter.fhir.export=false \
  --exporter.hospital.fhir.export=false \
  --exporter.practitioner.fhir.export=false \
  --exporter.metadata.export=false \
  > "$OUT/synthea.log" 2>&1 || { echo "run_synthea: Synthea failed, see $OUT/synthea.log" >&2; exit 1; }

ls "$OUT/csv" >/dev/null
sha256sum "$OUT/csv/patients.csv" "$OUT/csv/encounters.csv"
