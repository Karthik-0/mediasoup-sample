## Why

Currently, users can only start a new meeting and stream their own video/audio. There is no way to join an existing meeting by room ID, nor to see or interact with other participants. This limits the app to single-user demo scenarios and prevents real group calls.

## What Changes

- Add a "Join Meeting" button and input field for pasting a room ID
- Allow users to join an existing meeting by room ID
- Show a video grid of all participants (including self) in the meeting
- Add mute/unmute and camera on/off buttons for each participant's video tile
- Update socket signaling and server logic to support multi-participant rooms and peer notifications

## Capabilities

### New Capabilities
- `join-meeting-ui`: UI for joining a meeting by room ID, including input and join button
- `multi-participant-video-ui`: UI for displaying all participant videos in a grid, with per-tile controls

### Modified Capabilities
- `socket-signaling-server`: Add events for joining a room, peer notification, and multi-user media signaling

## Impact

- Client: new join UI, video grid, and controls; changes to meeting state management
- Server: room/peer management, new socket events, and multi-user media routing
- Protocol: new/updated socket events for join, peer list, and media signaling
