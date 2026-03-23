## ADDED Requirements

### Requirement: Load Balancing Participants across Routers
The system SHALL assign joining participants to the least-populated Router Shard for the requested Room.

#### Scenario: Room has active routers under capacity
- **WHEN** a user attempts to join a room
- **THEN** they are assigned to an existing router mapped to that room that has not exceeded its maximum participant limit

#### Scenario: Room routers are at maximum capacity
- **WHEN** a user attempts to join a room where all mapped routers are full
- **THEN** the system seamlessly instantiates a new Router on a secondary Worker, maps it to the Room, and assigns the user to it
