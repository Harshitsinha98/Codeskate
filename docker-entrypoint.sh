#!/bin/sh
# Container entrypoint: apply pending database migrations, then start the server.
#
# `prisma migrate deploy` is the PRODUCTION-SAFE apply command — it runs only
# committed migrations, never generates or resets, and is a no-op when the
# database is already up to date. Running it here means a fresh deployment (or a
# new schema version) becomes ready with no manual migration step. If migrations
# fail the container exits non-zero and never serves a half-migrated schema.
set -e

echo "[entrypoint] applying database migrations (prisma migrate deploy)…"
node node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] starting server…"
exec node server.js
