## 1. Server — All-Worker Stats

- [x] 1.1 In `server/index.js`, modify the `get-stats` socket handler to iterate `runtime.workers` using `Promise.all` with `pidusage` on each worker's `.pid`, returning `workerStats` as an array of `{ pid, cpu, memory }` objects
- [x] 1.2 Remove the `workerPid` parameter expectation from the `get-stats` handler (it now takes no arguments)
- [x] 1.3 Verify the existing `systemStats` fields (`cpuLoad`, `memFree`, `memTotal`, `uptime`) are unchanged in the response

## 2. Client — Expose Transports from meeting.ts

- [x] 2.1 In `client/src/lib/meeting.ts`, update `startMeeting()` to return `{ device, sendTransport }` (currently returns `{ device }` only)
- [x] 2.2 In `client/src/lib/meeting.ts`, update `consumeRemote()` to return `{ stream, recvTransport }` (currently returns `MediaStream` directly)
- [x] 2.3 Update all call sites in `App.tsx` that use `startMeeting()` and `consumeRemote()` to destructure the new return shapes

## 3. Client — Stats Polling Infrastructure

- [x] 3.1 In `App.tsx`, add a `useEffect` that sets up a 3-second `setInterval` emitting `get-stats` on the socket and updating `hardwareStats` state with `{ systemStats, workerStats }`
- [x] 3.2 Add cleanup (`clearInterval`) in the `useEffect` return function so polling stops on unmount
- [x] 3.3 In `App.tsx`, add a separate `useEffect` that polls `sendTransport.getStats()` every 3 seconds when `sendTransport` is non-null; compute uplink kbps from `outbound-rtp` `bytesSent` delta and store in `hardwareStats.sendBitrate`
- [x] 3.4 Accumulate recv transports (returned by `consumeRemote`) in a ref (`recvTransportsRef`); include downlink kbps computation from all tracked recv transports' `inbound-rtp` `bytesReceived` delta, stored in `hardwareStats.recvBitrate`
- [x] 3.5 Reset `sendBitrate` and `recvBitrate` to `null` when the user leaves the meeting; clear bandwidth polling interval

## 4. Client — Resource Monitor Card UI

- [x] 4.1 Create a `ResourceMonitorCard` component in `App.tsx` (or inline) with a minimize/expand toggle controlled by local `useState`
- [x] 4.2 Implement the SYSTEM section: display CPU% (from `systemStats.cpuLoad` clamped to 100) and MEM% (used/total), with total shown in GB
- [x] 4.3 Implement the WORKERS section: render one row per entry in `workerStats`, showing each worker's PID and CPU%; highlight the row whose `pid` matches the current peer's `workerPid`
- [x] 4.4 Implement the BANDWIDTH section: show `↑ N kbps` / `↓ N kbps` when bitrates are non-null, otherwise show `—`
- [x] 4.5 Apply color thresholds to CPU and memory percentage values: green < 60%/70%, yellow 60–80%/70–85%, red > 80%/85%
- [x] 4.6 Show `—` for all values when `hardwareStats` has not yet been populated (initial load state)
- [x] 4.7 Render `<ResourceMonitorCard>` in `App.tsx` stacked below the existing topology diagnostics card, visible on both lobby and meeting views
