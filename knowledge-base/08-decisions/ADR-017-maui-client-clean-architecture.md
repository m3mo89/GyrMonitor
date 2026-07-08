---
title: 'ADR-017: Layer Mobile/Desktop MAUI Features with Clean Architecture, Only Above a Complexity Threshold'
area: Mobile/Desktop
status: approved
version: 0.9.0
---

# ADR-017: Layer Mobile/Desktop MAUI Features with Clean Architecture, Only Above a Complexity Threshold

## Status

Accepted

## Context

Mobile and desktop already organized code by business feature (`Features/<name>/`), matching the Screaming Architecture guidance in `knowledge-base/06-engineering/mobile/maui-architecture.md` and `.../desktop/maui-desktop.md`. Inside each feature, however, ViewModels mixed presentation state, local validation, entity construction, SQLite persistence, and API calls in the same command method. `EventSimulatorViewModel.GenerateAsync` and `ObservationCaptureViewModel.SaveAsync` each validated input, built the persisted entity, called a repository, and enqueued a sync-queue item inline, with no separation matching the layering the backend (`clean-architecture.md`) and the web frontend (ADR-003, hardened by the `2026-07-08-frontend-clean-architecture-alignment` change) already had. This mattered because both clients are past MVP and gaining more multi-step workflows: desktop `EventSimulator` (load cattle → select → validate → persist → enqueue), mobile `Sync` (multi-repository orchestration + DTO mapping + retry/status transitions), and mobile `Alerts` (online fetch with offline cache fallback, user-scoped).

## Decision

Introduce `Domain/Application/Infrastructure/Presentation` subfolders inside a `*.Core` project's feature folder (or, for shared sync primitives, inside `shared/GyrMonitor.Client.Core/Sync/`), but only when a feature meets a complexity threshold: local business validation, more than one repository/API dependency composed in the same orchestration step, or a multi-step workflow. Applied to `desktop/EventSimulator`, `mobile/Observations`, `mobile/Sync`, `desktop/Sync`, `mobile/Alerts`, and `shared/Sync`. Left flat: `desktop/Cattle`, `desktop/Dashboard`, `desktop/Alerts`, and `Authentication` (mobile/desktop) — each is a single API call with no local validation or multi-step orchestration.

Domain entities that are also the locally persisted SQLite row (`PendingObservation`, `PendingEvent`, `LocalAlert`, `SyncQueueItem`) keep their existing `sqlite-net-pcl` `[Table]`/`[PrimaryKey]` mapping attributes as declarative persistence shape. `Domain` code still may not reference `SQLiteAsyncConnection`, `ISqliteConnectionProvider`, or any other SQLite connection/query type, nor `Microsoft.Maui`, `CommunityToolkit.Mvvm`, or `HttpClient`/API DTO types — that behavior stays in `Infrastructure`. Full requirement text and scenarios: `openspec/specs/maui-client-architecture/spec.md`.

## Alternatives Considered

- Layering every feature uniformly, including single-call read-only screens (`Cattle`, `Dashboard`): rejected. Four folders and multiple files for logic that fits in roughly 50 lines is ceremony without payoff.
- Splitting each entity into a separate pure-Domain POCO plus an Infrastructure-owned SQLite row class with a mapper, to avoid any `SQLite` import in `Domain`: rejected for now. It would double the type count for all four entities purely to avoid a mapping-attribute import, with no behavioral difference. Revisit if an entity's persistence shape and domain shape ever need to diverge.
- Leaving the tangled features flat: rejected. `EventSimulatorViewModel`/`ObservationCaptureViewModel` already mixed two repositories, validation, and entity construction in one command method — the same SRP violation the frontend alignment work had already fixed on the web client.

## Consequences

**Positive:**

- ViewModels for the five layered features no longer own persistence or API details directly; `Application`-layer services (`EventSimulatorService`, `ObservationCaptureService`, `AlertsService`, `MobileSyncService`, `DesktopSyncService`) are unit-testable independent of MAUI/XAML.
- Matches the layering convention already established for the backend and the frontend (ADR-003), so a developer who knows one client understands all three without learning a new structure.
- The dependency rule (`Domain` must not import MAUI/Mvvm/HttpClient/SQLite-connection types) is now a grep-able, auditable rule instead of something enforced only by code-review discipline.
- Infrastructure (SQLite repository, API client, DTO shape) can change without touching the ViewModel, as long as the port interface stays the same.

**Negative:**

- Tracing a single user action (for example, "save an observation") now spans four files instead of one, adding real navigation and cognitive cost for a codebase still at MVP scale.
- Unit tests for the layered ViewModels now construct a real `Application`-layer service wrapping mocked ports (e.g. `new ObservationCaptureViewModel(new ObservationCaptureService(observations.Object, syncQueue.Object, ...))`) instead of injecting mocks directly into the ViewModel — one more indirection in test setup for the same assertions, not new coverage.
- No user-facing behavior changed; the change is a bet on future maintainability, not a delivered improvement visible today.
- `mobile/Alerts` was promoted because it technically met the complexity threshold (two composed data sources plus offline fallback), but its previous single-file form (roughly 130 lines) was still comfortably readable. Of the five promotions, this is the most debatable one.

## Impacted Documentation

- `knowledge-base/04-architecture/clean-architecture.md` ("Mobile/Desktop Clean Architecture Layering" section).
- `knowledge-base/06-engineering/mobile/maui-architecture.md` and `knowledge-base/06-engineering/desktop/maui-desktop.md` ("Clean Architecture Layering Inside Each Feature" sections).
- `knowledge-base/07-reference/directory-map.md` (Mobile/Desktop trees).
- `knowledge-base/00-introduction/PROJECT_STRUCTURE.md` (Mobile/Desktop Project Structure sections).
- `openspec/specs/maui-client-architecture/spec.md` (full requirement and scenarios).

## Review Notes

Revisit if a currently-flat feature (`Cattle`, `Dashboard`, `Alerts` on desktop, or `Authentication` on either client) grows local validation or multi-step orchestration, if the team finds the added indirection isn't paying off at this app's scale, or specifically whether `mobile/Alerts` should be reverted to flat.
