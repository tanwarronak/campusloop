# DEVELOPMENT_LOG.md — CampusLoop Chronological Development Log

All significant engineering sessions, architecture changes, and milestone accomplishments are recorded here.

---

## 2026-10-08 — Session 1: Project Initialization & Foundations (Phase 0 & Phase 1)

### Phase
- Phase 0: Project Foundation (Completed)
- Phase 1: Backend Foundation (Completed)

### Implemented
- **Monorepo Setup**: Configured root monorepo with `package.json` workspaces (`backend`, `frontend`), `concurrently` scripts (`npm run dev`), `.gitignore`, and developer `README.md`.
- **Persistent Documentation Suite**:
  - `AGENTS.md`: Mandatory AI agent directives, source-of-truth priority, handoff protocols, and coding standards.
  - `PROJECT_CONTEXT.md`: Product vision, problem definition, core transaction loop, target users, and non-goals.
  - `PROGRESS.md`: Phase-by-phase tracker, current state descriptor, and handoff records.
  - `ARCHITECTURE.md`: Monorepo architecture, REST vs. Socket.IO boundaries, Azure Blob SAS direct upload pattern, and centralized error handling.
  - `API_REFERENCE.md`: Living API catalog including request/response envelopes and `GET /api/health`.
  - `DATABASE_SCHEMA.md`: Canonical schemas for User, Listing, Conversation, Message, and Offer models.
  - `DEVELOPMENT_LOG.md`: Chronological development log.
  - `DECISIONS.md`: Architecture Decision Records (ADRs 001 through 007).
  - `TODO.md`: Prioritized task backlog.
- **Backend Foundation (Node.js ES Modules)**:
  - Zod environment parsing and fail-fast validation (`src/config/env.js`).
  - Resilient Mongoose MongoDB connection with reconnect listeners and state inspector (`src/config/db.js`).
  - Low-overhead Pino structured logging with development pretty printing (`src/utils/logger.js`).
  - Centralized operational error management (`AppError`, `asyncHandler`, `error.middleware.js`, `notFound.middleware.js`, `validation.middleware.js`).
  - Standardized JSON response envelope across all endpoints and errors.
  - Helmet security headers and CORS configuration.
  - Health check endpoint `GET /api/health` returning database status, uptime timestamp, and environment.
  - Server lifecycle management with graceful shutdown on SIGTERM / SIGINT (`src/server.js`).
  - Automated integration tests with Vitest + Supertest (`tests/health.test.js`).
- **Frontend Foundation (Vite + React + Tailwind CSS)**:
  - Vite configuration with `@` alias and dev proxy to `http://localhost:5000`.
  - Tailwind CSS custom campus theme and typography.
  - Centralized Axios client instance with response unwrapping and error formatting.
  - React Router DOM router setup with Home view and phase placeholders.
  - Live `BackendStatusCard` component polling `/api/health` with TanStack Query.
  - Polished CampusLoop landing page communicating value proposition and transaction demo flow.

### Files Created
- `package.json`
- `.gitignore`
- `AGENTS.md`
- `PROJECT_CONTEXT.md`
- `PROGRESS.md`
- `ARCHITECTURE.md`
- `API_REFERENCE.md`
- `DATABASE_SCHEMA.md`
- `DEVELOPMENT_LOG.md`
- `DECISIONS.md`
- `TODO.md`
- `README.md`
- `backend/package.json`
- `backend/.env.example`
- `backend/.env`
- `backend/README.md`
- `backend/src/config/env.js`
- `backend/src/config/db.js`
- `backend/src/utils/logger.js`
- `backend/src/utils/AppError.js`
- `backend/src/utils/asyncHandler.js`
- `backend/src/middleware/notFound.middleware.js`
- `backend/src/middleware/error.middleware.js`
- `backend/src/middleware/validation.middleware.js`
- `backend/src/controllers/health.controller.js`
- `backend/src/routes/health.routes.js`
- `backend/src/routes/index.js`
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/tests/health.test.js`
- `frontend/package.json`
- `frontend/.env.example`
- `frontend/.env`
- `frontend/vite.config.js`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/index.html`
- `frontend/src/index.css`
- `frontend/src/api/axios.js`
- `frontend/src/components/common/Header.jsx`
- `frontend/src/components/common/Footer.jsx`
- `frontend/src/components/common/BackendStatusCard.jsx`
- `frontend/src/pages/Home.jsx`
- `frontend/src/router/index.jsx`
- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/README.md`

### Verification
- `npm test --workspace=backend`: 3/3 tests passed.
- `npm run build --workspace=frontend`: 0 errors, production build created in `frontend/dist/`.
- Endpoint `GET /api/health` returns HTTP 200 with standard `{ success: true, message: "CampusLoop API is running", data: { database: "..." } }`.

### Issues
- None.

### Next
- Proceed to Phase 2: Authentication & Campus Verification.

## 2026-10-08 — Session 2: Authentication Foundation (Phase 2)

### Phase
- Phase 2: Authentication & Campus Verification (In Progress)

### Implemented
- Added the Mongoose `User` model with verified status, trust fields, timestamps, and indexes.
- Added server-side campus email-domain validation from `ALLOWED_EMAIL_DOMAINS`.
- Added Passport Google OAuth strategy, guarded when credentials are absent.
- Added HTTP-only session cookies, `/api/auth/me`, `/api/auth/google`, `/api/auth/google/callback`, and `/api/auth/logout`.
- Added `requireAuth` middleware and frontend `AuthContext` with a functional `/login` view.

### Files Changed
- `backend/src/models/User.js`
- `backend/src/config/campus.js`
- `backend/src/config/passport.js`
- `backend/src/middleware/auth.middleware.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/routes/auth.routes.js`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/pages/Login.jsx`

