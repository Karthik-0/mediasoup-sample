## ADDED Requirements

### Requirement: Room manager creates mediasoup Routers
The system SHALL provide a `createRouter()` function that creates a mediasoup Router on an available worker and returns the Router object.

#### Scenario: Router is created with default media codecs
- **WHEN** `createRouter()` is called
- **THEN** a mediasoup Router is created with at least audio (opus) and video (VP8) codecs enabled

#### Scenario: Router is stored by ID
- **WHEN** `createRouter()` resolves successfully
- **THEN** the router is stored in an in-memory map keyed by `router.id`

### Requirement: Room manager retrieves a Router by ID
The system SHALL provide a `getRouter(id)` function that returns the Router for a given ID or `undefined` if not found.

#### Scenario: Known router ID returns Router
- **WHEN** `getRouter(id)` is called with an ID of a previously created router
- **THEN** the corresponding Router object is returned

#### Scenario: Unknown router ID returns undefined
- **WHEN** `getRouter(id)` is called with an unknown ID
- **THEN** `undefined` is returned
