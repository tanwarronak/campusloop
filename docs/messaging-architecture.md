# Messaging Architecture

## Target Principle

```text
MongoDB = source of truth
REST = persistence, history, pagination, recovery
Socket.IO = real-time synchronization
Frontend cache = UI representation
```

## Target Flow

```text
Marketplace Frontend
        |
   +----+----+
   |         |
 REST    Socket.IO
   |         |
   |   authenticated socket
   |         |
   v         v
Messaging API  Conversation Room
        \     /
         \   /
       Messaging Service
             |
       +-----+-----+
       |           |
 Conversations  Messages
             |
           MongoDB
```

## Conversation Identity

A conversation is a first-class participant relationship with an optional listing reference. During the migration, existing listing-bound conversations remain valid. The logical uniqueness key is:

```text
listingId + buyerId + sellerId
```

The listing may become SOLD, ARCHIVED, or deleted without deleting historical conversation data. Participant authorization remains mandatory for every REST and socket operation.

## Conversation Data

```javascript
{
  _id,
  listingId,
  buyerId,
  sellerId,
  lastMessageId,
  lastMessagePreview,
  lastMessageAt,
  buyerUnreadCount,
  sellerUnreadCount,
  buyerLastReadAt,
  sellerLastReadAt,
  status,
  createdAt,
  updatedAt
}
```

Recommended indexes:

- Unique `{ listingId: 1, buyerId: 1, sellerId: 1 }`
- `{ buyerId: 1, lastMessageAt: -1 }`
- `{ sellerId: 1, lastMessageAt: -1 }`

## Message Data

```javascript
{
  _id,
  conversationId,
  senderId,
  type,
  text,
  metadata,
  clientMessageId,
  deliveryState,
  createdAt,
  updatedAt
}
```

Supported types are extensible: `TEXT`, `IMAGE`, `OFFER`, `COUNTER_OFFER`, `OFFER_ACCEPTED`, `OFFER_REJECTED`, `OFFER_EXPIRED`, and `SYSTEM`.

Offers remain domain entities, but offer and system messages reference structured metadata rather than parsing text.

Recommended indexes:

- `{ conversationId: 1, createdAt: -1 }`
- Unique `{ conversationId: 1, clientMessageId: 1 }`

## REST Responsibilities

- Create or get a conversation from a listing.
- Paginate the inbox by `lastMessageAt`.
- Load newest messages first.
- Load older messages with `before=<cursor>`.
- Recover missed messages with `after=<cursor>`.
- Persist messages and enforce idempotency.
- Mark a conversation read in one efficient update.
- Create and mutate offers.

## Socket.IO Responsibilities

- Authenticate using the existing HTTP-only session.
- Authorize room membership against MongoDB.
- Use only `conversation:<id>` rooms.
- Broadcast persisted messages and offer events.
- Send delivery/read acknowledgements.
- Handle typing and presence as ephemeral events.
- Rejoin rooms after reconnect and trigger REST catch-up from the last known message cursor.

## Reliability Flow

```text
User sends message
      |
Create clientMessageId
      |
Optimistic UI: sending
      |
REST persistence request
      |
+-----+----------------+
|                      |
Saved                 Failure
|                      |
Canonical message     failed + retry
|                      |
Socket broadcast      |
|                      |
Sent / delivered / read
```

On reconnect:

```text
Socket reconnects
      |
Re-authenticate and rejoin authorized rooms
      |
GET messages?after=<lastMessageId>
      |
Merge by _id/clientMessageId
      |
Resume real-time events
```

## Authorization

Every conversation endpoint and socket room operation verifies that the authenticated user is the buyer or seller. A conversation ID alone is never sufficient authorization.

## Migration Strategy

The redesign is additive:

1. Add schema fields with defaults so old records remain readable.
2. Preserve current route shapes while adding cursor/read parameters.
3. Add message idempotency before enabling optimistic retries.
4. Add socket acknowledgements and reconnect catch-up.
5. Upgrade React Query cache updates and remove interval polling only after recovery is reliable.
