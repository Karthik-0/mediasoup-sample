## Why

The `client/` directory is not initialized with a frontend application scaffold, which slows UI feature development and creates setup inconsistency. Establishing a React + Vite baseline with shadcn now provides a fast, standardized UI foundation for future product work.

## What Changes

- Initialize the `client/` directory as a Vite-powered React application.
- Add and configure shadcn for reusable UI component scaffolding.
- Set up baseline styling and component infrastructure required by shadcn.
- Ensure the project can run in development and produce a build artifact.

## Capabilities

### New Capabilities
- `react-vite-client-bootstrap`: Defines requirements for creating and running a React app in `client/` using Vite.
- `shadcn-ui-bootstrap`: Defines requirements for initializing shadcn in the client app and enabling component generation/usage.

### Modified Capabilities
- None.

## Impact

- Affected code: `client/` directory (new app scaffold, config files, and UI primitives).
- APIs: No backend API contract changes.
- Dependencies: Adds React/Vite toolchain and shadcn-related frontend dependencies.
- Systems: Introduces a standardized frontend development/build workflow for this repository.
