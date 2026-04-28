# ─── LeakMap AI — Cloud Run Container ───
# Multi-stage build for Next.js standalone output

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env variables for Next.js static generation
# Cloud config is runtime-only — no secrets baked into the image
ARG NEXT_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=${NEXT_TELEMETRY_DISABLED}

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# ─── Google Cloud Service Configuration ───
# These are injected at runtime by Cloud Run (or .env)
# The app functions fully in demo mode without any of these set.
#
# Core
# ENV GOOGLE_CLOUD_PROJECT=
# ENV GOOGLE_CLOUD_LOCATION=us-central1
#
# Gemini
# ENV GEMINI_API_KEY=
#
# Cloud Storage
# ENV GCS_BUCKET_ASSETS=
# ENV GCS_BUCKET_EVIDENCE=
#
# Firestore
# ENV FIRESTORE_DATABASE=(default)
#
# BigQuery
# ENV BIGQUERY_DATASET=
#
# Pub/Sub
# ENV PUBSUB_TOPIC_SCANS=

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080

CMD ["node", "server.js"]
