## 1. Dependency and Startup Structure

- [x] 1.1 Add `mediasoup` to `server/package.json` dependencies
- [x] 1.2 Create a dedicated mediasoup bootstrap module for worker initialization
- [x] 1.3 Define a runtime holder for the created mediasoup worker instance

## 2. Worker Initialization and Failure Handling

- [x] 2.1 Initialize mediasoup during server startup before startup is considered successful
- [x] 2.2 Create exactly one worker at startup and persist it for reuse
- [x] 2.3 Implement fail-fast behavior that logs initialization errors and exits non-zero

## 3. Lifecycle and Verification

- [x] 3.1 Add process signal handling to coordinate worker-aware shutdown flow
- [x] 3.2 Verify server starts successfully when worker creation succeeds
- [x] 3.3 Verify startup exits non-zero when worker creation fails
- [x] 3.4 Verify shutdown path executes worker-related cleanup hooks
