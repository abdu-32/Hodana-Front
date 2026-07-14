#!/usr/bin/env bash
# Pulls the latest contract from the backend repo and regenerates TS types.
# Run this deliberately (not automatically) whenever you want to pick up
# backend API changes — never mid-sprint by surprise.
#
# Set BACKEND_CONTRACT_URL to the raw file URL for your backend repo, e.g.
# a GitHub raw link to contracts/openapi.yaml on its default branch, or a
# tagged release for a pinned/stable contract version.

set -euo pipefail

BACKEND_CONTRACT_URL="${BACKEND_CONTRACT_URL:?Set BACKEND_CONTRACT_URL to the backend repo's raw contracts/openapi.yaml URL}"

curl -fsSL "$BACKEND_CONTRACT_URL" -o contracts/openapi.yaml
echo "contracts/openapi.yaml synced from $BACKEND_CONTRACT_URL"

./scripts/generate-types.sh
