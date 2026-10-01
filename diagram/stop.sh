#!/bin/bash
# Stops whatever is listening on the diagram service port (8440).
pids=$(lsof -ti:8440 -sTCP:LISTEN || true)
if [ -n "$pids" ]; then kill $pids && echo "Stopped port 8440."; else echo "Nothing running on port 8440."; fi
