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

## Clean Architecture Layering Inside Each Feature

`GyrMonitor.Desktop.Core/Features/<feature>/` follows the same layer model as mobile (`06-engineering/mobile/maui-architecture.md`) and the backend (`04-architecture/clean-architecture.md`), once a feature meets the complexity threshold below:

```text
Features/<feature>/
  Domain/          Client-local entities and validation used for offline persistence (e.g. PendingEvent, confidence-range/selection checks). No MAUI, CommunityToolkit.Mvvm, or HttpClient types; may carry sqlite-net-pcl [Table]/[PrimaryKey] mapping attributes as persistence shape, but no SQLite connection/query types.
  Application/       Orchestrator/use-case classes the ViewModel calls (e.g. EventSimulatorService); depend on Domain and abstract ports (I*Repository, I*Api).
  Infrastructure/     SQLite repositories, API clients, DTOs, and DTO<->Domain mapping; implement the ports Application depends on.
  Presentation/       The ViewModel itself (this project) plus the corresponding XAML page/code-behind in GyrMonitor.Desktop.
```

A feature is promoted to this shape when it has local business validation, composes more than one repository/API dependency in the same orchestration step, or implements a multi-step workflow (e.g. `EventSimulator`'s load cattle → select → validate → persist → enqueue). Single-call, read-only features (`Cattle`, `Dashboard`, `Alerts`, `Authentication`) stay flat. See `openspec/specs/maui-client-architecture/spec.md` for the full requirement and scenarios, including the dependency rule (Presentation → Application → Domain, Infrastructure implements ports) and the rule that client `Domain` code must never recompute backend-owned values (risk score, severity, authorization). See `knowledge-base/08-decisions/ADR-017-maui-client-clean-architecture.md` for why this layering was adopted, which features were promoted versus kept flat and why, and the trade-offs accepted (more files per user action, more indirect test setup, no user-facing payoff today).
