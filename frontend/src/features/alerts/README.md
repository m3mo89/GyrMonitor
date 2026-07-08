# Alerts Feature Boundary

Implemented: alerts list and detail pages, observations list, and the `ADMIN`/`FIELD_OPERATOR` status-transition workflow (`PENDING` -> `IN_PROGRESS` -> `ATTENDED`).

```text
domain/          Alert, observation, severity and status types
application/     Alert list/detail/observation queries and status mutation orchestration
infrastructure/  Alerts HTTP API adapter
presentation/    List/detail pages and alert badge presentation helpers
```
