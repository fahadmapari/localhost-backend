# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (hot reload)
npm run dev

# Production build (compiles TS + resolves path aliases)
npm run build

# Start production server (requires build first)
npm start

# Lint
npx eslint src/

# Seed Pinecone vector DB (one-off script)
npm run seed:pinecone:temp

# Production deployment via PM2
pm2 start ecosystem.config.cjs --env production
```

No test framework is configured.

## Architecture

Express.js REST API (monolith) with real-time WebSocket support, background jobs, and AI capabilities. All routes are prefixed `/api/v1/*`.

**Request flow:**
```
Routes → Middlewares (auth, rate-limit) → Controllers → Services → Models → MongoDB
```

**Layer responsibilities:**
- `src/routes/` — Express router definitions; binds middlewares per route
- `src/controllers/` — Parses requests, calls service, formats JSON response
- `src/services/` — All business logic; never called directly from routes
- `src/models/` — Mongoose schemas; `InferSchemaType` used for TypeScript inference
- `src/middlewares/` — Auth (JWT verify + RBAC), Arcjet rate limiting, global error handler
- `src/schema/` — Zod validation schemas applied at controller entry points
- `src/config/` — One file per external service (Redis, S3, Pinecone, AI, BullMQ, Socket.io)
- `src/jobs/` — BullMQ worker definitions for async tasks (product embedding generation)

## Authentication & Authorization

Dual-token JWT system stored in `httpOnly` cookies. Access token is short-lived; refresh token is long-lived.

- `src/middlewares/auth.middleware.ts` — Verifies access token, attaches `req.user`
- Roles: `super admin`, `admin`, `client`, `supplier` — enforced per route via RBAC middleware
- Logout revokes tokens via Redis blocklist
- Token generation/hashing utilities live in `src/utils/common.ts`

## Real-time (Socket.io)

Socket.io is initialized in `src/config/sockets.ts` and uses the Redis adapter (`@socket.io/redis-adapter`) for multi-instance pub/sub. Conversations use room-based join/leave patterns. The Socket.io server instance is exported from `sockets.ts` and imported where broadcast is needed.

## Background Jobs (BullMQ)

Queue is configured in `src/config/queue.ts` using Upstash Redis. The only current job is **product embedding** — when a product is created or updated, a job is enqueued to generate Gemini text embeddings and upsert them into Pinecone. Job definition: `src/jobs/product-embedding.job.ts`.

## AI & Vector Search

- Google Gemini (`@google/genai`) generates text embeddings and rewrites product descriptions
- Pinecone stores embeddings for semantic similarity search
- `src/services/product-embedding.service.ts` orchestrates the embedding pipeline

## Key Environment Variables

```
PORT, DB_URI, NODE_ENV
JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXP_IN, JWT_REFRESH_EXP_IN
REDIS_TCP, REDIS_TOKEN
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME
GEMINI_KEY
PINECONE_KEY
ARCJET_KEY, ARCJET_ENV
```

Use `.env.development.local` for dev and `.env.production` for prod. The loader is `src/config/env.ts`.

## TypeScript Path Aliases

`@/` maps to `src/`. Resolved at compile time by `tsc-alias` (runs after `tsc`). Do not use relative `../../../` imports; use `@/` aliases.

## Error Handling

All errors should be created via `src/utils/errorHandlers.ts` and thrown — the global error middleware in `src/middlewares/error.middleware.ts` catches them and sends a standardized JSON response. Controllers should not contain `try/catch` that swallow errors silently.

## Production

PM2 is configured in `ecosystem.config.cjs` — cluster mode, one process per CPU core, 300 MB memory limit, zero-downtime reload. The compiled entry point is `dist/app.js`.
