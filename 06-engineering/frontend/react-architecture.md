# React Architecture

The frontend is a private, interactive SPA using Client Side Rendering.

## Application Layers

```text
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

## Rules

- Features own their components, hooks, API calls and types when they are not shared.
- `shared/` must not become a dumping ground.
- API calls must go through typed clients.
- Business-critical calculations should not be duplicated in the frontend.
- The frontend may format, filter and visualize data, but backend remains authoritative for risk and alert rules.
