# CampusLoop

> **"Your campus marketplace, without the WhatsApp chaos."**

CampusLoop is a hyperlocal campus marketplace built for university students to buy, sell, and negotiate items (used books, calculators, cycles, electronics, hostel gear, notes) within their verified college community.

---

## 🏛️ System Architecture

CampusLoop is structured as a full-stack monorepo:

- **Backend**: Node.js (ES Modules), Express.js, MongoDB (Mongoose), Socket.IO, Pino Logging, Zod Validation, Helmet, CORS.
- **Frontend**: Vite, React, Tailwind CSS, TanStack Query, React Router, Axios, Socket.IO Client.
- **Storage**: Azure Blob Storage (Direct client upload via SAS URLs).
- **Core Loop**: `LISTING` → `DISCOVERY` → `CHAT` → `OFFER / COUNTER-OFFER` → `ACCEPT` → `SOLD`.

---

## 📁 Repository Structure

```text
campusloop/
├── AGENTS.md                  # Instructions for AI coding agents
├── PROJECT_CONTEXT.md         # Stable product & domain context
├── PROGRESS.md                # Phase-by-phase tracker & current status
├── ARCHITECTURE.md            # System architecture & data flow diagrams
├── API_REFERENCE.md           # Living REST API documentation
├── DATABASE_SCHEMA.md         # Mongoose schema specifications
├── DEVELOPMENT_LOG.md         # Chronological development logs
├── DECISIONS.md               # Architecture Decision Records (ADRs)
├── TODO.md                    # Prioritized engineering backlog
├── README.md                  # Developer guide (this file)
│
├── backend/                   # Express + MongoDB API Server (Port 5000)
│   ├── src/
│   │   ├── config/            # Environment validation & DB connection
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Error, auth, notFound, validation middleware
│   │   ├── models/            # Mongoose models (User, Listing, Conversation, Message, Offer)
│   │   ├── routes/            # REST route handlers
│   │   ├── services/          # Business logic services
│   │   ├── sockets/           # Socket.IO handlers
│   │   ├── utils/             # Logger, AppError, asyncHandler
│   │   ├── app.js             # Express app configuration
│   │   └── server.js          # HTTP server & graceful shutdown
│   └── tests/                 # Backend automated tests
│
└── frontend/                  # React + Vite + Tailwind CSS (Port 5173)
    ├── src/
    │   ├── api/               # Axios instance & API endpoints
    │   ├── components/        # Reusable UI components
    │   ├── context/           # Auth and App contexts
    │   ├── pages/             # Route views (Home, Listings, Chat, Profile)
    │   └── App.jsx
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- MongoDB instance (Local or MongoDB Atlas connection string)

### 1. Install Dependencies
```bash
# From the root directory:
npm install
```

### 2. Environment Variables
Copy the example environment files:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Run Development Servers
```bash
# Run both Backend (Port 5000) and Frontend (Port 5173) concurrently:
npm run dev

# Or run individually:
npm run dev:backend
npm run dev:frontend
```

---

## 🧪 Testing

```bash
# Run backend test suite:
npm run test:backend
```

---

## 📖 Project Documentation

- **[AGENTS.md](./AGENTS.md)**: AI Agent Directives & Handoff Protocol
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)**: Product Vision, Problem Statement & Demo Flow
- **[PROGRESS.md](./PROGRESS.md)**: Active Phase Tracker & Current Status
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System Architecture & Data Flow
- **[API_REFERENCE.md](./API_REFERENCE.md)**: Living REST API Endpoints
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**: Mongoose Models & Indexes
- **[DECISIONS.md](./DECISIONS.md)**: Architecture Decision Records
- **[DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)**: Chronological Session Log
- **[TODO.md](./TODO.md)**: Task Backlog
