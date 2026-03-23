## Why

Currently, the application requires generating an obscure UUID to start a room and makes participants manually copy and paste it to join. Simultaneously, as we expand to a multi-worker architecture, developers and users have no visual feedback regarding which router or OS process thread is actively handling their media. Migrating to human-readable room names and exposing infrastructure diagnostics directly on the video tiles will massively improve UX and debugging observability.

## What Changes

- **BREAKING:** The dedicated `create-router` socket event will be completely deleted.
- The `join-room` payload will exclusively handle both checking room existence and spawning new Router Shards dynamically based on arbitrary strings (Room Names).
- The React Frontend will be refactored to condense the "Start" and "Join" workflows into a single unified textual input.
- The `get-producers` socket payload will be enriched to return standard `routerId` and `workerPid` identifiers.
- The React Video Tile component will be upgraded to display a metadata pill tracking the active Router and Worker.

## Capabilities

### New Capabilities
- `unified-room-entry`: A single React input controlling both the creation of new logical rooms and the joining of existing logical rooms using human-readable names.
- `ui-diagnostic-overlays`: Visual badges overlaying each remote participant's video tile indicating their exact backend Mediasoup Shard (`routerId`) and OS thread (`workerPid`).

### Modified Capabilities
- `socket-signaling-server`: Deprecating the `create-router` signal, expanding `join-room` to implicitly define room creation, and expanding `get-producers` with infrastructure metadata.

## Impact

- **Frontend (`App.tsx`)**: Significant simplification of React state. The `handleStartMeeting` function will be pruned.
- **Backend (`index.js` & `roomManager.js`)**: `create-router` disconnected. Process-level `worker.pid` data persistence added to the RoomManager map for downstream consumption.
