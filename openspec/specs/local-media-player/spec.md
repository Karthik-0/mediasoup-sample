## ADDED Requirements

### Requirement: Local video is displayed after meeting starts
The system SHALL render a `<video>` element with `autoplay`, `playsinline`, and `muted` attributes and set its `srcObject` to the local media stream once producers are active.

#### Scenario: Video element shows camera feed
- **WHEN** `getUserMedia` succeeds and producers are created
- **THEN** the video element displays the local camera track

#### Scenario: Video is hidden before meeting starts
- **WHEN** the app first loads and no meeting is in progress
- **THEN** no video element is visible

### Requirement: Audio toggle button mutes and unmutes the microphone
The system SHALL render a button below the video that pauses the audio Producer and disables the audio track when muted, and resumes/enables it when unmuted.

#### Scenario: Clicking Mute pauses audio producer
- **WHEN** audio is active and the user clicks the audio toggle button
- **THEN** the audio Producer is paused, the audio track is disabled, and the button label changes to "Unmute"

#### Scenario: Clicking Unmute resumes audio producer
- **WHEN** audio is muted and the user clicks the audio toggle button
- **THEN** the audio Producer is resumed, the audio track is enabled, and the button label changes to "Mute"

### Requirement: Video toggle button turns camera on and off
The system SHALL render a button below the video that pauses the video Producer and disables the video track when turned off, and resumes/enables it when turned on.

#### Scenario: Clicking Camera Off pauses video producer
- **WHEN** video is active and the user clicks the video toggle button
- **THEN** the video Producer is paused, the video track is disabled, and the button label changes to "Camera On"

#### Scenario: Clicking Camera On resumes video producer
- **WHEN** video is off and the user clicks the video toggle button
- **THEN** the video Producer is resumed, the video track is enabled, and the button label changes to "Camera Off"
