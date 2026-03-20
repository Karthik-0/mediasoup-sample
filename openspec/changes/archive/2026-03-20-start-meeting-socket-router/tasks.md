## 1. Server — Dependencies

- [x] 1.1 Install `socket.io` in `server/`

## 2. Server — Room Manager

- [x] 2.1 Create `server/roomManager.js` with `createRouter()` and `getRouter(id)` functions using the existing worker pool
- [x] 2.2 Define default mediasoup codec capabilities (opus audio, VP8 video) in `roomManager.js`

## 3. Server — Socket Signaling

- [x] 3.1 Refactor `server/index.js` to expose the `http.Server` instance
- [x] 3.2 Attach a socket.io `Server` to the HTTP server with CORS `origin: "*"`
- [x] 3.3 Handle `create-router` event: call `createRouter()` and ack with `{ routerId }` or `{ error }`

## 4. Client — Dependencies

- [x] 4.1 Install `socket.io-client` in `client/`

## 5. Client — Socket Singleton

- [x] 5.1 Create `client/src/lib/socket.ts` exporting a singleton `socket` connected to `VITE_SERVER_URL` (default `http://localhost:3001`)

## 6. Client — Start Meeting UI

- [x] 6.1 Update `client/src/App.tsx`: add `startMeeting()` handler that emits `create-router` and awaits ack
- [x] 6.2 Render a **Start Meeting** button that calls `startMeeting()` on click
- [x] 6.3 Show the returned `routerId` in the UI on success
- [x] 6.4 Show an error message in the UI on failure or timeout; re-enable button

## 7. Verification

- [x] 7.1 Start the server and confirm socket.io listens on port 3001
- [x] 7.2 Start the client dev server and click **Start Meeting** — confirm router ID appears in the UI
- [x] 7.3 Confirm server logs show router creation with the correct ID
