#!/bin/bash
# Starts the backend (FastAPI, :8430) then the frontend (Vite, :5430) in the
# lab conda env. Refuses to start anything already listening on its port.
# Checks ports, not stored pids -- `conda run` doesn't forward its child's
# real pid through $!.
set -euo pipefail
APP_DIR="$(dirname "$(cd "$(dirname "$0")" && pwd)")"

wait_for() {
  for _ in $(seq 1 "$3"); do
    curl -sf "$1" > /dev/null 2>&1 && { echo "$2 ready."; return 0; }
    sleep 1
  done
  echo "$2 did not become ready in time." >&2
  return 1
}

mkdir -p "$APP_DIR/backend/logs" "$APP_DIR/frontend/logs"

if lsof -ti:8430 -sTCP:LISTEN > /dev/null 2>&1; then
  echo "Backend already running on port 8430."
else
  (cd "$APP_DIR/backend" && nohup conda run -n lab python -m app.main > logs/backend.log 2>&1 &)
  wait_for "http://localhost:8430/docs" "Backend" 30
fi

if lsof -ti:5430 -sTCP:LISTEN > /dev/null 2>&1; then
  echo "Frontend already running on port 5430."
else
  (cd "$APP_DIR/frontend" && nohup conda run -n lab npm run dev > logs/frontend.log 2>&1 &)
  wait_for "http://localhost:5430" "Frontend" 30
fi

echo "All up: http://localhost:5430 (frontend), http://localhost:8430/docs (backend API)"
