## Why

The backend currently exposes 8 controllers (auth, cattle, dashboard, alerts, observations, events, sync) with no machine-readable documentation. Developers must read controller source to discover routes, request/response shapes, and auth requirements. There is no `@nestjs/swagger` dependency and no `SwaggerModule` wiring anywhere in `backend/src`, so there is no interactive way to browse or try endpoints.

## What Changes

- Add `@nestjs/swagger` (and `swagger-ui-express`, already a transitive dep of `@nestjs/platform-express`) to the backend.
- Wire `SwaggerModule` in `backend/src/main.ts` to generate an OpenAPI document from existing controllers/DTOs and serve interactive docs at `/api/docs`.
- Expose the raw OpenAPI JSON at `/api/docs-json` for tooling/codegen use.
- Annotate controllers and DTOs incrementally with `@nestjs/swagger` decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`) so routes render with useful metadata instead of bare paths.
- Gate the docs endpoint so it is available in development/test but not exposed with sensitive data in production (document the decision in design.md).

## Capabilities

### New Capabilities
- `api-documentation`: Serving interactive OpenAPI (Swagger) documentation and a machine-readable OpenAPI JSON document describing all backend HTTP endpoints.

### Modified Capabilities
(none — existing capability specs describe endpoint behavior, not documentation; no requirement text changes)

## Impact

- Affected code: `backend/src/main.ts` (bootstrap), `backend/package.json` (new dependency), each `*.controller.ts` and its DTOs under `backend/src/*/http/` (added decorators, additive/non-breaking).
- No breaking changes to existing endpoint behavior, routes, or response shapes.
- New public surface: `/api/docs` (Swagger UI) and `/api/docs-json` (OpenAPI spec), both under the existing `apiPrefix`-independent app root (paths defined explicitly, not prefixed, so they remain stable regardless of `API_PREFIX`).
