# MVP Release Smoke Checklist

Use this checklist after running automated tests to validate the end-to-end MVP release path.

## Prerequisites

- Backend is running with migrations and seed data applied.
- Desktop and mobile clients point to the same backend base URL.
- Test accounts exist for `ADMIN`, `FIELD_OPERATOR`, `RESEARCHER`, and `SYSTEM_GENERATOR`.

## Smoke Flow

1. Log in on desktop as `ADMIN`.
2. Open the event simulator.
3. Refresh/load cattle records and select a visible cattle option.
4. Generate an inactivity event.
5. Open desktop sync and synchronize pending events.
6. Verify the sync response/status reports created or duplicate event outcomes with server ids.
7. Verify alerts/dashboard reflect backend state for the generated inactivity context.
8. Log in on mobile as `FIELD_OPERATOR`.
9. Open alerts, select an alert, and capture an observation.
10. Verify mobile pending sync count includes the saved observation.
11. Synchronize mobile observations.
12. Verify the synced observation is returned by backend alert observation consultation.
13. Log out or replace the mobile session with a second user.
14. Verify the second user does not see or sync the first user's pending observations.
15. Log in on mobile as `RESEARCHER` or `SYSTEM_GENERATOR`.
16. Verify mobile blocks alert review, observation capture, and sync workflows for unsupported roles.

## Evidence To Record

- Backend test command results.
- Desktop core test command results.
- Mobile core test command results.
- Frontend test command results.
- For failures, identify the boundary: local SQLite queue, sync API response, backend sync log, or persisted event/observation data.

## Mobile Observation Path

Mobile observations are saved offline first into the mobile SQLite database at the MAUI `FileSystem.AppDataDirectory` path as `gyrmonitor-mobile.db3`.

- `PendingObservation` stores the local observation payload and `OwnerUserId`.
- `SyncQueueItem` stores retry/status metadata and the same `OwnerUserId`.
- `MobileSyncService` sends only the active supported user's pending observations to `POST /api/v1/sync/observations`.
- Backend persists synchronized observations through the inspections/observations capability.
- Web and backend consumers can consult synced observations with `GET /api/v1/alerts/{id}/observations`.

## Shared Client Core

Desktop and mobile share low-level MAUI-neutral primitives in `shared/GyrMonitor.Client.Core`:

- networking envelope and request sender
- auth session contracts and events
- SQLite connection provider contract
- sync queue/status/operation primitives
- idempotency-key generation

Desktop and mobile feature workflows remain separate because they solve different MVP jobs: desktop handles cattle/dashboard/event simulation, while mobile handles field alert review and observation capture.

## Mobile Role And User Scope

The mobile MVP workflow is available to `FIELD_OPERATOR`; `ADMIN` is allowed for support/testing. `RESEARCHER` and `SYSTEM_GENERATOR` must not access mobile alert review, observation capture, or sync workflows.

Local mobile observations and sync queue rows are scoped by authenticated `UserId`. A second user on the same device must not see, count, or synchronize another user's pending observations.
