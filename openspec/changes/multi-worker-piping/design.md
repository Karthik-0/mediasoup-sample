## Context

Currently, the Mediasoup SFU limits all incoming video traffic and routing to `worker[0]`. This artificial bottleneck restricts the maximum capacity of any meeting (and the application as a whole) to a single CPU core. By upgrading the application to distribute loads across multiple workers, we can achieve true horizontal scaling and uncap our concurrent participant limits.

## Goals / Non-Goals

**Goals:**
- Decouple rooms from individual routers.
- Enable a single Meeting to span seamlessly across multiple Node.js Worker processes.
- Implement synchronized Mesh-Piping (`pipeToRouter`) so that participants on different CPU threads can view each other seamlessly.

**Non-Goals:**
- Multi-server cluster scaling via Redis (this scope is strictly vertical scaling across multiple cores on the same underlying machine OS).

## Decisions

- **Room to Router Orchestration (`1:N` Topology)**: Instead of the `RoomManager` directly executing `worker.createRouter()`, it will maintain a map of `roomId` -> `[Array of Router Shards]`.
- **Eager Piping Synchronization**: Rather than tracking complex dynamic request-response chains for when users attempt to consume streams across shards, the system will use **Eager Piping**. Whenever a user publishes (`produce`) a track, the backend will instantly iterate through all other Router Shards assigned to that `roomId` and execute `pipeToRouter`. This eagerly populates all edge routers with proxy Producers, completely abstracting the sharding logic away from the client.
- **Client Unawareness**: The Frontend React Client will largely remain untouched. It will emit a `join-room` event with a `roomId`, and the Server will silently respond with the `routerId` of the specific shard the user was load-balanced to. The client continues using `routerId` for transport negotiation exactly as it did before.

## Risks / Trade-offs

- **[Risk] Node.js memory exhaustion from O(N^2) Pipe overheads** → Limit the capacity mapping. In tests, we can limit it to 2 users per router to verify functionality, and for production scale it up to 100-200. Eager piping avoids CPU deadlock, but wastes RAM if no one on the remote shard explicitly consumes the video. Given standard SFU limitations, this is an acceptable tradeoff against the immense synchronization complexity of Lazy Piping. 
