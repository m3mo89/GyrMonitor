# Inspections Module

Implements field observations recorded against an alert.

- `POST /alerts/:alertId/observations` (`ADMIN`, `FIELD_OPERATOR`) — adds a field observation to an alert, supports an idempotent `observationId`/`clientId` for offline-sync replays.
- `GET /alerts/:alertId/observations` (`ADMIN`, `FIELD_OPERATOR`, `RESEARCHER`) — lists observations recorded against an alert.

See `knowledge-base/05-api/observations.md` and `knowledge-base/02-domain/inspections.md` for the full contract and domain model.
