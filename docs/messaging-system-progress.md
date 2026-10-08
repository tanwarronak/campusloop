# Messaging System Progress

## Current Status

Phase 1 (architecture documentation) and the first frontend migration slice are complete. The existing messaging implementation remains active while the backend contracts are migrated incrementally.

## Current Architecture

- `Conversation` requires `listingId`, `buyerId`, and `sellerId`.
- A unique `{ listingId, buyerId }` index prevents duplicate buyer/listing conversations.
- `Message` stores `conversationId`, `senderId`, `type`, `text`, and timestamps.
- REST persists conversations and messages through `conversation.service.js`.
- Socket.IO shares the HTTP session, authorizes participants, and uses `conversation:{id}` rooms.
- The frontend uses TanStack Query for history and currently refreshes messages every three seconds as a fallback.
- The frontend inbox now shows listing, participant, preview, timestamp, verification, and unread metadata when available.
- The active chat now shows listing context, connection state, typing state, optimistic sending, failed-message retry, and duplicate-safe socket updates.
- Offers use the same conversation room but are currently separate REST operations and are not represented as structured message metadata.

## Problems Identified

- Conversations do not track unread counts, read timestamps, last message IDs, or status.
- Message records have no client idempotency key, delivery state, metadata, or update timestamp.
- Message history is not cursor-paginated.
- Reconnection does not synchronize missed messages from a cursor.
- The frontend has no optimistic sending state or retryable failed messages.
- Typing events exist, but presence and read receipts do not.
- The current uniqueness constraint does not include `sellerId`.
- The conversation inbox is not paginated and exposes limited status/read information.

## Completed

- [x] Document current models, APIs, socket events, authorization, and frontend state.
- [x] Document target architecture and migration strategy.
- [x] Upgrade inbox and conversation screen frontend state and UX.

## In Progress

- [ ] Conversation metadata and participant read state
- [ ] Message idempotency, metadata, delivery state, and cursor pagination
- [ ] Reconnection synchronization and read receipts
- [ ] Inbox and conversation screen redesign

## Pending

- [ ] Presence and reliable typing lifecycle
- [ ] Structured offer/system message rendering
- [ ] Rate limiting and production session store
- [ ] Multi-browser, reconnect, retry, and sold-listing tests

## Database Changes

Planned additive changes:

- Conversation: `lastMessageId`, `lastMessagePreview`, unread counters, read timestamps, and status.
- Message: `metadata`, `clientMessageId`, delivery state, and an idempotency index.
- Preserve existing listing, buyer, seller, and offer references during migration.

## API Changes

Planned additive changes:

- Cursor parameters for message history: `limit`, `before`, and `after`.
- `POST /api/conversations/:id/read`.
- Paginated `GET /api/conversations`.
- Existing send and offer routes remain compatible during migration.

## Socket Events

Existing: `joinConversation`, `leaveConversation`, `sendMessage`, `newMessage`, `typing:start`, `typing:stop`, `offer:new`, `offer:updated`, `listing:sold`.

Planned: `message_sent`, `message_delivered`, `message_read`, `user_online`, `user_offline`, `conversation_updated`, and reconnect synchronization.

## Frontend Changes

Planned TanStack Query state:

- Conversation list with unread counts and pagination.
- Active conversation with cursor-paginated messages.
- Optimistic messages keyed by `clientMessageId`.
- Connection state, typing users, presence, and retry actions.

## Known Issues

Live MongoDB, OAuth, Azure, and multi-browser behavior depend on local service configuration and are not verified by unit tests.

## Testing Status

- [x] Frontend production build passes after the messaging UI migration.
- [ ] Live two-browser messaging, reconnect, retry, and read-state verification.

## Important Decisions

- MongoDB is the source of truth.
- REST handles persistence, history, pagination, retries, and read state.
- Socket.IO handles real-time synchronization only.
- Existing conversation and offer routes will be migrated additively instead of replaced in one breaking change.

## Migration Notes

1. Add schema fields and indexes with backward-compatible defaults.
2. Add service-level cursor/read/idempotency behavior.
3. Add socket synchronization and delivery events.
4. Upgrade inbox and chat UI to consume the new contracts.
5. Remove obsolete polling only after reconnect synchronization is verified.

## Files Changed

- `docs/messaging-system-progress.md`
- `docs/messaging-architecture.md`

## Next Recommended Step

Add backward-compatible Conversation and Message schema fields plus indexes, then connect the frontend cursor/read-state helpers to those APIs.
