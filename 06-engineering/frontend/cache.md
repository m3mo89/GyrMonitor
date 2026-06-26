# Frontend Cache Strategy

The web frontend uses cache for responsive reading and resilience during temporary network failures.

## Principles

- Dashboard data can be briefly stale if clearly indicated.
- Alert lists should refetch when users return to the screen.
- Historical cattle data may have longer stale time than active alerts.
- Mutations should invalidate affected queries.

## Suggested Query Policies

| Data | Stale Policy |
|---|---|
| Dashboard metrics | Short stale time |
| Active alerts | Very short stale time |
| Cattle list | Medium stale time |
| Cattle history | Medium stale time |
| Static catalogs | Long stale time |

## User Experience

When showing cached data after a failed request, display a non-intrusive stale data indicator.
