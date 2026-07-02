## Why

`stabilize-mvp-release` (`openspec/changes/archive/2026-07-01-stabilize-mvp-release/design.md`) extracted the first slice of MAUI-neutral primitives (networking, auth session, SQLite connection contracts, sync statuses/queue shape) into `shared/GyrMonitor.Client.Core`, and its migration plan explicitly called for moving "common primitives one group at a time." That next group was never done: `desktop/GyrMonitor.Desktop.Core` and `mobile/GyrMonitor.Mobile.Core` still each define their own byte-identical (except namespace) authentication API contract, byte-identical alerts read contract, and a duplicated sync-queue repository where the desktop version is a strict subset of the mobile version. A shared-core test project doesn't exist yet either, so `SecureAuthSessionTests.cs` — which tests a class that already lives in the shared core — is duplicated verbatim in both `*.Core.Tests` projects. This drift risk is exactly what the shared core was created to prevent, and it will only get worse as more clients or features are added.

## What Changes

- Move the authentication API contract (`IAuthApi`, `AuthApiClient`, `AuthenticationDtos`) out of `Desktop.Core`/`Mobile.Core` into `shared/GyrMonitor.Client.Core`, since both copies are identical apart from namespace. `LoginViewModel` stays in each client (mobile's adds a role check that desktop doesn't have).
- Move the alerts read contract (`AlertSummaryDto` from `AlertDtos.cs`, `IAlertsApi`, `AlertsApiClient`) into `shared/GyrMonitor.Client.Core`, since both copies are identical apart from namespace and a trivial variable extraction. `AlertsViewModel` stays in each client (mobile's does offline caching and role gating that desktop's doesn't).
- Extract the common part of `SqliteSyncQueueRepository` (`AddAsync`, `GetPendingAsync`, `UpdateAsync`, `GetAllAsync`, connection initialization) into a shared base implementation in `shared/GyrMonitor.Client.Core`, with mobile extending it to add its two user-scoped query methods (`GetPendingForUserAsync`, `GetAllForUserAsync`). Unify the now-shared portion of `ISyncQueueRepository` accordingly.
- Add a `shared/GyrMonitor.Client.Core.Tests` project and move `SecureAuthSessionTests.cs` (and tests for the newly-shared auth/alerts/sync-queue code) there instead of duplicating them per client.
- Update `desktop/GyrMonitor.Desktop.slnx` and `mobile/GyrMonitor.Mobile.slnx` to include the new shared test project.
- No changes to public API contracts, request/response shapes, persisted data, or client-observable behavior — this is an internal duplication cleanup.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `maui-shared-client-core`: The shared client core SHALL also own the authentication API contract, the alerts read contract, and the common sync-queue repository behavior, instead of desktop and mobile each maintaining separate duplicate implementations of these.

## Impact

- Affected code: `desktop/GyrMonitor.Desktop.Core/Features/Authentication/{IAuthApi.cs,AuthApiClient.cs,AuthenticationDtos.cs}`, `desktop/GyrMonitor.Desktop.Core/Features/Alerts/{AlertDtos.cs,IAlertsApi.cs,AlertsApiClient.cs}`, `desktop/GyrMonitor.Desktop.Core/Features/Sync/{ISyncQueueRepository.cs,SqliteSyncQueueRepository.cs}`, and the equivalent `mobile/GyrMonitor.Mobile.Core/Features/...` files, plus their `*.Core.Tests` counterparts.
- New code: `shared/GyrMonitor.Client.Core/{Authentication,Alerts,Sync}` (contracts moved from the clients) and a new `shared/GyrMonitor.Client.Core.Tests` project.
- Solution files: `desktop/GyrMonitor.Desktop.slnx`, `mobile/GyrMonitor.Mobile.slnx` gain a reference to the new shared test project.
- No backend, database, or frontend changes. No API contract or behavior changes — every moved file keeps identical runtime behavior, only namespace/location and DI wiring change.
