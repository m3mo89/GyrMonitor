## Context

This change closes out the MVP roadmap's final capability phase. `knowledge-base/10-roadmap/phase-8-offline-sync.md` names `add-offline-sync` as its OpenSpec change and scopes it to SQLite persistence, `SyncQueue`, pending events/observations, the `/sync/events` and `/sync/observations` endpoints, idempotency, retry/status tracking, and a sync status endpoint. Every prior phase proposal (`add-observations`, `add-alerts`, `add-dashboard`) explicitly deferred "broader mobile/desktop local models and full sync endpoint implementation" to this phase, so `mobile/` and `desktop/` remain unfilled `.NET MAUI` placeholders today (`mobile/README.md`, `desktop/README.md`) with no login, alert, observation, dashboard, cattle, or event-simulator behavior implemented on either client. The backend already exposes stable, idempotent contracts for `activity-events`, `observations`, `alerts`, `dashboard`, `cattle-management`, and `authentication` that this change consumes as-is.

Given that gap, this change also stands up both native clients end-to-end (per `knowledge-base/04-architecture/container-architecture.md` client responsibilities), not only their sync slice, so the MVP has a working field (mobile) and administrative/simulation (desktop) surface to exercise offline sync against.

## Goals / Non-Goals

**Goals:**

- Implement `POST /api/v1/sync/events`, `POST /api/v1/sync/observations`, and `GET /api/v1/sync/status` per `knowledge-base/05-api/offline-sync.md`, with `Idempotency-Key` enforcement and per-item partial results per `knowledge-base/04-architecture/sync-architecture.md`.
- Generate real `.NET MAUI` mobile and desktop projects, replacing the placeholders, following the feature/MVVM layout in `knowledge-base/06-engineering/mobile/maui-architecture.md` and `knowledge-base/06-engineering/desktop/maui-desktop.md`.
- Implement mobile `Authentication`, `Alerts`, `Observations`, and `Sync`; desktop `Authentication`, `Dashboard`, `Cattle`, `Alerts`, `EventSimulator`, and `Sync`, each reusing existing backend contracts.
- Implement SQLite-backed `LocalAlert`, `PendingEvent`, `PendingObservation`, and `SyncQueue` storage per `knowledge-base/06-engineering/database/sqlite.md`.
- Preserve original client capture timestamps and prevent duplicate server records on retry, per SYNC-BR-004 and SYNC-BR-007 in `knowledge-base/02-domain/offline-sync.md`.

**Non-Goals:**

- No background sync workers, exponential backoff, dead-letter queues, or push-based sync status — these are explicitly listed as future evolution in `knowledge-base/04-architecture/sync-architecture.md`.
- No conflict-resolution UI or encrypted local storage — listed as future improvements in `knowledge-base/02-domain/offline-sync.md`.
- No multi-ranch/SaaS concerns, push notifications, or physical device/sensor integration, per `knowledge-base/10-roadmap/mvp.md`.
- No changes to the existing `authentication`, `alerts`, `activity-events`, `observations`, `dashboard`, or `cattle-management` backend requirements; this change only consumes those contracts.
- No shared cross-platform class library extraction for mobile/desktop in this change; each client stays an independent `.NET MAUI` project (see Decision 5).

## Decisions

1. **Implement sync as a thin orchestration layer over existing write paths, not a parallel persistence path.**

   `SyncEventsUseCase` and `SyncObservationsUseCase` in the new `offline-sync` backend module SHALL delegate to the existing `activity-events` and `observations` creation use cases per batch item, then aggregate per-item outcomes into the documented sync response shape. Alternative considered: give `offline-sync` its own repository writes into the `activity_events`/`observations` tables. Rejected because it would duplicate validation and idempotency logic already proven in those modules and risk drift between `POST /events` and `POST /sync/events` semantics.

2. **Add a dedicated idempotency store (`SyncLog`/`IdempotencyKey` table) keyed by `Idempotency-Key`, independent of entity-level uniqueness.**

   Entity uniqueness (`eventId`, `observationId`) alone cannot distinguish "same key, same payload → return prior result" from "same key, different payload → `IDEMPOTENCY_CONFLICT`," which `knowledge-base/04-architecture/sync-architecture.md` requires. The store records the key, a payload hash, and the recorded outcome, satisfying `GET /api/v1/sync/status` and the `SyncLog` requirement in `knowledge-base/02-domain/offline-sync.md`. Alternative considered: rely only on `eventId`/`observationId` uniqueness constraints. Rejected because it cannot detect key/payload mismatches and gives no queryable sync-status source.

