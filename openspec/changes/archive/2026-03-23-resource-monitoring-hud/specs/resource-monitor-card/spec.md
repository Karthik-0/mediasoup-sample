## ADDED Requirements

### Requirement: Resource Monitor card visible on all screens
The client UI SHALL render a Resource Monitor card that is visible in both the lobby (pre-join) and in-meeting views. The card SHALL be positioned in the top-right corner of the viewport, stacked below the existing topology diagnostics card.

#### Scenario: Card visible before joining
- **WHEN** the user is on the join/lobby screen
- **THEN** the Resource Monitor card is rendered and shows system and worker stats (with bandwidth showing `—`)

#### Scenario: Card visible during meeting
- **WHEN** the user has joined a room and is in a meeting
- **THEN** the Resource Monitor card is rendered and shows system stats, worker stats, and uplink/downlink bandwidth

### Requirement: Resource Monitor card displays system CPU and memory
The card SHALL show:
- System CPU as a percentage derived from `systemStats.cpuLoad` (1-min load average, clamped to 0–100%)
- System memory as a percentage of used/total, and the total in GB

#### Scenario: System section renders CPU and memory
- **WHEN** `hardwareStats.systemStats` is populated
- **THEN** the card shows a SYSTEM section with CPU% and MEM% values

#### Scenario: Loading state before first poll
- **WHEN** no stats have been received yet
- **THEN** the card shows `—` for all values

### Requirement: Resource Monitor card displays per-worker CPU and memory
The card SHALL show one row per worker entry in `hardwareStats.workerStats`. Each row SHALL display the worker's PID and CPU percentage. The worker matching the current peer's `workerPid` SHALL be visually highlighted (e.g., bold label or accent color).

#### Scenario: All workers rendered
- **WHEN** `hardwareStats.workerStats` contains N entries
- **THEN** the card shows N worker rows

#### Scenario: Current peer's worker is highlighted
- **WHEN** the user's `workerPid` matches a worker entry's `pid`
- **THEN** that row is visually distinguished from other rows (e.g., highlighted label)

#### Scenario: No highlight in lobby
- **WHEN** the user has not joined a meeting (`workerPid` is undefined)
- **THEN** no worker row is highlighted

### Requirement: Resource Monitor card displays uplink and downlink bandwidth
The card SHALL show a BANDWIDTH section with uplink (↑) and downlink (↓) kbps values derived from `hardwareStats.sendBitrate` and `hardwareStats.recvBitrate`.

#### Scenario: Bandwidth section shows kbps when in meeting
- **WHEN** `hardwareStats.sendBitrate` and `hardwareStats.recvBitrate` are non-null
- **THEN** the card shows `↑ <N> kbps` and `↓ <N> kbps`

#### Scenario: Bandwidth section shows dash in lobby
- **WHEN** bitrate values are null
- **THEN** the card shows `—` for both uplink and downlink

### Requirement: Resource Monitor card is minimizable
The card SHALL have a minimize/expand toggle button in its header. When minimized, only the header bar is visible. The minimized state SHALL persist through stats updates.

#### Scenario: Card minimizes on toggle click
- **WHEN** the user clicks the minimize button
- **THEN** the card body collapses and only the header remains visible

#### Scenario: Card expands on toggle click when minimized
- **WHEN** the card is minimized and the user clicks the expand button
- **THEN** the full card body is shown again

### Requirement: Color thresholds for CPU and memory
CPU and memory percentage values SHALL be colored to indicate health:
- Green: < 60% CPU or < 70% memory
- Yellow: 60–80% CPU or 70–85% memory
- Red: > 80% CPU or > 85% memory

#### Scenario: Low CPU shows green
- **WHEN** a CPU value is below 60%
- **THEN** the text renders in green

#### Scenario: High CPU shows red
- **WHEN** a CPU value exceeds 80%
- **THEN** the text renders in red
