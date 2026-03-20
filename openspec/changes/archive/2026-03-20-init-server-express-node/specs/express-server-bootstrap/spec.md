## ADDED Requirements

### Requirement: Server project bootstrap
The system SHALL define a Node.js project inside `server/` with a `package.json` that includes scripts to start the server and run it in development.

#### Scenario: Server scripts are available
- **WHEN** a developer inspects `server/package.json`
- **THEN** they can find scripts for starting the server and running development mode

### Requirement: Express dependency
The system MUST include Express as a dependency of the server project.

#### Scenario: Express is declared as dependency
- **WHEN** dependencies are listed for the `server/` project
- **THEN** Express appears as an installable runtime dependency

### Requirement: Health check endpoint
The server SHALL expose a `GET /health` endpoint that returns a successful response payload.

#### Scenario: Health endpoint returns success
- **WHEN** a client sends `GET /health` to a running server
- **THEN** the server responds with HTTP 200 and a health payload

### Requirement: Configurable port binding
The server SHALL bind to the port from the `PORT` environment variable and use a default port when `PORT` is not provided.

#### Scenario: Environment port is honored
- **WHEN** `PORT` is set before server startup
- **THEN** the server listens on the configured `PORT` value

#### Scenario: Default port is used
- **WHEN** `PORT` is not set before server startup
- **THEN** the server listens on a documented default port
