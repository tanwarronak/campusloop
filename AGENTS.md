# AGENTS.md — CampusLoop AI Coding Agent Directives

Welcome to **CampusLoop**. This document is the primary instruction and architectural guide for any AI coding model or human engineer working on this repository.

---

## 1. Executive Summary & Product Vision

- **Product Name**: CampusLoop
- **Tagline**: *"Your campus marketplace, without the WhatsApp chaos."*
- **Core Concept**:
  > *"WhatsApp is the communication layer. CampusLoop is the transaction layer."*
- **Problem Solved**:
  College students currently buy and sell items (books, cycles, calculators, electronics, lab coats, furniture) in messy WhatsApp and Telegram groups. Listings get lost, buyers repeat questions, prices are hard to find, negotiations are disorganized, there is no structured inventory, and seller verification is nonexistent.
- **Core Transaction Flow**:
  `LISTING` → `DISCOVERY` → `CHAT` → `OFFER` → `COUNTER-OFFER` → `ACCEPT` → `SOLD`

---

## 2. Mandatory Protocol for AI Agents

Every AI agent working on this repository **MUST** follow this protocol:

### Step 1: Read Project Documentation
Before making any changes or responding to complex architectural tasks, read:
1. `AGENTS.md` (this file)
2. `PROJECT_CONTEXT.md`
3. `PROGRESS.md`
4. `ARCHITECTURE.md`
5. `API_REFERENCE.md`
6. `DATABASE_SCHEMA.md`
7. `DECISIONS.md`
8. `TODO.md`

### Step 2: Source-of-Truth Hierarchy
When determining the current state or resolving ambiguities:
1. **Actual Source Code** (highest priority)
2. **Automated Tests**
3. **Database / Schema Implementation**
4. **`PROGRESS.md`**
5. **`ARCHITECTURE.md`**
6. **Other Documentation**
7. **AI Conversation Memory** (lowest priority — never assume memory is truth)

If documentation contradicts working source code, inspect the code, verify with tests, and update the documentation to match reality.

### Step 3: Session Protocol
1. Identify the active phase in `PROGRESS.md`.
2. Inspect the relevant implementation and tests.
3. Make the smallest, cleanest, coherent change required.
4. Run automated tests and build checks.
5. Update `PROGRESS.md`, `DEVELOPMENT_LOG.md`, and relevant API/Schema docs.
6. Commit with semantic message conventions (e.g. `feat: ...`, `fix: ...`, `docs: ...`).

---

## 3. Technology Stack

- **Monorepo**: Root workspace with `backend/` and `frontend/`.
- **Backend**:
  - Runtime: Node.js (JavaScript ES Modules, `"type": "module"`)
  - Framework: Express.js
  - Database: MongoDB + Mongoose ODM
  - Real-Time: Socket.IO
  - Validation: Zod
  - Logging: Pino / `pino-http`
  - Security: Helmet, CORS, Cookie-Parser, HTTP-only secure cookies
  - Storage: Azure Blob Storage (Direct client upload via SAS URLs)
- **Frontend**:
  - Tooling: Vite + React
  - Styling: Tailwind CSS
  - Routing: React Router DOM
  - State & Caching: TanStack Query (server state), React Context (auth/session)
  - HTTP: Centralized Axios instance (`withCredentials: true`)
  - Real-Time: Socket.IO Client

---

## 4. Repository Structure

