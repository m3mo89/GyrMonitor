# Backend Modules

Backend modules are organized by business capability, not by technical layer alone.

## Modules

| Module | Responsibility |
|---|---|
| `authentication` | Login, JWT validation, roles |
| `cattle-monitoring` | Cattle registration, listing and history |
| `activity-events` | Activity and inactivity event registration |
| `risk-analysis` | Risk score and severity classification |
| `alerts` | Alert creation, listing and status changes |
| `inspections` | Observations and field inspection records |
| `dashboard` | Aggregated metrics and risk ranking |
| `offline-sync` | Store-and-forward synchronization from offline clients |
| `shared` | Cross-cutting primitives and utilities |

## Module Interaction

```mermaid
flowchart LR
  Cattle[Cattle Monitoring] --> Events[Activity Events]
  Events --> Risk[Risk Analysis]
  Risk --> Alerts[Alerts]
  Alerts --> Inspections[Inspections]
  Events --> Dashboard[Dashboard]
  Alerts --> Dashboard
  Sync[Offline Sync] --> Events
  Sync --> Inspections
```

## Rule

Avoid creating generic modules such as `common-business` or `services`. Shared code should be limited to primitives that have no business ownership.
