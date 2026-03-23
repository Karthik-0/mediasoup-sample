## Context

Prior to this specification, users were forced to execute a complex Start and copy-paste-Join flow driven by obscure backend-generated Mediasoup UUIDs. Simultaneously, engineering lacks observability on the multi-thread scaling deployment since the frontend has no concept of what Router or underlying OS worker thread is fulfilling media delivery.

## Goals / Non-Goals

**Goals:**
- Eliminate the `create-router` flow entirely in favor of implicitly starting native rooms during the `join-room` initialization.
- Allow any arbitrary string provided by a user to become the core `roomId` (e.g. "Weekly Sync" -> "weekly-sync").
- Pass structural routing diagnostics (`workerPid` and `routerId`) through Socket signaling into the frontend.

**Non-Goals:**
- Validating the linguistic content of the room names beyond basic parsing.
- Dynamic migrations of a user from one worker to another.

## Decisions

- **Join-or-Create (Implicit Initialization)**: The `getOrCreateRouter(roomId)` already acts cohesively as a Room spawn function. By directing the React UI to emit `join-room` dynamically, the Server guarantees the room is created before attaching the user.
- **Worker PID Persistence**: Since Mediasoup obscures `worker.pid` after instantiation, the backend `roomManager.js` data structure will permanently hold `{ router, peerCount, workerPid: worker.pid }` so that it can be injected broadly during signaling queries.
- **React Participant Metadata Overlay**: Rather than requiring developers to inspect network websockets, `get-producers` will broadcast the producer's origin. The React Component `video-tile` will be enriched to gracefully overlay these tokens.

## Risks / Trade-offs

- **[Risk] Room Name Collisions** → Two completely independent groups might write "Test" and be thrown into the same room.
  - **Mitigation**: Warn users in the UI placeholder. In production, we assume user accountability or we append passwords to environments if security becomes paramount. This is a deliberate tradeoff for ease-of-use versus strict cryptographic UUID isolation.
