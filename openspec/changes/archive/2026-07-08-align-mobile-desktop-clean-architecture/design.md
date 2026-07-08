## Context

Mobile and desktop are `.NET MAUI` apps composed of three projects each side of a shared boundary:

```text
shared/GyrMonitor.Client.Core/     Authentication/  Alerts/  Networking/  Session/  Storage/  Sync/
mobile/GyrMonitor.Mobile.Core/     Features/{Authentication,Alerts,Observations,Sync}/
mobile/GyrMonitor.Mobile/          Features/{...same names...}/  (XAML pages, Shell)
desktop/GyrMonitor.Desktop.Core/   Features/{Authentication,Dashboard,Cattle,Alerts,EventSimulator,Sync}/
desktop/GyrMonitor.Desktop/        Features/{...same names...}/  (XAML pages, Shell)
```

This already communicates business capability first (Screaming Architecture at the top level), which is why `knowledge-base/06-engineering/mobile/maui-architecture.md` and `.../desktop/maui-desktop.md` only ask for "feature-based MVVM" today. The gap is inside each feature folder. Current `*.Core` feature folders are flat:

```text
Features/Observations/
  IPendingObservationRepository.cs
  ObservationCaptureViewModel.cs
  PendingObservation.cs
  SqlitePendingObservationRepository.cs
```

`ObservationCaptureViewModel.SaveAsync()` reads the session, validates input, builds the `PendingObservation` entity, calls the observation repository, and builds/enqueues a `SyncQueueItem` — all in one method. `desktop/.../EventSimulatorViewModel.GenerateAsync()` does the same for `PendingEvent`, plus a separate `LoadCattleAsync()` that calls `ICattleApi` directly and maps DTOs to a UI selection type inline. `MobileSyncService` and `DesktopSyncService` fare better (they are already single-purpose orchestrators), but they still build request DTOs and interpret HTTP results directly rather than depending on a mapping/port boundary. None of this matches the layered model the backend (`knowledge-base/04-architecture/clean-architecture.md`) and the web frontend (`openspec/specs/web-frontend-architecture/spec.md`, hardened by `2026-07-08-frontend-clean-architecture-alignment`) already enforce.

This design defines the MAUI-side equivalent of that same layer model, adapted to MVVM instead of React hooks/components.

## Goals / Non-Goals

**Goals:**

- Define a standard layered feature shape for `.NET MAUI` client features that meet the complexity threshold:

```text
Features/<feature>/
  Domain/           Entities, value objects, validation rules. No MAUI, SQLite, HttpClient, MVVM toolkit types.
  Application/       Use-case/orchestrator classes consumed by ViewModels; depend on Domain and abstract ports (I*Repository, I*Api).
  Infrastructure/    SQLite repository implementations, API clients, DTOs, DTO<->Domain mapping.
  Presentation/       ViewModels (Core project) and XAML pages/code-behind (UI head project).
```

- Preserve the existing top-level business-named `Features/<name>` folders in both `*.Core` projects and the existing domain-named top folders (`Authentication/`, `Alerts/`, `Sync/`, ...) in `shared/GyrMonitor.Client.Core`, instead of introducing global `ViewModels/`, `Repositories/`, or `ApiClients/` folders.
- Make the dependency rule explicit for MVVM: ViewModel → Application → Domain, with Infrastructure implementing ports that Application depends on, matching the backend/frontend inward dependency rule.
- Apply a complexity threshold so trivial read-only features are not forced into ceremony.
- Refactor incrementally, starting with the highest-coupling features identified in the audit (desktop `EventSimulator`, mobile `Observations`/`Sync`), preserving current behavior, DI registrations, and test coverage.

**Non-Goals:**

- No MAUI/mobile/desktop code changes are made as part of this proposal turn (planning only).
- No new screens, API endpoints, backend behavior, or database schema changes.
- No change to `shared/GyrMonitor.Client.Core`'s public contracts consumed by both clients (`IAuthApi`, `IAlertsApi`, `ISyncQueueRepository`, `ApiRequestSender`, etc.) beyond internal reorganization where it is itself split into layers.
- No forcing of simple, single-call, read-only features (e.g. desktop `Cattle`/`Dashboard` viewing) into layered folders before the audit shows they need it.

## Decisions

**1. Use feature-first Clean Architecture inside each `*.Core` project, not global technical folders.**

Each business feature remains the first organizing unit; technical layers nest inside it:

```text
GyrMonitor.Mobile.Core/Features/Observations/
  Domain/
  Application/
  Infrastructure/
  Presentation/
```

Alternative considered: create global `Domain/`, `Application/`, `Infrastructure/`, `Presentation/` folders at the `*.Core` project root. Rejected because it hides business capabilities and contradicts the project's Screaming Architecture guidance, exactly as it was for the frontend.

**2. `Presentation` spans both the `*.Core` ViewModel and the UI head XAML/code-behind.**

