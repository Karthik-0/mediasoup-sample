## Context

The repository includes separate `client/` and `server/` folders, but `server/` does not yet have a standardized runtime scaffold. This change establishes a minimal Node.js + Express baseline that any future backend feature can build on. The setup should stay simple, require minimal dependencies, and support local development with a predictable startup command and health check endpoint.

## Goals / Non-Goals

**Goals:**
- Provide a runnable Node.js project inside `server/` with standard npm scripts.
- Set up Express as the HTTP framework and expose a health endpoint.
- Support configurable port binding via environment variable with sensible default.
- Keep structure minimal and easy to extend.

**Non-Goals:**
- Implement business APIs beyond a health check.
- Add production deployment automation, containers, or orchestration.
- Introduce TypeScript, advanced logging stacks, or database integration.

## Decisions

- Use plain Node.js with CommonJS modules for bootstrap simplicity and low setup overhead.
  - Alternatives considered: ESM-only setup, TypeScript-first setup.
  - Rationale: fastest path to a stable baseline with minimal toolchain complexity.
- Use Express as the sole runtime dependency for request routing and server startup.
  - Alternatives considered: Node `http` module only, Fastify.
  - Rationale: Express is widely familiar, concise for MVP server scaffolding, and aligns with requested stack.
- Expose `GET /health` endpoint returning a simple JSON payload and `200` status.
  - Alternatives considered: root (`/`) health endpoint, plain text response.
  - Rationale: dedicated health route is explicit and test-friendly.
- Use `process.env.PORT` with fallback default (for example `3000`) for bind port.
  - Alternatives considered: fixed hardcoded port.
  - Rationale: environment-driven configuration works across local and hosted environments.

## Risks / Trade-offs

- [Risk] CommonJS may require migration work if project later standardizes on ESM. → Mitigation: keep entrypoint and imports isolated for easy conversion.
- [Risk] Very minimal scaffold may omit conventions needed later (linting, tests). → Mitigation: define baseline scripts that can be extended without breaking startup behavior.
- [Risk] Health endpoint may be interpreted as readiness in production contexts. → Mitigation: document it as baseline liveness only until richer checks are added.
