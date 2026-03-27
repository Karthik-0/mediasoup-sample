## 1. bot.ts Library

- [x] 1.1 Create `client/src/lib/bot.ts`. Define `BotHandle` interface: `{ name: string; socketId: string; disconnect: () => void }`. Define `SpawnBotOptions`: `{ videoSource: 'canvas' | File }`.
- [x] 1.2 Implement local `emit<T>()` helper (copy of the same helper from `meeting.ts`) for socket ack wrapping with error propagation.
- [x] 1.3 Implement `createCanvasStream(botName: string, hue: number): { stream: MediaStream; stop: () => void }`. Draw animated hue-cycling background (HSL at `hue + frame * 0.5 % 360`) + bot name centred + frame counter bottom-right on a 320×240 canvas at ~30fps via `setInterval(draw, 33)`. Return `canvas.captureStream(30)` and a stop function that clears the interval.
- [x] 1.4 Implement `createFileStream(file: File): Promise<{ stream: MediaStream; stop: () => void }>`. Create a hidden `HTMLVideoElement` (`display:none`), set `src = URL.createObjectURL(file)`, `loop = true`, `muted = true`, `playsInline = true`, append to `document.body`, call `await video.play()`, return `video.captureStream()`. Stop function: `video.pause()`, `URL.revokeObjectURL(src)`, `video.remove()`.
- [x] 1.5 Implement `createSilentAudioTrack(): { track: MediaStreamTrack; stop: () => void }`. Create `AudioContext`, `createOscillator()` → `createGain()` (gain value = 0) → `createMediaStreamDestination()`. Start the oscillator. Return `dest.stream.getAudioTracks()[0]` and a stop function that closes the AudioContext.
- [x] 1.6 Implement `spawnBot(roomId: string, botName: string, options: SpawnBotOptions, botIndex: number): Promise<BotHandle>`. Full sequence: `io(SERVER_URL)` → emit `join-room { roomId, userName: botName }` → emit `get-rtp-capabilities` → `new Device().load()` → emit `create-webrtc-transport` → `device.createSendTransport()` → wire `transport.on('connect')` → wire `transport.on('produce')` → acquire video stream (canvas or file) → acquire silent audio track → `transport.produce(videoTrack)` → `transport.produce(audioTrack)`.
- [x] 1.7 Inside `spawnBot`, after produce setup, start a 2-second `fetchAndConsume` interval: emit `get-producers { roomId }`, for each entry not in `consumedProducers` Set: emit `create-webrtc-transport` → `device.createRecvTransport()` → wire `recvTransport.on('connect')` → emit `consume` → `recvTransport.consume()`. Track consumed producer IDs in a local `Set<string>`.
- [x] 1.8 Implement `disconnect()` in `spawnBot` closure: `clearInterval` on the consume interval, call the video stop function, call the audio stop function, `socket.disconnect()`.
- [x] 1.9 Export `SERVER_URL` from `client/src/lib/socket.ts` as a named export so `bot.ts` can import it without importing the socket singleton.

## 2. BotPanel Component

- [x] 2.1 In `App.tsx`, add `botsRef = useRef<BotHandle[]>([])`, `botCounterRef = useRef(0)`, and `botVideoFileInputRef = useRef<HTMLInputElement>(null)`.
- [x] 2.2 Add `const [botCount, setBotCount] = useState(0)` for displaying the live count in the panel.
- [x] 2.3 Create `BotPanel` component (defined before `App` in `App.tsx`) accepting props `{ roomId: string; botsRef: React.MutableRefObject<BotHandle[]>; botCounterRef: React.MutableRefObject<number>; fileInputRef: React.RefObject<HTMLInputElement>; botCount: number; onCountChange: (n: number) => void }`. Render: header "DEV BOTS" with `Bots: N` count badge, "Add Canvas Bot" button, "Add Video Bot" button, "Remove All" button, hidden `<input type="file" accept="video/*" ref={fileInputRef}>`.
- [x] 2.4 "Add Canvas Bot" handler inside `BotPanel`: increment `botCounterRef.current`, derive `botName = \`Bot-${botCounterRef.current}\``, call `spawnBot(roomId, botName, { videoSource: 'canvas' }, botCounterRef.current)`, push returned handle to `botsRef.current`, call `onCountChange(botsRef.current.length)`.
- [x] 2.5 "Add Video Bot" handler: call `fileInputRef.current?.click()`. File input `onChange`: read `event.target.files?.[0]`, if present increment counter, derive name, call `spawnBot(roomId, botName, { videoSource: file }, index)`, push handle, call `onCountChange`, reset `input.value = ''`.
- [x] 2.6 "Remove All" handler: call `b.disconnect()` for every entry in `botsRef.current`, set `botsRef.current = []`, call `onCountChange(0)`.
- [x] 2.7 Render `{import.meta.env.DEV && state === 'active' && <BotPanel roomId={joinRoomId.trim()} botsRef={botsRef} botCounterRef={botCounterRef} fileInputRef={botVideoFileInputRef} botCount={botCount} onCountChange={setBotCount} />}` in the absolute top-right stack below `<ResourceMonitorCard>`.

## 3. Leave Room Integration

- [x] 3.1 In the "Leave Room" / page reload handler in `App.tsx` (currently `onClick={() => window.location.reload()}`), add cleanup before reload: `botsRef.current.forEach(b => b.disconnect()); botsRef.current = [];`. Since the current leave handler calls `window.location.reload()`, wrap it in a named `handleLeaveMeeting` function that runs bot cleanup first.
