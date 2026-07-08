## MODIFIED Requirements

### Requirement: Desktop project foundation

The desktop client SHALL be a generated `.NET MAUI` project under `desktop/` following the feature-based `MVVM` structure documented in `knowledge-base/06-engineering/desktop/maui-desktop.md`, replacing the current placeholder scaffolding. The desktop project SHALL target only desktop platforms (`net10.0-maccatalyst` and `net10.0-windows10.0.19041.0`) and SHALL NOT declare `net10.0-android` or `net10.0-ios` as target frameworks.

#### Scenario: Desktop project builds

- **WHEN** the desktop `.NET MAUI` project is built with the documented setup path
- **THEN** the build succeeds and produces the `Authentication`, `Dashboard`, `Cattle`, `Alerts`, `EventSimulator`, and `Sync` feature areas under `Features/`, with storage and networking isolated under `Shared/`

#### Scenario: Desktop project has no mobile target frameworks

- **WHEN** the desktop `.NET MAUI` project's `TargetFrameworks` are inspected
- **THEN** the list does not include `net10.0-android` or `net10.0-ios`

#### Scenario: Building desktop for a mobile target fails

- **WHEN** a build is attempted against the desktop project with `-f net10.0-android` or `-f net10.0-ios`
- **THEN** the build fails because the desktop project does not declare that target framework
