## Why

During development it requires multiple real browser windows to test multi-participant scenarios, shard overflow, cross-worker piping, and the participant grid UI. This is friction-heavy and doesn't scale beyond a handful of windows. Developers need a way to inject fake-but-real participants into any room from within the existing UI — instantly, without any extra setup.

## What Changes

- Add a new `client/src/lib/bot.ts` module that exports `spawnBot(roomId, options)` returning a `BotHandle` with a `disconnect()` method. The bot opens a fresh Socket.io connection, joins the room, creates a mediasoup Device + SendTransport, produces a video track (animated canvas or looped HTMLVideoElement), produces a silent AudioContext audio track, and runs a `fetchAndConsume` interval so it also receives all other participants in the room.
- Add a `BotPanel` React component in `App.tsx`, rendered in the meeting view gated behind `import.meta.env.DEV`. It has "Add Canvas Bot", "Add Video Bot", and "Remove All Bots" buttons with a live bot count.
- All active bots are stored in a `botsRef`. Clicking "Leave Room" disconnects all bots before tearing down the meeting.

## Capabilities

### New Capabilities

- `bot-participant-simulator`: The `bot.ts` library — `spawnBot()`, `BotHandle`, canvas video source, HTMLVideoElement looped file source, silent AudioContext audio track.
- `bot-panel-ui`: The `BotPanel` UI component in `App.tsx` — dev-only, renders inside the meeting view, exposes add/remove controls and a live bot count display.

### Modified Capabilities

None — bots use existing socket events (`join-room`, `get-rtp-capabilities`, `create-webrtc-transport`, `connect-transport`, `produce`, `get-producers`, `consume`). No server changes needed.

## Impact

- **client/src/lib/bot.ts**: New file — entire bot spawning library
- **client/src/App.tsx**: Add `botsRef`, `botCounterRef`, `BotPanel` component, bot disconnection in leave handler
- **No new npm dependencies** — uses `socket.io-client` (already installed), `mediasoup-client` (already installed), and native browser APIs (`HTMLCanvasElement`, `AudioContext`, `HTMLVideoElement`)
