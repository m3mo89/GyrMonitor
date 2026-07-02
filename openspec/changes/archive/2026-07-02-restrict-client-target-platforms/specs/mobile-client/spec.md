## MODIFIED Requirements

### Requirement: Mobile project foundation
The mobile client SHALL be a generated `.NET MAUI` project under `mobile/` following the feature-based `MVVM` structure documented in `knowledge-base/06-engineering/mobile/maui-architecture.md`, replacing the current placeholder scaffolding. The mobile project SHALL target only mobile platforms (`net10.0-android` and `net10.0-ios`) and SHALL NOT declare `net10.0-maccatalyst` or `net10.0-windows10.0.19041.0` as target frameworks.

#### Scenario: Mobile project builds
- **WHEN** the mobile `.NET MAUI` project is built with the documented setup path
- **THEN** the build succeeds and produces the `Authentication`, `Alerts`, `Observations`, and `Sync` feature areas under `Features/`, with storage and networking isolated under `Shared/`

#### Scenario: Mobile project has no desktop target frameworks
- **WHEN** the mobile `.NET MAUI` project's `TargetFrameworks` are inspected
- **THEN** the list does not include `net10.0-maccatalyst` or `net10.0-windows10.0.19041.0`

#### Scenario: Building mobile for a desktop target fails
- **WHEN** a build is attempted against the mobile project with `-f net10.0-maccatalyst` or `-f net10.0-windows10.0.19041.0`
- **THEN** the build fails because the mobile project does not declare that target framework
