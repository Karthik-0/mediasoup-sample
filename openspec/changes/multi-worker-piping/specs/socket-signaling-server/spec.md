## MODIFIED Requirements

### Requirement: Server handles create-router event
The system SHALL listen for a `create-router` socket event from any connected client, generate a custom `roomId`, initialize the primary shard, and respond with the `roomId`.

#### Scenario: Client emits create-router and receives custom roomId
- **WHEN** a connected client emits the `create-router` event
- **THEN** the server creates a mediasoup Router, generates a string ID, and calls the callback with `{ roomId: "..." }`

### Requirement: Server handles join-room event
The system SHALL listen for a `join-room` event, invoke load-balancing to assign the user to a shard, and return the `routerId`.

#### Scenario: User joins room and receives router shard allocation
- **WHEN** a connected client emits `join-room` providing a valid `roomId`
- **THEN** the server assigns the socket.io socket to an available Mediasoup Router shard and calls the acknowledgement callback with `{ routerId: router.id }`
