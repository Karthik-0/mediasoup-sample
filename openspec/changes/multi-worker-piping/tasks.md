## 1. Room Manager Decoupling

- [x] 1.1 Refactor `server/roomManager.js` data structures to map unique `roomId` strings to a globally tracked `Room` array containing multiple Router shards.
- [x] 1.2 Implement a load balancing algorithm in `getOrCreateRouter(roomId)` that verifies participant capacity against active shards before spinning up new Routers on round-robin Mediasoup Workers.

## 2. Eager Piping Mesh Synchronization

- [x] 2.1 Update `transportManager.js` or `index.js` to trigger a `pipeToRouter` fan-out whenever a new Producer is created, forwarding it to all surrounding sibling Routers attached to that same Room identifier.
- [x] 2.2 Add synchronization logic inside the Room Manager to execute retroactive `pipeToRouter` transfers from old Routers into a newly spawned Router the exact moment it establishes, guaranteeing seamless historical media access for new shards.

## 3. Socket Signaling Integration

- [x] 3.1 Modify the `create-router` socket event to autonomously generate a random unique `roomId` string, trigger the first shard creation, and acknowledge with the `roomId`.
- [x] 3.2 Modify the `join-room` socket event to securely query the `RoomManager`, allocate the user to an optimal Router shard, and respond with their assigned `routerId` payload.
