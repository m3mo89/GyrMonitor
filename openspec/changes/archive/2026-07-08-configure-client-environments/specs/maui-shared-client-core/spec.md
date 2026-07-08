## ADDED Requirements

### Requirement: Shared runtime-selectable API environment

The shared client core SHALL provide a runtime-selectable, persisted API environment (Local/Development, Staging, Production) that both desktop and mobile consume instead of a fixed, compile-time `ApiOptions.BaseUrl`. All three environments SHALL always be selectable — none is excluded from the set of choices.

#### Scenario: Debug build defaults to Local/Development

- **WHEN** a Debug build starts with no previously persisted environment selection
- **THEN** the resolved API base URL is the head-supplied Local/Development default (unchanged from today's hardcoded value)

#### Scenario: Release build defaults to Production

- **WHEN** a Release build starts with no previously persisted environment selection
- **THEN** the resolved API base URL is the Production catalog URL

#### Scenario: Selecting any environment updates the API base URL without restart

- **WHEN** a client selects Local/Development, Staging, or Production through the shared environment service
- **THEN** subsequent API requests use the corresponding base URL immediately, without an app restart or DI re-registration

#### Scenario: Selected environment persists across restarts

- **WHEN** a client selects a non-default environment and the app is restarted
- **THEN** the previously selected environment is restored on startup, including when the persisted value is Production

#### Scenario: Unrecognized persisted value falls back to the build's default environment

- **WHEN** the persisted environment value is missing or corrupted
- **THEN** the shared environment service resolves to that build configuration's default environment (Local/Development in Debug, Production in Release) instead of failing or leaving `BaseUrl` unset

#### Scenario: Environment base URLs use the client host-only convention

- **WHEN** the shared catalog resolves the base URL for Staging or Production
- **THEN** the value contains no `/api/v1` suffix, consistent with how `ApiRequestSender` already builds request paths

### Requirement: Local environment default is supplied per client head

The shared client core SHALL let each MAUI head (desktop, mobile) supply its own Local/Development base URL default, since that value depends on the platform the head targets (e.g. the Android emulator loopback address).

#### Scenario: Desktop supplies its own Local/Development default

- **WHEN** the desktop head initializes the shared environment service
- **THEN** it supplies its existing Mac Catalyst/Windows-compatible loopback URL as the Local/Development default

#### Scenario: Mobile supplies its own Local/Development default per platform

- **WHEN** the mobile head initializes the shared environment service on Android
- **THEN** it supplies the Android emulator loopback URL as the Local/Development default
- **WHEN** the mobile head initializes the shared environment service on a non-Android platform
- **THEN** it supplies the same loopback URL desktop uses
