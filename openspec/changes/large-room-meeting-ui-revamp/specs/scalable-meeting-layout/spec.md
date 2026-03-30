## ADDED Requirements

### Requirement: Meeting layout uses tiered visibility zones
The system SHALL present participants through tiered visibility zones instead of a single all-participants grid. The in-meeting UI SHALL provide a stage zone for the highest-priority participants, a filmstrip zone for recent or pinned participants, and a participant panel for the full room roster.

#### Scenario: Large room renders stage, filmstrip, and roster
- **WHEN** the user is in an active meeting
- **THEN** the UI renders a stage region, a filmstrip region, and access to the full participant roster without requiring every participant to appear as a video tile

### Requirement: Meeting layout supports switchable display modes
The system SHALL support Speaker Focus, Gallery, Presentation, and Spotlight layout modes. Speaker Focus SHALL be the default mode when a meeting becomes active.

#### Scenario: Meeting starts in Speaker Focus
- **WHEN** a user joins a meeting without a previously selected layout mode
- **THEN** the active layout is Speaker Focus

#### Scenario: User switches layout mode
- **WHEN** the user activates a different layout mode from the layout switcher
- **THEN** the visible meeting layout updates to the selected mode while preserving participant state

### Requirement: Visible video tiles are capped by a render budget
The system SHALL enforce a hard cap on mounted video tiles so that no more than 16 participant video elements are rendered at once.

#### Scenario: Large room exceeds stage and filmstrip capacity
- **WHEN** the meeting contains more participants than the visible stage and filmstrip can show
- **THEN** only the participants selected for the current layout are rendered as video tiles and the total mounted video elements do not exceed 16

### Requirement: Gallery layout is paginated
The system SHALL paginate Gallery mode so only the current page of participant tiles is mounted.

#### Scenario: User navigates gallery pages
- **WHEN** the user moves to the next or previous gallery page
- **THEN** the UI replaces the currently visible gallery tiles with the selected page and does not mount off-page video tiles

### Requirement: Overflow is summarized outside visible tiles
The system SHALL summarize participants who are not currently visible as tiles using overflow indicators rather than rendering additional tiles.

#### Scenario: Filmstrip has more participants than visible slots
- **WHEN** the number of filmstrip-eligible participants exceeds the visible filmstrip capacity
- **THEN** the UI shows an aggregated overflow indicator such as `+N others`