## ADDED Requirements

### Requirement: Active speaker changes are announced accessibly
The system SHALL expose an ARIA live region that announces active speaker changes.

#### Scenario: Active speaker changes
- **WHEN** the active speaker selection changes
- **THEN** an ARIA live announcement states which participant is speaking

### Requirement: Meeting tiles are keyboard navigable
The system SHALL support keyboard navigation for visible participant tiles and meeting layout controls.

#### Scenario: User navigates visible tiles with keyboard
- **WHEN** focus is within the meeting layout
- **THEN** the user can move between visible tiles and controls using keyboard navigation without requiring a pointer

### Requirement: Off-screen participant media is not kept mounted
The system SHALL unload or avoid mounting off-screen participant video tiles so that hidden participants do not consume the visible media budget.

#### Scenario: Participant is not on the visible page or stage
- **WHEN** a participant is outside the visible layout budget
- **THEN** their video tile is not mounted in the active meeting DOM

### Requirement: Large-room layout uses explicit performance guardrails
The system SHALL apply layout performance guardrails including throttled activity polling, CSS containment on tile wrappers, and lazy avatar loading hooks.

#### Scenario: Large-room meeting is rendered
- **WHEN** the meeting UI is active in a large room
- **THEN** tile wrappers use containment-friendly styling and activity updates are throttled rather than processed every animation frame