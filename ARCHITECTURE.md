# Mediasoup Architecture & Technical Overview

This application is a modern WebRTC-based video conferencing platform powered by **Mediasoup** (as the Selective Forwarding Unit), **Socket.io** (for signaling), and **React** (for the frontend).

## Core Components

The architecture relies on an SFU pattern. Unlike peer-to-peer (P2P) mesh networks where every user uploads their stream directly to every other user, an SFU acts as a smart central server. Clients upload their media exactly **once** to the Mediasoup backend, which then conditionally forwards those streams to the participants who request them.

### 1. The Backend (Node.js + Mediasoup)

The backend is organized into four modules:

| Module | Responsibility |
|--------|---------------|
| `index.js` | Express HTTP server, Socket.io event handlers, startup/shutdown |
| `mediasoupBootstrap.js` | Worker pool lifecycle — create, expose, close |
| `roomManager.js` | Named room → router shard mapping, peer counts, cross-shard piping |
| `transportManager.js` | WebRtcTransport and Producer creation and lookup |

**Workers** — Mediasoup spawns one C++ worker process per logical CPU core (configurable via `MEDIASOUP_WORKERS`). Workers handle raw UDP/TCP RTP packet forwarding. The pool size defaults to 4 and is managed by `mediasoupBootstrap.js`.

**Router shards** — Each named room can span multiple Router shards, each pinned to a different worker. `roomManager.js` tracks a `rooms` map (`roomId → Set<routerId>`) and a `routers` map (`routerId → { router, peerCount, workerPid }`). When a shard reaches `MAX_PEERS_PER_ROUTER` (currently 2), a new shard is automatically created on the next available worker that does not already host a shard for that room.

**WebRtcTransports** — The WebRTC pipes bridging a browser to the server. Each peer has a dedicated Send transport (upload) and one or more Recv transports (download, one per remote peer). Managed by `transportManager.js`.

**Producers & Consumers** — Producer objects represent an incoming track from a client. Consumer objects pull a Producer's track through a Router and deliver it to a receiving client's Recv transport.

### 2. Multi-Worker Router Sharding

When the number of peers in a room would exceed `MAX_PEERS_PER_ROUTER`, `roomManager.getOrCreateRouter` allocates a new Router on a worker not already hosting a shard for this room (round-robin fallback when all workers are used).

To ensure every shard can play back every producer:

- **Eager piping** — When a new Producer is created, its shard immediately calls `pipeToRouter` to every other shard already in the room.
- **Historical piping** — When a brand-new shard is allocated, it retroactively pipes all pre-existing Producers from the other shards in the room.

This means consumers on any shard can always reach any producer in the room, regardless of which worker originally received it.

### 3. The Signaling Layer (Socket.io)

