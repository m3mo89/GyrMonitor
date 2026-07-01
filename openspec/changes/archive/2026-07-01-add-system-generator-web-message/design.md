## Context

The approved role matrix in `knowledge-base/07-reference/roles-and-permissions.md` identifies `SYSTEM_GENERATOR` as an event-ingestion role for simulator, desktop client, or controlled test data. It can authenticate, but it is not allowed to view dashboard, cattle, or alerts in the web app. The current frontend treats that post-login state as a generic access-denied route, which is technically correct but confusing to users testing seeded credentials.

## Goals / Non-Goals

**Goals:**

- Give authenticated `SYSTEM_GENERATOR` users a clear web message that explains the role is for API/integration event ingestion.
- Preserve existing authentication, token handling, and backend authorization behavior.
- Keep the message consistent with the current private app shell and access-state styling.
- Add frontend test coverage so this does not regress to a generic denial.

**Non-Goals:**

- No event simulator UI.
- No new backend endpoint or permission change.
- No change to the documented role matrix.
- No login blocking for `SYSTEM_GENERATOR`; the account may still authenticate for API use.

## Decisions

1. Handle this as frontend route-state behavior after login.

   The backend should continue to authenticate `SYSTEM_GENERATOR` and enforce endpoint permissions. The confusing part is the web landing experience, so the frontend should detect this role and render a dedicated integration-account message. Alternative considered: reject `SYSTEM_GENERATOR` at login. Rejected because the role may legitimately need tokens for API/event ingestion workflows.

2. Do not add a simulator route in this change.

   A simulator or event-generation screen would be a larger workflow involving event payload forms, idempotency, cattle selection, and API behavior. This change is intentionally limited to making the current web behavior understandable. Alternative considered: send `SYSTEM_GENERATOR` to `/events`. Rejected because no approved web event simulator capability is part of this change.

## Risks / Trade-offs

- [Risk] Users may expect `SYSTEM_GENERATOR` to do something in the web app. -> Mitigation: message explicitly names the role purpose and suggests switching to an operational account for dashboard/cattle/alerts.
- [Risk] Future desktop simulator work may make the message stale. -> Mitigation: keep copy tied to the current role matrix and revisit when simulator UI is proposed.
