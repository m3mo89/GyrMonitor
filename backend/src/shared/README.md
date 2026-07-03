# Shared Backend Boundary

Cross-cutting primitives used by more than one business-capability module. No feature module should redefine what's already here.

- `domain/domain-error.ts` — `DomainError` base class carrying `httpStatus`/`code`; every domain error class (`CattleNotFoundError`, `AlertNotFoundError`, etc.) extends it.
- `http/api-response.ts` — `ApiSuccess<T>`/`ApiError` response envelope types and the `apiError()` helper.
- `http/domain-error.filter.ts` — global NestJS `ExceptionFilter` (`DomainErrorFilter`) that maps any `DomainError` to its HTTP status/envelope, passes through NestJS `HttpException`s unchanged, and maps anything else to a generic 500.
- `validation/assertions.ts` — generic validators (`isUuid`, `assertUuid`, `assertIsoDateTime`, `assertNonEmptyString`) with no logic specific to any single capability.
