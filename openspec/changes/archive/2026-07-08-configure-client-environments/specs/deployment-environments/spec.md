## ADDED Requirements

### Requirement: Environment desktop and mobile client binding, with Production as a one-way destination

The system SHALL define the same development/staging/production backend targets for the desktop and mobile clients as for the web frontend, selectable at runtime from within each client's login screen, except that the picker is hidden once the current environment is Production (Release builds start there by default; Debug builds can reach it by selection).

#### Scenario: Debug client Local/Development default matches backend default bind address

- **WHEN** a Debug desktop or mobile client starts with no previously persisted environment
- **THEN** it targets the same local backend address documented for frontend development (`127.0.0.1:3000`, with the Android emulator's `10.0.2.2` loopback case)

#### Scenario: Client Staging target matches the deployed staging backend

- **WHEN** a desktop or mobile client is set to Staging
- **THEN** it targets `https://gyrmonitor-staging.up.railway.app`, the same Railway staging backend used by the web frontend

#### Scenario: Client Production target matches the deployed production backend

- **WHEN** a desktop or mobile client is set to Production (by selection in Debug, or by default in Release)
- **THEN** it targets `https://gyrmonitor-production.up.railway.app`, the same Railway production backend used by the web frontend

#### Scenario: Reaching Production hides further in-app switching

- **WHEN** a desktop or mobile client's current environment becomes Production, whether by explicit selection or by Release default
- **THEN** the environment picker is no longer available in the app, and returning to Local/Development or Staging requires clearing the client's persisted environment state outside the app

#### Scenario: Client environment selection is documented as in-app, not a rebuild

- **WHEN** someone follows desktop/mobile setup or deployment documentation to change environments
- **THEN** the documentation describes picking the environment from the running app's login screen (while available) instead of editing `MauiProgram.ApiBaseUrl` and rebuilding, and notes that the picker disappears once Production is reached
