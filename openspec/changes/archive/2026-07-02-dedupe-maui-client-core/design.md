## Context

`stabilize-mvp-release` created `shared/GyrMonitor.Client.Core` and moved the first slice of MAUI-neutral primitives there (networking envelope/sender/options, auth session contracts, SQLite connection contract, sync statuses/queue item shape, idempotency helper). Its migration plan explicitly said to "move common primitives one group at a time" — that was slice one, not the whole job.

Comparing `desktop/GyrMonitor.Desktop.Core` and `mobile/GyrMonitor.Mobile.Core` file-by-file today shows a second group that was left behind:

- `Features/Authentication/{IAuthApi.cs,AuthApiClient.cs,AuthenticationDtos.cs}` — byte-identical between clients except for the namespace.
- `Features/Alerts/{AlertDtos.cs,IAlertsApi.cs}` — byte-identical except namespace; `AlertsApiClient.cs` differs only by a variable extraction with no behavior change.
- `Features/Sync/SqliteSyncQueueRepository.cs` — desktop's implementation (`AddAsync`, `GetPendingAsync`, `UpdateAsync`, `GetAllAsync`, private connection init) is a strict subset of mobile's; mobile adds `GetPendingForUserAsync`/`GetAllForUserAsync` for its per-user data scoping requirement from `stabilize-mvp-release`. `ISyncQueueRepository` differs the same way.
- `*.Core.Tests/.../SecureAuthSessionTests.cs` — byte-identical except namespace, testing a class (`SecureAuthSession`) that already lives in the shared core. There is no `shared/GyrMonitor.Client.Core.Tests` project for it to live in instead.

Everything else that shares a filename between the two clients (`AlertsViewModel.cs`, `LoginViewModel.cs`, `SyncViewModel.cs`) is genuinely different: mobile's versions add offline caching, role gating (`MobileRoleAccess`), and observation-specific sync behavior that desktop doesn't have. Those stay separate, consistent with the existing `maui-shared-client-core` spec's "Platform UI remains outside shared core" scenario and the prior design's decision to "share primitives, not feature workflows."

## Goals / Non-Goals

**Goals:**

- Move the authentication API contract and the alerts read contract into `shared/GyrMonitor.Client.Core`, since they are true duplicates with no platform-specific variation.
- Extract the common sync-queue repository behavior into a shared base that mobile extends for its user-scoped queries, removing the duplicated subset without forcing desktop to gain methods it doesn't need.
- Create `shared/GyrMonitor.Client.Core.Tests` and move/de-duplicate tests for code that now lives only in the shared core.
- Preserve all current runtime behavior, DI wiring outcomes, and API contracts exactly — this is a pure move/de-duplication, not a behavior change.

**Non-Goals:**

- No changes to `LoginViewModel`, `AlertsViewModel`, or `SyncViewModel` behavior — only their dependencies' namespaces change where those dependencies move.
- No new abstraction for `DesktopSyncService`/`MobileSyncService` (already correctly kept separate per `stabilize-mvp-release`) or for entity-specific DTOs (`PendingEvent`, `PendingObservation`, `LocalAlert`).
- No merging of the desktop and mobile apps, no shared XAML/Shell/UI code — unchanged from the existing `maui-shared-client-core` spec's non-goals.
- No change to which roles/users can do what, and no change to the two mobile-only sync-queue query methods' behavior.

## Decisions

### Move auth and alerts contracts as-is, keep ViewModels in place

`IAuthApi`, `AuthApiClient`, `AuthenticationDtos`, `AlertSummaryDto` (from `AlertDtos.cs`), `IAlertsApi`, and `AlertsApiClient` move into `shared/GyrMonitor.Client.Core` under new `Authentication/` and `Alerts/` folders, keeping their existing member shapes and just changing the namespace to `GyrMonitor.Client.Core.*`. `LoginViewModel` and `AlertsViewModel` stay in each client's `Features/Authentication`/`Features/Alerts` folder and update their `using` statements to point at the shared namespace.

Alternative considered: also move `LoginViewModel`/`AlertsViewModel` since they share a filename. Rejected — their bodies are not duplicates (mobile's `LoginViewModel` adds a `MobileRoleAccess` check; mobile's `AlertsViewModel` adds local caching, connectivity/staleness handling, and role gating that desktop has no equivalent of), and moving them would mix platform-specific workflow logic back into the MAUI-neutral shared core, which the existing spec explicitly prohibits.

### Shared sync-queue repository via a common base, not a shared full interface

`ISyncQueueRepository` moves its four common members (`AddAsync`, `GetPendingAsync`, `UpdateAsync`, `GetAllAsync`) into `shared/GyrMonitor.Client.Core/Sync/ISyncQueueRepository.cs`. A `SqliteSyncQueueRepository` base implementation of those four members (plus the shared `GetInitializedConnectionAsync` helper, exposed `protected`) moves into `shared/GyrMonitor.Client.Core/Sync/SqliteSyncQueueRepository.cs`. Desktop's `Features/Sync/SqliteSyncQueueRepository.cs` is deleted; desktop registers the shared class directly for `ISyncQueueRepository`. Mobile keeps a thin `Features/Sync/SqliteSyncQueueRepository.cs` that derives from the shared base, adds `GetPendingForUserAsync`/`GetAllForUserAsync` on a mobile-only `IMobileSyncQueueRepository : ISyncQueueRepository` interface, and reuses the inherited connection.

