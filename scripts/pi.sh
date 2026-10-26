#!/usr/bin/env bash
# Start the pi coding agent (earendil-works/pi, formerly badlogic/pi-mono) for this repo.
# Installed project-locally under /workspace/tools/pi (no global install).
# Model backend: OmniRoute at 127.0.0.1:20128 once provider keys exist.
set -euo pipefail
PI_HOME="${PI_HOME:-/workspace/tools/pi}"
export PATH="/workspace/tools/node24/bin:$PATH"
export PI_CODING_AGENT_DIR="${PI_CODING_AGENT_DIR:-$PI_HOME/agent}"
export PI_TELEMETRY=0
mkdir -p "$PI_CODING_AGENT_DIR"
if [[ ! -f "$PI_CODING_AGENT_DIR/models.json" ]]; then
  # The key comes from the environment at request time. Never write a key into this file.
  cat > "$PI_CODING_AGENT_DIR/models.json" <<'JSON'
{
  "providers": {
    "omniroute": {
      "baseUrl": "http://127.0.0.1:20128/v1",
      "api": "openai-completions",
      "apiKey": "$OMNIROUTE_API_KEY",
      "models": [ { "id": "auto" } ]
    }
  }
}
JSON
fi
exec "$PI_HOME/node_modules/.bin/pi" "$@"
