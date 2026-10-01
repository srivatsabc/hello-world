#!/bin/bash
# Starts the diagram backend (which also serves the diagram frontend) on :8440 in the lab conda env. Refuses to
# start if the port is taken. Checks the port, not a stored pid -- `conda run`
# doesn't forward its child's real pid through $!.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$DIR/logs"
if lsof -ti:8440 -sTCP:LISTEN > /dev/null 2>&1; then
  echo "Diagram service already running on port 8440."
  exit 0
fi
(cd "$DIR/backend" && nohup conda run -n lab python -m diagram_app.main > "$DIR/logs/diagram.log" 2>&1 &)
for _ in $(seq 1 30); do
  curl -sf http://localhost:8440/api/v1/system-management/health-checks/status > /dev/null 2>&1 && { echo "Diagram service ready: http://localhost:8440"; exit 0; }
  sleep 1
done
echo "Diagram service did not become ready in time." >&2
exit 1
