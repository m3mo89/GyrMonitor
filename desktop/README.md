# Desktop Foundation

This folder contains the .NET MAUI desktop setup path for GyrMonitor.

Source guidance:

- `knowledge-base/06-engineering/desktop/overview.md`
- `knowledge-base/07-reference/directory-map.md`

The current Phase 1 foundation uses placeholders instead of generated MAUI project files. Generate the desktop project here when the .NET SDK and MAUI workload are available.

## Setup Path

```sh
dotnet workload install maui
dotnet new maui -n GyrMonitor.Desktop -o desktop
dotnet build desktop/GyrMonitor.Desktop.csproj
```

## Boundary

No login, dashboard, cattle, alerts, event simulator, SQLite persistence, or synchronization workflow is implemented in Phase 1.
