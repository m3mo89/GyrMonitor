## MODIFIED Requirements

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
