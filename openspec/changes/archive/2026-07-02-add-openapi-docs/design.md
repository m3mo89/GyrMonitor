## Context

The backend ([backend/src/main.ts](backend/src/main.ts)) is a NestJS app on `@nestjs/platform-express`, bootstrapped with a global prefix (`apiPrefix`, default `/api/v1`) read from `backend/src/config/app.config.ts`. It has 8 controllers across feature modules (`authentication`, `cattle-monitoring`, `dashboard`, `alerts`, `inspections`, `activity-events`, `offline-sync`, plus the root `app.controller.ts`). None carry `@nestjs/swagger` decorators today, and the dependency isn't installed. This is a new-dependency, cross-cutting (touches every controller) change, so a design doc is warranted.

## Goals / Non-Goals

**Goals:**
- Make all existing HTTP endpoints discoverable via a browsable UI and a machine-readable OpenAPI JSON document.
- Reflect real auth requirements (JWT bearer) in the generated docs so protected routes are marked correctly.
- Keep the change additive: no existing route, request, or response shape changes.

**Non-Goals:**
- Full DTO-by-DTO annotation coverage in this change's first pass is not required for every field; tasks.md sequences core annotation (tags, operations, auth) now and leaves exhaustive `@ApiProperty` coverage as incremental follow-up if desired.
- Not introducing API versioning or contract testing — only documentation generation.
- Not changing the empty `backend/src/shared` placeholder or other empty scaffold directories (separate concern, unrelated to this change).

## Decisions

- **Library: `@nestjs/swagger`.** It's the first-party Nest integration, generates the OpenAPI document directly from existing decorators (`@Controller`, `@Get`, etc.) with no parallel schema to maintain, and is already compatible with the installed `@nestjs/core`/`@nestjs/platform-express` versions.
- **Mount point: `/api/docs` (UI) and `/api/docs-json` (raw spec), outside `apiPrefix`.** Keeping docs paths fixed and independent of `API_PREFIX` means the docs URL doesn't shift when an operator changes the API version prefix, and avoids the docs endpoints being mistaken for versioned API routes.
- **Environment gating.** `SwaggerModule.setup` is called unconditionally in development/test, but the design documents an explicit env check (`NODE_ENV !== 'production'`, or a `SWAGGER_ENABLED` flag defaulting true in non-prod) so a production deployment doesn't have to expose full route/schema introspection unless the operator opts in. This is a decision to flag in tasks.md rather than silently ship an always-on docs endpoint.
- **Auth representation:** use `DocumentBuilder().addBearerAuth()` plus `@ApiBearerAuth()` on controllers guarded by the existing JWT/role guards (mirrors real behavior instead of re-deriving it).
- **Incremental annotation over one big-bang rewrite:** annotate controllers module-by-module (tasks.md sequences this) rather than one large PR touching all 8 controllers at once, to keep review small and reduce merge conflicts with in-flight feature work.

## Risks / Trade-offs

- [Docs endpoint exposed in production by default] → Mitigate via explicit env gate decided above; document the flag in `backend/README.md` and `.env.example`.
- [Decorator drift — docs go stale if controllers change without updating annotations] → Mitigated by generating from live decorators/types rather than a hand-written spec file; only new DTOs need new decorators, existing ones aren't hand-duplicated.
- [Partial annotation coverage looks inconsistent at first] → Acceptable trade-off per Non-Goals; tasks.md still requires every controller to get at least `@ApiTags` + `@ApiOperation` so no route is undocumented, just not every field fully typed on day one.

## Open Questions

- Should `/api/docs` require authentication itself in staging/production, or is env-gating (on/off) sufficient? Default to env-gating for this change; revisit if a staging environment needs docs while still restricting access.
