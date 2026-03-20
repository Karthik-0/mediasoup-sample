## ADDED Requirements

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
