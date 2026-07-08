# MAUI Shared Client Core Specification

## Purpose

TBD - Define the shared .NET client core that provides reusable MAUI-neutral primitives (networking, session, storage, and sync primitive contracts) consumed by both the desktop and mobile client cores.

## Requirements

### Requirement: Shared MAUI-neutral client primitives

Desktop and mobile clients SHALL reference a shared .NET client core for reusable MAUI-neutral primitives instead of maintaining separate duplicate implementations. This includes the authentication API contract, the alerts read contract, and the common sync-queue repository behavior, in addition to networking, session, and storage primitives.

#### Scenario: Shared core is referenced by both client cores

- **WHEN** desktop and mobile client core projects are built
- **THEN** both projects reference the shared client core for common networking, session, storage, authentication API contract, alerts read contract, and sync primitive contracts

#### Scenario: Platform UI remains outside shared core

- **WHEN** the shared client core project is inspected
- **THEN** it does not contain XAML pages, Shell routes, platform-specific MAUI startup code, or feature-specific desktop/mobile workflows

#### Scenario: Authentication and alerts read contracts are not duplicated per client

- **WHEN** either client authenticates a user or reads the alerts list from the backend
- **THEN** it uses the shared client core's authentication API contract and alerts read contract instead of a client-local copy of the same DTOs and API client

#### Scenario: Common sync-queue repository behavior is shared, entity-agnostic extensions are not

- **WHEN** either client persists or reads sync-queue items using their common (non-user-scoped) operations
- **THEN** both clients use the shared client core's sync-queue repository base implementation
- **WHEN** a client needs behavior beyond the shared base, such as mobile's per-user-scoped sync-queue queries
- **THEN** that client extends the shared base locally instead of the shared base growing client-specific methods

### Requirement: Shared sync primitives

The shared client core SHALL provide common sync statuses, operations, entity type identifiers, queue metadata shape, and idempotency-key generation usable by desktop event sync and mobile observation sync.

#### Scenario: Desktop and mobile compute stable idempotency keys consistently

- **WHEN** either client computes an idempotency key for the same unordered set of entity ids
- **THEN** the shared helper returns the same stable key regardless of item order

#### Scenario: Entity-specific payloads remain separate

- **WHEN** desktop syncs events and mobile syncs observations
- **THEN** each client keeps its entity-specific request DTOs and sync service behavior while reusing shared primitive values and helpers

### Requirement: Shared authenticated API request behavior

The shared client core SHALL centralize authenticated API request behavior so desktop and mobile use the same envelope parsing, bearer-token handling, idempotency header behavior, and standardized error handling.

#### Scenario: Authenticated request includes session token

- **WHEN** either client sends an authenticated API request with a stored session
- **THEN** the request uses the shared sender behavior to include the bearer token and parse the standardized API response envelope

#### Scenario: Sync request includes idempotency key

- **WHEN** either client sends a sync request with an idempotency key
- **THEN** the shared sender behavior includes the `Idempotency-Key` header without duplicating header logic in each client

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
