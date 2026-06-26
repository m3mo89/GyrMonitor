---
title: Directory Map
section: 07-reference
status: approved
version: 0.7.0
---

# Directory Map

This document defines the recommended source code organization.

## Backend

```text
backend/
  src/
    authentication/
    cattle-monitoring/
    inactivity-analysis/
    alerts/
    inspections/
    dashboard/
    offline-sync/
    shared/
```

Each business module should follow Clean Architecture internally:

```text
alerts/
  domain/
    entities/
    value-objects/
    services/
  application/
    use-cases/
    ports/
    dto/
  infrastructure/
    persistence/
    mappers/
  presentation/
    controllers/
```

## Frontend

```text
frontend/
  src/
    app/
      router/
      providers/
      layouts/
    features/
      auth/
      dashboard/
      cattle/
      events/
      alerts/
      metrics/
    shared/
      components/
      hooks/
      services/
      types/
      utils/
```

## Mobile

```text
mobile/
  src/
    Features/
      Authentication/
      Alerts/
      Observations/
      Sync/
    Shared/
      Storage/
      Networking/
      Navigation/
```

## Desktop

```text
desktop/
  src/
    Features/
      Authentication/
      Dashboard/
      Cattle/
      Alerts/
      EventSimulator/
    Shared/
```

## Documentation

```text
gyrmonitor-docs/
  00-introduction/
  01-product/
  02-domain/
  03-requirements/
  04-architecture/
  05-api/
  06-engineering/
  07-reference/
  08-decisions/
  09-guides/
  10-roadmap/
  11-openspec/
  12-examples/
  13-templates/
```
