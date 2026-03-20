### Requirement: React app scaffold in client directory
The system SHALL initialize a React application inside `client/` using Vite.

#### Scenario: Vite React scaffold exists
- **WHEN** a developer inspects the `client/` directory after bootstrap
- **THEN** Vite React app files and configuration are present

### Requirement: Client development and build scripts
The client project MUST define scripts to run local development and produce a production build.

#### Scenario: Scripts are available
- **WHEN** a developer inspects `client/package.json`
- **THEN** scripts for development and build are defined

### Requirement: Client app can run and build
The client project SHALL run in development mode and complete a build without bootstrap errors.

#### Scenario: Development command runs
- **WHEN** the developer executes the client development script
- **THEN** the Vite development server starts successfully

#### Scenario: Build command runs
- **WHEN** the developer executes the client build script
- **THEN** a production build artifact is generated successfully
