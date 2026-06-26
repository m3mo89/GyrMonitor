---
title: Project Structure
module: project
version: 0.1.0
status: approved
owner: GyrMonitor Team
last_updated: 2026-06-26
---

# Project Structure

This document explains the intended repository structure for the GyrMonitor documentation and future implementation repositories.

## Documentation Repository

The documentation repository is organized as a knowledge base.

```text
gyrmonitor-docs/
├── README.md
├── ROADMAP.md
├── AI_CONTEXT.md
├── STYLE_GUIDE.md
├── PROJECT_STRUCTURE.md
├── GLOSSARY.md
├── CONTRIBUTING.md
├── 01-project/
├── 02-domain/
├── 03-requirements/
├── 04-architecture/
├── 05-data/
├── 06-api/
├── 07-frontend/
├── 08-backend/
├── 09-mobile/
├── 10-desktop/
├── 11-decisions/
├── 12-guides/
└── 13-examples/
```

## Root Files

| File | Purpose |
| --- | --- |
| `README.md` | Entry point for the documentation repository. |
| `ROADMAP.md` | Technical roadmap and implementation phases. |
| `AI_CONTEXT.md` | Instructions and project context for AI assistants. |
| `STYLE_GUIDE.md` | Naming, architecture, API, and documentation conventions. |
| `PROJECT_STRUCTURE.md` | Explanation of repository organization. |
| `GLOSSARY.md` | Canonical vocabulary for the project. |
| `CONTRIBUTING.md` | Contribution and documentation workflow. |

## Folder Responsibilities

### `01-project/`

Project-level documentation.

Recommended files:

```text
vision.md
scope.md
objectives.md
milestones.md
system-map.md
```

### `02-domain/`

Business domain documentation independent of frameworks.

Recommended files:

```text
domain-model.md
cattle.md
activity-events.md
risk-analysis.md
alerts.md
inspections.md
observations.md
offline-sync.md
business-rules.md
```

### `03-requirements/`

Requirements extracted and normalized from academic documentation.

Recommended files:

```text
business-requirements.md
user-requirements.md
functional-requirements.md
non-functional-requirements.md
user-stories.md
use-cases.md
```

### `04-architecture/`

Technical architecture documentation.

Recommended files:

```text
overview.md
clean-architecture.md
screaming-architecture.md
system-design.md
offline-first.md
scalability.md
tradeoffs.md
c4.md
```

### `05-data/`

Data models and persistence documentation.

Recommended files:

```text
mariadb.md
sqlite.md
sync-model.md
entities.md
relationships.md
```

### `06-api/`

REST API contracts and integration rules.

Recommended files:

```text
overview.md
authentication.md
dashboard.md
cattle.md
events.md
alerts.md
observations.md
sync.md
error-model.md
security.md
headers.md
```

### `07-frontend/`

Frontend web documentation.

Recommended files:

```text
overview.md
rendering.md
routing.md
state-management.md
cache.md
security.md
forms.md
testing.md
observability.md
accessibility.md
```

### `08-backend/`

Backend implementation guidance.

Recommended files:

```text
overview.md
modules.md
application-layer.md
domain-layer.md
infrastructure-layer.md
presentation-layer.md
testing.md
```

### `09-mobile/`

Mobile client documentation.

Recommended files:

```text
overview.md
offline-storage.md
sync-queue.md
alerts-workflow.md
observations-workflow.md
```

### `10-desktop/`

Desktop client documentation.

Recommended files:

```text
overview.md
event-simulator.md
offline-storage.md
dashboard.md
```

### `11-decisions/`

Architecture Decision Records.

Recommended files:

```text
ADR-001-rendering-csr.md
ADR-002-react-typescript.md
ADR-003-feature-organization.md
ADR-004-tanstack-query.md
ADR-005-rest-client.md
ADR-006-cache-strategy.md
ADR-007-frontend-security.md
ADR-008-error-states.md
ADR-009-metrics-visualization.md
ADR-010-form-validation.md
ADR-011-frontend-observability.md
ADR-012-frontend-testing.md
ADR-013-accessibility.md
```

### `12-guides/`

Developer guides and operating procedures.

Recommended files:

```text
backend-development.md
frontend-development.md
mobile-development.md
desktop-development.md
writing-docs.md
using-ai-assistants.md
openspec-workflow.md
```

### `13-examples/`

Examples, sample payloads, HTTP files, fixtures, and test scenarios.

Recommended files:

```text
http/auth.http
http/dashboard.http
http/events.http
http/alerts.http
http/sync.http
payloads/register-event.json
payloads/sync-events.json
fixtures/cattle.json
fixtures/alerts.json
```

## Future Implementation Repository

Recommended future structure:

```text
gyrmonitor/
├── docs/               # Academic DOCX files and university deliverables
├── specs/              # Markdown technical documentation or submodule link
├── backend/            # NestJS API
├── frontend/           # React web app
├── mobile/             # .NET MAUI mobile app
├── desktop/            # .NET MAUI desktop app
├── openspec/           # Manual OpenSpec proposals and specs
├── scripts/
└── README.md
```

## Backend Project Structure

Recommended backend structure:

```text
backend/src/
├── authentication/
├── cattle-monitoring/
├── inactivity-analysis/
├── alerts/
├── inspections/
├── dashboard/
├── offline-sync/
└── shared/
```

Each module should follow Clean Architecture internally:

```text
module/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

## Frontend Project Structure

Recommended frontend structure:

```text
frontend/src/
├── app/
│   ├── router/
│   ├── providers/
│   └── layouts/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── cattle/
│   ├── events/
│   ├── alerts/
│   └── metrics/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
└── main.tsx
```

## OpenSpec Placement

OpenSpec should live in the implementation repository, not in the documentation repository, unless the user decides otherwise.

```text
openspec/
├── project.md
├── specs/
└── changes/
```

OpenSpec changes should be created manually per feature.

## Change History

| Version | Date | Description |
| --- | --- | --- |
| 0.1.0 | 2026-06-26 | Initial project structure guide. |


## Current Repository Layout

```text
gyrmonitor-docs/
├── README.md
├── 00-introduction/
├── 01-product/
├── 02-domain/
├── 03-requirements/
├── 04-architecture/
├── 05-data/
├── 06-api/
├── 07-frontend/
├── 08-backend/
├── 09-mobile/
├── 10-desktop/
├── 11-decisions/
├── 12-guides/
└── 13-examples/
```
