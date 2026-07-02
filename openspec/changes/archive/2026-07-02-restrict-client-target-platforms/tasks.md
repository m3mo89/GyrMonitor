## 1. Desktop project: restrict to desktop platforms

- [x] 1.1 Edit `desktop/GyrMonitor.Desktop/GyrMonitor.Desktop.csproj` `TargetFrameworks` so it declares only `net10.0-maccatalyst` (non-Linux hosts) and `net10.0-windows10.0.19041.0` (Windows hosts), removing `net10.0-android` and `net10.0-ios`.
- [x] 1.2 Remove the now-orphaned `desktop/GyrMonitor.Desktop/Platforms/Android/` and `desktop/GyrMonitor.Desktop/Platforms/iOS/` folders.
- [x] 1.3 Confirm `desktop/GyrMonitor.Desktop/Platforms/MacCatalyst/` and `desktop/GyrMonitor.Desktop/Platforms/Windows/` are unchanged and still referenced by the remaining TFMs.

## 2. Mobile project: restrict to mobile platforms

- [x] 2.1 Edit `mobile/GyrMonitor.Mobile/GyrMonitor.Mobile.csproj` `TargetFrameworks` so it declares only `net10.0-android` (always) and `net10.0-ios` (non-Linux hosts), removing `net10.0-maccatalyst` and `net10.0-windows10.0.19041.0`.
- [x] 2.2 Remove the now-dead `CodesignMacCatalystNativeLibraries` MSBuild `Target` from `mobile/GyrMonitor.Mobile/GyrMonitor.Mobile.csproj` (its condition can never be true once `net10.0-maccatalyst` is no longer a target framework).
- [x] 2.3 Remove the now-orphaned `mobile/GyrMonitor.Mobile/Platforms/MacCatalyst/` and `mobile/GyrMonitor.Mobile/Platforms/Windows/` folders.
- [x] 2.4 Confirm `mobile/GyrMonitor.Mobile/Platforms/Android/` and `mobile/GyrMonitor.Mobile/Platforms/iOS/` are unchanged and still referenced by the remaining TFMs.

## 3. Verification

- [x] 3.1 Build the desktop project for its remaining TFMs (e.g. `dotnet build desktop/GyrMonitor.Desktop -f net10.0-maccatalyst` and/or the Windows TFM) and confirm success.
- [x] 3.2 Confirm `dotnet build desktop/GyrMonitor.Desktop -f net10.0-android` and `-f net10.0-ios` fail with an unsupported-target-framework error.
- [x] 3.3 Build the mobile project for its remaining TFMs (`dotnet build mobile/GyrMonitor.Mobile -f net10.0-android` and, on a non-Linux host, `-f net10.0-ios`) and confirm success.
- [x] 3.4 Confirm `dotnet build mobile/GyrMonitor.Mobile -f net10.0-maccatalyst` and `-f net10.0-windows10.0.19041.0` fail with an unsupported-target-framework error.
- [x] 3.5 Search `.github/workflows/` and `scripts/` for any hardcoded per-project TFM lists that assumed the old shared platform matrix, and update them if found.
- [x] 3.6 Run the existing desktop and mobile test suites (`desktop/GyrMonitor.Desktop.Core.Tests`, `mobile/GyrMonitor.Mobile.Core.Tests`, `shared/GyrMonitor.Client.Core.Tests`) to confirm no regressions from the `.csproj` edits.
