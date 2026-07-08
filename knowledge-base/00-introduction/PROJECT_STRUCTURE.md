---
title: Project Structure
module: project
version: 1.1.0
status: approved
owner: GyrMonitor Team
last_updated: 2026-06-26
---

# Project Structure

This document explains the current repository structure for GyrMonitor and the recommended organization for implementation code.

## Documentation Repository

The documentation repository is organized as a knowledge base.

```text
gyrmonitor/
├── README.md
├── CONTRIBUTING.md
├── docs/
├── knowledge-base/
├── openspec/
├── backend/
├── frontend/
├── mobile/
├── desktop/
├── .agents/
├── .claude/
├── .codex/
└── .github/
```

## Root Files

| File | Purpose |
| --- | --- |
| File | Purpose |
| --- | --- |
| `README.md` | Entry point for the repository. |
| `CONTRIBUTING.md` | Contribution and development workflow. |
| `knowledge-base/README.md` | Entry point for the Product Knowledge Base. |

## Folder Responsibilities

### `00-introduction/`

Repository usage, AI context, style guide and contribution rules.

Recommended files:

```text
README.md
AI_CONTEXT.md
PROJECT_STRUCTURE.md
STYLE_GUIDE.md
GLOSSARY.md
CONTRIBUTING.md
ROADMAP.md
```

### `01-product/`

Project-level documentation.

Recommended files:

```text
vision.md
scope.md
objectives.md
business-problem.md
product-roadmap.md
success-metrics.md
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
quality-attributes.md
business-rules.md
risk-register.md
traceability.md
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
container-architecture.md
security-architecture.md
sync-architecture.md
observability.md
failure-modes.md
```

### `05-api/`

REST API contracts and integration rules.

Recommended files:

```text
overview.md
conventions.md
authentication.md
dashboard.md
cattle.md
activity-events.md
alerts.md
observations.md
offline-sync.md
error-model.md
dto-catalog.md
security.md
http-examples.md
```

### `06-engineering/`

Backend, frontend, mobile, desktop and database implementation guidance.

Recommended files:

```text
overview.md
backend/overview.md
frontend/overview.md
mobile/overview.md
desktop/overview.md
database/overview.md
```

### `07-reference/`

Fast lookup tables and developer reference.

Recommended files:

```text
QUICK_REFERENCE.md
directory-map.md
dto-catalog.md
enumerations.md
error-codes.md
roles-and-permissions.md
glossary.md
naming-conventions.md
```

### `08-decisions/`

Architecture Decision Records.

Recommended files:

```text
ADR-001-rendering-csr.md
ADR-002-react-typescript.md
ADR-003-feature-organization.md
ADR-004-tanstack-query.md
ADR-005-rest-client.md
ADR-006-cache-strategy.md
ADR-007-jwt-route-guards.md
ADR-008-error-empty-states.md
```

### `09-guides/`

Developer guides and operating procedures.

Recommended files:

```text
developer-guide.md
backend-module-guide.md
frontend-feature-guide.md
testing-guide.md
documentation-guide.md
review-checklist.md
definition-of-done.md
ai-assisted-development.md
```

### `10-roadmap/`

MVP implementation phases and technical debt.

Recommended files:

```text
phase-1-foundation.md
phase-2-authentication.md
phase-3-cattle-management.md
phase-4-observations.md
phase-5-activity-events.md
phase-6-alerts.md
phase-7-dashboard.md
phase-8-offline-sync.md
phase-9-testing-release.md
overview.md
```

### `11-openspec/`

Manual OpenSpec workflow guidance. This folder does not contain generated proposals or implementation changes.

Recommended files:

```text
workflow.md
proposal-checklist.md
implementation-checklist.md
review-checklist.md
naming-conventions.md
best-practices.md
```

### `12-examples/`

Examples, sample payloads, HTTP requests, fixtures and test scenarios.

Recommended files:

```text
http-requests.md
sample-payloads.md
seed-data.md
```

### `13-templates/`

Reusable documentation templates.

Recommended files:

```text
adr-template.md
api-template.md
guide-template.md
module-template.md
openspec-proposal-notes-template.md
```

### `99-meta/`

Indexes, traceability, catalogs and governance.

Recommended files:

```text
MASTER_INDEX.md
DOCUMENT_STATUS.md
MODULE_CATALOG.md
TRACEABILITY_MATRIX.md
DEPENDENCY_MATRIX.md
PROJECT_DECISIONS.md
```

## Backend Project Structure

Recommended backend structure:

```text
backend/src/
├── authentication/
├── user-management/
├── cattle-monitoring/
├── inactivity-analysis/
├── activity-events/
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
│   ├── user-management/
│   ├── dashboard/
│   ├── cattle/
│   ├── events/       # placeholder, not yet implemented
│   ├── alerts/
│   └── metrics/      # placeholder, not yet implemented
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
└── main.tsx
```

## OpenSpec Placement

OpenSpec lives at the repository root. The `knowledge-base/11-openspec/` folder is guidance only.

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
| 1.1.0 | 2026-06-29 | Aligned with current repository and Knowledge Base structure. |
| 0.1.0 | 2026-06-26 | Initial project structure guide. |


## Current Repository Layout

```text
gyrmonitor/
├── README.md
├── CONTRIBUTING.md
├── docs/
├── knowledge-base/
│   ├── 00-introduction/
│   ├── 01-product/
│   ├── 02-domain/
│   ├── 03-requirements/
│   ├── 04-architecture/
│   ├── 05-api/
│   ├── 06-engineering/
│   ├── 07-reference/
│   ├── 08-decisions/
│   ├── 09-guides/
│   ├── 10-roadmap/
│   ├── 11-openspec/
│   ├── 12-examples/
│   ├── 13-templates/
│   └── 99-meta/
├── openspec/
├── backend/
├── frontend/
├── mobile/
├── desktop/
├── database/
├── shared/
└── scripts/
```

- `database/` — MariaDB (server) and SQLite (mobile/desktop local storage) schema, migrations, and seeds.
- `shared/` — shared `.NET MAUI` client core (`GyrMonitor.Client.Core`) used by both desktop and mobile.
- `scripts/` — repository-level maintenance scripts (e.g. `verify-foundation.mjs`).