3. **Process sync batches item-by-item with a per-item try/catch and always return `200` with mixed results, rather than failing the whole batch on one bad item.**

   This matches the documented partial-failure response shape (`processed`, `created`, `duplicates`, `failed`, `results`). Alternative considered: reject the whole batch on the first invalid item (transactional all-or-nothing). Rejected because it would force clients to resubmit already-valid items and contradicts the documented partial-success contract.

4. **Generate mobile and desktop as separate `.NET MAUI` single-project apps using `sqlite-net-pcl` (or an equivalent lightweight MAUI-compatible SQLite ORM) for local storage, chosen at implementation time based on current MAUI 10 package compatibility.**

   Both `mobile/README.md` and `desktop/README.md` already describe `dotnet new maui` as the intended setup path, and the environment has the `maui` workload installed. Alternative considered: a cross-platform Blazor Hybrid or MAUI Blazor app to share more code with the web frontend. Rejected because the knowledge base consistently describes both clients as `.NET MAUI` native apps (`container-architecture.md`, `mobile-architecture.md`, `maui-desktop.md`) with no Blazor guidance, and switching stacks is out of scope for this change.

5. **Keep mobile and desktop as independent projects with mirrored conventions instead of extracting a shared class library in this change.**

   Both clients need equivalent `Sync`, storage, and networking building blocks, but the knowledge base does not document a shared-library pattern, and introducing one adds packaging/versioning surface not required by the Phase 8 acceptance criteria. Alternative considered: create a `GyrMonitor.Client.Shared` class library now. Deferred as a candidate for `knowledge-base/10-roadmap/technical-debt.md`-style future work; this change instead keeps the two `Sync` feature implementations structurally parallel (same queue model, same idempotency-key strategy) so extraction stays cheap later.

6. **Trigger sync manually (explicit user action or app-foreground/connectivity-restored event) rather than a background service.**

   `knowledge-base/04-architecture/sync-architecture.md` lists "background sync workers" under Future Evolution, meaning MVP sync is expected to be foreground-triggered. Alternative considered: a persistent background sync service. Rejected as out of scope for Phase 8 and unnecessary to satisfy the documented acceptance criteria (clients can persist and later send pending operations).

7. **Store the JWT/session using MAUI secure storage (`SecureStorage`) on both clients, reusing the existing backend login contract as-is.**

   `knowledge-base/07-reference/roles-and-permissions.md` states sensitive data must not be stored longer than required and mandates `Authorization: Bearer <token>`. Alternative considered: plain preferences/local settings storage. Rejected because it does not meet the documented security expectation for token handling.

## Risks / Trade-offs

- [Risk] Reusing `activity-events`/`observations` use cases inside sync introduces a dependency from `offline-sync` back into those modules. → Mitigation: depend only on their existing public use-case interfaces (already consumed by their own controllers), keeping `offline-sync` a consumer, not a modifier, of those modules' contracts.
- [Risk] Full mobile/desktop client build-out in one change is large and could hide regressions in either app. → Mitigation: implement and test `Authentication` first on both clients (shared login contract, lowest risk), then layer `Alerts`/`Observations` (mobile) and `Dashboard`/`Cattle`/`Alerts`/`EventSimulator` (desktop) before `Sync`, per the task breakdown, so each feature area is independently testable.
- [Risk] Manual/foreground-only sync may leave data pending longer than a background-worker approach would. → Mitigation: acceptable for MVP per the documented Future Evolution note; UX requirements still surface pending/failed counts so users know to trigger sync.
- [Risk] Idempotency store adds a new MariaDB table and migration in an already-stable backend. → Mitigation: scope the migration to an additive table with no changes to existing entities, following `knowledge-base/06-engineering/database/migrations.md`.
- [Risk] `.NET MAUI` package choices (SQLite ORM, MVVM toolkit) aren't pinned by the knowledge base and could drift from mobile to desktop. → Mitigation: pick the same packages for both projects during implementation and document the choice in each client's `README.md`.

## Open Questions

- Exact idempotency-key granularity for `/sync/events` (one key per batch vs. one key per item) is not fully specified in `knowledge-base/05-api/offline-sync.md`; implementation should default to one key per batch request (matching the documented request shape) unless testing surfaces a need for per-item keys.
