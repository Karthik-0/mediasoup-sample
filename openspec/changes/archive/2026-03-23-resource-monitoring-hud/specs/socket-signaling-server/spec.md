## ADDED Requirements

### Requirement: Server handles get-stats event and returns all-worker stats
The server SHALL listen for a `get-stats` socket event and respond with system-level resource stats and per-worker stats for every worker in the mediasoup pool.

The acknowledgement payload SHALL conform to:
```
{
  systemStats: { cpuLoad: number, memFree: number, memTotal: number, uptime: number },
  workerStats: Array<{ pid: number, cpu: number, memory: number }>
}
```

`workerStats` SHALL be an array (not a single object), with one entry per worker in `runtime.workers`. Callers MUST NOT pass a `workerPid` parameter; the server returns all workers unconditionally.

#### Scenario: Emitting get-stats returns all worker entries
- **WHEN** a connected client emits `get-stats` (no arguments required)
- **THEN** the server acknowledges with `{ systemStats, workerStats }` where `workerStats` is an array with one entry per worker

#### Scenario: Backward-compatible call with no parameters
- **WHEN** a client emits `get-stats` without any arguments
- **THEN** the server still responds successfully with the full stats payload
