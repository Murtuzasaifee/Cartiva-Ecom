#!/usr/bin/env bash
# Runs the Cartiva backend (Docker) + frontend (npm dev server) locally.
# The Salesforce/Apex layer is NOT started here — it's the real org already
# deployed via `sf project deploy start` (see README.md).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "No backend/.env found — copying backend/.env.example."
  echo "Fill in the SALESFORCE_* values to enable real Case creation (see README.md)."
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
fi

echo "==> Building and starting backend (Docker) on :8080"
# --force-recreate so edits to backend/.env always take effect, even if a
# container from a previous run is still up with stale environment variables.
(cd "$BACKEND_DIR" && docker compose up -d --build --force-recreate)

echo "==> Waiting for backend to become healthy..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:8080/api/products >/dev/null 2>&1; then
    echo "Backend is up."
    break
  fi
  sleep 2
done

echo "==> Checking Salesforce connection..."
SF_STATUS=$(curl -sf http://localhost:8080/api/salesforce/status || echo '{"configured":false,"connected":false}')
echo "$SF_STATUS"
if echo "$SF_STATUS" | grep -q '"connected":true'; then
  echo "Salesforce: connected — tickets will create real Cases in your org."
else
  echo "Salesforce: NOT connected — check backend/.env values and backend logs (docker compose logs -f backend)."
  echo "Tickets will still be created locally and stay SYNC_PENDING until this is fixed."
fi

echo "==> Installing frontend dependencies"
(cd "$FRONTEND_DIR" && npm install)

echo ""
echo "Backend:    http://localhost:8080"
echo "H2 console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:file:/app/data/cartiva)"
echo "Frontend:   starting now at http://localhost:5173"
echo ""
echo "Salesforce org (already deployed, not started by this script):"
echo "  sf org open -o case-triage-poc"
echo ""
echo "To stop the backend later: (cd backend && docker compose down)"
echo ""

cd "$FRONTEND_DIR"
npm run dev
