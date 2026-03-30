## MODIFIED Requirements

### Requirement: Show participants through an adaptive meeting layout
The system SHALL display meeting participants through an adaptive layout that prioritizes stage participants, supporting participants, and roster access rather than rendering every participant as a visible video tile at once.

#### Scenario: Layout updates as participants join and leave
- **WHEN** participants join or leave the meeting
- **THEN** the active stage, filmstrip, gallery page, and roster update to reflect the current participant set without requiring every participant to be visible as a tile

### Requirement: Local media controls remain available during the meeting
The system SHALL provide mute/unmute and camera on/off controls for the local participant across all meeting layouts.

#### Scenario: User can mute or unmute self from the active meeting chrome
- **WHEN** the user clicks the local audio control in the meeting UI
- **THEN** their audio producer is paused or resumed and the control state updates

#### Scenario: User can turn camera on or off from the active meeting chrome
- **WHEN** the user clicks the local video control in the meeting UI
- **THEN** their video producer is paused or resumed and the control state updates