Unlike the web frontend (single project), MAUI splits UI across a shareable `*.Core` project (ViewModels, no MAUI XAML dependency) and a per-platform head project (`GyrMonitor.Mobile`/`GyrMonitor.Desktop`, XAML pages + code-behind). Both are `Presentation` in Clean Architecture terms: the ViewModel is presentation logic without a rendering technology, and the XAML/code-behind is the rendering technology itself. This proposal keeps that existing two-project split unchanged and only adds `Domain`/`Application`/`Infrastructure` folders inside the `*.Core` project's feature folder; the head project's `Features/<name>/*.xaml` files are unaffected in file location, only in what they may call (application-facing ViewModel members only, never repositories/API clients directly — this is already true today and remains a constraint, not a new one).

Alternative considered: also restructure the head project's `Features/<name>/` folders into layered subfolders. Rejected: the head project already contains only XAML pages/code-behind (no business logic), so there is nothing to layer there; adding empty `Presentation/` nesting would be ceremony without benefit.

**3. `Domain` holds entities and validation rules already used for persistence, not a rewritten model.**

`PendingObservation`, `PendingEvent`, `LocalAlert`, and `SyncQueueItem` already act as domain/persistence entities. They move into `Domain/` (or, for `SyncQueueItem`, stay in `shared/GyrMonitor.Client.Core/Sync/Domain/` since it is cross-feature there) with their invariant checks (e.g. "comment must not be empty", "confidence must be between 0 and 1" — currently inline in ViewModels) extracted into small validation methods/value objects that `Application` calls, so `Domain` does not import `CommunityToolkit.Mvvm`, `Microsoft.Maui`, or `HttpClient`. These entities keep their existing `sqlite-net-pcl` mapping attributes (`[Table]`, `[PrimaryKey]`) as declarative persistence shape — that is metadata, not connection/query behavior, and splitting a parallel mapped class purely to avoid the attribute import would duplicate the shape without a behavioral payoff at this project's scale. `Domain` still does not reference `SQLiteAsyncConnection`, `ISqliteConnectionProvider`, or any connection/query type; that stays in `Infrastructure`.

Alternative considered: leave validation inline in ViewModels and only move entity classes. Rejected because inline validation in `SaveAsync`/`GenerateAsync` is exactly the SRP violation this change targets; leaving it defeats the purpose.

Alternative considered: split each entity into a pure Domain POCO plus a separate Infrastructure-owned SQLite row class with a mapper between them. Rejected for this change: it would double the type count for all four entities with no behavioral change, and the `[Table]`/`[PrimaryKey]` attributes are declarative metadata rather than a dependency on SQLite connection/query behavior. Revisit if these entities' persistence shape and domain shape ever need to diverge.

**4. `Application` owns orchestration; ViewModels become thin.**

Multi-step orchestration currently living in ViewModel command methods (validate → build entity → persist → enqueue sync item; or load cattle → map → populate selection list) moves into `Application`-layer classes (e.g. `ObservationCaptureService`, `CattleSelectionLoader`) that the ViewModel calls through one or two methods. `MobileSyncService`/`DesktopSyncService` already fit the `Application` role and mostly need their DTO mapping split out (Decision 5) rather than a rewrite.

Alternative considered: keep orchestration in the ViewModel and only extract validation. Rejected because the audited evidence (`ObservationCaptureViewModel.SaveAsync`, `EventSimulatorViewModel.GenerateAsync`) shows the orchestration itself, not just validation, is the coupling problem — ViewModels directly sequence two repositories today.

**5. `Infrastructure` implements ports; DTOs and mapping move out of `Application`/`Domain`.**

`SqlitePendingObservationRepository`, `SqliteLocalAlertRepository`, `SqlitePendingEventRepository`, `*ApiClient`, and `*Dtos` classes move into `Infrastructure/`, keeping their existing `I*Repository`/`I*Api` interfaces as the port `Application` depends on. Sync DTO request/response mapping currently inline in `MobileSyncService.SyncPendingObservationsAsync`/`ApplyResultAsync` and `DesktopSyncService`'s equivalent moves to `Infrastructure` mapping helpers so the `Application`-layer sync service works with domain values, not wire DTOs.

Alternative considered: leave DTOs beside the ViewModel as today. Rejected because DTOs are wire-format infrastructure concerns, and keeping them beside `Domain`/`Presentation` code is the same anti-pattern flagged in the frontend design (`*.api.ts` beside pages).

**6. Use a complexity threshold, not blanket ceremony.**

A feature is promoted to the layered shape when it has any of: local business validation, more than one persistence/API dependency composed in the same orchestration step, or multi-step workflows (load → select → validate → persist → enqueue). Single-call, read-only features stay flat. Applying the threshold to current features:

