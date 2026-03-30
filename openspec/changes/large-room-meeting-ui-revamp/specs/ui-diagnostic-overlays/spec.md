## MODIFIED Requirements

### Requirement: Render diagnostic node identities on visible participant surfaces
The React frontend SHALL display the physical `routerId` and Linux `workerPid` for visible participants within the active meeting layout, including stage tiles and other currently rendered participant surfaces.

#### Scenario: Visible participant surface is rendered
- **WHEN** a participant is currently rendered in the stage, filmstrip, or active gallery page and has a non-null `routerId` and `workerPid`
- **THEN** the UI shows a diagnostic badge for that participant on the rendered surface