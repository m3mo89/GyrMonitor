# Shared Hooks

`useApiQuery` wraps TanStack Query with the authenticated `ApiClient` from `AuthProvider`, giving every feature a single, consistent way to fetch remote server state (ADR-004). Used by the cattle, alerts, and dashboard features.
