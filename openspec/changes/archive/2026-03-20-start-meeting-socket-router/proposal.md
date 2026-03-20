## Why

The app has a working mediasoup worker pool and a React client but no way to start a real-time session. Connecting the two requires a signaling channel so the client can trigger router creation on the server—the first step toward a full WebRTC meeting flow.

## What Changes

- Add `socket.io` to the server and attach it to the existing Express HTTP server.
- Add `socket.io-client` to the React client.
- Expose a `create-router` socket event: client emits it, server creates a mediasoup Router on an available worker and acknowledges with the router ID.
- Add a **Start Meeting** button to the React client UI that emits `create-router` and displays the returned router ID on success.

## Capabilities

### New Capabilities

- `socket-signaling-server`: Socket.io server attached to the Express HTTP server; handles the `create-router` event and returns a router ID to the caller.
- `mediasoup-router-management`: Per-session mediasoup Router creation using the existing worker pool; exposes helper to create and retrieve routers.
- `start-meeting-ui`: React UI component with a **Start Meeting** button; connects to the socket server, emits `create-router`, and shows the resulting router ID.

### Modified Capabilities

<!-- none -->

## Impact

- **Server**: `server/index.js` gains socket.io attachment; new `server/roomManager.js` manages router lifecycle.
- **Client**: `client/src/App.tsx` updated with button and state; new `client/src/lib/socket.ts` socket singleton.
- **Dependencies**: `socket.io` added to `server/package.json`; `socket.io-client` added to `client/package.json`.
- **No breaking changes** to existing `/health` endpoint or mediasoup worker startup.
