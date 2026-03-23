## ADDED Requirements

### Requirement: Socket.io server attaches to Express HTTP server
The system SHALL attach a socket.io `Server` instance to the existing `http.Server` created from the Express app, sharing the same port.

#### Scenario: Socket.io initialises on server start
- **WHEN** the Express server starts successfully
- **THEN** a socket.io server is listening on the same port as Express

#### Scenario: CORS allows client origin
- **WHEN** a browser client connects from any origin (development mode)
- **THEN** the socket.io handshake succeeds without CORS errors

### Requirement: Server handles join-room event
The system SHALL securely process arbitrary `roomId` string payloads within `join-room` emissions, dynamically instantiating the underlying backend routing shard mapped to that Room if absent, before concluding attachment logic for the participant. The server SHALL also add the client to that room for peer event broadcasting.

#### Scenario: User provides a new custom room name
- **WHEN** a client emits `join-room` referencing `"My Awesome Lobby"`
- **THEN** the signaling server creates a new Router mapped to that identifier if one does not exist, and returns confirmation

#### Scenario: Client emits join-room and is added
- **WHEN** a client emits `join-room` with a valid `{ roomId }`
- **THEN** the server adds the client to the room and acknowledges

### Requirement: Server handles get-rtp-capabilities event
The system SHALL listen for a `get-rtp-capabilities` socket event and respond with the router's RTP capabilities.

#### Scenario: Emitting get-rtp-capabilities returns RTP capabilities
- **WHEN** a connected client emits `get-rtp-capabilities` with `{ routerId }`
- **THEN** the server responds with `{ rtpCapabilities }` for that router

### Requirement: Server handles create-webrtc-transport event
The system SHALL listen for a `create-webrtc-transport` socket event and create a server-side WebRTC transport.

#### Scenario: Emitting create-webrtc-transport returns transport params
- **WHEN** a connected client emits `create-webrtc-transport` with `{ routerId }`
- **THEN** the server responds with `{ id, iceParameters, iceCandidates, dtlsParameters }`

### Requirement: Server handles connect-transport event
The system SHALL listen for a `connect-transport` socket event to complete DTLS negotiation.

#### Scenario: Emitting connect-transport completes handshake
- **WHEN** a connected client emits `connect-transport` with `{ transportId, dtlsParameters }`
- **THEN** the server calls `transport.connect()` and acknowledges with `{}`

### Requirement: Server handles produce event
The system SHALL listen for a `produce` socket event and create a mediasoup Producer.

#### Scenario: Emitting produce returns producer ID
- **WHEN** a connected client emits `produce` with `{ transportId, kind, rtpParameters }`
- **THEN** the server creates a Producer and acknowledges with `{ id: <producerId> }`

### Requirement: Server handles get-producers event
The system SHALL return a globally synchronized array of active external media producers mapped to the current room topology, enriching the response payload with granular telemetry detailing the exact shard origin.

#### Scenario: User requests remote producers
- **WHEN** the frontend emits `get-producers` providing their `roomId`
- **THEN** the server returns an array containing `producerId`, `peerId`, `routerId`, and `workerPid` explicitly identifying the node origin of each item

### Requirement: Server notifies peers on join/leave
The system SHALL emit `peer-joined` and `peer-left` events to all clients in a room when participants join or leave.

#### Scenario: peer-joined event is sent
- **WHEN** a new participant joins a room
- **THEN** all clients in the room receive a `peer-joined` event with the new participant's info

#### Scenario: peer-left event is sent
- **WHEN** a participant leaves a room
- **THEN** all clients in the room receive a `peer-left` event with the departing participant's ID

### Requirement: Server relays media signaling for multi-user
The system SHALL relay media signaling events (e.g., transport/producer info) between all participants in a room as needed for multi-user media setup.

#### Scenario: Media signaling is routed to correct peers
- **WHEN** a client emits a media signaling event for a room
- **THEN** the server relays it to the intended participants

### Requirement: Server handles get-stats event and returns all-worker stats
The server SHALL listen for a `get-stats` socket event and respond with system-level resource stats and per-worker stats for every worker in the mediasoup pool.

The acknowledgement payload SHALL conform to:
```
{
  systemStats: { cpuLoad: number, memFree: number, memTotal: number, uptime: number },
  workerStats: Array<{ pid: number, cpu: number, memory: number }>
}
```

`workerStats` SHALL be an array (not a single object), with one entry per worker in `runtime.workers`. Callers MUST NOT pass a `workerPid` parameter; the server returns all workers unconditionally.

#### Scenario: Emitting get-stats returns all worker entries
- **WHEN** a connected client emits `get-stats` (no arguments required)
- **THEN** the server acknowledges with `{ systemStats, workerStats }` where `workerStats` is an array with one entry per worker

#### Scenario: Backward-compatible call with no parameters
- **WHEN** a client emits `get-stats` without any arguments
- **THEN** the server still responds successfully with the full stats payload
