#!/bin/sh
# Post-deploy check. Usage: ./scripts/smoke-test.sh http://localhost:3000
# Exits non-zero if the service is not healthy, so a pipeline can fail or roll back.
URL="${1:-http://localhost:3000}"

for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS "$URL/health" | grep -q '"status":"ok"'; then
    echo "Smoke test passed on attempt $i"
    exit 0
  fi
  echo "Waiting for $URL ... ($i/10)"
  sleep 2
done

echo "Smoke test FAILED"
exit 1
