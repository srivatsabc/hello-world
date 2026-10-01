#!/bin/bash
# Stops whatever is listening on the backend (8430) and frontend (5430) ports.
for port in 8430 5430; do
  pids=$(lsof -ti:"$port" -sTCP:LISTEN || true)
  if [ -n "$pids" ]; then
    kill $pids && echo "Stopped port $port."
  else
    echo "Nothing running on port $port."
  fi
done
