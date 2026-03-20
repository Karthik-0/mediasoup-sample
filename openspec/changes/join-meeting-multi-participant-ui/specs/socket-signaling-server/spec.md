## MODIFIED Requirements

### Requirement: Server supports joining a room by ID
The system SHALL handle a `join-room` socket event with `{ roomId }` and add the client to the specified room.

#### Scenario: Client emits join-room and is added
- **WHEN** a client emits `join-room` with a valid room ID
- **THEN** the server adds the client to the room and acknowledges

### Requirement: Server notifies peers on join/leave
The system SHALL emit peer-joined and peer-left events to all clients in a room when participants join or leave.

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
