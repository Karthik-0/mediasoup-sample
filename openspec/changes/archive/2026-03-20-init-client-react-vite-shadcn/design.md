## Context

The repository has a `client/` directory but no frontend app scaffold yet. This blocks UI development and makes it harder to establish conventions for component structure, styling, and local development. A Vite + React baseline with shadcn setup provides a consistent starting point for shipping UI features quickly.

## Goals / Non-Goals

**Goals:**
- Initialize `client/` with a runnable React app created with Vite.
- Add shadcn initialization and required supporting config.
- Ensure baseline scripts support local development and production build.
- Keep bootstrap setup minimal and aligned with common React/Vite conventions.

**Non-Goals:**
- Build product-specific pages, flows, or business logic.
- Add complex state management architecture.
- Implement full design system token strategy beyond shadcn bootstrap needs.
- Integrate backend APIs in this change.

## Decisions

- Use Vite React template as the base scaffold for fast startup and modern bundling.
  - Alternatives considered: CRA, Next.js.
  - Rationale: Vite is lightweight, fast in dev, and fits a simple client bootstrap requirement.
- Initialize shadcn with standard configuration and required alias/styling support.
  - Alternatives considered: manual component library setup.
  - Rationale: shadcn setup provides repeatable component generation and clear conventions.
- Keep baseline styling infrastructure compatible with shadcn requirements.
  - Alternatives considered: custom CSS-only initial setup.
  - Rationale: avoids rework before adding first shadcn components.
- Keep output focused on project bootstrap files and scripts.
  - Alternatives considered: adding optional tooling (testing/linting extras) in same change.
  - Rationale: isolates bootstrap scope for easier review and implementation.

## Risks / Trade-offs

- [Risk] shadcn setup may vary by CLI version and require extra prompts/flags. → Mitigation: document chosen defaults and pin generated config in committed files.
- [Risk] Initial dependency footprint increases client setup time. → Mitigation: keep only required dependencies for bootstrap stage.
- [Risk] Path aliases or styling config mismatch can break component generation. → Mitigation: include explicit verification task for shadcn generation/readiness.

## Migration Plan

1. Scaffold React app in `client/` via Vite.
2. Install and configure shadcn and required frontend dependencies.
3. Verify app runs in dev mode and builds successfully.
4. Verify shadcn initialization artifacts exist and are usable.

## Open Questions

- Should the initial shadcn setup include one sample component (e.g., button), or only base initialization files?
- Should TypeScript be preferred for this bootstrap, or keep JavaScript template for minimal setup?
