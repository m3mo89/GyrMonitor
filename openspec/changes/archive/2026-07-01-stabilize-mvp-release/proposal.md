## Why

The MVP currently has the main backend, desktop, and mobile flows in place, but release validation still depends on manual UUID entry and duplicated MAUI client logic that can drift between desktop and mobile. This change stabilizes the release path by making offline capture/sync flows traceable, easier to operate, and consistent enough to verify end to end.

## What Changes

- Introduce a shared MAUI client core for cross-client primitives that are currently duplicated in `Desktop.Core` and `Mobile.Core`, including networking envelopes, request sending, auth session contracts, SQLite connection contracts, sync queue models, statuses, and idempotency helpers.
- Keep desktop and mobile feature modules separate where their domain workflows differ: desktop remains focused on cattle/dashboard/event simulation/event sync, while mobile remains focused on alerts/observation capture/observation sync.
- Clarify and verify where mobile observations go: observations are saved locally as `PendingObservation` rows plus `SyncQueue` entries, then sent to `POST /api/v1/sync/observations`, which delegates to inspections and persists backend observations idempotently.
- Restrict mobile app workflows to supported roles after login, with the MVP mobile workflow intended for `FIELD_OPERATOR` and optionally `ADMIN` support/testing access.
- Scope mobile offline observations, local alert cache, and sync queue processing by authenticated user so one user's pending observations are never shown or synchronized by another user on the same device.
- Remove the need to manually type UUIDs in the desktop simulator by integrating cattle lookup/selection from the existing cattle API flow and preserving the selected `cattleId` in generated pending events.
- Add release smoke validation that exercises login, desktop event generation and sync, alert creation/visibility, mobile observation capture and sync, and backend observation persistence.

## Capabilities

### New Capabilities

- `maui-shared-client-core`: Shared MAUI client contracts and primitives reused by desktop and mobile without collapsing their distinct feature implementations.
- `mvp-release-validation`: End-to-end release validation for the MVP client/backend/offline-sync flows.

### Modified Capabilities

- `desktop-client`: Desktop event simulator must allow selecting cattle without manual UUID entry while still generating idempotent offline-first events.
- `mobile-client`: Mobile observation capture and sync behavior must expose a verifiable offline-to-backend path for release validation.
- `offline-sync`: Sync behavior must remain idempotent and traceable across desktop event sync and mobile observation sync after shared-client-core extraction.
- `observations`: Observation persistence must be verifiable from mobile offline capture through backend storage and duplicate handling.

## Impact

- Affected client code: `desktop/GyrMonitor.Desktop.Core`, `desktop/GyrMonitor.Desktop`, `mobile/GyrMonitor.Mobile.Core`, `mobile/GyrMonitor.Mobile`, and their tests.
- Affected backend/API flows: `POST /api/v1/sync/events`, `POST /api/v1/sync/observations`, `GET /api/v1/cattle`, `GET /api/v1/alerts`, and `GET/POST /api/v1/alerts/:alertId/observations`.
- Potential project structure impact: add a MAUI-neutral shared .NET core project referenced by both desktop and mobile core projects.
- No breaking API changes are intended; behavior should remain contract-compatible while improving client reuse and release operability.
