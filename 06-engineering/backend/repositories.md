# Backend Repositories

Repositories abstract persistence for use cases. They protect the application layer from ORM and SQL details.

## Repository Interfaces

Initial ports:

```text
ICattleRepository
IActivityEventRepository
IAlertRepository
IObservationRepository
ISyncLogRepository
IUserRepository
IIdempotencyRepository
```

## Repository Rules

- Repository interfaces live in the application layer.
- SQL/ORM implementations live in infrastructure.
- Repositories should persist and retrieve domain/application models.
- Repositories must not expose ORM entities to use cases.
- Idempotency checks should be explicit and testable.

## Example Responsibility

`IActivityEventRepository` should support:

- saving a new activity event;
- checking whether an event already exists by `eventId`;
- listing events by cattle and period;
- supporting dashboard aggregation queries when appropriate, or delegating to a read model repository.
