## Why

The desktop and mobile `.NET MAUI` projects both currently declare the exact same `TargetFrameworks` (Android, iOS, Mac Catalyst, and Windows), so `desktop/GyrMonitor.Desktop` can be built and run as an Android/iOS app and `mobile/GyrMonitor.Mobile` can be built and run on Windows/Mac Catalyst. This blurs the product boundary between the two clients, lets each app ship to platforms it was never designed or tested for, and risks store submissions or release builds targeting the wrong platform.

## What Changes

- **BREAKING**: `desktop/GyrMonitor.Desktop/GyrMonitor.Desktop.csproj` no longer targets `net10.0-android` or `net10.0-ios`; it targets only the desktop platforms (`net10.0-windows10.0.19041.0` on Windows, `net10.0-maccatalyst` elsewhere on non-Linux).
- **BREAKING**: `mobile/GyrMonitor.Mobile/GyrMonitor.Mobile.csproj` no longer targets `net10.0-maccatalyst` or `net10.0-windows10.0.19041.0`; it targets only the mobile platforms (`net10.0-android` always, plus `net10.0-ios` on non-Linux).
- Remove or scope out any platform-specific build/codesign targets (e.g. the Mac Catalyst native-library codesign step) that no longer apply once a project stops targeting that platform.
- Update CI/build documentation or scripts that assume the previous shared target list, if any reference desktop-as-mobile or mobile-as-desktop builds.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `desktop-client`: the "Desktop project foundation" requirement now also constrains the project to desktop-only target platforms (Windows, Mac Catalyst) and excludes Android/iOS.
- `mobile-client`: the "Mobile project foundation" requirement now also constrains the project to mobile-only target platforms (Android, iOS) and excludes Mac Catalyst/Windows.

## Impact

- Affected code: `desktop/GyrMonitor.Desktop/GyrMonitor.Desktop.csproj`, `mobile/GyrMonitor.Mobile/GyrMonitor.Mobile.csproj`, and any `Platforms/` folders or codesign build targets tied to a now-removed target framework.
- Affected builds: local `dotnet build -f <tfm>` invocations, CI matrix (if it builds all four TFMs per project), and any packaging/publish scripts that assume both projects support all four platforms.
- No backend, shared client core, or spec-level runtime behavior changes — this is a build/target-platform scoping change only.
