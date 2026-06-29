---
title: DTO Catalog
area: api
version: 0.5.0
status: approved
owner: backend
last_updated: 2026-06-26
---

# DTO Catalog

## Purpose

This catalog centralizes request and response DTOs for GyrMonitor API contracts. DTOs are external contracts and must not be coupled directly to ORM models.

## Authentication DTOs

### LoginRequestDto

```json
{
  "email": "admin@gyrmonitor.local",
  "password": "********"
}
```

### LoginResponseDto

```json
{
  "accessToken": "jwt-token",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "name": "Administrador",
    "email": "admin@gyrmonitor.local",
    "role": "ADMIN"
  }
}
```

## Cattle DTOs

### CattleListItemDto

```json
{
  "id": "uuid",
  "tagNumber": "GYR-023",
  "breed": "Gyr",
  "sex": "FEMALE",
  "status": "ACTIVE",
  "lastRiskScore": 87.5
}
```

## Event DTOs

### RegisterActivityEventRequestDto

```json
{
  "eventId": "uuid",
  "deviceId": "SIM-001",
  "cattleId": "uuid",
  "eventType": "INACTIVITY",
  "inactiveMinutes": 95,
  "confidence": 0.87,
  "capturedAt": "2026-06-20T12:30:00Z",
  "source": "DESKTOP_SIMULATOR"
}
```

### RegisterActivityEventResponseDto

```json
{
  "eventId": "uuid",
  "riskScore": 78.5,
  "severity": "HIGH",
  "alertGenerated": true,
  "alertId": "uuid"
}
```

## Alert DTOs

### AlertListItemDto

```json
{
  "id": "uuid",
  "cattleId": "uuid",
  "tagNumber": "GYR-023",
  "severity": "HIGH",
  "riskScore": 87.5,
  "status": "PENDING",
  "reason": "Inactividad prolongada",
  "createdAt": "2026-06-20T12:40:00Z"
}
```

### UpdateAlertStatusRequestDto

```json
{
  "status": "ATTENDED",
  "attendedAt": "2026-06-20T13:10:00Z"
}
```

## Observation DTOs

### AddAlertObservationRequestDto

```json
{
  "observationId": "uuid",
  "comment": "El animal fue revisado. Se observó baja movilidad.",
  "createdAt": "2026-06-20T13:00:00Z",
  "clientId": "MOBILE-001"
}
```

## Sync DTOs

### SyncEventsRequestDto

```json
{
  "clientId": "MOBILE-001",
  "deviceId": "DEVICE-001",
  "items": [
    {
      "localId": "local-uuid",
      "eventId": "uuid",
      "cattleId": "uuid",
      "eventType": "INACTIVITY",
      "inactiveMinutes": 80,
      "confidence": 0.85,
      "capturedAt": "2026-06-20T12:00:00Z",
      "source": "MOBILE_CLIENT"
    }
  ]
}
```

### SyncEventsResponseDto

```json
{
  "processed": 1,
  "created": 1,
  "duplicates": 0,
  "failed": 0,
  "results": []
}
```

## DTO Rules

- Request DTO names must end with `RequestDto`.
- Response DTO names must end with `ResponseDto`.
- List item DTO names should end with `ListItemDto`.
- DTOs must use camelCase JSON fields.
- DTOs must validate required fields before use case execution.

## References

- `00-introduction/STYLE_GUIDE.md`
- `05-api/conventions.md`
- `06-engineering/backend/overview.md`
