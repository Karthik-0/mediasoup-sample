## ADDED Requirements

### Requirement: Unified Join Interface
The system SHALL expose a singular combined entry point on the frontend for users to declare their intended destination without segregating "Start vs Join" states.

#### Scenario: User provides arbitrary string name
- **WHEN** a user enters "Main Lobby" and submits the action
- **THEN** the React client trims/sanitizes the input and emits `join-room` with `roomId: "Main Lobby"`
