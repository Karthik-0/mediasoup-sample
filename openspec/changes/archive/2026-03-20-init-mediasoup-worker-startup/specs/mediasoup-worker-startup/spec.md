## ADDED Requirements

### Requirement: Mediasoup dependency is installed
The server project MUST include `mediasoup` as a runtime dependency so mediasoup APIs are available at startup.

#### Scenario: Dependency is declared
- **WHEN** a developer inspects `server/package.json`
- **THEN** `mediasoup` is listed in dependencies

### Requirement: Worker is created at server startup
The server SHALL initialize mediasoup and create a worker during Node.js process startup before startup is considered successful.

#### Scenario: Successful startup creates worker
- **WHEN** the server starts with a valid runtime environment
- **THEN** a mediasoup worker is created and retained for reuse

### Requirement: Startup fails on worker initialization failure
The server MUST fail startup if mediasoup worker creation fails.

#### Scenario: Worker creation throws error
- **WHEN** worker initialization fails during startup
- **THEN** the process reports the error and exits with non-zero status

### Requirement: Worker lifecycle is coordinated with process lifecycle
The server SHALL wire shutdown handling so mediasoup worker lifecycle is coordinated with Node.js process termination.

#### Scenario: Process receives shutdown signal
- **WHEN** the process receives a termination signal
- **THEN** server shutdown flow executes worker-related cleanup hooks before process exit
