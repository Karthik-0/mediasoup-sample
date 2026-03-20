## Why

The server currently boots Express but does not initialize mediasoup, so WebRTC media capabilities cannot be added on a stable runtime foundation. Initializing mediasoup and starting a worker at server boot creates a reliable baseline for future room, transport, and producer/consumer features.

## What Changes

- Add mediasoup as a server dependency and wire initialization into server startup.
- Start a mediasoup worker during Node.js server boot and fail fast if worker creation fails.
- Define a minimal worker lifecycle model (startup, readiness, shutdown handling) inside the server process.
- Expose baseline startup behavior so future media routing components can reuse the initialized worker.

## Capabilities

### New Capabilities
- `mediasoup-worker-startup`: Defines requirements for initializing mediasoup and creating a worker when the Node.js server starts.

### Modified Capabilities
- None.

## Impact

- Affected code: `server/` startup and runtime initialization flow.
- APIs: No new public HTTP API required for this change.
- Dependencies: Adds mediasoup runtime dependency to the server project.
- Systems: Introduces mediasoup worker process lifecycle management alongside Express startup.
