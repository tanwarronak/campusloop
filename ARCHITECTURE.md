# ARCHITECTURE.md — CampusLoop System Architecture

This document details the architectural blueprints, data flow diagrams, and design patterns utilized in CampusLoop.

---

## 1. System Overview & Data Flow

CampusLoop is structured as a full-stack monorepo consisting of an Express.js backend and a Vite/React frontend.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                       │
│  - React Router DOM (Pages & Routes)                                   │
│  - TanStack Query (Server State Caching)                                │
│  - Axios Client (REST API Consumer)                                    │
│  - Socket.IO Client (Real-time events)                                  │
└──────────────┬──────────────────────────┬───────────────────────────────┘
               │                          │
        REST (HTTP/JSON)           WebSockets (WS)
               │                          │
┌──────────────▼──────────────────────────▼───────────────────────────────┐
│                           BACKEND (Express.js)                          │
│                                                                         │
│  ┌───────────────────────┐              ┌────────────────────────────┐  │
│  │     REST Pipeline     │              │     Socket.IO Server       │  │
│  │  - Helmet & CORS      │              │  - Connection Auth         │  │
│  │  - Pino-HTTP Logging  │              │  - Room Management         │  │
│  │  - Zod Validation     │              │    (conversation:{id})     │  │
│  │  - Controllers        │              │  - Real-time event push    │  │
│  └───────────┬───────────┘              └─────────────┬──────────────┘  │
│              │                                        │                 │
│              └─────────────────┬──────────────────────┘                 │
│                                │                                        │
│                     ┌──────────▼──────────┐                             │
│                     │    Service Layer    │                             │
│                     │  (Business Logic)   │                             │
│                     └──────────┬──────────┘                             │
│                                │                                        │
│                     ┌──────────▼──────────┐                             │
│                     │  Mongoose ODM Layer │                             │
│                     │   (Models & Validation)                           │
│                     └──────────┬──────────┘                             │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                      ┌──────────▼──────────┐
                      │    MongoDB Database │
                      │ (Durable Data Store)│
                      └─────────────────────┘
