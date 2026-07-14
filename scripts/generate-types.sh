#!/usr/bin/env bash
# Regenerates src/lib/api-types.ts from contracts/openapi.yaml.
# Run standalone after manually editing contracts/openapi.yaml (e.g. while
# waiting on a backend PR to merge), or automatically via sync-contract.sh.

set -euo pipefail
npx openapi-typescript contracts/openapi.yaml -o src/lib/api-types.ts
echo "src/lib/api-types.ts regenerated."
