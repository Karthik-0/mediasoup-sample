## 1. Client — Join UI

- [x] 1.1 Add "Join Meeting" button and room ID input to client UI
- [x] 1.2 Wire input/button to emit join-room event via socket
- [x] 1.3 Handle join success/failure and transition to meeting state

## 2. Server — Room Management

- [x] 2.1 Implement join-room event handler on server
- [x] 2.2 Track room membership and notify peers on join/leave
- [x] 2.3 Relay peer-joined and peer-left events to all clients in room

## 3. Client — Multi-Participant Video Grid

- [x] 3.1 Maintain participant list in client state
- [x] 3.2 Render video grid with a tile for each participant (including self)
- [x] 3.3 Add mute/unmute and camera on/off buttons to each tile (self-controls only)
- [x] 3.4 Update grid as participants join/leave

## 4. Media Signaling

- [x] 4.1 Update signaling to support multi-user media setup (transport/producer per peer)
- [x] 4.2 Relay media signaling events between all participants in a room

## 5. Verification

- [x] 5.1 Start server and client; join meeting from two browsers; confirm both see each other
- [x] 5.2 Test mute/camera controls for self; confirm UI updates
- [x] 5.3 Test join/leave; confirm video grid updates for all participants
