# TODO.md — CampusLoop Task Backlog

---

## Critical (Phase 0 & Phase 1 — COMPLETED)

- [x] Create root `.gitignore` and monorepo workspace `package.json`
- [x] Create 9 persistent project documentation files
- [x] Implement `backend/package.json`, `.env.example`, `.env`
- [x] Implement `backend/src/config/env.js` (Zod validation)
- [x] Implement `backend/src/config/db.js` (Mongoose connection & lifecycle)
- [x] Implement `backend/src/utils/logger.js`, `AppError.js`, `asyncHandler.js`
- [x] Implement `backend/src/middleware/error.middleware.js`, `notFound.middleware.js`, `validation.middleware.js`
- [x] Implement `backend/src/controllers/health.controller.js` and `routes/health.routes.js` (`GET /api/health`)
- [x] Implement `backend/src/app.js` and `server.js` (Graceful shutdown)
- [x] Implement backend automated tests (`tests/health.test.js`)
- [x] Scaffold `frontend/` (Vite, React, Tailwind CSS, Axios, React Router, TanStack Query)
- [x] Create frontend Landing page with live backend health card
- [x] Verify both applications build and test successfully

---

## High Priority (Upcoming Phase 2 — Authentication)

- [x] Implement User Mongoose model (`backend/src/models/User.js`)
- [ ] Complete Google OAuth / session authentication with real credentials
- [x] Validate email syntax while allowing any domain
- [ ] Add optional campus verification if a restricted campus marketplace is required later
- [x] Implement `auth.middleware.js` for route protection
- [x] Create Frontend `AuthContext` and Login view
- [ ] Configure a persistent production session store

---

## High Priority (Upcoming Phase 3 — Marketplace Listings)

- [x] Implement Listing Mongoose model with full enum categories and conditions
- [x] Implement Listing CRUD REST routes and services
- [x] Implement search, filter, and pagination endpoints
- [x] Create Frontend Browse Listings page and Create Listing modal/page
- [ ] Verify authenticated CRUD against MongoDB

---

## Medium Priority (Phase 4 & 5 — Storage & Chat)

- [x] Implement Azure Blob Storage SAS service (`storage.service.js`)
- [x] Implement direct browser upload to Azure Blob Storage
- [x] Make upload URL access public for the simple development flow
- [ ] Verify Azure Blob CORS and a real authenticated upload
- [x] Implement Socket.IO server & chat handlers
- [x] Implement Conversation & Message models with MongoDB persistence
- [x] Create Frontend Chat UI with listing banner
- [ ] Verify two-browser live messaging with authenticated sessions

---

## Medium Priority (Phase 6 & 7 — Negotiation & Trust)

- [x] Implement Offer model and negotiation lifecycle (`PENDING`, `COUNTERED`, `ACCEPTED`, `REJECTED`)
- [x] Implement atomic offer acceptance logic and listing `SOLD` transition
- [x] Implement in-chat interactive offer cards
- [x] Implement verified student badge and seller trust stats
- [ ] Verify buyer/seller negotiation against live MongoDB and OAuth

---

## Low Priority / Polish (Phase 8)

- [ ] Mobile responsive tuning and touch optimizations
- [ ] Loading skeletons and error toast notifications
- [ ] Empty state designs for searches and message threads
- [ ] Performance audit and bundle size optimization

---

## Future Ideas (Post-Hackathon)

- [ ] Optional in-app ratings and peer review after deal completion
- [ ] Multi-campus federation (selecting active campus)
- [ ] Push notifications for new chat messages and offers
