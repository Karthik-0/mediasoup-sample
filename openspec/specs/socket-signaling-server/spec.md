## ADDED Requirements

### Requirement: Socket.io server attaches to Express HTTP server
The system SHALL attach a socket.io `Server` instance to the existing `http.Server` created from the Express app, sharing the same port.

#### Scenario: Socket.io initialises on server start
- **WHEN** the Express server starts successfully
- **THEN** a socket.io server is listening on the same port as Express

#### Scenario: CORS allows client origin
- **WHEN** a browser client connects from any origin (development mode)
- **THEN** the socket.io handshake succeeds without CORS errors

### Requirement: Server handles create-router event
The system SHALL listen for a `create-router` socket event from any connected client and respond with an acknowledgement containing a router ID.

#### Scenario: Client emits create-router and receives router ID
- **WHEN** a connected client emits the `create-router` event
- **THEN** the server creates a mediasoup Router and calls the acknowledgement callback with `{ routerId: "<uuid>" }`

#### Scenario: Router creation failure returns error
- **WHEN** router creation throws an error
- **THEN** the acknowledgement callback is called with `{ error: "<message>" }` and no router is stored

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
