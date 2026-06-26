# .NET MAUI Mobile Architecture

The mobile app should follow MVVM and feature-based organization.

## Suggested Structure

```text
Mobile/
  Features/
    Authentication/
    Alerts/
    Observations/
    Sync/
  Shared/
    Components/
    Services/
    Storage/
    Networking/
```

## Rules

- ViewModels should not contain direct SQL logic.
- API clients should be separated from UI logic.
- Sync logic should be isolated in a dedicated service.
- Local storage should be accessed through repositories.
