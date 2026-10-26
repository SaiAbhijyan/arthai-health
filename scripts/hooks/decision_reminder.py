# scripts/hooks/decision_reminder.py
# Claude Code passes the tool call as JSON on stdin. Exit code 2 blocks the call
# and shows stderr to Claude, which then fixes the problem and retries.
import json, subprocess, sys
call = json.load(sys.stdin)
cmd = call.get("tool_input", {}).get("command", "")
if "git commit" not in cmd:
    sys.exit(0)
staged = subprocess.run(["git", "diff", "--cached", "--name-only"], capture_output=True, text=True).stdout.split()
significant = [f for f in staged if f.startswith(("pyproject.toml", "package.json", "migrations/", "packages/rcm_models/", "services/")) ]
logged = any(f in ("DECISIONS.md",) or f.startswith("docs/adr/") for f in staged)
if significant and not logged and any(f.startswith(("pyproject.toml", "package.json", "migrations/")) for f in significant):
    print("Dependency or schema change without a decision entry. Run /decision or add 'No decision: <reason>' to the commit message.", file=sys.stderr)
    sys.exit(2)
sys.exit(0)
