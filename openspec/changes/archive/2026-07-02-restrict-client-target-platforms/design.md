## Context

`desktop/GyrMonitor.Desktop/GyrMonitor.Desktop.csproj` and `mobile/GyrMonitor.Mobile/GyrMonitor.Mobile.csproj` were both generated from the same `.NET MAUI` template and still carry the template's full `TargetFrameworks` matrix:

```xml
<TargetFrameworks>net10.0-android</TargetFrameworks>
<TargetFrameworks Condition="!$([MSBuild]::IsOSPlatform('linux'))">$(TargetFrameworks);net10.0-ios;net10.0-maccatalyst</TargetFrameworks>
<TargetFrameworks Condition="$([MSBuild]::IsOSPlatform('windows'))">$(TargetFrameworks);net10.0-windows10.0.19041.0</TargetFrameworks>
```

Both projects currently resolve to the same set: `android`, `ios`, `maccatalyst` (non-Linux), and `windows` (Windows only). This means `dotnet build -f net10.0-android` succeeds against the desktop project, and `dotnet build -f net10.0-windows10.0.19041.0` succeeds against the mobile project, even though neither app's UI, navigation, or feature set (per `openspec/specs/desktop-client/spec.md` and `openspec/specs/mobile-client/spec.md`) was designed for the other form factor.

## Goals / Non-Goals

**Goals:**

- Desktop project (`GyrMonitor.Desktop.csproj`) only exposes desktop target frameworks: Mac Catalyst (non-Linux dev/build hosts) and Windows (on Windows hosts).
- Mobile project (`GyrMonitor.Mobile.csproj`) only exposes mobile target frameworks: Android (always) and iOS (non-Linux dev/build hosts).
- Platform-specific build steps (e.g. the Mac Catalyst native-library codesign `Target`) stay attached only to the project(s) that still target that platform.
- Existing platform-specific code (e.g. `Platforms/Android`, `Platforms/iOS`, `Platforms/MacCatalyst`, `Platforms/Windows` folders) is left in place unless it's dead weight for a platform the project no longer targets, since `.NET MAUI` only compiles the `Platforms/<X>` folder matching an active TFM.

**Non-Goals:**

- No change to shared business logic in `shared/GyrMonitor.Client.Core`, `desktop/GyrMonitor.Desktop.Core`, or `mobile/GyrMonitor.Mobile.Core` — this is a target-framework/build-surface change only.
- No change to app behavior, UI, authentication, sync, or any other spec-level runtime capability.
- No introduction of a new shared "platform policy" abstraction — this is a straightforward `TargetFrameworks` edit, not a new build system.

## Decisions

**Decision: Edit `TargetFrameworks` directly in each `.csproj` rather than adding a new MSBuild property/import.**
Both projects are small, single-purpose MAUI heads. A shared `.props` file or custom MSBuild condition would add indirection for two lines of XML that are unlikely to need to stay in sync (desktop and mobile platforms are permanently different by design). Keep the fix local and readable in each project file.

Desktop `TargetFrameworks`:

```xml
<TargetFrameworks Condition="!$([MSBuild]::IsOSPlatform('linux'))">net10.0-maccatalyst</TargetFrameworks>
<TargetFrameworks Condition="$([MSBuild]::IsOSPlatform('windows'))">$(TargetFrameworks);net10.0-windows10.0.19041.0</TargetFrameworks>
```

On Linux, desktop has no buildable TFM under this project (Mac Catalyst and Windows are both unavailable there) — same constraint the template already implied by gating those TFMs behind non-Linux/Windows conditions.

Mobile `TargetFrameworks`:

```xml
<TargetFrameworks>net10.0-android</TargetFrameworks>
<TargetFrameworks Condition="!$([MSBuild]::IsOSPlatform('linux'))">$(TargetFrameworks);net10.0-ios</TargetFrameworks>
```

Android remains buildable everywhere (including Linux CI runners), iOS added on non-Linux hosts — unchanged from today's mobile behavior, just with `maccatalyst` and `windows` removed.

**Decision: Drop the Mac Catalyst codesign `Target` from `GyrMonitor.Mobile.csproj`, keep it in `GyrMonitor.Desktop.csproj`.**
That `Target` is conditioned on `'$(TargetFramework)' == 'net10.0-maccatalyst'`, so once mobile no longer has a `net10.0-maccatalyst` TFM the condition can never be true — the block becomes dead code. Removing it avoids confusion for future readers about which project still ships as a Mac Catalyst app. Desktop keeps its (slightly more complete, Team-ID-signing) version since desktop remains a Mac Catalyst target.

**Alternative considered and rejected: `RuntimeIdentifier`/`SupportedOSPlatformVersion` gating instead of `TargetFrameworks`.**
Restricting only at the runtime-identifier or platform-version level wouldn't actually stop `dotnet build -f net10.0-android` from succeeding against the desktop project — the TFM itself must be removed to make the wrong-platform build fail outright, which is the behavior this change wants (build-time enforcement, not just a packaging convention).

## Risks / Trade-offs

- [Risk] CI pipelines or local scripts that currently build/test all four TFMs per project (if any) will start failing for the now-removed TFMs → Mitigation: covered in `tasks.md` as an explicit verification step; update any matrix definitions found.
- [Risk] `Platforms/MacCatalyst` or `Platforms/Windows` folders under `mobile/GyrMonitor.Mobile/`, or `Platforms/Android`/`Platforms/iOS` under `desktop/GyrMonitor.Desktop/`, become unused source that MAUI simply won't compile once the TFM is gone, but stays in the repo as clutter → Mitigation: check for and remove any such now-orphaned platform folders during implementation; keep the projects that still use a platform untouched.
- [Trade-off] Desktop becomes unbuildable on Linux hosts (no Mac Catalyst, no Windows TFM available there) → Accepted: this matches the existing template's own conditions, which already made Mac Catalyst and Windows non-Linux/Windows-only; Linux was never a supported desktop build host for this app.

## Migration Plan

1. Edit `desktop/GyrMonitor.Desktop/GyrMonitor.Desktop.csproj` `TargetFrameworks` to drop `net10.0-android` and `net10.0-ios`.
2. Edit `mobile/GyrMonitor.Mobile/GyrMonitor.Mobile.csproj` `TargetFrameworks` to drop `net10.0-maccatalyst` and `net10.0-windows10.0.19041.0`.
3. Remove the now-dead Mac Catalyst codesign `Target` from the mobile `.csproj`.
4. Search for and remove any orphaned `Platforms/<removed-TFM>` folders in each project.
5. Search CI workflow files and build scripts for hardcoded TFM lists per project and align them.
6. Build each project locally (or in CI) to confirm the desktop project no longer offers `net10.0-android`/`net10.0-ios` as a valid `-f` target, and the mobile project no longer offers `net10.0-maccatalyst`/`net10.0-windows10.0.19041.0`.

Rollback: revert the `.csproj` edits; no data migration or backend changes are involved.

## Open Questions

- None — this is a scoped, mechanical build-configuration change with no unresolved product decisions.