Alternative considered: move the two user-scoped methods into the shared interface/base as well, with desktop simply not using them. Rejected — desktop has no per-user data scoping concept (single shared simulator session, not per-operator device data per `stabilize-mvp-release`'s role-gating decision), so adding those methods to the shared surface would be speculative and untestable from desktop's side, violating the "don't share workflow, share primitives" principle already established for this project.

### New `shared/GyrMonitor.Client.Core.Tests` project for shared-only tests

Add `shared/GyrMonitor.Client.Core.Tests` (same xunit/Moq/coverlet setup as the existing `*.Core.Tests` projects) referencing `shared/GyrMonitor.Client.Core`. Move `SecureAuthSessionTests.cs` there (deleting both duplicate copies), and add tests for the newly-moved `AuthApiClient`, `AlertsApiClient`, and the shared `SqliteSyncQueueRepository` base there instead of per-client. Reference the new test project from `desktop/GyrMonitor.Desktop.slnx` and `mobile/GyrMonitor.Mobile.slnx` so `dotnet test` on either solution still exercises shared-core coverage.

Alternative considered: leave `SecureAuthSessionTests.cs` duplicated since it's "just tests." Rejected — duplicated tests are exactly the drift risk this change is closing off elsewhere; a test testing shared code belongs next to that code, and a future change to `SecureAuthSession` should only require updating one test file, not two that could silently diverge.

## Risks / Trade-offs

- Namespace changes ripple into every file that references the moved types (`using` statements in ViewModels, DI registration in each MAUI app's `MauiProgram`) → Mitigation: grep for every reference to the moved type names before deleting the old files, and rely on the build failing loudly (missing namespace) rather than silently.
- Splitting `ISyncQueueRepository` into a base plus a mobile-only extension could break existing DI registrations that resolve `ISyncQueueRepository` for mobile's user-scoped call sites → Mitigation: introduce `IMobileSyncQueueRepository` for the two extra methods and update mobile's DI registration/call sites that need them to resolve that type instead of the base interface; desktop's DI is unaffected since it never had those methods.
- Moving `AlertsApiClient`/`IAlertsApi` changes the type mobile's `AlertsViewModel` constructs against → Mitigation: since the member signatures are unchanged (only namespace), this is a mechanical `using` update, verified by both client test suites passing unchanged.
- Existing desktop/mobile core tests reference `SqliteSyncQueueRepository` by its old namespace → Mitigation: update `DesktopSyncServiceTests.cs`/`MobileSyncServiceTests.cs`/`SqliteSyncQueueRepositoryTests.cs` imports as part of this change; move the shared-behavior assertions into the new shared test project and keep only mobile-specific assertions (`GetPendingForUserAsync`/`GetAllForUserAsync`) in `mobile/GyrMonitor.Mobile.Core.Tests`.

## Migration Plan

1. Create `shared/GyrMonitor.Client.Core/Authentication` and move `IAuthApi.cs`, `AuthApiClient.cs`, `AuthenticationDtos.cs` there with the `GyrMonitor.Client.Core.Authentication` namespace; delete both client copies; update `LoginViewModel.cs` (desktop and mobile) `using` statements and DI registrations.
2. Create `shared/GyrMonitor.Client.Core/Alerts` and move `AlertDtos.cs` (`AlertSummaryDto`), `IAlertsApi.cs`, `AlertsApiClient.cs` there; delete both client copies; update `AlertsViewModel.cs` (desktop and mobile) `using` statements and DI registrations.
3. Move the common four members of `ISyncQueueRepository`/`SqliteSyncQueueRepository` into `shared/GyrMonitor.Client.Core/Sync`; delete desktop's copies and point its DI registration at the shared class; refactor mobile's copies into a derived `IMobileSyncQueueRepository`/`SqliteSyncQueueRepository` that extends the shared base with the two user-scoped methods.
4. Create `shared/GyrMonitor.Client.Core.Tests`, move `SecureAuthSessionTests.cs` there (delete both client duplicates), and add/relocate tests for the moved auth/alerts/sync-queue code; trim `DesktopSyncServiceTests.cs`/`MobileSyncServiceTests.cs`/`SqliteSyncQueueRepositoryTests.cs` to only their client-specific assertions.
5. Add the new test project to `desktop/GyrMonitor.Desktop.slnx` and `mobile/GyrMonitor.Mobile.slnx`.
6. Build and run both `dotnet test` suites (desktop and mobile solutions) plus the new shared test project; confirm no behavior or contract changes via existing passing assertions.
7. Rollback is trivial before archive: this is a pure move with no data or API changes, so reverting the commit fully restores the prior (duplicated) state.

## Open Questions

None — this is a same-behavior de-duplication of code already proven out per-client; no product decisions are pending.
