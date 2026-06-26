# Sample Payloads

## Alert Response

```json
{
  "success": true,
  "data": [
    {
      "id": "00000000-0000-0000-0000-000000000201",
      "cattleId": "00000000-0000-0000-0000-000000000101",
      "tagNumber": "GYR-023",
      "severity": "HIGH",
      "riskScore": 87.5,
      "status": "PENDING",
      "reason": "Inactividad prolongada",
      "createdAt": "2026-06-20T12:40:00Z"
    }
  ]
}
```

## Sync Events Request

```json
{
  "clientId": "MOBILE-001",
  "deviceId": "DEVICE-001",
  "items": [
    {
      "localId": "local-001",
      "eventId": "00000000-0000-0000-0000-000000000301",
      "cattleId": "00000000-0000-0000-0000-000000000101",
      "eventType": "INACTIVITY",
      "inactiveMinutes": 80,
      "confidence": 0.85,
      "capturedAt": "2026-06-20T12:00:00Z"
    }
  ]
}
```
