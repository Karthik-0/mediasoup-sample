# Spec: bot-participant-simulator

## Capability
`bot-participant-simulator` — Programmatic WebRTC participant that joins a room, produces media, and consumes remote media using the same signalling protocol as a real browser client.

---

## Context

### Core Objects

**`BotHandle`**
```ts
interface BotHandle {
  name: string;
  socketId: string;
  disconnect: () => void;
}
```

**`SpawnBotOptions`**
```ts
interface SpawnBotOptions {
  videoSource: 'canvas' | File;
}
```

**`spawnBot(roomId, botName, options, botIndex): Promise<BotHandle>`**
- Opens a fresh `socket.io-client` connection to `SERVER_URL`
- Uses `mediasoup-client` `Device` loaded with server RTP capabilities
- Joins with `userName = botName`
- Creates one send transport, produces one video track and one silent audio track
- Creates recv transports on demand via the consume interval
- Returns a `BotHandle` whose `disconnect()` tears everything down cleanly

---

## ADDED Requirements

### Scenario 1 — Canvas Bot Spawn
**GIVEN** `spawnBot` is called with `videoSource: 'canvas'`  
**WHEN** the bot connects  
**THEN** it joins the specified room via `join-room`  
**AND** loads RTP capabilities via `get-rtp-capabilities`  
**AND** creates a send transport via `create-webrtc-transport`  
**AND** produces a 320×240 canvas video track (animated, 30fps) via `transport.produce()`  
**AND** produces a silent audio track via `transport.produce()`  
**AND** the server receives two `produce` events from the bot's socket  

### Scenario 2 — File Bot Spawn
**GIVEN** `spawnBot` is called with `videoSource: File`  
**WHEN** the bot connects  
**THEN** a hidden `<video>` element is created, plays the file in a loop, and `captureStream()` is used as the video track source  
**AND** all other join/produce behaviour is identical to Scenario 1  

### Scenario 3 — Bot Consume Loop
**GIVEN** a bot has spawned and there are other producers in the room  
**WHEN** the consume interval fires (every 2 seconds)  
**THEN** the bot emits `get-producers`  
**AND** for each producer ID not yet consumed, it creates a recv transport and emits `consume`  
**AND** it calls `recvTransport.consume()` with the server's consumer parameters  
**AND** the same producer is not consumed twice (idempotent via a `Set<string>`)  

### Scenario 4 — Clean Disconnect
**GIVEN** a bot is active (joined, producing, consuming)  
**WHEN** `botHandle.disconnect()` is called  
**THEN** the consume interval is cleared  
**AND** the video source (canvas interval or hidden video element) is stopped/removed  
**AND** the AudioContext is closed  
**AND** `socket.disconnect()` is called  
**AND** no pending intervals or DOM elements remain  
