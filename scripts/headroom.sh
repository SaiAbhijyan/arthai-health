#!/usr/bin/env bash
# Headroom token-compression proxy. Pinned version. Binds to 127.0.0.1 only.
# Usage: scripts/headroom.sh install|start|run|stop|status|check|claude
# Tracking is always off: these three variables are exported for every command.
set -euo pipefail
VERSION="0.42.0"
TOOL_ROOT="${HEADROOM_TOOL_ROOT:-/workspace/tools}"
BIN="$TOOL_ROOT/bin/headroom"
export HEADROOM_TELEMETRY=off HEADROOM_BEACON=off DO_NOT_TRACK=1
export HEADROOM_TELEMETRY_WARN=off
export HEADROOM_HOST=127.0.0.1 HEADROOM_PORT="${HEADROOM_PORT:-8787}"
# Keep Headroom state out of the repo and out of $HOME.
export HEADROOM_WORKSPACE_DIR="${HEADROOM_WORKSPACE_DIR:-$TOOL_ROOT/headroom-data}"
export HEADROOM_CONFIG_DIR="${HEADROOM_CONFIG_DIR:-$HEADROOM_WORKSPACE_DIR/config}"
URL="http://127.0.0.1:$HEADROOM_PORT"

install() {
  if ! "$BIN" --version 2>/dev/null | grep -q "$VERSION"; then
    UV_TOOL_DIR="$TOOL_ROOT/uv-tools" UV_TOOL_BIN_DIR="$TOOL_ROOT/bin" \
      uv tool install --python 3.12 --force "headroom-ai[proxy]==$VERSION"
  fi
  mkdir -p "$HEADROOM_WORKSPACE_DIR" "$HEADROOM_CONFIG_DIR"
}

case "${1:-status}" in
  install) install ;;
  start)
    install
    if tmux has-session -t arthai 2>/dev/null; then
      tmux list-windows -t arthai -F '#W' | grep -qx headroom || tmux new-window -d -t arthai -n headroom
      tmux send-keys -t arthai:headroom "$0 run" C-m
      echo "started in tmux window arthai:headroom ($URL)"
    else
      exec "$0" run
    fi ;;
  run) install; exec "$BIN" proxy --host 127.0.0.1 --port "$HEADROOM_PORT" --no-telemetry --no-subscription-tracking ;;
  stop) tmux send-keys -t arthai:headroom C-c 2>/dev/null || true ;;
  status|check) curl -fsS "$URL/health" && echo; "$BIN" telemetry 2>/dev/null | head -4 || true ;;
  # Opt-in only. Point one Claude Code session at the proxy. No global config change.
  claude) shift; ANTHROPIC_BASE_URL="$URL" exec claude "$@" ;;
  *) echo "usage: $0 install|start|run|stop|status|check|claude" >&2; exit 2 ;;
esac
