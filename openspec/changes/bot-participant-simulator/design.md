## Context

The existing `meeting.ts` shows the full pattern a bot must replicate: open a socket, `join-room`, `get-rtp-capabilities`, `new Device().load()`, `create-webrtc-transport`, wire `connect` and `produce` events, acquire media, `transport.produce()`. Bots follow the same sequence verbatim except they source their MediaStream from a canvas or HTMLVideoElement instead of `getUserMedia`.

The `emit<T>()` helper in `meeting.ts` wraps socket acks with error propagation. `bot.ts` will carry a local copy of this helper to stay self-contained and avoid exporting internal utilities from `meeting.ts`.

`App.tsx` manages a `socket` singleton from `socket.ts`. Bots need their **own** socket instances to get independent peer IDs. They call `io(SERVER_URL)` directly, importing `SERVER_URL` as a constant from `socket.ts` (not the socket instance).

The `fetchAndConsume` pattern in `App.tsx` polls `get-producers` every 2 seconds and calls `consumeRemote()`. Bots replicate this inline using their own `Device` and per-producer `recvTransport` instances — they do not share state with `App.tsx`.

## Goals / Non-Goals

**Goals:**
- Bots are real peers (real socket, real WebRTC transports, real Producers on the server)
- Bots both produce and consume — full roundtrip exercises all server code paths
- Canvas video source — animated hue-cycling background + bot name + frame counter, zero file dependency
- File video source — looped HTMLVideoElement off-screen, user picks file via hidden `<input type="file">`
- Silent audio (AudioContext oscillator at gain=0) — both tracks always present so mediasoup never rejects the produce call
- Unlimited bots (user controls count by clicking Add repeatedly)
- Bots persist until the user clicks "Remove All Bots" or "Leave Room"
- Dev-only UI gated behind `import.meta.env.DEV` — stripped from production bundle by Vite

**Non-Goals:**
- Bots do not mirror camera controls (mute/unmute, video on/off)
- Bot video tiles in the *host's* grid are rendered by the existing `fetchAndConsume` loop — no special bot-aware rendering code
- No persistence across page refreshes
- No server-side changes

## Decisions

### 1. Canvas video: animated hue cycle

Each bot gets a unique hue offset (`(botIndex * 60) % 360` degrees). The canvas draw loop (33ms `setInterval`) renders a full-color HSL background, the bot's name centred in white, and an incrementing frame counter in the bottom-right corner so the stream is never static (static streams can cause mediasoup to treat the encoder as idle). `canvas.captureStream(30)` yields a valid 30fps video track without any permission prompt.

### 2. File video: one off-screen `<video>` element per bot

A hidden `HTMLVideoElement` is created (`style.display = 'none'`), appended to `document.body`, `src` set to `URL.createObjectURL(file)`, `loop = true`, `muted = true`. `await video.play()` is safe because it runs in the user-gesture call chain of the "Add Video Bot" button click. `video.captureStream()` returns a valid MediaStream. The stop function pauses the video, revokes the object URL, and removes the element from the DOM.

### 3. Audio: silent AudioContext oscillator

`new AudioContext()` → `createOscillator()` → `createGain({ gain: { value: 0 } })` → `createMediaStreamDestination()`. The destination's `.stream.getAudioTracks()[0]` is a valid, non-muted-flag, zero-amplitude audio track. This avoids any `getUserMedia` permission and satisfies mediasoup's requirement for a real audio Producer. The AudioContext is closed in `disconnect()`.

### 4. Bot's own fetchAndConsume loop

Each bot runs a 2-second `setInterval` that emits `get-producers` for the room and subscribes to any unseen producer via `create-webrtc-transport` (recv) + `connect-transport` + `consume`. Each recv transport is created fresh per producer (matching `meeting.ts`'s `consumeRemote` pattern). This correctly exercises cross-shard `pipeToRouter` on the server.

### 5. BotPanel UI placement

Rendered in the absolute top-right stack in `App.tsx`, below `ResourceMonitorCard`, visible only when `state === 'active'` **and** `import.meta.env.DEV`. The `import.meta.env.DEV` guard is evaluated at build time by Vite — dead-code eliminated in production.

### 6. File input UX

A hidden `<input type="file" accept="video/*">` lives inside `BotPanel`. "Add Video Bot" calls `.click()` on it via a `useRef`. `onChange` reads `event.target.files[0]`, calls `spawnBot`, pushes the handle, updates the count, then resets `input.value = ''` so the same file can be re-selected next click.

### 7. Bot naming

Sequential: `Bot-1`, `Bot-2`, `Bot-3` … via a `botCounterRef` that increments monotonically and never resets. This ensures that after "Remove All" + re-add, new bots get non-colliding names (`Bot-4`, `Bot-5`, …).

## Risks / Trade-offs

- **ICE failures at high bot counts:** Each bot opens a real DTLS+ICE connection. At very high counts (20+) the browser's ICE agent may throttle. Expected and acceptable — this is a deliberate stress-test tool.
- **Canvas `setInterval` vs `requestAnimationFrame`:** `captureStream` works with both; `setInterval(draw, 33)` is simpler to cancel without a running RAF loop reference.
- **File video autoplay policy:** `video.play()` could be blocked if called outside a user-gesture chain. "Add Video Bot" → file input `onChange` is technically a user-gesture continuation in all major browsers; this has been validated as safe.
- **AudioContext suspended on page load:** `AudioContext` auto-suspend applies on page load, not inside a user gesture. Calling `new AudioContext()` inside the button handler creates it in a running state.
- **Bot tiles in the participant grid:** Bots appear via the existing `peer-joined` → `fetchAndConsume` flow in `App.tsx`. No rendering special-casing is needed.
- **recv transport accumulation:** Each bot's consume loop creates one recv transport per remote producer and never prunes closed ones. For a debug tool this is acceptable.

## Open Questions

None — all design decisions are resolved.
