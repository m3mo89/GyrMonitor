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

## Clean Architecture Layering Inside Each Feature

`GyrMonitor.Mobile.Core/Features/<feature>/` follows the same layer model as the backend (`04-architecture/clean-architecture.md`) and the frontend, adapted to MVVM, once a feature meets the complexity threshold below:

```text
Features/<feature>/
  Domain/          Client-local entities, value objects, and validation used for offline persistence (e.g. PendingObservation, required-field checks). No MAUI, CommunityToolkit.Mvvm, or HttpClient types; may carry sqlite-net-pcl [Table]/[PrimaryKey] mapping attributes as persistence shape, but no SQLite connection/query types.
  Application/       Orchestrator/use-case classes the ViewModel calls (e.g. ObservationCaptureService); depend on Domain and abstract ports (I*Repository, I*Api).
  Infrastructure/     SQLite repositories, API clients, DTOs, and DTO<->Domain mapping; implement the ports Application depends on.
  Presentation/       The ViewModel itself (this project) plus the corresponding XAML page/code-behind in GyrMonitor.Mobile.
```

A feature is promoted to this shape when it has local business validation, composes more than one repository/API dependency in the same orchestration step, or implements a multi-step workflow (load → select → validate → persist → enqueue). Single-call, read-only features (a single API client feeding a list) may stay flat — currently `Authentication`. See `openspec/specs/maui-client-architecture/spec.md` for the full requirement and scenarios, including the dependency rule (Presentation → Application → Domain, Infrastructure implements ports) and the rule that client `Domain` code must never recompute backend-owned values (risk score, severity, authorization). See `knowledge-base/08-decisions/ADR-017-maui-client-clean-architecture.md` for why this layering was adopted, which features were promoted versus kept flat and why, and the trade-offs accepted (more files per user action, more indirect test setup, no user-facing payoff today).
