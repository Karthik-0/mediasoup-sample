## Context

The current meeting experience is implemented largely inside `client/src/App.tsx` as a single responsive grid that renders one tile per participant. That approach is acceptable for small rooms but it creates both UX and performance problems for large rooms because the DOM, video elements, and layout complexity all grow with participant count.

This revamp introduces a stage-first presentation model that keeps the existing mediasoup meeting lifecycle intact while adding a presentation-state layer for layout orchestration. The design must preserve existing diagnostics and local media controls, remain compatible with the current polling-based meeting flow, and establish hard UI performance limits such as a maximum mounted video budget.

## Goals / Non-Goals

**Goals:**
- Replace the all-participants grid with a tiered layout based on stage, filmstrip, and virtualized participant roster.
- Default to Speaker Focus for large rooms while supporting Gallery, Presentation, and Spotlight modes.
- Guarantee that the UI mounts at most 16 `<video>` elements at once.
- Preserve local controls, diagnostics overlays, and resource monitor visibility within the new layout.
- Add host-facing stage controls and participant metadata affordances without requiring a backend rewrite.
- Add accessibility and performance rules that scale to large rooms.

**Non-Goals:**
- Rebuild the mediasoup transport model or signaling contract in this change.
- Introduce authoritative server-side host moderation workflows beyond what the client can already represent.
- Implement captions, reactions transport, or network-quality telemetry collection end to end.
- Solve multi-server signaling limitations as part of the UI-only revamp.

## Decisions

- **Presentation-state layer above raw participant state**: The UI will derive stage tiles, filmstrip tiles, gallery pages, roster rows, and overflow counts from a single participant source. This avoids coupling rendering directly to the raw `participants` array and makes the render budget enforceable.
  - Alternative considered: keep all logic in `App.tsx` with conditional rendering. Rejected because the current single-file approach is already a maintenance and performance bottleneck.

- **Hard video render budget**: A selector will determine the visible video participants for the active layout and cap mounted video tiles at 16 regardless of total room size.
  - Alternative considered: render all participants but hide off-screen tiles with CSS. Rejected because hidden video elements still carry DOM and media costs.

- **Virtualized roster with one new dependency**: The participant panel will use a dedicated virtualization library rather than a homegrown scroll window implementation.
  - Alternative considered: manual windowing logic. Rejected because it increases maintenance cost for keyboarding, resizing, and row measurement with little benefit.

- **Speaker Focus as default mode**: Large rooms benefit most from a single dominant tile and compact supporting surfaces. Gallery remains available but paginated to preserve the render cap.
  - Alternative considered: default gallery mode. Rejected because it emphasizes breadth over clarity and does not match the requested broadcast-style experience.

- **Client-local host interactions first**: Pinning, spotlighting, and queue ordering will be represented in client state and UI immediately, with server-backed authority as a future enhancement.
  - Alternative considered: block host controls until backend moderation exists. Rejected because it would stall the UI revamp and prevent iteration on the interaction model.

- **Overlay preservation with layout-aware docking**: Diagnostic badges remain attached to visible participant tiles while the resource monitor and diagnostics card stay anchored in the chrome rather than floating over the stage center.
  - Alternative considered: remove diagnostics in large-room mode. Rejected because diagnostics are already a documented and useful part of this sample app.

## Risks / Trade-offs

- **[Risk] Active-speaker detection is only as good as available client telemetry** → Mitigation: start with a pluggable client-side activity model and document where better server events can replace heuristics later.
- **[Risk] Client-local host controls can diverge between participants** → Mitigation: scope initial implementation to local presentation control and call out synchronization gaps in the docs and tasks.
- **[Risk] Poll-based producer discovery may create stale presentation state** → Mitigation: derive presentation state from currently known participants only and keep the layout system independent from consume timing.
- **[Risk] UI decomposition can destabilize existing meeting flows** → Mitigation: preserve `meeting.ts` and transport behavior while extracting presentational components incrementally.
- **[Risk] Rich chrome may crowd smaller screens** → Mitigation: make the participant panel dismissible, keep overlays collapsible, and prioritize the stage surface on narrow widths.

## Migration Plan

1. Create the new scalable layout components and derived participant selectors alongside the current grid implementation.
2. Move local controls and overlay chrome into the new layout shell while preserving existing meeting join and transport behavior.
3. Add virtualization and gallery pagination before enabling large-room defaults.
4. Switch the active meeting view to the new layout once render-cap validation passes.
5. Roll back by restoring the current grid render path if regressions are found; no backend migration is required.

## Open Questions

- What signal should drive active-speaker detection in the first implementation: client audio energy, current speaking heuristic placeholders, or manual promotion only?
- Should raise-hand state be entirely local in the first pass or stubbed behind future server events?
- Do we want network quality icons to be static placeholders initially, or should they remain hidden until telemetry exists?