| Feature | Verdict | Why |
| --- | --- | --- |
| desktop `EventSimulator` | Layer now | Multi-step: load cattle, validate selection/confidence, build entity, persist, enqueue sync |
| mobile `Observations` | Layer now | Validation + entity construction + two repositories (observation, sync queue) |
| mobile `Sync` / desktop `Sync` (`MobileSyncService`/`DesktopSyncService`) | Layer now (Application already, extract Infrastructure mapping) | Multi-repository orchestration + DTO mapping + retry/status transitions |
| mobile `Alerts` (`AlertsViewModel`, `AlertDetailViewModel`) | Layer now (light) | `AlertsViewModel.LoadAsync` composes two data sources (remote API + local cache fallback), a role/session check, and user-scoped cache replace/read — confirmed during implementation audit |
| desktop `Alerts` (`AlertsViewModel`) | Keep flat | Confirmed during implementation audit: identical single-API-call, read-only shape as desktop `Cattle`/`Dashboard`, no local cache or offline fallback |
| desktop `Cattle`, desktop `Dashboard` | Keep flat | Single API call, read-only display, no local validation or multi-step orchestration |
| `Authentication` (mobile/desktop) | Keep flat, revisit if MFA/lockout logic is added | Confirmed during implementation audit: single API call + session write; mobile adds one role-support check post-login, not enough local business logic to justify layering yet |
| `shared/GyrMonitor.Client.Core` `Sync/` | Layer now (shared entity-agnostic base) | Already the shared reuse boundary (`maui-shared-client-core`); idempotency/mapping helpers benefit from the same Domain/Infrastructure split so both clients extend a clean base |

Alternative considered: refactor every feature immediately. Rejected for the same reason as the frontend change: big-bang restructuring across three projects at once maximizes broken-DI/broken-XAML-binding risk without a behavior payoff.

## Risks / Trade-offs

- [Risk] File moves across `*.Core` projects can break `MauiProgram.cs`/DI container registrations (constructor injection by interface) and XAML `x:DataType`/binding paths. → Mitigation: migrate one feature at a time, rebuild + run `*.Core.Tests` after each, and keep interface names/namespaces stable where feasible to minimize DI/XAML churn.
- [Risk] Splitting `SyncQueueItem`/idempotency helpers touches the shared reuse boundary (`maui-shared-client-core`) used by both clients simultaneously. → Mitigation: layer `shared/GyrMonitor.Client.Core/Sync/` first and in isolation, verify both `mobile` and `desktop` builds and their `*.Core.Tests` pass before touching client-specific features.
- [Risk] Over-applying `Domain/` to hold backend-owned rules (e.g. re-deriving alert severity) would duplicate the backend's authority. → Mitigation: spec language limits client `Domain` to client-local validation/entities already used for offline persistence, not a second source of truth for backend-computed values (risk score, severity), matching the existing `mobile-client`/`desktop-client` "no local recalculation" requirements.
- [Risk] Layering may feel heavy for genuinely simple screens. → Mitigation: complexity threshold and the classification table above; `Cattle`/`Dashboard` viewing and current `Authentication` stay flat.
- [Trade-off] This proposal prioritizes long-term structure over near-term feature velocity across three coupled projects (`shared`, `mobile`, `desktop`). Payoff is lower coupling as desktop/mobile gain more multi-step workflows.

## Migration Plan

1. Add the new `maui-client-architecture` delta requirements (this change).
2. During implementation, audit each current mobile/desktop/shared feature and confirm/refine the classification table above.
3. Layer `shared/GyrMonitor.Client.Core/Sync/` first (shared boundary, smallest blast radius relative to its reuse).
4. Layer desktop `EventSimulator` (highest local coupling) and mobile `Observations` next, each behind its own build + `*.Core.Tests` run.
5. Layer `Sync` orchestration (`MobileSyncService`, `DesktopSyncService`) by extracting `Infrastructure` mapping, keeping the class itself as the `Application`-layer entry point.
6. Apply the same audit/promote-or-keep-flat decision to `Alerts` (mobile/desktop) and `Authentication` (mobile/desktop); leave desktop `Cattle`/`Dashboard` flat per the table unless implementation reveals a violation.
7. Update `knowledge-base/06-engineering/mobile/maui-architecture.md` and `.../desktop/maui-desktop.md` to document the layered feature shape, mirroring how `clean-architecture.md` documents the frontend layering today.
8. Run each project's build and test suite (`dotnet build`, `dotnet test` for `*.Core.Tests`) after every feature migration; rely on normal `git revert` for rollback since no data migrations or backend contracts change.

## Open Questions

- Should `Application`-layer orchestrator classes be registered in DI as-is (constructor injection, matching current `*Service`/`*ViewModel` style), or is a lighter static/functional helper acceptable for the smallest promoted features (e.g. mobile `Alerts`)? Implementation should pick one and apply it consistently within a project.

### Resolved during implementation

- `shared/GyrMonitor.Client.Core/Authentication/` and `Alerts/` stay flat (no `Domain`/`Application` subfolders). Confirmed during implementation: each folder holds exactly one DTO file, one `I*Api` port, and one `*ApiClient` adapter — a single-call passthrough to one backend endpoint with no local entity, no local validation, and no orchestration across more than one dependency. That is below the complexity threshold, same reasoning as desktop `Cattle`/`Dashboard`. `shared/GyrMonitor.Client.Core/Sync/` did get `Domain`/`Infrastructure` because it owns an actual domain entity (`SyncQueueItem`) with status-transition semantics and idempotency-key logic (`SyncIdempotency`) reused by two orchestrators (`MobileSyncService`, `DesktopSyncService`), not just a DTO passthrough.
