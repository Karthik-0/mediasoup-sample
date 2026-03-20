## MODIFIED Requirements

### Requirement: Start Meeting button triggers full WebRTC setup
The system SHALL render a **Start Meeting** button that, when clicked, orchestrates the full WebRTC flow: emit `create-router`, load mediasoup Device with RTP capabilities, create and connect a send transport, acquire local media, and produce audio and video tracks.

#### Scenario: Button is visible and enabled on initial load
- **WHEN** the app renders
- **THEN** a button labelled "Start Meeting" is visible and enabled

#### Scenario: Clicking button initiates full meeting flow
- **WHEN** the user clicks **Start Meeting**
- **THEN** the client sequentially: creates a router, fetches RTP capabilities, loads the Device, creates a send transport, connects it, calls getUserMedia, and produces audio and video

#### Scenario: Success shows video and media controls
- **WHEN** all producers are created successfully
- **THEN** the local video is displayed and the audio/video toggle buttons are shown; the Start Meeting button is hidden

#### Scenario: Error displays failure message
- **WHEN** any step in the flow fails (including camera permission denied)
- **THEN** the UI displays a descriptive error message and the Start Meeting button is re-enabled
