# Shared Hooks

`useApiQuery` wraps TanStack Query with the authenticated `ApiClient` from `AuthProvider`, giving features a consistent way to fetch remote server state (ADR-004). Used by cattle and alerts application hooks; features with extra query options can still call TanStack Query directly inside their application layer.
