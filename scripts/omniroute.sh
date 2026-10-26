#!/usr/bin/env bash
# OmniRoute local LLM router. Pinned version. Binds to 127.0.0.1 only.
# Usage: scripts/omniroute.sh start|stop|status|add-keys
set -euo pipefail
VERSION="3.8.52"
TOOL_DIR="${OMNIROUTE_TOOL_DIR:-/workspace/tools/omniroute}"
BIN="$TOOL_DIR/node_modules/.bin/omniroute"
# OmniRoute needs Node 22.22+/24. Use a local Node 24 if present.
[ -x "$TOOL_DIR/../node24/bin/node" ] && export PATH="$TOOL_DIR/../node24/bin:$PATH"
PORT="${OMNIROUTE_PORT:-20128}"
export PORT OMNIROUTE_PORT="$PORT"
export OMNIROUTE_SERVER_HOST=127.0.0.1 HOST=127.0.0.1 APP_BIND_HOST=127.0.0.1
export DATA_DIR="${DATA_DIR:-$TOOL_DIR/data}"
export OMNIROUTE_NO_UPDATE_NOTIFIER=1 NEXT_TELEMETRY_DISABLED=1
export OMNIROUTE_BASE_URL="http://127.0.0.1:$PORT"
# Local secrets (dashboard password). This file is outside the repo. Never commit it.
SECRETS="$TOOL_DIR/.env.local"

install() {
  if ! grep -q "\"version\": \"$VERSION\"" "$TOOL_DIR/node_modules/omniroute/package.json" 2>/dev/null; then
    mkdir -p "$TOOL_DIR" && (cd "$TOOL_DIR" && [ -f package.json ] || npm init -y >/dev/null; npm i "omniroute@$VERSION" --no-fund --no-audit)
  fi
  mkdir -p "$DATA_DIR"
  if [ ! -f "$SECRETS" ]; then
    umask 077; echo "INITIAL_PASSWORD=$(openssl rand -hex 16)" > "$SECRETS"
  fi
  set -a; . "$SECRETS"; set +a
}

case "${1:-status}" in
  start)
    install
    if tmux has-session -t arthai 2>/dev/null; then
      tmux list-windows -t arthai -F '#W' | grep -qx omniroute || tmux new-window -d -t arthai -n omniroute
      tmux send-keys -t arthai:omniroute "$0 run" C-m
      echo "started in tmux window arthai:omniroute"
    else
      exec "$0" run
    fi ;;
  run) install; exec "$BIN" serve --port "$PORT" --no-open --no-tray --log ;;
  stop) "$BIN" stop || true; tmux send-keys -t arthai:omniroute C-c 2>/dev/null || true ;;
  status) curl -fsS "$OMNIROUTE_BASE_URL/api/monitoring/health" && echo || { echo "omniroute: not running on $OMNIROUTE_BASE_URL"; exit 1; } ;;
  add-keys)
    # API-key providers only. Set the env vars first. Missing vars are skipped.
    for pair in meta-llama:LLAMA_API_KEY fireworks:FIREWORKS_API_KEY baseten:BASETEN_API_KEY; do
      p="${pair%%:*}"; v="${pair##*:}"
      if [ -n "${!v:-}" ]; then "$BIN" providers add "$p" --credential-env "$v" --yes; else echo "skip $p: $v is not set"; fi
    done ;;
  *) echo "usage: $0 start|stop|status|add-keys"; exit 2 ;;
esac
