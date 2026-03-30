## ADDED Requirements

### Requirement: Participant panel uses virtualization
The system SHALL render the full participant roster in a virtualized side panel so that only visible roster rows are mounted in the DOM.

#### Scenario: Large participant roster is opened
- **WHEN** the user opens the participant panel in a large meeting
- **THEN** the panel renders only the rows needed for the current scroll viewport plus virtualization overscan rows

### Requirement: Participant rows show meeting metadata
Each participant row SHALL display the participant's avatar or placeholder, display name, mute state, raised-hand state, network-quality indicator space, and whether the participant is currently on stage.

#### Scenario: Participant row is rendered
- **WHEN** a participant appears in the participant panel
- **THEN** the row includes visible metadata for identity and meeting status, including an on-stage badge when applicable

### Requirement: Participant roster follows priority ordering
The participant panel SHALL order participants by raised hand, then speaking, then video on, then audio only, then muted.

#### Scenario: Roster sort priority is recalculated
- **WHEN** participant activity or hand-raise state changes
- **THEN** the roster order updates to reflect the configured priority ranking

### Requirement: Participant panel is toggleable from meeting chrome
The system SHALL allow the participant panel to be opened and closed from the meeting control bar.

#### Scenario: User opens participant panel
- **WHEN** the user activates the participants control
- **THEN** the participant panel slides into view without disrupting the current stage layout