### Verification
- `npm test`: PASS, 6/6 backend tests.
- `npm run build:frontend`: PASS.

### Issues
- Google OAuth credentials are intentionally blank in local `.env`; real browser login is not yet verifiable.
- Express MemoryStore is development-only.

### Next
- Configure Google OAuth, verify a real allowed-domain login, and protect the first marketplace endpoint.

## 2026-10-08 — Session 3: Open Email-Domain Registration

### Phase
- Phase 2: Authentication & Campus Verification (In Progress)

### Implemented
- Changed email validation to accept any syntactically valid domain.
- Kept malformed email/domain rejection in place.
- Updated environment examples, login copy, API documentation, and architecture notes.

### Verification
- Focused authentication tests: PASS, 3/3.

### Important Note
- The `verified` flag currently represents a Google-authenticated valid email, not proof of campus membership.

## 2026-10-08 — Session 4: Marketplace Listings (Phase 3)

### Implemented
- Added the Listing Mongoose model with category, condition, status, text-search, seller, and timestamp indexes.
- Added Zod validation for listing creation, updates, identifiers, filters, price ranges, and pagination.
- Added public listing discovery and detail endpoints plus authenticated seller-only create, update, delete, and sold transitions.
- Added frontend browse, detail, and create-listing views connected to the real API.

### Verification
- Backend tests: PASS, 9/9.
- Frontend production build: PASS.

### Remaining
- Authenticated CRUD still needs verification against the configured MongoDB instance.
- Listing image upload remains deferred to the Azure SAS storage phase.

## 2026-10-08 — Session 5: Azure Direct Image Uploads (Phase 4)

### Implemented
- Added Azure Blob Storage SDK integration and short-lived write-only SAS generation.
- Added authenticated `POST /api/storage/upload-url` with MIME type and 5 MB size validation.
- Added browser direct `PUT` upload helper and connected image selection to listing creation.

### Verification
- Focused storage test: PASS, 1/1.
- Frontend production build: PASS.

### Remaining
- Verify with the configured Azure container and Blob CORS rules.
- Run the full backend regression suite after the storage dependency change.

## 2026-10-08 — Session 6: Listing-Bound Chat (Phase 5)

### Implemented
- Added Conversation and Message models with listing-bound participant rules and indexes.
- Added authenticated conversation creation, listing, detail, message history, and message send APIs.
- Added session-aware Socket.IO server with conversation rooms, persisted messages, live delivery, and typing events.
- Added frontend conversation list and chat views using REST history plus Socket.IO updates.

### Verification
- Backend tests: PASS, 12/12.
- Frontend production build: PASS.

### Remaining
- Verify two authenticated browser sessions exchange messages live.
- Begin structured offer negotiation after live chat verification.

## 2026-10-08 — Session 7: Offers and Trust Profiles (Phases 6-7)

### Implemented
- Added immutable Offer history with seller counters and buyer acceptance of counter-offers.
- Added server-side sold transition, competing-offer cancellation, transaction counter updates, and Socket.IO offer events.
- Added authenticated self-profile and public seller profile APIs with server-controlled trust metrics.
- Added in-chat offer controls and a trust profile view.

### Verification
- Backend tests: PASS, 16/16.
- Frontend production build: PASS.

### Remaining
- Validate the complete flow against live MongoDB, Google OAuth, Azure, and two browser sessions.
- Add rating submission and polish issues discovered during the live demo.

## 2026-10-08 — Session 8: MongoDB Failure Handling

### Fixed
- Detect unresolved `<...>` placeholders in `MONGODB_URI` before connecting.
- Abort backend startup when MongoDB is unavailable instead of serving requests that buffer for 10 seconds.
- Map legacy Mongoose buffering failures to a clear `503 DATABASE_UNAVAILABLE` response.
- Restored the local Google OAuth callback URL after it had been replaced with a MongoDB URI.

### Verification
- Backend tests: PASS, 16/16.
- Startup check: correctly aborts with an explicit `MONGODB_URI` configuration error.

## 2026-10-08 — Session 9: Standalone MongoDB Offer Acceptance

### Fixed
- Offer acceptance now detects MongoDB standalone transaction errors.
- Local standalone MongoDB uses a conditional listing claim to prevent double-selling, then updates the accepted offer, competing offers, transaction counters, and system message.
- Replica sets and Atlas continue using the stronger multi-document transaction path.

### Verification
- Backend tests: PASS, 17/17.
