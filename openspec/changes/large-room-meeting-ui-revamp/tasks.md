## 1. Foundation

- [x] 1.1 Add a virtualization dependency to the client and keep the existing build green.
- [x] 1.2 Extract meeting participant types and derived layout selectors out of the current monolithic App state.
- [x] 1.3 Create reusable meeting UI components for stage tiles, filmstrip, participant roster, and control bar.

## 2. Large-Room Layouts

- [x] 2.1 Replace the all-participants grid with a tiered layout shell that supports stage, filmstrip, and participant panel regions.
- [x] 2.2 Implement Speaker Focus as the default mode and add layout switching for Gallery, Presentation, and Spotlight.
- [x] 2.3 Enforce the visible video render budget and paginate Gallery mode so mounted video tiles never exceed the cap.

## 3. Participant Panel And Host Controls

- [x] 3.1 Implement a virtualized participant panel with ordering, badges, and on-stage indicators.
- [ ] 3.2 Add client-side host controls for pinning, spotlighting, and raise-hand queue presentation.
- [x] 3.3 Add overflow indicators and supporting participant metadata surfaces across the layout.

## 4. Accessibility And Performance

- [ ] 4.1 Add active-speaker promotion and silence timeout behavior with accessible announcements.
- [ ] 4.2 Add keyboard navigation, high-contrast mute states, and control-bar accessibility affordances.
- [ ] 4.3 Apply large-room performance guardrails including containment, throttled activity polling, and off-screen media unloading.

## 5. Validation

- [x] 5.1 Validate the client build and verify the new layout compiles cleanly.
- [ ] 5.2 Verify mounted video count stays within budget during participant simulations.
- [ ] 5.3 Review diagnostics and resource monitor placement across lobby and in-meeting layouts.