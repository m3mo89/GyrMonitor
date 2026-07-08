# Frontend Features

Features are organized by business capability first, then by Clean Architecture layer when the feature has real behavior:

```text
features/<feature>/
  domain/
  application/
  infrastructure/
  presentation/
```

## Classification

| Feature | Status | Reason |
|---|---|---|
| `auth` | Layered | Login, session storage, authenticated API client, route guards and integration-account message. |
| `user-management` | Layered | Admin mutations, form validation, list state and backend user lifecycle API. |
| `alerts` | Layered | List/detail pages, observations and status mutation workflow. |
| `cattle` | Layered | List/detail/history screens backed by typed API adapters. |
| `dashboard` | Layered | Aggregate metrics query and chart presentation. |
| `events` | Placeholder/deferred | Dedicated events UI is not scheduled; cattle detail shows read-only event history. |
| `metrics` | Placeholder/deferred | Superseded by dashboard unless product later defines a distinct analytics feature. |

## Dependency Rule

- `presentation/` renders UI and consumes application hooks/use-cases plus domain types.
- `application/` owns feature query/mutation orchestration and may use TanStack Query.
- `infrastructure/` owns HTTP and browser/storage adapters.
- `domain/` owns client-safe feature language and UX validation. It must not import React, router APIs, TanStack Query, browser APIs or HTTP clients.

Route adapter components stay in `app/router` and import presentation entry points from feature barrels.
