## MODIFIED Requirements

### Requirement: Local video is displayed within the active meeting layout
The system SHALL render the local participant video within the active meeting layout when local video is available and a meeting is in progress.

#### Scenario: Local participant appears in meeting layout
- **WHEN** `getUserMedia` succeeds and producers are created
- **THEN** the local participant video is displayed in the appropriate visible meeting surface for the current layout

#### Scenario: Local video is hidden before meeting starts
- **WHEN** the app first loads and no meeting is in progress
- **THEN** no in-meeting local video surface is visible

### Requirement: Audio toggle button is available from persistent meeting controls
The system SHALL render an audio toggle control in the persistent meeting control bar that pauses the audio Producer and disables the audio track when muted, and resumes or enables it when unmuted.

#### Scenario: Clicking mute pauses audio producer
- **WHEN** audio is active and the user clicks the audio toggle control
- **THEN** the audio Producer is paused, the audio track is disabled, and the control state updates to muted

#### Scenario: Clicking unmute resumes audio producer
- **WHEN** audio is muted and the user clicks the audio toggle control
- **THEN** the audio Producer is resumed, the audio track is enabled, and the control state updates to unmuted

### Requirement: Video toggle button is available from persistent meeting controls
The system SHALL render a video toggle control in the persistent meeting control bar that pauses the video Producer and disables the video track when turned off, and resumes or enables it when turned on.

#### Scenario: Clicking camera off pauses video producer
- **WHEN** video is active and the user clicks the video toggle control
- **THEN** the video Producer is paused, the video track is disabled, and the control state updates to off

#### Scenario: Clicking camera on resumes video producer
- **WHEN** video is off and the user clicks the video toggle control
- **THEN** the video Producer is resumed, the video track is enabled, and the control state updates to on