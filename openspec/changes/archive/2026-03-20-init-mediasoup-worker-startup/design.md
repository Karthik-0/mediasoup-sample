## Context

The current server starts Express and exposes a health endpoint, but mediasoup is not initialized during boot. To support upcoming WebRTC workflows, the server needs a predictable startup sequence that creates a mediasoup worker and keeps its lifecycle tied to the Node.js process lifecycle.

## Goals / Non-Goals

**Goals:**
- Initialize mediasoup during server startup.
- Create exactly one baseline mediasoup worker at boot.
- Fail startup if mediasoup worker creation fails.
- Handle shutdown signals so server and worker lifecycle are coordinated.

**Non-Goals:**
- Implement room management, routers, transports, producers, or consumers.
- Define full runtime observability/metrics strategy for mediasoup internals.
- Introduce distributed worker orchestration or multi-worker load balancing.

## Decisions

- Use a dedicated startup module to initialize mediasoup before accepting traffic.
  - Alternatives considered: lazy-initialize on first WebRTC request.
  - Rationale: deterministic startup state and early failure visibility.
- Create one worker instance and store it in process-level runtime context for reuse.
  - Alternatives considered: create worker per request or per route.
  - Rationale: mediasoup workers are heavyweight and intended to be long-lived.
- If worker creation throws, terminate startup with non-zero exit.
  - Alternatives considered: continue server without media subsystem.
  - Rationale: avoids partially healthy service state for media-dependent deployments.
- Attach process signal handlers for graceful shutdown hooks.
  - Alternatives considered: rely only on default process termination.
  - Rationale: enables cleaner release path as routers/transports are added later.

## Risks / Trade-offs

- [Risk] mediasoup installation can require platform-specific native build prerequisites. → Mitigation: document environment requirements and fail fast during install/startup.
- [Risk] Single-worker baseline can become a performance bottleneck as load grows. → Mitigation: keep abstraction boundary so multi-worker support can be added later.
- [Risk] Tight startup dependency on mediasoup can reduce service availability if media subsystem breaks. → Mitigation: explicit boot failure makes operational issues visible instead of silently degraded runtime.

## Migration Plan

1. Add mediasoup dependency in `server/package.json`.
2. Add server bootstrap code to initialize mediasoup and create worker on startup.
3. Ensure startup fails on initialization errors.
4. Add graceful shutdown wiring for process termination.
5. Verify local startup and shutdown behavior.

## Open Questions

- Should initial worker settings (RTC ports, log level, worker appData) be environment-configurable in this phase or deferred?
- Do we want a dedicated readiness indicator that depends on successful worker creation in addition to current health behavior?
