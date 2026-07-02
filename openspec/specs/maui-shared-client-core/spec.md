# MAUI Shared Client Core Specification

## Purpose

TBD - Define the shared .NET client core that provides reusable MAUI-neutral primitives (networking, session, storage, and sync primitive contracts) consumed by both the desktop and mobile client cores.

## Requirements

### Requirement: Shared MAUI-neutral client primitives
Desktop and mobile clients SHALL reference a shared .NET client core for reusable MAUI-neutral primitives instead of maintaining separate duplicate implementations.

#### Scenario: Shared core is referenced by both client cores
- **WHEN** desktop and mobile client core projects are built
- **THEN** both projects reference the shared client core for common networking, session, storage, and sync primitive contracts

#### Scenario: Platform UI remains outside shared core
- **WHEN** the shared client core project is inspected
- **THEN** it does not contain XAML pages, Shell routes, platform-specific MAUI startup code, or feature-specific desktop/mobile workflows

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
