## ADDED Requirements

### Requirement: Socket.io server attaches to Express HTTP server
The system SHALL attach a socket.io `Server` instance to the existing `http.Server` created from the Express app, sharing the same port.

#### Scenario: Socket.io initialises on server start
- **WHEN** the Express server starts successfully
- **THEN** a socket.io server is listening on the same port as Express

#### Scenario: CORS allows client origin
- **WHEN** a browser client connects from any origin (development mode)
- **THEN** the socket.io handshake succeeds without CORS errors

### Requirement: Server handles create-router event
The system SHALL listen for a `create-router` socket event from any connected client and respond with an acknowledgement containing a router ID.

#### Scenario: Client emits create-router and receives router ID
- **WHEN** a connected client emits the `create-router` event
- **THEN** the server creates a mediasoup Router and calls the acknowledgement callback with `{ routerId: "<uuid>" }`

#### Scenario: Router creation failure returns error
- **WHEN** router creation throws an error
- **THEN** the acknowledgement callback is called with `{ error: "<message>" }` and no router is stored
