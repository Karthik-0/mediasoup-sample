## ADDED Requirements

### Requirement: Server provides RTP capabilities for a router
The system SHALL handle a `get-rtp-capabilities` socket event with `{ routerId }` and acknowledge with the router's RTP capabilities object.

#### Scenario: Valid routerId returns RTP capabilities
- **WHEN** a client emits `get-rtp-capabilities` with a known `routerId`
- **THEN** the acknowledgement callback is called with `{ rtpCapabilities: <RtpCapabilities> }`

#### Scenario: Unknown routerId returns error
- **WHEN** a client emits `get-rtp-capabilities` with an unknown `routerId`
- **THEN** the acknowledgement callback is called with `{ error: "Router not found" }`

### Requirement: Server creates a WebRTC send transport
The system SHALL handle a `create-webrtc-transport` socket event with `{ routerId }` and create a server-side `WebRtcTransport`, acknowledging with transport connection parameters.

#### Scenario: Transport is created and parameters returned
- **WHEN** a client emits `create-webrtc-transport` with a valid `routerId`
- **THEN** the acknowledgement returns `{ id, iceParameters, iceCandidates, dtlsParameters }` for the new transport

#### Scenario: Transport is stored by ID
- **WHEN** a WebRtcTransport is created successfully
- **THEN** it is stored in an in-memory map keyed by `transport.id`

### Requirement: Server connects a WebRTC transport
The system SHALL handle a `connect-transport` socket event with `{ transportId, dtlsParameters }` to complete the DTLS handshake.

#### Scenario: Transport DTLS handshake completes
- **WHEN** a client emits `connect-transport` with a valid `transportId` and `dtlsParameters`
- **THEN** `transport.connect({ dtlsParameters })` is called and the acknowledgement returns `{}`

#### Scenario: Unknown transportId returns error
- **WHEN** a client emits `connect-transport` with an unknown `transportId`
- **THEN** the acknowledgement returns `{ error: "Transport not found" }`

### Requirement: Server creates a Producer
The system SHALL handle a `produce` socket event with `{ transportId, kind, rtpParameters }` and create a `Producer`, acknowledging with its ID.

#### Scenario: Producer is created for valid transport
- **WHEN** a client emits `produce` with a valid `transportId`, `kind` (`"audio"` or `"video"`), and `rtpParameters`
- **THEN** the acknowledgement returns `{ id: <producerId> }`

#### Scenario: Producer is stored by ID
- **WHEN** a Producer is created successfully
- **THEN** it is stored in an in-memory map keyed by `producer.id`
