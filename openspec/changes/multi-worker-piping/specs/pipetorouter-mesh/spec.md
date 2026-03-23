## ADDED Requirements

### Requirement: Eager Piping of New Producers
The system SHALL eagerly replicate newly published Producers to all sibling Routers in the same Room topology using `pipeToRouter`.

#### Scenario: User produces video on Shard A
- **WHEN** a user successfully emits a `produce` event resolving to a new Mediasoup Producer on Shard A
- **THEN** the server iterates over Shards B, C, etc., and pipes the Producer to them, storing the proxy Producer IDs

### Requirement: Historical Piping for New Shards
The system SHALL instantly pipe all historically existing Producers from older Shards into any newly instantiated Shards.

#### Scenario: Spawning Shard C
- **WHEN** the Room Manager spawns Shard C due to capacity limits
- **THEN** the backend immediately pipes all active Producers from Shard A and Shard B into Shard C so the new user has access to historical streams
