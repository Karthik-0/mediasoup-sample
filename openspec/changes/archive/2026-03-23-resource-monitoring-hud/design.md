## Context

The server already has a `get-stats` socket handler (in `server/index.js`) that accepts a `workerPid`, queries it via `pidusage`, and returns `{ systemStats, workerStats }`. The client declares a `hardwareStats` state and a `showDiagnostics` toggle but never populates them — the polling loop was never wired up.

The client uses `mediasoup-client`'s `Device` and `Transport` abstractions. `startMeeting()` in `meeting.ts` returns `{ device }` only; the send transport is created internally and not exposed. The `RTCPeerConnection` lives inside the mediasoup-client `Transport` and is accessible via `transport.getStats()` (a public API that wraps `pc.getStats()`).

The existing topology diagnostics panel is a right-side card in `App.tsx` with a Show/Hide toggle. The new resource monitor card follows the same pattern.

## Goals / Non-Goals

**Goals:**
- Show system-wide CPU and memory at all times (lobby + meeting)
- Show per-worker CPU and memory for all workers in the pool, every 3 seconds
- Visually distinguish which worker serves the current peer's room
- Show uplink and downlink bitrate once in a meeting (computed client-side)
- Card is minimizable, styled consistently with existing diagnostics panel
- No new npm dependencies

**Non-Goals:**
- Historical graphs or sparklines (static current-value display only)
- Per-consumer/per-producer bandwidth breakdown
- Server-side transport stats (client-side RTCStats is sufficient)
- Mobile/responsive layout optimization (developer tool only)
- Aggregate room bandwidth across all peers

## Decisions

### 1. Return all workers from `get-stats`, not one

**Decision**: Modify the server `get-stats` handler to iterate `runtime.workers` and return `{ pid, cpu, memory }[]` via `Promise.all(pidusage(...))`.

**Alternative considered**: Keep the single-PID API and make multiple client requests, one per worker. Rejected — requires the client to know all worker PIDs upfront, which it doesn't.

**Rationale**: `runtime.workers` is available in scope in `index.js`. A single request returning all workers is simpler and avoids multiple socket roundtrips per poll cycle.

---

### 2. Bandwidth via `sendTransport.getStats()` (client-side), not server-side

**Decision**: Expose `sendTransport` from `startMeeting()` return value. Poll `sendTransport.getStats()` every 3s in `App.tsx`. Delta `bytesSent` from `outbound-rtp` entries to compute upload kbps. Delta `bytesReceived` from all active `RecvTransport` stats for download kbps.

**Alternative considered**: `transport.getStats()` on server-side mediasoup transports, returned via socket. Rejected — adds socket overhead and requires maintaining a transport-ID-to-socket mapping for the client's specific transports.

**Rationale**: `mediasoup-client` `Transport.getStats()` is a public API. Client-side deltas are straightforward. No server changes needed beyond the worker stats modification.

**Note on receive bitrate**: `consumeRemote()` in `meeting.ts` also creates receive transports internally. To collect recv stats, the return value of `consumeRemote()` must also expose the recv transport. Alternatively, `App.tsx` can track recv transports itself via a ref. The simpler path: `consumeRemote()` returns `{ stream, recvTransport }` and `App.tsx` accumulates them in a ref for polling.

---

### 3. Card positioned below the existing topology diagnostics card

**Decision**: Render `<ResourceMonitorCard>` directly below `<TopologyDiagnosticsPanel>` in `App.tsx`. Both float in the top-right corner, stacked vertically.

**Rationale**: Colocation with the existing developer panel reinforces the "debug tooling" mental model. Avoids layout disruption to the video grid.

---

### 4. Color thresholds for health indication

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| CPU % | < 60 | 60–80 | > 80 |
| Memory % | < 70 | 70–85 | > 85 |

Text color only (no background changes) to keep the card visually light.

---

### 5. Polling interval: 3 seconds

**Decision**: Single `setInterval` at 3000ms triggers both the `get-stats` socket emit and the `sendTransport.getStats()` call.

**Rationale**: 3s is responsive enough to notice load spikes without hammering the server. One interval for both keeps cleanup simple.

## Risks / Trade-offs

- **`pidusage` accuracy on macOS**: `pidusage` reports per-process CPU as a percentage of a single core. On a multi-core machine the system CPU (from `os.loadavg`) and worker CPU may appear on different scales. → Mitigation: label units clearly in the UI (`cpu %` for OS load average normalized to 1 min, `proc %` for worker).

- **Transport stats not available before join**: `sendTransport` is `null` in the lobby. The polling effect must guard against this and show `—` for bandwidth. → Mitigation: conditional check in polling effect.

- **Stale stats after leave**: Polling must be cleared on unmount and when the user leaves the meeting. → Mitigation: `useEffect` cleanup returns `clearInterval`.

- **`consumeRemote` transport accumulation**: Each new remote participant creates a new recv transport. The ref accumulates them but never pruned on participant leave. → Accepted for now; this is a debug tool and transport objects are lightweight.

## Open Questions

- Should system CPU display `loadavg[0]` (1-min) or a real-time value? `os.loadavg()` returns a 1-min average which can lag spikes. For a debug tool this is acceptable. → Use `loadavg[0]`.
