## ADDED Requirements

### Requirement: Host can pin or spotlight participants
The system SHALL provide host-facing controls to pin a participant to the stage or place a participant in Spotlight mode.

#### Scenario: Host pins participant
- **WHEN** the host pins a participant
- **THEN** that participant remains in the stage selection regardless of speaker changes until the host removes the pin

#### Scenario: Host spotlights participant
- **WHEN** the host activates spotlight for a participant
- **THEN** the meeting switches to Spotlight mode with that participant occupying the dominant stage tile

### Requirement: Raise-hand queue is visible and ordered
The system SHALL display an ordered raise-hand queue that the host can inspect while managing the stage.

#### Scenario: Participant raises hand
- **WHEN** a participant enters the raised-hand state
- **THEN** the participant appears in the raise-hand queue in queue order

### Requirement: Stage selection supports manual lock over auto behavior
The system SHALL allow manual stage choices to override automatic active-speaker promotion while the manual lock is in effect.

#### Scenario: Auto speaker change occurs during manual lock
- **WHEN** a different participant becomes the active speaker while a manual pin or stage lock is active
- **THEN** the manually selected participant remains on stage until the lock is removed