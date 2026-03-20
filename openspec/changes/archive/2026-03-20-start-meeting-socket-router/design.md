## Context

The server has an Express HTTP server (`server/index.js`) and a mediasoup worker pool (`server/mediasoupBootstrap.js`). The React client (`client/`) is a standalone Vite app. Neither side has a real-time communication channel yet. This design introduces socket.io as the signaling layer and adds the first meeting-level primitive: a mediasoup Router created per session.

## Goals / Non-Goals

**Goals:**
- Attach socket.io to the existing Express `http.Server` so the port is shared.
- Handle a `create-router` socket event server-side: pick an available mediasoup worker and create a Router, return its ID.
- Add a `roomManager` module to own router lifecycle (create, lookup).
- Add a socket singleton to the client (`src/lib/socket.ts`) that connects lazily.
- Add a **Start Meeting** button in `App.tsx` that emits `create-router` and renders the returned router ID.

**Non-Goals:**
- WebRTC transport creation, producer/consumer setup, or media exchange (future changes).
- Authentication or multi-room management.
- Persistent room state (in-memory only).
- TURN/STUN configuration.

## Decisions

### socket.io over raw WebSocket
socket.io is chosen for its automatic reconnection, event-based API, and broad ecosystem alignment with mediasoup signaling examples. Raw `ws` would work but offers no reconnect or namespace ergonomics.

### Shared HTTP server (no separate WS port)
socket.io is attached via `const io = new Server(httpServer, { cors: { origin: "*" } })` so both Express REST and socket.io share port `3001`. Avoids additional infra, CORS complexity is negligible for local dev.

### roomManager as a standalone module
Router lifecycle is isolated in `server/roomManager.js` (separate from `mediasoupBootstrap.js`) to keep worker concerns and room concerns decoupled. The room manager calls `getMediasoupWorker()` to pick a worker; it does not own the worker.

### Round-robin worker selection deferred to mediasoupBootstrap
`getMediasoupWorker()` already returns `workers[0]`. A future change can add round-robin logic there without touching the room manager.

### Client socket singleton
`src/lib/socket.ts` exports a single `socket` instance created with `io(SERVER_URL)`. This avoids multiple connections if the component re-renders. The URL is read from `import.meta.env.VITE_SERVER_URL` (defaults to `http://localhost:3001`).

## Risks / Trade-offs

- **In-memory router map**: Server restarts lose all routers. → Acceptable for this stage; persistence is a future concern.
- **CORS open (`origin: "*"`)**: Fine for local dev; must be tightened before production. → Document in env/config.
- **Single worker for all routers**: All routers land on `workers[0]` until round-robin is added. → Noted as a known limitation; worker pool already supports multiple workers.
- **No error boundary on client**: If socket connection fails, the button click silently hangs. → Handled with a `timeout` on the ack callback and error state in component.
