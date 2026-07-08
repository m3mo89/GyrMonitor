## Why

Mobile and desktop follow the top-level `Features/<name>/` grouping documented in `knowledge-base/06-engineering/mobile/maui-architecture.md` and `.../desktop/maui-desktop.md`, so they already read as Screaming Architecture at the folder level. But inside each feature, `ViewModel`, `ApiClient`, `Dtos`, and `Repository` files sit flat side by side, and ViewModels (e.g. `ObservationCaptureViewModel`, `EventSimulatorViewModel`) directly construct persistence entities, call repositories, and call API clients in the same method. There is no domain/application/infrastructure/presentation separation like the backend (`knowledge-base/04-architecture/clean-architecture.md`) and the web frontend (`openspec/specs/web-frontend-architecture/spec.md`, hardened in `2026-07-08-frontend-clean-architecture-alignment`) already have.

This matters now because `shared/GyrMonitor.Client.Core` is the reuse boundary between mobile and desktop, and both client apps are past MVP: desktop has multi-step orchestration (event simulator with cattle loading + validation + persistence + sync-queueing) and mobile has user-scoped offline sync. Without an explicit layering and dependency-rule contract, this coupling will keep compounding as more MAUI features are added, the same problem the frontend alignment change addressed for the web app.

## What Changes

- Define a new `maui-client-architecture` capability describing Clean Architecture layering for `.NET MAUI` client code: `Domain`, `Application`, `Infrastructure`, and `Presentation` responsibilities nested inside each feature folder (`Features/<name>/...`) in `mobile/GyrMonitor.Mobile.Core`, `desktop/GyrMonitor.Desktop.Core`, and the domain-named top folders of `shared/GyrMonitor.Client.Core` (`Authentication/`, `Alerts/`, `Sync/`, etc.).
- Require dependencies to point inward: `Presentation` (ViewModel-facing bindable state and MAUI pages/XAML in the UI head projects) may depend on `Application`; `Application` (use-case/orchestrator classes) may depend on `Domain` and abstract ports; `Infrastructure` (API clients, SQLite repositories, DTOs) implements those ports; `Domain` (entities, value objects, validation rules) must not reference MAUI, SQLite, `HttpClient`, or `CommunityToolkit.Mvvm`.
- Set a pragmatic complexity threshold (mirroring the frontend alignment change): a feature must be layered once it has local business validation, multi-step orchestration (e.g. load-then-select-then-persist), or more than one persistence/API dependency composed together. Single-call, read-only features (e.g. a page that only lists data from one API client) may stay flat.
- Add SOLID-oriented guardrails specific to MVVM: ViewModels keep a single orchestration responsibility and depend on application-layer use cases/services rather than directly new-ing up or coupling multiple repositories and API clients; concrete `ApiClient`/`SqliteRepository` implementations stay swappable behind the existing `I*Api`/`I*Repository` interfaces without ViewModel changes.
- Keep Screaming Architecture as the top-level organizing principle: business-named `Features/<name>` folders remain the entry point in both client Core projects, and `shared/GyrMonitor.Client.Core`'s domain-named folders remain the entry point there; technical layers are nested inside, not hoisted into global `ViewModels/`, `Services/`, or `Repositories/` folders.
- Plan an implementation audit that classifies every current mobile/desktop/shared feature as `layer now`, `keep flat`, or `not applicable`, starting with the highest-coupling features (`EventSimulator` on desktop, `Observations`/`Sync` on mobile) and leaving simple read-only screens (e.g. desktop `Cattle`, `Dashboard` viewing) flat unless the audit shows a violation.

## Capabilities

### New Capabilities

- `maui-client-architecture`: Clean Architecture layering, inward dependency rule, SOLID-friendly MVVM boundaries, and Screaming Architecture preservation for the `.NET MAUI` client code shared by `mobile/`, `desktop/`, and `shared/GyrMonitor.Client.Core`.

### Modified Capabilities

(none — `mobile-client`, `desktop-client`, and `maui-shared-client-core` keep their current user-facing and structural requirements; this change adds an internal layering contract nested inside their existing `Features/` and domain-named folders without changing any documented scenario.)

## Impact

- **Affected planning/specs**: new `openspec/specs/maui-client-architecture/spec.md` via this change's delta spec.
- **Affected code when implemented later**: `mobile/GyrMonitor.Mobile.Core/Features/*` (especially `Observations`, `Sync`), `desktop/GyrMonitor.Desktop.Core/Features/*` (especially `EventSimulator`, `Sync`), `shared/GyrMonitor.Client.Core/*` domain folders, plus corresponding `*.Core.Tests` projects. UI head projects (`GyrMonitor.Mobile`, `GyrMonitor.Desktop`) are touched only for `Presentation`-layer file moves, not behavior.
- **APIs**: No backend API contract changes.
- **Dependencies**: No new NuGet packages expected.
- **Systems**: Mobile and desktop `.NET MAUI` clients and their shared client core only. Backend, web frontend, database, and deployment runtime behavior remain out of scope.
- **Risk**: Medium-low. The change is structural and should preserve behavior, but moving/splitting ViewModel and service files across three projects can break DI registrations, XAML bindings, or tests if not migrated incrementally and verified per feature.
