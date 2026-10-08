# PROJECT_CONTEXT.md — CampusLoop Product & Domain Context

## 1. Product Overview

- **Product**: CampusLoop
- **Tagline**: *"Your campus marketplace, without the WhatsApp chaos."*
- **Primary Domain**: Hyperlocal student-to-student campus marketplace.

---

## 2. Problem Statement

University students rely heavily on unofficial WhatsApp and Telegram groups to buy and sell campus essentials (used textbooks, calculators, cycles, lab coats, hostel furniture, mattresses, electronics, notes).

While chat apps excel at unstructured instant messaging, they fail completely as transaction platforms:
1. **Disappearing Listings**: Messages scroll away quickly beneath casual chat chatter.
2. **Repetitive Friction**: Buyers repeatedly ask *"Is this still available?"* and *"What is the final price?"*.
3. **Disorganized Pricing**: Price drops and counter-offers are lost in chat histories.
4. **Lack of Verified Trust**: No structured identity verification to ensure the seller is an enrolled student.
5. **No Clear Lifecycle**: Deals conclude with ambiguity, leaving obsolete listings circulating indefinitely.

---

## 3. Core Solution & Guiding Principle

> **"WhatsApp is the communication layer. CampusLoop is the transaction layer."**

CampusLoop provides a structured, campus-gated marketplace while preserving the familiar, frictionless feel of peer-to-peer chat:
- **Email Verification**: Authenticated users must provide a valid email address; any email domain can register.
- **Structured Marketplace**: Categorized, filterable listings with condition badges, locations, and photos.
- **Listing-Centric Chat**: Conversations are always bound to a specific listing item.
- **Structured In-App Negotiation**: Interactive offer, counter-offer, and acceptance flows embedded directly in the chat stream.
- **Atomic Deal Lifecycle**: Accepting an offer marks the listing as `SOLD` and closes pending negotiations.

---

## 4. Core Transaction Flow

```text
[CREATE LISTING]
       │
       ▼
  [DISCOVERY]  ── (Search, Filter by Category/Price/Condition)
       │
       ▼
 [ITEM DETAILS]
       │
       ▼
  [ITEM CHAT]  ── (Listing-specific real-time conversation)
       │
       ▼
 [MAKE OFFER]  ── (Buyer proposes e.g. ₹600 on ₹800 listing)
       │
       ▼
[COUNTER-OFFER] ── (Seller counters with e.g. ₹700)
       │
       ▼
 [ACCEPT DEAL] ── (Buyer or Seller accepts ₹700)
       │
       ▼
 [MARK AS SOLD] ── (Listing state → SOLD, deal recorded in trust history)
```

---

## 5. Target Users & Personas

- **Student Sellers**: Students graduating, moving hostels, or finishing courses who want to liquidate items quickly to campus peers without spamming groups.
- **Student Buyers**: Budget-conscious campus peers looking for immediate physical handovers (library, hostel gate, campus cafeteria) without shipping delays or fees.
- **Campus Community**: Students, faculty, and campus residents who register with a valid email address.

---

## 6. MVP Boundaries & Non-Goals

### In Scope (MVP Core):
- Campus-gated authentication & email verification.
- Listings CRUD (Categories: Books, Calculators, Electronics, Cycles, Hostel, Furniture, Sports, Academic, Fashion, Other).
- Direct client image upload via Azure Blob Storage SAS URLs.
- Filter, search, and pagination.
- Listing-specific real-time chat via Socket.IO.
- Structured offer / counter-offer negotiation system.
- Atomic deal acceptance and status transition to `SOLD`.
- Trust profiles (verified badge, transaction counter, rating container).

### Explicit Non-Goals (What NOT to Build):
- Payment gateway / Escrow integration (transactions are physical campus handovers).
- Shipping, logistics, or delivery tracking.
- AI chatbots, price prediction algorithms, or complex recommendation engines.
- Social feeds, likes, public comment threads, follower graphs.
- Native mobile apps (MVP is a mobile-first responsive web application).
- Complex administrative dashboards or multi-tenant billing.

---

## 7. Hackathon Demo Flow (Under 2 Minutes)

1. **Seller Login**: Student logs in with campus credentials.
2. **Create Listing**: Posts *"Casio Scientific Calculator FX-991EX"* for ₹800, condition *Like New*, location *Hostel 4*.
3. **Buyer Discovery**: Second student searches *"calculator"*, filters under ₹1000, and views the listing with verified seller badge.
4. **Initiate Chat**: Buyer opens listing chat: *"Hi! Can we meet at the library today?"*
5. **Make Offer**: Buyer submits an offer of **₹600**.
6. **Seller Counter**: Seller receives real-time notification in chat and counters with **₹700**.
7. **Accept Offer**: Buyer clicks **Accept** on the ₹700 counter-offer.
8. **Instant Deal Finalization**:
   - Backend atomically updates listing status to `SOLD`.
   - System message confirms the agreement.
   - Transaction counts increment for both users.

---

## 8. Success Criteria

- **Speed**: A student can list an item in under 60 seconds.
- **Clarity**: Price, condition, location, and negotiation state are immediately visible.
- **Reliability**: Real-time events sync across browser windows without page reloads.
- **Trust**: Verified campus badges reflect real server-side email validation.
