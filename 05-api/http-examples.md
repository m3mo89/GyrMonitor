---
title: HTTP Examples
area: api
version: 0.5.0
status: approved
owner: backend
last_updated: 2026-06-26
---

# HTTP Examples

## Purpose

This document provides copy-ready HTTP examples for local testing in VS Code REST Client, Postman or similar tools.

## Variables

```http
@baseUrl = http://localhost:3000/api/v1
@token = jwt-token
@cattleId = 00000000-0000-0000-0000-000000000001
@alertId = 00000000-0000-0000-0000-000000000002
```

## Login

```http
POST {{baseUrl}}/auth/login
Content-Type: application/json
Accept: application/json

{
  "email": "admin@gyrmonitor.local",
  "password": "password"
}
```

## Dashboard

```http
GET {{baseUrl}}/dashboard
Authorization: Bearer {{token}}
Accept: application/json
```

## List Cattle

```http
GET {{baseUrl}}/cattle?page=1&pageSize=20
Authorization: Bearer {{token}}
Accept: application/json
```

## Register Inactivity Event

```http
POST {{baseUrl}}/events
Authorization: Bearer {{token}}
Content-Type: application/json
Accept: application/json
Idempotency-Key: event-{{$guid}}
X-Client-Id: DESKTOP-001

{
  "eventId": "00000000-0000-0000-0000-000000000010",
  "deviceId": "SIM-001",
  "cattleId": "{{cattleId}}",
  "eventType": "INACTIVITY",
  "inactiveMinutes": 95,
  "confidence": 0.87,
  "capturedAt": "2026-06-20T12:30:00Z",
  "source": "DESKTOP_SIMULATOR"
}
```

## List Alerts

```http
GET {{baseUrl}}/alerts?status=PENDING&severity=HIGH&page=1&pageSize=20
Authorization: Bearer {{token}}
Accept: application/json
```

## Attend Alert

```http
PATCH {{baseUrl}}/alerts/{{alertId}}/status
Authorization: Bearer {{token}}
Content-Type: application/json
Accept: application/json

{
  "status": "ATTENDED",
  "attendedAt": "2026-06-20T13:10:00Z"
}
```

## Add Observation

```http
POST {{baseUrl}}/alerts/{{alertId}}/observations
Authorization: Bearer {{token}}
Content-Type: application/json
Accept: application/json
Idempotency-Key: observation-{{$guid}}
X-Client-Id: MOBILE-001

{
  "observationId": "00000000-0000-0000-0000-000000000020",
  "comment": "El animal fue revisado. Se observó baja movilidad.",
  "createdAt": "2026-06-20T13:00:00Z",
  "clientId": "MOBILE-001"
}
```

## Sync Events

```http
POST {{baseUrl}}/sync/events
Authorization: Bearer {{token}}
Content-Type: application/json
Accept: application/json
Idempotency-Key: sync-events-{{$guid}}
X-Client-Id: MOBILE-001

{
  "clientId": "MOBILE-001",
  "deviceId": "DEVICE-001",
  "items": [
    {
      "localId": "local-uuid",
      "eventId": "00000000-0000-0000-0000-000000000030",
      "cattleId": "{{cattleId}}",
      "eventType": "INACTIVITY",
      "inactiveMinutes": 80,
      "confidence": 0.85,
      "capturedAt": "2026-06-20T12:00:00Z"
    }
  ]
}
```

## Sync Observations

```http
POST {{baseUrl}}/sync/observations
Authorization: Bearer {{token}}
Content-Type: application/json
Accept: application/json
Idempotency-Key: sync-observations-{{$guid}}
X-Client-Id: MOBILE-001

{
  "clientId": "MOBILE-001",
  "items": [
    {
      "localId": "local-uuid",
      "observationId": "00000000-0000-0000-0000-000000000040",
      "alertId": "{{alertId}}",
      "comment": "Observación registrada en campo sin conexión.",
      "createdAt": "2026-06-20T13:00:00Z"
    }
  ]
}
```
