---
title: Dependency Matrix
section: 99-meta
status: approved
version: 1.1.0
---

# Dependency Matrix

```mermaid
flowchart TD
    AUTH[Authentication]
    CATTLE[Cattle Management]
    OBS[Observations]
    EVENTS[Activity Events]
    RISK[Risk Analysis]
    ALERTS[Alerts]
    DASH[Dashboard]
    SYNC[Offline Sync]

    AUTH --> CATTLE
    AUTH --> OBS
    AUTH --> EVENTS
    AUTH --> ALERTS
    CATTLE --> EVENTS
    CATTLE --> ALERTS
    EVENTS --> RISK
    RISK --> ALERTS
    ALERTS --> OBS
    ALERTS --> DASH
    EVENTS --> DASH
    OBS --> SYNC
    EVENTS --> SYNC
```

## Practical Reading

- Changes to Activity Events can affect Risk Analysis, Alerts, Dashboard and Offline Sync.
- Changes to Alerts can affect Observations, Dashboard and Mobile/Desktop workflows.
- Changes to Authentication can affect every protected module.
