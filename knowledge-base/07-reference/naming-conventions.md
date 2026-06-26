---
title: Naming Conventions
section: 07-reference
status: approved
version: 0.7.0
---

# Naming Conventions

## API Routes

Use plural, lowercase, kebab-case resource names.

```text
GET /cattle
POST /events
GET /alerts
PATCH /alerts/{id}/status
POST /sync/events
```

Avoid action-style routes such as `/GetAlerts` or `/CreateEvent`.

## JSON Fields

Use `camelCase`.

```json
{
  "inactiveMinutes": 95,
  "capturedAt": "2026-06-20T12:30:00Z"
}
```

## Backend Classes

| Type | Convention | Example |
|---|---|---|
| Controller | `<Resource>Controller` | `AlertsController` |
| Use Case | `<Action><Resource>UseCase` | `RegisterActivityEventUseCase` |
| Repository Port | `I<Resource>Repository` | `IAlertRepository` |
| Repository Implementation | `<Resource>Repository` | `AlertRepository` |
| DTO | `<Action><Resource>RequestDto` | `UpdateAlertStatusRequestDto` |
| Response DTO | `<Resource>ResponseDto` | `AlertResponseDto` |
| Domain Service | `<Capability>Service` | `RiskCalculationService` |
| Value Object | `<Concept>` | `RiskScore` |

## Frontend Naming

| Type | Convention | Example |
|---|---|---|
| Feature folder | lowercase domain name | `alerts` |
| Page component | `<Feature>Page` | `AlertsPage` |
| UI component | PascalCase | `AlertSeverityBadge` |
| Query hook | `use<Feature>Query` | `useAlertsQuery` |
| Mutation hook | `use<Action><Feature>Mutation` | `useUpdateAlertStatusMutation` |
| API client | `<feature>Api` | `alertsApi` |
| Type | PascalCase | `AlertListItem` |

## Database Naming

| Element | Convention | Example |
|---|---|---|
| Table | snake_case plural | `activity_events` |
| Column | snake_case | `inactive_minutes` |
| Primary key | `id` | `id` |
| Foreign key | `<entity>_id` | `cattle_id` |
| Timestamp | snake_case | `created_at` |

## Documentation Naming

Use lowercase kebab-case file names.

```text
activity-events.md
risk-analysis.md
offline-sync.md
error-codes.md
```
