# Frontend Testing

Frontend tests should protect critical flows and UI states.

## Test Targets

- Login flow.
- Protected route behavior.
- Dashboard loading, success and error states.
- Alert list filters.
- Empty states.
- API error mapping.
- Critical chart/table rendering.

## Tools

- Vitest for unit tests.
- Testing Library for component behavior.
- Mocked API clients or MSW for integration-like tests.

## Rule

Tests should verify user-visible behavior, not implementation details.
