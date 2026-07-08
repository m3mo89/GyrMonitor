## 1. Architecture Audit

- [x] 1.1 Audit every feature folder in `mobile/GyrMonitor.Mobile.Core/Features/*`, `desktop/GyrMonitor.Desktop.Core/Features/*`, and the domain-named folders of `shared/GyrMonitor.Client.Core/*` and confirm/refine the `layer now` / `keep flat` classification from `design.md`.
- [x] 1.2 Record the chosen `.NET MAUI` layered feature convention (`Domain/Application/Infrastructure/Presentation`) in `knowledge-base/06-engineering/mobile/maui-architecture.md` and `knowledge-base/06-engineering/desktop/maui-desktop.md`, mirroring how `knowledge-base/04-architecture/clean-architecture.md` documents the frontend layering.
- [x] 1.3 Identify every ViewModel method that currently calls more than one repository/API client directly or contains inline validation (e.g. `ObservationCaptureViewModel.SaveAsync`, `EventSimulatorViewModel.GenerateAsync`/`LoadCattleAsync`).
- [x] 1.4 Identify every `Domain`-candidate type (`PendingObservation`, `PendingEvent`, `LocalAlert`, `SyncQueueItem`) that currently has no folder separating it from ViewModel/repository/API-client code.

## 2. Shared Client Core Layering

- [x] 2.1 Create `Domain` and `Infrastructure` folders under `shared/GyrMonitor.Client.Core/Sync/` and move `SyncQueueItem`, `SyncStatuses`, `SyncIdempotency` into `Domain`, and `SqliteSyncQueueRepository` into `Infrastructure`, keeping `ISyncQueueRepository` as the port.
- [x] 2.2 Verify `mobile` and `desktop` both still build against the shared core after this move, and run `shared/GyrMonitor.Client.Core.Tests`.
- [x] 2.3 Apply the same audit to `shared/GyrMonitor.Client.Core/Authentication/` and `Alerts/`; layer only if the audit in 1.1 shows they meet the complexity threshold, otherwise document why they stay flat.

## 3. Desktop Event Simulator Layering

- [x] 3.1 Create `Domain`, `Application`, `Infrastructure`, `Presentation` folders under `desktop/GyrMonitor.Desktop.Core/Features/EventSimulator/`.
- [x] 3.2 Move `PendingEvent` and its validation (confidence range, required cattle selection) into `Domain`, without changing current validation behavior.
- [x] 3.3 Extract an `Application`-layer orchestrator (e.g. `EventSimulatorService`) that implements the load-cattle and generate-event workflows currently inline in `EventSimulatorViewModel`; the ViewModel calls this orchestrator instead of `ICattleApi`/`IPendingEventRepository`/`ISyncQueueRepository` directly.
- [x] 3.4 Move `SqlitePendingEventRepository` and any DTO/API-client code used only by this feature into `Infrastructure`.
- [x] 3.5 Move `EventSimulatorViewModel` into `Presentation`; confirm `desktop/GyrMonitor.Desktop/Features/EventSimulator/*.xaml` still binds correctly and calls only ViewModel members.
- [x] 3.6 Run `desktop/GyrMonitor.Desktop.Core.Tests` and a desktop build after this migration before moving to the next feature.

## 4. Mobile Observations Layering

- [x] 4.1 Create `Domain`, `Application`, `Infrastructure`, `Presentation` folders under `mobile/GyrMonitor.Mobile.Core/Features/Observations/`.
- [x] 4.2 Move `PendingObservation` and its validation (alert selected, comment not empty) into `Domain`.
- [x] 4.3 Extract an `Application`-layer orchestrator (e.g. `ObservationCaptureService`) implementing the save workflow (session check, entity construction, persist, enqueue sync item) currently inline in `ObservationCaptureViewModel.SaveAsync`.
- [x] 4.4 Move `SqlitePendingObservationRepository` into `Infrastructure`.
- [x] 4.5 Move `ObservationCaptureViewModel` into `Presentation`; confirm `mobile/GyrMonitor.Mobile/Features/Observations/*.xaml` still binds correctly.
- [x] 4.6 Run `mobile/GyrMonitor.Mobile.Core.Tests` and a mobile build after this migration.

## 5. Sync Orchestration Layering

