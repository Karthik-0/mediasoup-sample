## ADDED Requirements

### Requirement: Client connects to socket server
The system SHALL establish a socket.io connection to the server using a configurable URL (`VITE_SERVER_URL`, defaulting to `http://localhost:3001`).

#### Scenario: Socket connects on app load
- **WHEN** the React app mounts
- **THEN** a socket.io client connection is established to the server URL

#### Scenario: Custom server URL is respected
- **WHEN** `VITE_SERVER_URL` environment variable is set
- **THEN** the socket connects to that URL instead of the default

### Requirement: Start Meeting button triggers router creation
The system SHALL render a **Start Meeting** button that, when clicked, emits the `create-router` event to the server and awaits an acknowledgement.

#### Scenario: Button is visible and enabled on initial load
- **WHEN** the app renders
- **THEN** a button labelled "Start Meeting" is visible and enabled

#### Scenario: Clicking button emits create-router event
- **WHEN** the user clicks **Start Meeting**
- **THEN** the socket emits a `create-router` event to the server

#### Scenario: Success displays router ID
- **WHEN** the server acknowledgement contains a `routerId`
- **THEN** the UI displays the router ID to the user

#### Scenario: Error displays failure message
- **WHEN** the server acknowledgement contains an `error` field or the call times out
- **THEN** the UI displays an error message and the button is re-enabled
