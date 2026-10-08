# API_REFERENCE.md — CampusLoop Living API Documentation

This document is the living reference for all CampusLoop REST endpoints.

---

## 1. Global Conventions

### Base URL
```text
http://localhost:5000/api
```

### Standard Success Response Envelope
```json
{
  "success": true,
  "message": "Descriptive success message",
  "data": {}
}
```

### Standard Error Response Envelope
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

---

## 2. Phase 1 Endpoints (Active)

### `GET /api/health`

- **Auth Required**: None
- **Purpose**: Verifies that the API server is operational and reports database connectivity status.
- **Request Headers**: None
- **Query Parameters**: None
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "CampusLoop API is running",
    "data": {
      "status": "healthy",
      "database": "connected"
    }
  }
  ```
- **Response (503 Service Unavailable — if DB down)**:
  ```json
  {
    "success": true,
    "message": "CampusLoop API is running",
    "data": {
      "status": "degraded",
      "database": "disconnected"
    }
  }
  ```

---

## 3. Authentication and Marketplace Endpoints

### Authentication (`/api/auth`) — Phase 2 active
- `GET /api/auth/me` (Auth: Required) — Fetch current authenticated user from the HTTP-only session.
- `GET /api/auth/google` (Auth: None) — Initiate Google OAuth; returns `503` when credentials are not configured.
- `GET /api/auth/google/callback` (Auth: None) — Validate the Google profile email format for any domain, upsert the User, and establish a session.
- `POST /api/auth/logout` (Auth: Required) — Destroy the session and clear the session cookie.

### Users (`/api/users`)
- `GET /api/users/me` (Auth: Required) — Get profile details.
- `PATCH /api/users/me` (Auth: Required) — Update profile details.
- `GET /api/users/:id` (Auth: None) — Get public seller profile and trust metrics.

### Listings (`/api/listings`)
- `GET /api/listings` (Auth: None) — Paginated, filterable marketplace listings. Query parameters: `page`, `limit`, `search`, `category`, `condition`, `minPrice`, `maxPrice`, `sort` (`newest`, `oldest`, `priceAsc`, `priceDesc`).
- `POST /api/listings` (Auth: Required) — Create a new listing.
- `GET /api/listings/:id` (Auth: None) — Get listing details with seller info.
- `PATCH /api/listings/:id` (Auth: Required, Owner only) — Update listing.
- `DELETE /api/listings/:id` (Auth: Required, Owner only) — Remove listing.
- `PATCH /api/listings/:id/sold` (Auth: Required, Owner only) — Manually mark listing as sold.

### Conversations & Messages (`/api/conversations`)
- Implemented in Phase 5; all endpoints require an authenticated participant.
- `POST /api/conversations` (Auth: Required) — Find or create a conversation for a `listingId`.
- `GET /api/conversations` (Auth: Required) — List current user's conversations.
- `GET /api/conversations/:id` (Auth: Required) — Get single conversation details.
- `GET /api/conversations/:id/messages` (Auth: Required) — Fetch message history.
- `POST /api/conversations/:id/messages` (Auth: Required) — Send persistent message.

Socket.IO uses the same HTTP-only session cookie and emits `newMessage` only after the message is saved. Rooms are named `conversation:{id}`. The frontend also refreshes message history periodically if real-time delivery is unavailable.

### Offers (`/api/offers`)
- Implemented in Phase 6; offer acceptance marks the listing sold and updates transaction counters server-side.
- `POST /api/offers` (Auth: Required) — Submit an initial offer.
- `PATCH /api/offers/:id/counter` (Auth: Required) — Submit a counter-offer.
- `PATCH /api/offers/:id/accept` (Auth: Required) — Accept offer and mark listing sold.
- `PATCH /api/offers/:id/reject` (Auth: Required) — Reject offer.

### Storage (`/api/storage`)
- `POST /api/storage/upload-url` (Auth: None) — Generate a short-lived write-only SAS URL for simple public storage access.
  - Request: `{ "contentType": "image/png", "size": 123456 }`
  - Allowed types: JPEG, PNG, WebP; maximum size: 5 MB.
  - Response data: `{ "uploadUrl": "...", "blobUrl": "...", "expiresAt": "..." }`.
  - Azure setup: enable anonymous blob read access on the `campus-images` container and allow browser `PUT` CORS requests from `http://localhost:5173`.