```text
campusloop/
├── AGENTS.md                  # Primary AI agent instructions (this file)
├── PROJECT_CONTEXT.md         # Stable product domain context
├── PROGRESS.md                # Phase progress, Current State, Latest Handoff
├── ARCHITECTURE.md            # System architecture and data flow diagrams
├── API_REFERENCE.md           # Living REST API contracts and documentation
├── DATABASE_SCHEMA.md         # Mongoose schema specifications
├── DEVELOPMENT_LOG.md         # Chronological engineering session logs
├── DECISIONS.md               # Architecture Decision Records (ADRs)
├── TODO.md                    # Prioritized engineering backlog
├── README.md                  # Main developer readme
├── package.json               # Root monorepo workspace configuration
├── .gitignore                 # Root gitignore
│
├── backend/                   # Node.js + Express + MongoDB + Socket.IO
│   ├── src/
│   │   ├── config/            # env.js (Zod), db.js (Mongoose)
│   │   ├── controllers/       # Route controllers (thin)
│   │   ├── middleware/        # auth, error, notFound, validation
│   │   ├── models/            # User, Listing, Conversation, Message, Offer
│   │   ├── routes/            # REST route definitions
│   │   ├── services/          # Pure business logic layer
│   │   ├── sockets/           # Socket.IO handlers
│   │   ├── utils/             # logger, AppError, asyncHandler
│   │   ├── app.js             # Express app configuration
│   │   └── server.js          # HTTP server & graceful shutdown
│   ├── tests/                 # Integration and unit tests
│   ├── .env.example
│   └── package.json
│
└── frontend/                  # React + Vite + Tailwind CSS
    ├── src/
    │   ├── api/               # Centralized Axios instance & API modules
    │   ├── components/        # Common, Listing, Chat, Offer UI components
    │   ├── context/           # AuthContext
    │   ├── hooks/             # Custom React hooks
    │   ├── layouts/           # Page layouts (Navbar, Footer)
    │   ├── pages/             # Route pages (Home, Listings, Chat, Profile)
    │   ├── sockets/           # Socket.IO client instance
    │   ├── App.jsx            # App root with QueryClientProvider & Router
    │   └── main.jsx           # React entry point
    ├── .env.example
    ├── vite.config.js
    └── package.json
```

---

## 5. Architectural Invariants & Rules

1. **Layer Separation**:
   - Routes → Validation Middleware (Zod) → Controllers → Services → Models (MongoDB).
   - Controllers must remain thin. Business logic belongs in Services.
2. **Error Handling**:
   - Use `AppError` with HTTP status codes and operational flags.
   - Wrap all async controller methods with `asyncHandler`.
   - Never use empty try/catch blocks that swallow errors.
   - Do not leak stack traces to clients in production.
3. **Response Envelope**:
   - Success: `{ "success": true, "message": "...", "data": ... }`
   - Failure: `{ "success": false, "message": "...", "errors": [...] }`
4. **Dual Communication Model**:
   - **REST API**: Single source of truth for persistent data (Listings, Messages, Offers, Users).
   - **Socket.IO**: Real-time notifications and ephemeral events (`newMessage`, `typing`, `user:online`, `offer:new`).
5. **Azure Blob Storage Uploads**:
   - Never stream large images through the Node.js server.
   - Backend issues short-lived SAS URLs; Frontend uploads directly to Azure; Frontend sends metadata to Backend for Mongoose persistence.
6. **Business Rules**:
   - Only authenticated users can interact with listings, chats, and offers.
   - Only verified campus users (`verified === true`) can transact if campus verification is enforced.
   - Only the seller can accept, counter, or reject an offer.
   - Sellers cannot make offers on their own listings.
   - A conversation is always tied to a specific `listingId`.
   - When an offer is accepted:
     - Mark Offer `ACCEPTED`.
     - Mark Listing `SOLD`.
     - Cancel/Reject other pending offers.
     - Increment transaction counts for buyer and seller.
     - Perform these updates inside a database transaction/safe sequence.

---

## 6. Coding Conventions

- **Module Format**: JavaScript ES Modules (`import`/`export`) across both backend and frontend.
- **Indentation**: 2 spaces.
- **Naming**:
  - Files: `camelCase.js` or `kebab-case.js` for backend utils/routes; `PascalCase.jsx` for React components.
  - Variables & Functions: `camelCase`.
  - Constants & Enums: `UPPER_SNAKE_CASE`.
- **Imports**: Group imports (1. External packages, 2. Internal modules, 3. Config/Utils).
- **No Console Logs**: Use `logger.info()`, `logger.error()`, `logger.warn()` via Pino in backend.

---

## 7. Development & Testing Commands

```bash
# Install all dependencies across monorepo
npm install

# Run backend and frontend concurrently
npm run dev

# Run backend only (port 5000)
npm run dev:backend

# Run frontend only (port 5173)
npm run dev:frontend

# Run backend automated tests
npm run test:backend

# Build frontend production bundle
npm run build:frontend
```

---

## 8. AI Agent Handoff Instructions

When starting work as a new agent:
1. Generate an internal understanding by reading `AGENTS.md`, `PROJECT_CONTEXT.md`, `PROGRESS.md`, `ARCHITECTURE.md`, `DECISIONS.md`, and `TODO.md`.
2. Inspect the current Git status and relevant source code.
3. Check `PROGRESS.md` for current phase, active task, and latest handoff summary.
4. Verify functionality using tests or health endpoints before modifying code.
