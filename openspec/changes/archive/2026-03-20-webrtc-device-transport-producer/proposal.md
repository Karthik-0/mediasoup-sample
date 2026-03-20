## Why

The app can create a mediasoup Router but stops there — no media actually flows. To deliver a real meeting experience, the client needs to load a mediasoup `Device`, negotiate WebRTC transports, acquire the user's camera and microphone, produce those tracks to the server, and display the local video feed with controls to mute/unmute.

## What Changes

- **Server**: expose four new socket events for the WebRTC negotiation handshake:
  - `get-rtp-capabilities` → returns the router's RTP capabilities to the client
  - `create-webrtc-transport` → creates a server-side `WebRtcTransport` and returns its connection parameters
  - `connect-transport` → finalises DTLS handshake when client calls `transport.connect()`
  - `produce` → creates a server-side `Producer` for a given transport and returns the producer ID
- **Server**: new `transportManager.js` module owns `WebRtcTransport` and `Producer` lifecycle
- **Client**: install `mediasoup-client`; after `create-router` succeeds, load a `Device`, create a send transport, acquire local media, and start producing audio and video
- **Client**: replace the router ID display with a `<video>` element showing the local stream
- **Client**: add **Mute / Unmute** and **Camera On / Off** toggle buttons below the video

## Capabilities

### New Capabilities

- `webrtc-transport-server`: Server-side WebRTC transport creation, DTLS connection, and producer management via socket events.
- `local-media-player`: Client-side local video display (`<video autoplay muted>`) and audio/video toggle controls.

### Modified Capabilities

- `start-meeting-ui`: Start Meeting now initiates the full WebRTC flow (load device → create transport → produce) rather than just displaying a router ID.
- `socket-signaling-server`: Four new socket events added (`get-rtp-capabilities`, `create-webrtc-transport`, `connect-transport`, `produce`).

## Impact

- **Server**: new `server/transportManager.js`; `server/index.js` gains four socket event handlers; `server/roomManager.js` unchanged.
- **Client**: `mediasoup-client` added to `client/package.json`; `client/src/App.tsx` refactored to orchestrate the full meeting flow; new `client/src/lib/meeting.ts` encapsulates device/transport/producer logic.
- **Dependencies**: `mediasoup-client` (npm) on client side only; no new server dependencies.
- **No breaking changes** to `/health`, existing `create-router` event, or worker pool.
