# GyrMonitor Documentation

GyrMonitor is a product knowledge base for a multiplatform system that monitors prolonged inactivity in Gyr cattle under intermittent connectivity conditions.

This repository transforms the academic DOCX documentation into modular Markdown documentation for product, domain, requirements, architecture, API, engineering and developer reference.

## Documentation Map

| Section | Purpose |
|---|---|
| [00-introduction](./00-introduction/) | Project overview, AI context, style guide and contribution rules. |
| [01-product](./01-product/) | Product vision, scope, objectives, stakeholders and success metrics. |
| [02-domain](./02-domain/) | Domain model and business concepts. |
| [03-requirements](./03-requirements/) | Requirements, use cases, business rules and traceability. |
| [04-architecture](./04-architecture/) | System architecture, offline-first, security and scalability. |
| [05-api](./05-api/) | API contracts, DTOs, errors, authentication and HTTP examples. |
| [06-engineering](./06-engineering/) | Backend, frontend, mobile, desktop and database implementation guidance. |
| [07-reference](./07-reference/) | Developer reference for DTOs, roles, enums, errors, naming and directories. |
| [08-decisions](./08-decisions/) | Architecture Decision Records. |
| [09-guides](./09-guides/) | Practical development and documentation guides. |
| [10-roadmap](./10-roadmap/) | Product and technical roadmap. |
| [11-openspec](./11-openspec/) | OpenSpec workflow support only; proposals are created manually. |
| [12-examples](./12-examples/) | HTTP examples and sample payloads. |
| [13-templates](./13-templates/) | Reusable documentation templates. |
| [99-meta](./99-meta/) | Master index, catalogs, matrices and project governance. |

## OpenSpec Policy

OpenSpec proposals and implementations are intentionally not generated in this repository. They will be created manually by the project owner to preserve review quality and design control.

## Current Version

`v1.0.1` — Phase 1 finalized, MVP scope cleaned, and meta indexes added.

## Current Documentation Version

Version: `1.0.1`

This version finalizes Phase 1:

- MVP-only documentation focused on authentication, cattle, observations, events, alerts, dashboard and offline sync.
- No automated detection pipelines, model inference, physical sensing infrastructure or specialized hardware deployment in the MVP scope.
- `11-openspec/` remains guidance-only; proposals and implementations are created manually.
- `99-meta/` added for master index, traceability, dependency map, document status and project decisions.
- Documentation structure is now frozen for the start of OpenSpec-driven development.


## Release Notes

See [`RELEASE_NOTES.md`](./RELEASE_NOTES.md) for the v1.0 scope and OpenSpec readiness statement.

## Phase 1 status

The Knowledge Base and project standards are frozen as of v1.1.0.

Future functional work should start from a manually authored OpenSpec proposal and should keep the documentation synchronized with the approved implementation.
