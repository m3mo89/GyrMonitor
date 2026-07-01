## 1. Frontend Role Message

- [x] 1.1 Add a dedicated `SYSTEM_GENERATOR` integration-account UI state that explains the role is for event ingestion from simulator, desktop client, or controlled test data.
- [x] 1.2 Include a clear next action in the message, such as logging out or switching to an operational account.
- [x] 1.3 Keep the message visually consistent with existing access/error state components and app shell styling.

## 2. Routing Behavior

- [x] 2.1 Update protected routing so authenticated `SYSTEM_GENERATOR` users land on the dedicated integration-account message instead of the generic access-denied state.
- [x] 2.2 Preserve generic access-denied behavior for other authenticated users who lack a route permission.
- [x] 2.3 Preserve existing backend login/API permissions and avoid adding a simulator route in this change.

## 3. Tests and Validation

- [x] 3.1 Add frontend test coverage for `SYSTEM_GENERATOR` login/protected-route behavior.
- [x] 3.2 Verify existing protected-route tests still pass for unauthenticated and forbidden human-facing users.
- [x] 3.3 Run frontend build/test commands.
- [x] 3.4 Verify OpenSpec status for `add-system-generator-web-message` before implementation handoff.