```

---

## 2. REST vs. Real-Time (Socket.IO) Boundary

### The Rule
> **"REST is the source of truth for persistent data. Socket.IO is for ephemeral real-time notifications."**

- **REST API (`/api/*`)**:
  - Handles authentication, listing creation/editing, fetching paginated feeds, loading message history, and submitting formal offers.
  - Returns canonical responses and updates MongoDB.
- **Socket.IO**:
  - Delivers instantaneous UI updates when both parties are online.
  - Broadcasts `newMessage`, `typing:start`, `typing:stop`, `user:online`, `offer:new`, and `listing:sold`.
  - When a user refreshes or re-joins, the message history is fetched from MongoDB via REST, not Socket memory.

---

## 3. Chat Functionality

CampusLoop does not support generic user-to-user chat. Every conversation belongs to one listing and contains exactly one buyer and one seller.

### Starting a Chat

```text
Listing Details
  ↓ click "Chat with Seller"
POST /api/conversations { listingId }
  ↓
Backend verifies the buyer is authenticated and is not the seller
  ↓
Find existing conversation or create one
  ↓
/messages/:conversationId
```

The unique `{ listingId, buyerId }` index prevents duplicate conversations for the same buyer and listing. Sellers cannot start a conversation with themselves.

### Loading Chat History

The chat screen loads conversation details and message history through REST:

1. `GET /api/conversations/:id` loads the listing, buyer, and seller context.
2. `GET /api/conversations/:id/messages` loads durable messages from MongoDB.
3. Only conversation participants can access either endpoint.

### Sending a Message

```text
POST /api/conversations/:id/messages { text }
  ↓
Validate participant and message text
  ↓
Save Message in MongoDB
  ↓
Update Conversation.lastMessage and lastMessageAt
  ↓
Broadcast newMessage to conversation:{id}
```

The sender receives the REST response immediately. Connected participants receive the same saved message through Socket.IO. The frontend deduplicates messages by MongoDB `_id` and refreshes history every three seconds as a fallback when real-time delivery is unavailable.

### Socket.IO Events

- `joinConversation(conversationId)`: authenticated participant joins the listing conversation room.
- `leaveConversation(conversationId)`: leaves the room.
- `sendMessage({ conversationId, text })`: persists and broadcasts a message through the socket path.
- `newMessage`: delivered after persistence.
- `typing:start` and `typing:stop`: ephemeral typing indicators for the room.
- `offer:new` and `offer:updated`: negotiation events for the same conversation room.
- `listing:sold`: emitted after an offer is accepted.

Socket authentication uses the HTTP-only session cookie. A socket without a valid session or participant record is rejected, and room membership is checked against MongoDB before joining.

### Chat UX Rules

- The user enters chat from a specific listing, so the item and seller are always known.
- The Messages page lists existing listing conversations only; it cannot create an arbitrary chat.
- The chat header identifies the listing and the other participant.
- If Socket.IO is unavailable, REST history polling keeps messages visible while showing a live-update warning.

## 4. Azure Blob Direct SAS Upload Pattern

To avoid bottlenecking the Node.js server with large binary image uploads, images are uploaded directly from the browser to Azure Blob Storage:

```text
┌──────────┐            ┌─────────┐             ┌─────────────────────┐
│ Frontend │            │ Backend │             │ Azure Blob Storage  │
└────┬─────┘            └───┬─────┘             └──────────┬──────────┘
     │                      │                              │
     │ 1. POST /storage/upload-url                         │
     │    (filename, mimeType)                             │
     │ ────────────────────>│                              │
     │                      │ 2. Generate SAS URL          │
     │                      │    (short-lived, write-only) │
     │                      │    using Azure Storage SDK   │
     │                      │                              │
     │ 3. { uploadUrl, blobUrl }                           │
     │ <────────────────────│                              │
     │                                                     │
     │ 4. PUT blob (direct binary upload via SAS URL)       │
     │ ───────────────────────────────────────────────────>│
     │                                                     │
     │ 5. POST /listings (includes blobUrl in payload)     │
     │ ────────────────────>│                              │
     │                      │ 6. Persist URL in MongoDB    │
     │                      │                              │
```

---

## 5. Centralized Error Handling Pipeline

```text
Incoming HTTP Request
       │
       ▼
   Route Handler (Wrapped in asyncHandler)
       │
    Throws / Rejects Error? ───> YES ───┐
       │                                │
       ▼ (NO)                           ▼
 Send 2xx JSON Response       error.middleware.js
                                        │
                                        ├── 1. Determine statusCode (default 500)
                                        ├── 2. Map ZodError / Mongoose ValidationError
                                        ├── 3. Log via Pino logger
                                        └── 4. Send standardized JSON error envelope:
                                               {
                                                 "success": false,
                                                 "message": "...",
                                                 "errors": [...]
                                               }
```

---

## 6. Security & Isolation Architecture

1. **HTTP-only Cookies**: Session/Auth tokens are stored in secure, `SameSite: lax`, `httpOnly: true` cookies. Tokens are never exposed in JavaScript or localStorage.
2. **Email Validation**: Backend validates email address and domain syntax before setting `verified = true`; registration is open to all domains.
3. **Helmet**: Configured with secure HTTP headers; `x-powered-by` header disabled.
4. **CORS**: Restricted to `CLIENT_URL` (e.g. `http://localhost:5173` in development) with `credentials: true`.
5. **No Leaked Secrets**: Azure access keys and MongoDB connection strings exist exclusively on the server side in `.env`.

## 7. Authentication Flow (Phase 2)

```text
Frontend /login
  ↓
GET /api/auth/google
  ↓
Google OAuth consent
  ↓
GET /api/auth/google/callback
  ↓
Server validates email domain → upserts User → HTTP-only session cookie
  ↓
Frontend GET /api/auth/me
```

The Google strategy is only registered when both Google credentials are configured. Until then, the endpoint returns a deliberate configuration error. The default Express session store is suitable for local development only; production must use a persistent store. The current open-registration policy accepts any valid email domain and should not be presented as proof of campus membership.
