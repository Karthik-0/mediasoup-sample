## ADDED Requirements

### Requirement: Show all participant videos in a grid
The system SHALL display a video tile for each participant in the meeting, including the current user.

#### Scenario: Video grid updates as participants join/leave
- **WHEN** a participant joins or leaves the meeting
- **THEN** the video grid updates to show all current participants

### Requirement: Mute and camera controls per participant
The system SHALL provide mute/unmute and camera on/off buttons for each participant's video tile (self-controls only affect local media).

#### Scenario: User can mute/unmute self
- **WHEN** the user clicks the mute button on their own tile
- **THEN** their audio producer is paused/resumed and the button label updates

#### Scenario: User can turn camera on/off
- **WHEN** the user clicks the camera button on their own tile
- **THEN** their video producer is paused/resumed and the button label updates
