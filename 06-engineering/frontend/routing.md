# Frontend Routing

Routing should reflect user workflows and protected areas.

## Suggested Routes

| Route | Feature | Access |
|---|---|---|
| `/login` | Auth | Public |
| `/dashboard` | Dashboard | ADMIN, RESEARCHER |
| `/cattle` | Cattle | ADMIN, RESEARCHER |
| `/cattle/:id` | Cattle | ADMIN, RESEARCHER |
| `/alerts` | Alerts | ADMIN, FIELD_OPERATOR, RESEARCHER |
| `/alerts/:id` | Alerts | ADMIN, FIELD_OPERATOR, RESEARCHER |
| `/metrics` | Metrics | ADMIN, RESEARCHER |

## Route Guards

- Unauthenticated users are redirected to `/login`.
- Users without the required role should see an access denied page.
- Expired tokens should clear session state and redirect to login.
