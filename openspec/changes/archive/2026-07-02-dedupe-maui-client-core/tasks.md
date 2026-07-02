## 1. Shared authentication contract

- [x] 1.1 Create `shared/GyrMonitor.Client.Core/Authentication/` and move `IAuthApi.cs`, `AuthApiClient.cs`, `AuthenticationDtos.cs` there under the `GyrMonitor.Client.Core.Authentication` namespace
- [x] 1.2 Delete `desktop/GyrMonitor.Desktop.Core/Features/Authentication/{IAuthApi.cs,AuthApiClient.cs,AuthenticationDtos.cs}` and `mobile/GyrMonitor.Mobile.Core/Features/Authentication/{IAuthApi.cs,AuthApiClient.cs,AuthenticationDtos.cs}`
- [x] 1.3 Update `LoginViewModel.cs` (desktop and mobile) `using` statements and any `MauiProgram`/DI registrations that reference the old namespaces
- [x] 1.4 Build both `desktop/GyrMonitor.Desktop.slnx` and `mobile/GyrMonitor.Mobile.slnx` to confirm no remaining references to the deleted files

## 2. Shared alerts read contract

- [x] 2.1 Create `shared/GyrMonitor.Client.Core/Alerts/` and move `AlertSummaryDto` (from `AlertDtos.cs`), `IAlertsApi.cs`, `AlertsApiClient.cs` there under the `GyrMonitor.Client.Core.Alerts` namespace
- [x] 2.2 Delete `desktop/GyrMonitor.Desktop.Core/Features/Alerts/{AlertDtos.cs,IAlertsApi.cs,AlertsApiClient.cs}` and `mobile/GyrMonitor.Mobile.Core/Features/Alerts/{AlertDtos.cs,IAlertsApi.cs,AlertsApiClient.cs}`
- [x] 2.3 Update `AlertsViewModel.cs` (desktop and mobile) `using` statements and DI registrations to reference the shared namespace
- [x] 2.4 Build both solutions to confirm no remaining references to the deleted files

## 3. Shared sync-queue repository base

- [x] 3.1 Create `shared/GyrMonitor.Client.Core/Sync/ISyncQueueRepository.cs` with the four common members (`AddAsync`, `GetPendingAsync`, `UpdateAsync`, `GetAllAsync`) and `shared/GyrMonitor.Client.Core/Sync/SqliteSyncQueueRepository.cs` implementing them, exposing `GetInitializedConnectionAsync` as `protected`
- [x] 3.2 Delete `desktop/GyrMonitor.Desktop.Core/Features/Sync/{ISyncQueueRepository.cs,SqliteSyncQueueRepository.cs}` and register the shared `SqliteSyncQueueRepository` for `ISyncQueueRepository` in desktop's DI setup
- [x] 3.3 Add `mobile/GyrMonitor.Mobile.Core/Features/Sync/IMobileSyncQueueRepository.cs` (extends the shared `ISyncQueueRepository` with `GetPendingForUserAsync`, `GetAllForUserAsync`) and refactor `mobile/GyrMonitor.Mobile.Core/Features/Sync/SqliteSyncQueueRepository.cs` to derive from the shared base and implement only the two extra methods
- [x] 3.4 Update mobile's DI registration and any call sites that need the user-scoped methods to resolve `IMobileSyncQueueRepository` instead of the base `ISyncQueueRepository`
- [x] 3.5 Build both solutions to confirm desktop and mobile sync features still compile and wire up correctly

## 4. Shared test project

- [x] 4.1 Create `shared/GyrMonitor.Client.Core.Tests` (xunit/Moq/coverlet, matching the existing `*.Core.Tests` projects) referencing `shared/GyrMonitor.Client.Core`
- [x] 4.2 Move `SecureAuthSessionTests.cs` into the new project and delete both `desktop/GyrMonitor.Desktop.Core.Tests/Shared/Session/SecureAuthSessionTests.cs` and `mobile/GyrMonitor.Mobile.Core.Tests/Shared/Session/SecureAuthSessionTests.cs`
- [x] 4.3 Add tests in the new project for the moved `AuthApiClient`, `AlertsApiClient`, and the shared `SqliteSyncQueueRepository` base behavior
- [x] 4.4 Trim `desktop/GyrMonitor.Desktop.Core.Tests` and `mobile/GyrMonitor.Mobile.Core.Tests` sync-queue/auth/alerts tests down to only client-specific assertions (e.g. mobile keeps tests for `GetPendingForUserAsync`/`GetAllForUserAsync`)
- [x] 4.5 Add the new test project reference to `desktop/GyrMonitor.Desktop.slnx` and `mobile/GyrMonitor.Mobile.slnx`

## 5. Verification

- [x] 5.1 Run `dotnet test` for `desktop/GyrMonitor.Desktop.slnx`, `mobile/GyrMonitor.Mobile.slnx`, and the new `shared/GyrMonitor.Client.Core.Tests` project, confirming all pass with no assertion changes needed
- [x] 5.2 Grep the repo for any remaining references to the deleted namespaces/files to confirm the move is complete
- [x] 5.3 Confirm no changes to backend, database, or frontend code, and no changes to API contracts or persisted data
