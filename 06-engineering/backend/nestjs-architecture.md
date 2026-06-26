# NestJS Architecture

NestJS is used as the HTTP and dependency injection framework. It must not own the business model. Business rules belong in the domain and application layers.

## Layer Mapping

| Clean Architecture Layer | NestJS Implementation |
|---|---|
| Presentation | Controllers, request DTOs, guards, interceptors |
| Application | Use cases, ports, application services |
| Domain | Entities, value objects, domain services, business rules |
| Infrastructure | ORM repositories, JWT providers, database modules, external adapters |

## Recommended Module Shape

```text
alerts/
  presentation/
    alerts.controller.ts
    dto/
  application/
    use-cases/
    ports/
  domain/
    alert.entity.ts
    alert-status.value-object.ts
    alert-severity.value-object.ts
  infrastructure/
    alert.repository.sql.ts
  alerts.module.ts
```

## Rules

- Controllers must not contain business logic.
- Use cases must not depend directly on ORM models.
- Domain entities must not import NestJS decorators.
- Infrastructure may depend on application ports, but application must not depend on infrastructure classes.
- DTOs are transport contracts, not domain entities.
