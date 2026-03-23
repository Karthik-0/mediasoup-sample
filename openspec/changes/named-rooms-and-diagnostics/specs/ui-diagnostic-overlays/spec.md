## ADDED Requirements

### Requirement: Render Diagnostic Node Identities
The React frontend SHALL display the physical `routerId` and Linux `workerPid` of explicitly connected Remote Producers overlaid onto their visual media boundary.

#### Scenario: Active Video Tile rendered for a Peer
- **WHEN** a participant's state specifies a non-null `routerId` and `workerPid`
- **THEN** the UI mounts a stylized badge confirming the exact topology fulfilling their stream
