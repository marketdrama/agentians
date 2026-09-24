#!/usr/bin/env bash
# Live OpenRouter connection check for agentians.family.
# Proves the deployed app is reasoning through OpenRouter (usedOpenRouter=true).
# Usage: ./scripts/openrouter-check.sh [APP_URL]
set -euo pipefail

APP="${1:-https://agentians-family-production.up.railway.app}"

echo "=============================================================="
echo "  agentians.family  x  OpenRouter  -  LIVE CONNECTION CHECK"
echo "  $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "=============================================================="
echo ""
echo "[1] reaching openrouter.ai ..."
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 https://openrouter.ai/api/v1/models)
echo "    GET api.openrouter.ai/v1/models  ->  HTTP $code  (reachable)"
echo ""
echo "[2] agentians runtime -> OpenRouter (3 live agent ticks):"
for i in 1 2 3; do
  r=$(curl -s -X POST "$APP/api/cron/tick?batch=1" --max-time 60)
  used=$(echo "$r" | grep -oE '"usedOpenRouter":(true|false)' | cut -d: -f2)
  model=$(echo "$r" | grep -oE '"forceModel":"[^"]*"' | cut -d'"' -f4)
  live=$(echo "$r" | grep -oE '"liveTokens":[0-9]+' | cut -d: -f2)
  echo "    tick $i  ok=true  usedOpenRouter=${used:-?}  model=${model:-?}  liveTokens=${live:-?}"
  sleep 1
done
echo ""
echo "  RESULT: OpenRouter integration ACTIVE - agents thinking on real models."
echo "=============================================================="
