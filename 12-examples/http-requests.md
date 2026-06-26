# HTTP Request Examples

## Login

```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@gyrmonitor.local",
  "password": "password"
}
```

## Register Activity Event

```http
POST http://localhost:3000/api/v1/events
Authorization: Bearer <token>
Content-Type: application/json
Idempotency-Key: event-001

{
  "eventId": "00000000-0000-0000-0000-000000000001",
  "deviceId": "SIM-001",
  "cattleId": "00000000-0000-0000-0000-000000000101",
  "eventType": "INACTIVITY",
  "inactiveMinutes": 95,
  "confidence": 0.87,
  "capturedAt": "2026-06-20T12:30:00Z",
  "source": "DESKTOP_SIMULATOR"
}
```

## Get Alerts

```http
GET http://localhost:3000/api/v1/alerts?status=PENDING&severity=HIGH
Authorization: Bearer <token>
Accept: application/json
```
