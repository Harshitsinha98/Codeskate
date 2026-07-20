# syntax=docker/dockerfile:1

##
# Multi-stage production image for codeskate (Next.js standalone output).
#
# Stages:
#   deps    — install all dependencies (cached on lockfile changes)
#   builder — generate the Prisma client and build the standalone server bundle
#   runner  — minimal non-root runtime carrying only the standalone output
##

# ---- deps ---------------------------------------------------------------------
FROM node:22-alpine AS deps
# libc compat for some native deps (e.g. Prisma engines) on Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
# `npm ci` runs the `postinstall` (prisma generate) using the copied schema.
RUN npm ci

# ---- builder ------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Regenerate the client against the full schema, then build.
RUN npx prisma generate && npm run build

# ---- runner -------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone output bundles a minimal server + only the node_modules it needs.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma engine + schema + committed migrations for runtime queries/migrations.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Prisma CLI + engines so the entrypoint can run `prisma migrate deploy`. The
# standalone bundle omits devDependencies, so copy these explicitly.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000

# Container-level liveness probe hitting the health route.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Apply migrations (prisma migrate deploy) then launch the standalone server.
ENTRYPOINT ["./docker-entrypoint.sh"]
