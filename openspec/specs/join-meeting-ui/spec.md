## ADDED Requirements

### Requirement: User can join a meeting by room ID
The system SHALL provide a UI for entering a room ID and joining an existing meeting.

#### Scenario: Join input and button are visible
- **WHEN** the app loads and user is not in a meeting
- **THEN** an input for room ID and a "Join Meeting" button are visible

#### Scenario: User joins meeting by room ID
- **WHEN** the user enters a valid room ID and clicks "Join Meeting"
- **THEN** the client emits a join event and transitions to the meeting UI
