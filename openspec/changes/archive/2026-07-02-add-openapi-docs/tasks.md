## 1. Setup

- [x] 1.1 Add `@nestjs/swagger` to `backend/package.json` dependencies and install
- [x] 1.2 Add `SWAGGER_ENABLED` (or equivalent) config key to `backend/src/config/app.config.ts`, defaulting to enabled outside production, and document it in `backend/.env.example`

## 2. Bootstrap Wiring

- [x] 2.1 In `backend/src/main.ts`, build a `DocumentBuilder` with title/description/version and `.addBearerAuth()`
- [x] 2.2 Call `SwaggerModule.createDocument` and `SwaggerModule.setup('api/docs', ...)`, gated by the config flag from 1.2
- [x] 2.3 Verify the raw document is reachable at `/api/docs-json`

## 3. Controller Annotations

- [x] 3.1 Annotate `backend/src/authentication/http/authentication.controller.ts` with `@ApiTags`, `@ApiOperation` for `POST /auth/login`
- [x] 3.2 Annotate `backend/src/cattle-monitoring/http/cattle.controller.ts` routes (`GET /cattle`, `GET /cattle/:id`, `GET /cattle/:id/events`) and mark them `@ApiBearerAuth()` per the guards actually applied
- [x] 3.3 Annotate `backend/src/dashboard/http/dashboard.controller.ts` (`GET /dashboard`)
- [x] 3.4 Annotate `backend/src/alerts/http/alerts.controller.ts` (`GET /alerts`, `GET /alerts/:id`, `PATCH /alerts/:id/status`)
- [x] 3.5 Annotate `backend/src/inspections/http/observations.controller.ts` (`POST`/`GET` under `alerts/:alertId/observations`)
- [x] 3.6 Annotate `backend/src/activity-events/http/activity-events.controller.ts` (`POST /events`, `GET /events`)
- [x] 3.7 Annotate `backend/src/offline-sync/http/offline-sync.controller.ts` (`POST /sync/events`, `POST /sync/observations`, `GET /sync/status`)
- [x] 3.8 Annotate root `backend/src/app.controller.ts` (`GET /`)

## 4. Verification

- [x] 4.1 Start the backend locally and confirm `/api/docs` renders all 8 controllers with correct auth badges
- [x] 4.2 Confirm `/api/docs-json` returns a valid OpenAPI document (e.g. via `npx swagger-cli validate` or equivalent)
- [x] 4.3 Confirm setting the disable flag prevents `/api/docs` from serving the UI
- [x] 4.4 Update `backend/README.md` with a short "API Documentation" section pointing to `/api/docs`

## 5. Spec Sync

- [x] 5.1 Run `/opsx:sync` (or equivalent) to promote `specs/api-documentation/spec.md` into `openspec/specs/` once implementation lands
