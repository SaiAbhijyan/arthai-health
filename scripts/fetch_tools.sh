#!/usr/bin/env bash
# Fetch and verify the pinned tools for the synthetic-data pipeline (D-016).
# Tools go to $ARTHAI_TOOLS_DIR (default /workspace/tools), never into the repo, never global.
# Usage: scripts/fetch_tools.sh [fetch|verify|paths]
set -euo pipefail

TOOLS_DIR="${ARTHAI_TOOLS_DIR:-/workspace/tools}"

# Eclipse Temurin JDK 17 (GPL-2.0 with Classpath Exception). sha256 from api.adoptium.net
# and from the GitHub release .sha256.txt (both checked 2026-10-28; they match).
JDK_VERSION="17.0.21+9"
JDK_FILE="OpenJDK17U-jdk_x64_linux_hotspot_17.0.21_9.tar.gz"
JDK_URL="https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.21%2B9/${JDK_FILE}"
JDK_SHA256="8b9b611d917e3dfd8419d3566b5949226f69b052fed7e109c1368add1dfe8711"
JDK_DIR="${TOOLS_DIR}/jdk-${JDK_VERSION}"

# Synthea (Apache-2.0). Versioned release, not the rolling master-branch-latest.
# sha256 from the GitHub release asset digest (checked 2026-10-28).
SYNTHEA_TAG="v4.0.0"
SYNTHEA_URL="https://github.com/synthetichealth/synthea/releases/download/${SYNTHEA_TAG}/synthea-with-dependencies.jar"
SYNTHEA_SHA256="ed43c20ad40ba5c3bc724503a5af032715fe3c491620b766148e7c2361e6ecc1"
SYNTHEA_JAR="${TOOLS_DIR}/synthea/${SYNTHEA_TAG}/synthea-with-dependencies.jar"

die() { echo "fetch_tools: $*" >&2; exit 1; }

check_sha() { # file expected
  local got
  got="$(sha256sum "$1" | awk '{print $1}')"
  [ "$got" = "$2" ] || die "sha256 mismatch for $1: got $got, want $2"
}

download() { # url dest sha
  local part="$2.part"
  mkdir -p "$(dirname "$2")"
  curl --fail --location --proto '=https' --tlsv1.2 --silent --show-error -o "$part" "$1"
  check_sha "$part" "$3"
  mv "$part" "$2"
}

fetch_jdk() {
  [ "$(uname -m)" = "x86_64" ] || die "only x86_64 Linux is pinned"
  if [ -x "${JDK_DIR}/bin/java" ] && [ -f "${JDK_DIR}/.arthai-sha256" ] && [ "$(cat "${JDK_DIR}/.arthai-sha256")" = "$JDK_SHA256" ]; then
    echo "jdk: ok (${JDK_DIR})"; return
  fi
  local tgz="${TOOLS_DIR}/.downloads/${JDK_FILE}"
  [ -f "$tgz" ] && check_sha "$tgz" "$JDK_SHA256" || download "$JDK_URL" "$tgz" "$JDK_SHA256"
  local tmp="${JDK_DIR}.tmp"
  rm -rf "$tmp" && mkdir -p "$tmp"
  tar -xzf "$tgz" -C "$tmp" --strip-components=1 --no-same-owner
  echo "$JDK_SHA256" > "$tmp/.arthai-sha256"
  rm -rf "$JDK_DIR" && mv "$tmp" "$JDK_DIR"
  echo "jdk: installed (${JDK_DIR})"
}

fetch_synthea() {
  if [ -f "$SYNTHEA_JAR" ]; then check_sha "$SYNTHEA_JAR" "$SYNTHEA_SHA256"; echo "synthea: ok (${SYNTHEA_JAR})"; return; fi
  download "$SYNTHEA_URL" "$SYNTHEA_JAR" "$SYNTHEA_SHA256"
  echo "synthea: installed (${SYNTHEA_JAR})"
}

verify() {
  [ -x "${JDK_DIR}/bin/java" ] || die "jdk missing; run: $0 fetch"
  [ "$(cat "${JDK_DIR}/.arthai-sha256" 2>/dev/null)" = "$JDK_SHA256" ] || die "jdk marker mismatch; run: $0 fetch"
  "${JDK_DIR}/bin/java" -version 2>&1 | grep -q '"17\.0\.21"' || die "unexpected java version"
  [ -f "$SYNTHEA_JAR" ] || die "synthea jar missing; run: $0 fetch"
  check_sha "$SYNTHEA_JAR" "$SYNTHEA_SHA256"
  echo "verify: ok"
}

case "${1:-fetch}" in
  fetch) fetch_jdk; fetch_synthea; verify ;;
  verify) verify ;;
  paths) echo "JAVA=${JDK_DIR}/bin/java"; echo "SYNTHEA_JAR=${SYNTHEA_JAR}"; echo "SYNTHEA_TAG=${SYNTHEA_TAG}" ;;
  *) die "usage: $0 [fetch|verify|paths]" ;;
esac
