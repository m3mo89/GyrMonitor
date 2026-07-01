## Why

`SYSTEM_GENERATOR` can authenticate, but the current web app sends that role into a generic access-denied state, which makes it look like a broken login instead of an intentional API/integration-only role. The source of truth is `knowledge-base/07-reference/roles-and-permissions.md`, where `SYSTEM_GENERATOR` is documented for event ingestion rather than dashboard, cattle, or alert review.

## What Changes

- Replace the generic post-login web denial for `SYSTEM_GENERATOR` with a clear role-specific message.
- Explain that `SYSTEM_GENERATOR` is intended for event ingestion from simulator, desktop client, or controlled test data.
- Provide an explicit next action from that message, such as logging out or switching to an operational user.
- Preserve existing backend login and API permissions; no new web workflow or event simulator is introduced in this change.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authentication`: Frontend protected-route behavior changes so authenticated `SYSTEM_GENERATOR` users see a dedicated integration-account message instead of a generic access-denied state.

## Impact

- Frontend: protected-route/routing logic, copy, and tests for `SYSTEM_GENERATOR` login behavior.
- Backend: no API contract change expected.
- Documentation traceability: behavior follows `knowledge-base/07-reference/roles-and-permissions.md` and `knowledge-base/06-engineering/frontend/routing.md`.
