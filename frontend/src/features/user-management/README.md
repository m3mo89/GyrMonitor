# User Management Feature Boundary

Implemented: admin-only user list, user creation, disable/reactivate actions, and password reset workflow.

This feature is the reference frontend Clean Architecture layout:

```text
domain/          Client-safe user types and UX validation helpers
application/     TanStack Query hooks and mutation invalidation
infrastructure/  HTTP API adapter for `/users`
presentation/    Page and view composition
```

Presentation code consumes application hooks and domain helpers. Backend validation remains authoritative for account lifecycle rules.
