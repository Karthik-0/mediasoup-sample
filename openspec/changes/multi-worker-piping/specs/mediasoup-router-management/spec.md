## MODIFIED Requirements

### Requirement: Room manager creates mediasoup Routers
The system SHALL provide a `getOrCreateRouter(roomId)` function that returns an available Mediasoup Router from the global map for that room, prioritizing routers with remaining capacity, or creating a new one on a round-robin worker.

#### Scenario: Router is created when room is empty
- **WHEN** `getOrCreateRouter(roomId)` is called for a new room
- **THEN** a mediasoup Router is created on a worker, mapped to the `roomId`, and returned to the caller

#### Scenario: Router is retrieved when room has capacity
- **WHEN** `getOrCreateRouter(roomId)` is called for an active room with unfulfilled Shard capacity
- **THEN** the existing Router is identified and returned without spawning a new memory instance
