# Mobile Foundation

This folder contains the .NET MAUI mobile setup path for GyrMonitor.

Source guidance:

- `knowledge-base/06-engineering/mobile/overview.md`
- `knowledge-base/07-reference/directory-map.md`

The current Phase 1 foundation uses placeholders instead of generated MAUI project files. Generate the mobile project here when the .NET SDK and MAUI workload are available.

## Setup Path

```sh
dotnet workload install maui
dotnet new maui -n GyrMonitor.Mobile -o mobile
dotnet build mobile/GyrMonitor.Mobile.csproj
```

## Boundary

No login, alerts, observations, SQLite persistence, or synchronization workflow is implemented in Phase 1.
