#!/usr/bin/env bash
# Stops the Cartiva backend (Docker). The frontend dev server runs in the
# foreground under run-local.sh — stop it there with Ctrl+C.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

echo "==> Stopping backend (Docker)"
(cd "$BACKEND_DIR" && docker compose down)

echo "Backend stopped."
