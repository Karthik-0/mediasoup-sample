## Context

The current app only supports starting a new meeting and streaming local media. There is no way to join an existing meeting, and no support for multi-user video/audio. This change enables joining by room ID and showing all participants in a video grid, requiring new client UI, server-side room/peer management, and updated socket signaling.

## Goals / Non-Goals

**Goals:**
- Allow users to join a meeting by room ID
- Show all participant videos (including self) in a grid
- Provide mute/camera controls per participant
- Support dynamic join/leave and peer notifications

**Non-Goals:**
- Screen sharing
- Chat/messaging
- Advanced moderation or permissions

## Decisions
- Use socket.io for all signaling (join, peer list, media events)
- Each room is identified by a unique room ID (UUID)
- Server tracks room membership and notifies peers on join/leave
- Client maintains a participant list and renders a video tile for each
- Media is sent via mediasoup transports/producers as before, but now with per-peer signaling
- UI: show join input/button when not in a meeting; show video grid and controls when joined

## Risks / Trade-offs
- [Risk] Increased signaling complexity → [Mitigation] Use clear event names and document protocol
- [Risk] UI complexity for dynamic video grid → [Mitigation] Use React state keyed by participant ID
- [Risk] Media scaling with many participants → [Mitigation] Limit to small groups initially
