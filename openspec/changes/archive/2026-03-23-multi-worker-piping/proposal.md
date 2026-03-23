## Why

Presently, the Mediasoup server assigns all incoming participants from all rooms onto the exact same `worker[0]` process. Mediasoup workers run strictly single-threaded, meaning a single core is artificially bottlenecking the entire application's capacity. By introducing multi-router shards per room and synchronizing them via `pipeToRouter`, the system will seamlessly scale horizontally across all available CPU cores, enabling massive multi-hundred participant video topologies.

## What Changes

- Decouple the concept of a `Room` from a single `Router`.
- Implement a `RoomManager` mapping that tracks which `Routers` belong to which `Room ID`.
- Introduce a load-balancing mechanism to assign new participants to routers dynamically (e.g. limiting users per router and automatically spawning a new shard on a different worker when full).
- Build a synchronization mesh that automatically executes `pipeToRouter` when a participant produces media, distributing the track copy to all other active routers in the same Room.
- Update tracking arrays so participants immediately receive producers even if they span across workers.

## Capabilities

### New Capabilities
- `multi-worker-routing`: Defines the state architecture and load-balancing strategy for distributing participants across multiple Mediasoup instances.
- `pipetorouter-mesh`: The synchronization logic responsible for eagerly mirroring published tracks across sibling routers in the same room.

### Modified Capabilities
- `mediasoup-router-management`: Must heavily evolve from a 1:1 Room-to-Router mapper into a 1:N Room-to-Routers orchestrator.
- `socket-signaling-server`: Must interact intelligently with the new `RoomManager` structure to assign incoming connections to the correct underlying router shard.

## Impact

- **Backend Architecture**: Major structural refactor traversing `roomManager.js` and `transportManager.js`.
- **Signaling Contract**: The client-side payload logic remains mostly identical, making this a transparent, non-breaking infrastructure scaling feature.
- **CPU Spikes**: Memory and CPU usage will correctly distribute across the OS, unlocking enterprise WebRTC throughput limits.
