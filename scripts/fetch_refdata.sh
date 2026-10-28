#!/usr/bin/env bash
# Download the public CMS code files used to build data/reference/codes subsets (D-019).
# Files land in build/ref (gitignored). sha256 is pinned; a mismatch stops the script.
# CMS replaces files quarterly. On a mismatch, review the new file, then update the pin.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/build/ref"
mkdir -p "$OUT"

HCPCS_URL="https://www.cms.gov/files/zip/october-2026-alpha-numeric-hcpcs-file.zip"
HCPCS_SHA256="08c2202fa92c1d1fb6f31b808b61c767bc487954f6930b6a0f8d09c89af5992f"
ICD_URL="https://www.cms.gov/files/zip/2027-code-descriptions-tabular-order.zip"
ICD_SHA256="91c6c9d1117764ce72375a0f3a5493b1725dafbc1ab283b55799076c9e194965"

fetch() { # url sha dest
  curl --proto '=https' --tlsv1.2 -fsSL -A "arthai-refdata/1.0" "$1" -o "$3.part"
  echo "$2  $3.part" | sha256sum -c --quiet - || { rm -f "$3.part"; echo "fetch_refdata: sha256 mismatch for $1" >&2; exit 1; }
  mv "$3.part" "$3"
}
fetch "$HCPCS_URL" "$HCPCS_SHA256" "$OUT/hcpcs.zip"
fetch "$ICD_URL" "$ICD_SHA256" "$OUT/icd10cm.zip"
rm -rf "$OUT/hcpcs" "$OUT/icd10cm"
unzip -q -o "$OUT/hcpcs.zip" -d "$OUT/hcpcs"
unzip -q -o "$OUT/icd10cm.zip" -d "$OUT/icd10cm"
ls "$OUT/hcpcs/HCPC2026_OCT_ANWEB_09232026.txt" "$OUT/icd10cm/Code Descriptions/icd10cm_codes_2027.txt"
