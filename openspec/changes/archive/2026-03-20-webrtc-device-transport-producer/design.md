## Context

The server has a mediasoup Router (created via `create-router`) and a socket.io signaling channel. The client can trigger router creation but has no WebRTC transport or media flow. This design extends the signaling protocol to cover the full send-side WebRTC negotiation: RTP capabilities exchange, transport creation and DTLS connection, and producer creation. The client then acquires local media and displays it.

## Goals / Non-Goals

**Goals:**
- Add 4 server-side socket event handlers (`get-rtp-capabilities`, `create-webrtc-transport`, `connect-transport`, `produce`) in a new `transportManager.js`.
- Client orchestration module `src/lib/meeting.ts` that performs the full sequence after a router is created.
- Local `<video>` element rendering the camera stream with `autoplay`, `playsinline`, `muted`.
- **Mute / Unmute** (audio) and **Camera On / Off** (video) toggle buttons that pause/resume the respective `Producer` and reflect state in the UI.

**Non-Goals:**
- Remote video (consuming from other participants) — future change.
- TURN/STUN server configuration — rely on loopback/LAN for local dev (WebRTC will work without TURN on localhost).
- Recording, SFU fan-out, or multiple rooms.
- Error recovery / reconnect after transport failure.

## Decisions

### Separate `transportManager.js`
WebRTC transport and producer state is isolated from `roomManager.js` (which owns Routers). Each concern stays in its own module with its own in-memory Map. The transport manager calls `getRouter(routerId)` to look up the parent Router.

### Single send transport per socket connection
One `WebRtcTransport` is created per `create-webrtc-transport` call. For this stage a single transport carries both audio and video producers. Splitting per-track is valid but premature.

### `listenInfos` over `listenIps`
mediasoup v3 prefers `listenInfos: [{ protocol: 'udp', ip: '0.0.0.0', announcedAddress: '127.0.0.1' }]` for local dev. This avoids ICE failures on loopback without needing a TURN server.

### `meeting.ts` client orchestration module
All signaling steps (emit/ack sequence) are encapsulated in `src/lib/meeting.ts` as a single exported async function `startMeeting(routerId): Promise<{ stream, audioProducer, videoProducer }>`. `App.tsx` calls this and hands the result to the video element and toggle buttons. This keeps the component thin and the protocol logic testable.

### Producer pause/resume for A/V toggle
Toggling audio/video calls `producer.pause()` / `producer.resume()` on the client-side mediasoup-client Producer. No server round-trip is needed for local mute (the track itself is also enabled/disabled for consistency). A server-side `pause-producer` event is out of scope.

## Risks / Trade-offs

- **ICE on non-loopback networks**: `announcedAddress: '127.0.0.1'` only works when server and browser are on the same machine. → Document as a known limitation; changing to the real LAN IP fixes it.
- **In-memory transport map**: Transports are lost on server restart. → Acceptable at this stage.
- **Camera permission denial**: `getUserMedia` throws if user denies permission. → Caught in `meeting.ts` and surfaced as an error string.
- **Single transport for audio + video**: If one producer fails the transport may be unusable. → Acceptable; error state shown in UI.
