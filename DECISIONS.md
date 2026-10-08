# DECISIONS.md — CampusLoop Architecture Decision Records (ADRs)

This file tracks all significant architectural and technical decisions made in the CampusLoop project.

---

## Decision 001: Monorepo Workspace Structure

- **Date**: 2026-10-08
- **Context**: CampusLoop contains both an Express.js backend and a React/Vite frontend. We need unified dependency coordination and single-command local development.
- **Decision**: Use an npm workspaces monorepo at root with `backend/` and `frontend/` folders, orchestrated via `concurrently`.
- **Reason**: Simplifies local setup for developers, keeps all code in a single repository, and avoids split-repository synchronization lag during hackathon velocity.
- **Alternatives Considered**: Multi-repo setup, Turborepo / Nx (too heavy for MVP scope).
- **Consequences**: Both frontend and backend share root scripts (`npm run dev`), but maintain isolated `package.json` dependencies.

---

## Decision 002: Native JavaScript ES Modules (`"type": "module"`)

- **Date**: 2026-10-08
- **Context**: Standardizing module syntax across frontend and backend.
- **Decision**: Configure `"type": "module"` in `backend/package.json` and use native `import`/`export` across all backend code.
- **Reason**: Aligns modern JavaScript standards across both tiers and avoids CommonJS/ESM interop friction.
- **Alternatives Considered**: CommonJS `require()`.
- **Consequences**: Must use `.js` extensions in local relative imports when running in Node.js.

---

## Decision 003: Dual Architecture — REST for Persistence & Socket.IO for Ephemeral Events

- **Date**: 2026-10-08
- **Context**: Real-time communication is needed for chat and offers, but data durability and history must remain consistent.
- **Decision**: All persistent state (creating listings, sending messages, submitting offers, fetching history) goes through REST endpoints and writes to MongoDB. Socket.IO is reserved exclusively for broadcasting real-time events (`newMessage`, `typing:start`, `user:online`, `offer:new`).
- **Reason**: Prevents message loss on socket disconnection, keeps database operations transactional and testable, and provides reliable pagination over REST.
- **Alternatives Considered**: Pure WebSocket API without REST endpoints.
- **Consequences**: Messages are persisted via REST or verified database writes before socket broadcast; chat history is fetched via REST on initial load.

---

## Decision 004: Azure Blob Storage Direct Client SAS Upload Pattern

- **Date**: 2026-10-08
- **Context**: Listing images need to be uploaded reliably without overloading the Express server.
- **Decision**: Backend generates short-lived, write-only Azure Blob SAS URLs. The frontend uploads image binaries directly to Azure, then sends the resulting blob URLs to the backend when publishing the listing.
- **Reason**: Offloads network bandwidth and memory pressure from Node.js server, prevents buffer overflows on large uploads, and avoids exposing Azure credentials to the client.
- **Alternatives Considered**: Streaming multipart form data through Express / Multer.
- **Consequences**: Requires Azure Blob Storage SDK on the backend for SAS generation and preflight CORS configuration on Azure Blob containers.

---

## Decision 005: Pino for Low-Overhead Structured Logging

- **Date**: 2026-10-08
- **Context**: Production-quality logging is required without incurring console I/O bottlenecks.
- **Decision**: Adopt Pino with `pino-http` for Express request logging and `pino-pretty` for development formatting.
- **Reason**: Pino is significantly faster than Winston, formats logs cleanly as structured JSON in production, and standardizes request timing and status code recording.
- **Alternatives Considered**: `console.log`, Winston, Morgan.
- **Consequences**: No raw `console.log` statements permitted in backend code.

---

## Decision 006: Zod for Unified Runtime Environment and Payload Validation

- **Date**: 2026-10-08
- **Context**: Preventing startup failures from missing environment variables and validating incoming API requests.
- **Decision**: Use Zod to parse `process.env` at server startup (fail fast if invalid) and create reusable validation middleware for API requests.
- **Reason**: Provides TypeScript-grade schema safety, clear error messages, and easy composability.
- **Alternatives Considered**: Joi, Yup, manual validation checks.
- **Consequences**: Environment variables are strictly validated before MongoDB or Express initialization.

---

## Decision 007: Atomic Offer Acceptance via Server-Side Database Transactions

- **Date**: 2026-10-08
- **Context**: When a seller accepts an offer, the listing must become `SOLD`, the offer marked `ACCEPTED`, other pending offers canceled, and transaction counters updated without race conditions.
- **Decision**: Execute offer acceptance and state changes within atomic MongoDB operations/transactions on the backend. Never rely on frontend state for deal completion.
- **Reason**: Protects against double-selling an item to multiple concurrent buyers.
- **Alternatives Considered**: Client-driven multi-step update calls.
- **Consequences**: Requires strict backend validation of ownership and listing status before state transitions.

## Decision 008: Server-Owned HTTP-Only Sessions for Authentication

- **Date**: 2026-10-08
- **Context**: CampusLoop needs browser authentication without exposing tokens to frontend JavaScript.
- **Decision**: Use Passport for Google OAuth and Express sessions backed by an HTTP-only, same-site cookie. Store only the user identity in the session and load the User from MongoDB.
- **Reason**: Keeps authentication state server-owned and fits the Google OAuth flow required by the MVP.
- **Alternatives Considered**: JWT in localStorage (rejected because browser script access increases token exposure), frontend-only verification (rejected because the client is untrusted).
- **Consequences**: Production requires a persistent session store and configured Google OAuth credentials.

## Decision 009: Open Email-Domain Registration

- **Date**: 2026-10-08
- **Context**: The product should allow users from any email provider or institution to register.
- **Decision**: Accept any syntactically valid email domain during Google profile validation; reject malformed addresses only.
- **Reason**: Removes unnecessary domain restrictions while preserving basic input correctness.
- **Alternatives Considered**: Maintaining a configured campus allowlist, which would block otherwise valid users.
- **Consequences**: `verified` confirms a valid Google-authenticated email, not campus membership. Stronger campus trust will require a separate verification mechanism later.

## Decision 010: Standalone MongoDB Development Fallback

- **Date**: 2026-10-08
- **Context**: Local MongoDB deployments commonly run without replica-set support, but offer acceptance must still work for development.
- **Decision**: Use MongoDB transactions on replica sets/Atlas and a conditional listing state claim on standalone MongoDB. The fallback rejects concurrent sale attempts through `status: ACTIVE|NEGOTIATING` matching.
- **Reason**: Keeps the local development flow usable without weakening the production transaction path.
- **Consequences**: The standalone fallback is not equivalent to a multi-document transaction; production should use a replica set or MongoDB Atlas.
