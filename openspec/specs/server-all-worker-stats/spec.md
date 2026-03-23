## ADDED Requirements

### Requirement: get-stats returns stats for all workers
The server SHALL respond to a `get-stats` socket event with system-level stats and an array of per-worker stats covering every worker in the mediasoup worker pool.

The response shape SHALL be:
```
{
  systemStats: {
    cpuLoad: number,   // os.loadavg()[0] — 1-minute load average
    memFree: number,   // bytes
    memTotal: number,  // bytes
    uptime: number     // seconds
  },
  workerStats: [
    { pid: number, cpu: number, memory: number },
    ...
  ]
}
```

`workerStats` SHALL contain one entry per worker in `runtime.workers`, in array order.

#### Scenario: Stats returned for all workers
- **WHEN** a client emits `get-stats` with no parameters
- **THEN** the server responds with `systemStats` and `workerStats` as an array with length equal to the number of workers in the pool

#### Scenario: Each worker entry contains pid, cpu, memory
- **WHEN** the server processes a `get-stats` request
- **THEN** each entry in `workerStats` SHALL contain `pid` (number), `cpu` (percent, 0–100), and `memory` (bytes)

#### Scenario: System stats always present
- **WHEN** a client emits `get-stats`
- **THEN** `systemStats.cpuLoad`, `systemStats.memFree`, `systemStats.memTotal`, and `systemStats.uptime` SHALL all be present and non-null
