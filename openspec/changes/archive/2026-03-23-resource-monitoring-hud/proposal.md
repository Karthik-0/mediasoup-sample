## Why

During development and debugging, there is no visibility into how much CPU/memory the server's mediasoup workers are consuming, how loaded the system is overall, or what bandwidth the local peer is sending and receiving. Developers must resort to external tools or manual socket inspection to answer basic questions like "which worker handles this room?" and "is that worker overloaded?".

## What Changes

- Add a **Resource Monitor card** to the client UI — a minimizable developer HUD card (positioned alongside the existing topology diagnostics panel) that shows system CPU/memory, per-worker CPU/memory (with the current peer's worker highlighted), and uplink/downlink bandwidth
- Modify the server's `get-stats` socket event to return stats for **all workers** in the pool (instead of a single worker by PID)
- Add a **3-second polling loop** on the client that calls `get-stats` and updates the resource state
- Expose the mediasoup-client `sendTransport` from `startMeeting()` so `App.tsx` can call `transport.getStats()` every 3 seconds to derive uplink/downlink kbps
- Show bandwidth as `—` in the lobby (pre-join) and populate it once in a meeting

## Capabilities

### New Capabilities

- `resource-monitor-card`: A minimizable UI card component displaying system CPU/memory, all worker CPU/memory stats (with "my worker" highlighted), and uplink/downlink bandwidth. Visible on both the join screen and in-meeting view. Refreshes every 3 seconds.
- `client-stats-polling`: Client-side polling infrastructure — a `useEffect` loop emitting `get-stats` on the socket every 3 seconds and a separate loop collecting `RTCPeerConnection` stats via `sendTransport.getStats()` to compute bitrates.
- `server-all-worker-stats`: Modified `get-stats` socket handler that iterates all workers in `runtime.workers` via `pidusage` and returns an array of per-worker stats instead of a single worker stat.

### Modified Capabilities

- `socket-signaling-server`: The `get-stats` event response shape changes — `workerStats` becomes an array of `{ pid, cpu, memory }` objects instead of a single object.

## Impact

- **server/index.js**: `get-stats` handler — change from single-PID lookup to full worker array iteration
- **server/mediasoupBootstrap.js**: No change needed; `runtime.workers` already exposes all worker objects with `.pid`
- **client/src/lib/meeting.ts**: `startMeeting()` return value extended to include `sendTransport` reference
- **client/src/App.tsx**: New `hardwareStats` polling `useEffect`, new `ResourceMonitorCard` component rendered in the UI
- **No new npm dependencies** — `pidusage` already installed on server; `RTCPeerConnection.getStats()` is a browser built-in
