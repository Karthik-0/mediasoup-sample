## REMOVED Requirements

### Requirement: Server handles create-router event
**Reason**: Replaced entirely by the implicit creation capabilities built natively inside `join-room` utilizing RoomManager data structures.
**Migration**: Frontends expecting `create-router` behaviors must instead emit `join-room` directly possessing their target `roomId` payload.

## MODIFIED Requirements

### Requirement: Server handles join-room event
The system SHALL securely process arbitrary `roomId` string payloads within `join-room` emissions, dynamically instantiating underlying backend routing shards mapping to that Room if absent, before concluding attachment logic mapping the participant.

#### Scenario: User provides a new custom name
- **WHEN** a client emits `join-room` referencing `"My Awesome Lobby"`
- **THEN** the signaling server intercepts this string, explicitly creates a new Router mapped to that identifier, and returns confirmation.

### Requirement: Server handles get-producers event
The system SHALL return a globally synchronized array of active external media producers mapped to the current topology, enriching the structural response payload with granular telemetry detailing the exact shard origin.

#### Scenario: User requests remote producers
- **WHEN** the frontend emits `get-producers` providing their `roomId`
- **THEN** the server returns an array containing `producerId`, `peerId`, `routerId`, and `workerPid` explicitly identifying the node origin of each item.