- [x] 5.1 Extract DTO request/response mapping out of `MobileSyncService.SyncPendingObservationsAsync`/`ApplyResultAsync` into an `Infrastructure`-layer mapper under `mobile/GyrMonitor.Mobile.Core/Features/Sync/Infrastructure/`, keeping `MobileSyncService` as the `Application`-layer entry point working with domain values.
- [x] 5.2 Apply the same extraction to `DesktopSyncService` under `desktop/GyrMonitor.Desktop.Core/Features/Sync/Infrastructure/`.
- [x] 5.3 Move `SyncViewModel`/`ConnectivityStatusViewModel` (mobile and desktop) into their feature's `Presentation` folder.
- [x] 5.4 Run both `*.Core.Tests` suites and confirm sync retry/duplicate/failure behavior is unchanged (existing scenarios in `mobile-client`/`desktop-client` specs).

## 6. Remaining Feature Audit Pass

- [x] 6.1 Apply the layer-now/keep-flat decision to mobile `Alerts` (online fetch + offline cache fallback) and desktop `Alerts`; layer if the audit confirms two composed data sources, otherwise document why flat is still correct. Mobile `Alerts` layered (`Domain/LocalAlert.cs`, `Application/AlertsService.cs`, `Infrastructure/SqliteLocalAlertRepository.cs`, `Presentation/{AlertsViewModel,AlertDetailViewModel}.cs`); desktop `Alerts` confirmed flat (single API call, no cache/offline fallback) per `design.md`.
- [x] 6.2 Apply the same audit to `Authentication` (mobile and desktop); keep flat per `design.md` unless local business rules have been added since the audit. Confirmed still flat: single API call + session write, mobile's one role-support check post-login is not enough to justify layering.
- [x] 6.3 Confirm desktop `Cattle` and `Dashboard` remain flat (single API call, read-only) and document that decision rather than layering them speculatively. Confirmed via `CattleViewModel`/`DashboardViewModel` inspection: single `I*Api` call, no local validation, no multi-step orchestration.
- [x] 6.4 Update each promoted feature's namespace/using statements and confirm no feature outside the promoted one imports its internals directly (dependency-rule check). Verified: no `Domain` file references `Microsoft.Maui`, `CommunityToolkit.Mvvm`, `HttpClient`, or SQLite connection/query types (attribute-only `SQLite` usage documented as an accepted exception in the spec); no `Presentation` file references `Infrastructure` namespaces or concrete `Sqlite*Repository`/`*ApiClient` types directly; no `Application` file references `CommunityToolkit.Mvvm`/`Microsoft.Maui`.

## 7. Verification

- [x] 7.1 Run `dotnet build` for `mobile/`, `desktop/`, and `shared/` solutions after each feature migration and fix DI-registration or XAML-binding regressions before moving to the next feature. Verified across `net10.0` (Core projects), `net10.0-ios`, `net10.0-android` (mobile head), and `net10.0-maccatalyst` (desktop head) — all 0 errors. `net10.0-windows10.0.19041.0` was not build-verified (no Windows toolchain available in this environment); no Windows-specific files were touched.
- [x] 7.2 Run all `*.Core.Tests` projects (`shared/GyrMonitor.Client.Core.Tests`, `mobile/GyrMonitor.Mobile.Core.Tests`, `desktop/GyrMonitor.Desktop.Core.Tests`) and fix regressions. Final counts match the pre-refactor baseline exactly: shared 27/27, mobile 29/29, desktop 23/23, all passing.
- [x] 7.3 Manually verify (or via existing UI smoke steps) that desktop event simulation, mobile observation capture, and mobile/desktop sync retain identical user-facing behavior (validation messages, offline queueing, sync outcomes) after layering. Verified via the unchanged, still-passing test assertions on exact validation strings (e.g. "Select a cattle record before generating an event.", "Confidence must be between 0 and 1.", "Comment must not be empty.", "Select an alert before saving an observation.") and sync retry/duplicate/failure/offline-queueing outcomes. A live interactive smoke test on a simulator/emulator with a running backend was not performed — this sandboxed environment has no display, simulator, or backend access; recommend a manual pass before merging.
- [x] 7.4 Run `openspec validate align-mobile-desktop-clean-architecture --strict` and fix any spec/task formatting issues. Validation passed with no issues.
