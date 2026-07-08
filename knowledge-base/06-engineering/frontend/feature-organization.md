# Frontend Feature Organization

The frontend follows feature-based organization aligned with Screaming Architecture.

## Features

| Feature | Main Responsibility |
| --- | --- |
| `auth` | Login, session, route guards |
| `dashboard` | Metrics, risk ranking, trends |
| `cattle` | Cattle list and detail history |
| `events` | Activity event timeline and filters |
| `alerts` | Alert list, detail and status information |
| `metrics` | Charts and analytics components |

## Feature Shape

```text
features/alerts/
  domain/
  application/
  infrastructure/
  presentation/
```

Use this Clean Architecture shape for features with mutations, multiple pages, route-level orchestration, browser/storage adapters or client-side business validation. Keep the business feature folder first; technical layers stay nested inside the capability.

## Shared Components

Only promote a component to `shared/components` after it is used by at least two features or is clearly part of the design system.
