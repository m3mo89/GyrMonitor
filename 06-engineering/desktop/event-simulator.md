# Event Simulator

The event simulator helps validate backend behavior using controlled activity and inactivity events.

## Responsibilities

- Generate activity and inactivity events.
- Assign events to existing cattle.
- Set `inactiveMinutes`, `confidence`, `capturedAt` and `source`.
- Send events to `POST /events` or queue them for offline sync.
- Allow controlled testing of alert generation rules.

## Example Event

```json
{
  "eventId": "uuid",
  "deviceId": "DESKTOP-SIM-001",
  "cattleId": "uuid",
  "eventType": "INACTIVITY",
  "inactiveMinutes": 95,
  "confidence": 0.87,
  "capturedAt": "2026-06-20T12:30:00Z",
  "source": "DESKTOP_SIMULATOR"
}
```

## Rule

Simulator events must be clearly traceable and must not be confused with manually captured events.
