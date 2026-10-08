# DATABASE_SCHEMA.md — CampusLoop MongoDB & Mongoose Schemas

This document defines the data models, relations, indexes, and validation rules for CampusLoop.

---

## 1. User Model (`users`)

Represents a student or campus member.

```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  avatar: { type: String, default: "" },
  college: { type: String, default: "" },
  verified: { type: Boolean, default: false }, // Set to true ONLY if email domain matches ALLOWED_EMAIL_DOMAINS
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalTransactions: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Indexes
- `email`: `1` (Unique)
- `verified`: `1`

### Implementation Status
- Implemented in `backend/src/models/User.js`.
- `verified` is set by the server after Google email-domain validation; it is never accepted from frontend input.

---

## 2. Listing Model (`listings`)

Represents an item posted for sale on the campus marketplace.

```javascript
{
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: [
      "BOOKS",
      "ELECTRONICS",
      "CALCULATORS",
      "CYCLES",
      "HOSTEL",
      "FURNITURE",
      "SPORTS",
      "ACADEMIC",
      "FASHION",
      "OTHER"
    ]
  },
  condition: {
    type: String,
    required: true,
    enum: ["NEW", "LIKE_NEW", "GOOD", "FAIR"]
  },
  images: [{ type: String }], // Array of Azure Blob storage image URLs
  location: { type: String, required: true, trim: true }, // e.g., "Hostel 4", "Main Library"
  status: {
    type: String,
    required: true,
    enum: ["ACTIVE", "NEGOTIATING", "SOLD", "ARCHIVED"],
    default: "ACTIVE"
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Indexes
- `sellerId`: `1`
- `category`: `1`
- `status`: `1`
- `createdAt`: `-1`
- Text Index: `{ title: "text", description: "text" }`

### Implementation Status
- Implemented in `backend/src/models/Listing.js`.
- Listing creation and mutation are authenticated; only the seller can edit, delete, or mark their listing sold.

---

## 3. Conversation Model (`conversations`)

Represents a chat thread between a buyer and a seller strictly bound to a specific listing.

```javascript
{
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lastMessage: { type: String, default: "" },
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Indexes & Constraints
- Compound Unique Index: `{ listingId: 1, buyerId: 1 }` (Prevents duplicate conversations between same buyer and listing)
- `sellerId`: `1`
- `lastMessageAt`: `-1`

### Implementation Status
- Implemented in `backend/src/models/Conversation.js`.

---

## 4. Message Model (`messages`)

Represents an individual message or structured offer event in a conversation.

```javascript
{
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    required: true,
    enum: [
      "TEXT",
      "OFFER",
      "COUNTER_OFFER",
      "OFFER_ACCEPTED",
      "OFFER_REJECTED",
      "SYSTEM"
    ],
    default: "TEXT"
  },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Indexes
- Compound Index: `{ conversationId: 1, createdAt: 1 }`

### Implementation Status
- Implemented in `backend/src/models/Message.js`.

---

## 5. Offer Model (`offers`)

Represents a formal price negotiation attempt for a listing.

```javascript
{
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    required: true,
    enum: ["PENDING", "COUNTERED", "ACCEPTED", "REJECTED", "CANCELLED"],
    default: "PENDING"
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Indexes
- Compound Index: `{ listingId: 1, conversationId: 1 }`
- `status`: `1`
- `createdAt`: `-1`

### Implementation Status
- Implemented in `backend/src/models/Offer.js`.
- Counter-offers preserve history through `parentOfferId`; acceptance cancels competing actionable offers.
