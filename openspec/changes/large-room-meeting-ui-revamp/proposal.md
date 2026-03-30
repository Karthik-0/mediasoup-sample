## Why

The current meeting UI renders every participant as a full video tile in a single grid, which breaks down visually and technically once rooms grow beyond a small group. For large rooms, users need a stage-first experience that highlights active speakers and pinned participants while keeping the full roster accessible without mounting hundreds of video elements.

## What Changes

- Replace the all-participants grid with a tiered visibility layout built around stage, filmstrip, and participant panel zones.
- Add switchable meeting layouts: Speaker Focus, Gallery with pagination, Presentation Mode, and Spotlight.
- Add a virtualized participant panel that supports large rosters, participant metadata, and host-oriented controls.
- Add active-speaker promotion, silence timeout demotion, manual pinning, spotlighting, and raise-hand queue visibility.
- Add explicit performance constraints so the UI never mounts more than 16 video elements at once and only renders visible roster rows.
- Preserve and reposition diagnostics and resource monitoring overlays so they still work within the new stage-centric layout.

## Capabilities

### New Capabilities
- `scalable-meeting-layout`: Tiered meeting layout system with stage, filmstrip, layout modes, and capped visible video tiles.
- `virtualized-participant-panel`: Virtualized participant roster with ordering, badges, metadata, and host interaction affordances.
- `meeting-host-stage-controls`: Host-facing controls for pinning, spotlighting, raise-hand queue management, and stage locking.
- `meeting-accessibility-and-performance`: Accessibility behaviors and performance guardrails for large-room meeting presentation.

### Modified Capabilities
- `multi-participant-video-ui`: Replace the requirement to show every participant as a grid tile with a scalable tiered-visibility system.
- `ui-diagnostic-overlays`: Adapt diagnostic badges and overlays to stage, filmstrip, and layout-mode contexts.
- `resource-monitor-card`: Reposition and preserve the resource monitor within the new meeting layout without obscuring stage content.
- `local-media-player`: Keep local controls functional while moving them into the new sticky control bar and stage-aware tile system.

## Impact

- Affected code: client meeting rendering in `client/src/App.tsx`, new meeting UI components, and related styling files.
- Dependencies: add one virtualization library for the participant panel.
- Systems: no backend API break is required for the initial layout revamp, but richer speaker, raise-hand, and network state may require follow-up signaling improvements.