Socket.io exchanges the setup parameters that WebRTC cannot negotiate on its own (SDP/ICE/DTLS handshakes).

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join-room` | Client → Server | Join or create a named room; server allocates/reuses a router shard and returns `{ routerId, workerPid }` |
| `peer-joined` | Server → Others | Broadcast when a new peer joins |
| `peer-left` | Server → Others | Broadcast when a peer disconnects |
| `get-rtp-capabilities` | Client → Server | Fetch router codec parameters for Device initialization |
| `create-webrtc-transport` | Client → Server | Create a send or recv transport; returns ICE/DTLS params |
| `connect-transport` | Client → Server | Complete DTLS handshake |
| `produce` | Client → Server | Create a Producer; triggers eager piping to sibling shards |
| `get-producers` | Client → Server | List all other peers' Producers in the room (with `routerId` and `workerPid`) |
| `consume` | Client → Server | Create a Consumer for a specific Producer |
| `get-stats` | Client → Server | Return system stats + per-worker CPU/memory for all workers |

### 4. The Frontend (React + Vite + Tailwind CSS)

The frontend manages local application state, browser permissions, and UI rendering.

- Uses `navigator.mediaDevices.getUserMedia` to acquire camera and microphone tracks.
- Runs a `setInterval` polling loop (`fetchAndConsume`) to check for new Producers in the room, guaranteeing late-joiners are synchronized without requiring a server push.
- Injects downloaded MediaStreams into `<video>` refs. Assignments to `HTMLVideoElement.srcObject` are guarded (`el.srcObject !== p.stream`) to prevent frame buffer flushes from React re-renders.
- Merges Audio and Video tracks from separate Consumers into unified `MediaStream` objects per peer.
- Returns `recvTransport` from `consumeRemote()` so the caller can accumulate transport references for bandwidth measurement.

**ResourceMonitorCard** — A developer HUD rendered in the top-right corner on both the lobby and meeting screens. It polls `get-stats` every 3 seconds to display:
- System 1-minute CPU load average and memory utilization.
- Per-worker CPU% and memory, with color-coded thresholds (green < 60%, yellow 60–80%, red > 80% CPU; similar for memory).
- Uplink/downlink bandwidth in kbps, computed from delta of `outbound-rtp`/`inbound-rtp` stats via `Transport.getStats()`.
- The card is minimizable and highlights the peer's own assigned worker.

## WebRTC Connection Flow (Sequence)

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant Socket.IO
    participant Mediasoup

    note over Browser,Mediasoup: 1. Host Joins the Room
    Browser->>Socket.IO: 'join-room' { roomId: "My Room", userName }
    Socket.IO->>Mediasoup: getOrCreateRouter(roomId) — allocates shard on least-loaded worker
    Socket.IO-->>Browser: { success, routerId, workerPid }

    Browser->>Socket.IO: 'get-rtp-capabilities' { routerId }
    Socket.IO-->>Browser: { rtpCapabilities }

    note over Browser,Mediasoup: 2. Host Uploads (Produces) Camera/Mic
    Browser->>Socket.IO: 'create-webrtc-transport' { routerId }
    Socket.IO->>Mediasoup: createWebRtcTransport()
    Socket.IO-->>Browser: { id, iceParameters, iceCandidates, dtlsParameters }

    Browser->>Browser: Initializes mediasoup-client SendTransport
    Browser->>Browser: getUserMedia() — acquires camera + mic tracks
    Browser->>Browser: transport.produce(videoTrack)

    Browser->>Socket.IO: transport.on('connect') → 'connect-transport'
    Socket.IO->>Mediasoup: transport.connect(dtlsParameters)
    Browser->>Socket.IO: transport.on('produce') → 'produce' { transportId, kind, rtpParameters, roomId }
    Socket.IO->>Mediasoup: createProducer() + eager pipeToRouter to sibling shards
    Socket.IO-->>Browser: { id: producerId }

    note over Browser,Mediasoup: 3. Guest Joins & Downloads (Consumes)
    participant Guest
    Guest->>Socket.IO: 'join-room' { roomId: "My Room", userName }
    Socket.IO->>Mediasoup: getOrCreateRouter — reuses shard if capacity allows; creates new shard + historical pipe if full
    Socket.IO-->>Browser: 'peer-joined' { peerId, userName }
    Socket.IO-->>Guest: { success, routerId, workerPid }

    Guest->>Socket.IO: 'get-producers' { roomId }
    Socket.IO-->>Guest: [{ producerId, peerId, routerId, workerPid }, ...]

    Guest->>Socket.IO: 'create-webrtc-transport' { routerId } (recv)
    Socket.IO->>Mediasoup: createWebRtcTransport()
    Socket.IO-->>Guest: { id, iceParameters, iceCandidates, dtlsParameters }

    Guest->>Socket.IO: 'consume' { routerId, producerId, transportId, rtpCapabilities }
    Socket.IO->>Mediasoup: recvTransport.consume()
    Socket.IO-->>Guest: { id, producerId, kind, rtpParameters }

    Guest->>Guest: recvTransport.consume() — builds MediaStream
    Guest->>Socket.IO: recvTransport.on('connect') → 'connect-transport'
    Socket.IO->>Mediasoup: finalizes DTLS
    Guest->>Guest: mounts MediaStream to <video srcObject>
```

## Advanced Logic & Error Prevention

- **Avoiding the Promise Deadlock:** The `recvTransport.on('connect')` event in Mediasoup only fires *while* `.consume()` is executing. It cannot be awaited proactively. By binding the listener before calling consume, the client never hangs on an unprovooked connection.
- **Video Element Re-render Throttling:** Unnecessary assignments to `HTMLVideoElement.srcObject` flush the frame buffer and cause visible black frames. The application verifies `el.srcObject !== p.stream` before assigning to preserve seamless rendering through React update cycles.
- **Track Merging:** Audio and Video are published as two separate Producers. `fetchAndConsume` aggregates arriving tracks into unified `MediaStream` objects per peer to prevent audio from overwriting video references in state.
- **Shard Capacity Fallback:** If all workers already host a shard for a room (no fresh workers available), `getOrCreateRouter` falls back to the first existing shard rather than failing. This ensures rooms with more shards than workers still function.
- **Producer Garbage Collection:** On socket disconnect, all Producers owned by that socket are closed and removed from the global map, preventing stale entries from appearing in `get-producers` responses.
