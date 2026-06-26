# Backend Testing

Backend testing must focus on business correctness and API contract stability.

## Test Types

| Type | Target |
|---|---|
| Unit tests | Domain services, value objects, use cases |
| Integration tests | Repositories, database mappings, controllers |
| Contract tests | REST request/response compatibility |
| Security tests | Authentication and role-based access |

## Priority Tests for MVP

- Register inactivity event and generate alert.
- Duplicate event does not create duplicate records.
- Offline sync handles duplicates through idempotency.
- Alert status transitions are valid.
- Dashboard returns expected aggregate shape.
- Unauthorized requests are rejected.

## Rule

Every use case that changes system state should have unit tests before integration tests.
