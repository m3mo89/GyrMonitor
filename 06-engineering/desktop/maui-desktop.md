# .NET MAUI Desktop

The desktop app should share architectural principles with the mobile app while supporting desktop-specific workflows.

## Suggested Structure

```text
Desktop/
  Features/
    Authentication/
    Dashboard/
    Cattle/
    Alerts/
    EventSimulator/
    Sync/
  Shared/
```

## Rules

- Event simulation should be isolated from production event ingestion logic.
- Simulator-generated events must clearly identify their source.
- Desktop offline behavior should use the same sync concepts as mobile.
