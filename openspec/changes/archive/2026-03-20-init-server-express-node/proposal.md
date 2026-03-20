## Why

The project currently has a `server/` directory but no standardized Node.js + Express runtime scaffold. Establishing a baseline server setup now enables backend features to be added consistently and run reliably in local development.

## What Changes

- Initialize a Node.js project inside `server/` with `package.json` and standard npm scripts.
- Add Express as the HTTP framework dependency.
- Create a minimal server entrypoint with a health endpoint and configurable port.
- Add a basic ignore file for Node artifacts in `server/`.

## Capabilities

### New Capabilities
- `express-server-bootstrap`: Defines requirements for bootstrapping and running a minimal Express-based Node.js server in `server/`.

### Modified Capabilities
- None.

## Impact

- Affected code: `server/` directory (new Node/Express bootstrap files).
- APIs: Adds a baseline HTTP endpoint contract for server health checks.
- Dependencies: Introduces Express (and any minimal dev tooling required by project conventions).
- Systems: Establishes a repeatable backend startup flow for local development.
