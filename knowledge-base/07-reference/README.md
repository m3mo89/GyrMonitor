---
title: Developer Reference
section: 07-reference
status: approved
version: 0.7.0
---

# Developer Reference

This section is the fast-access technical reference for GyrMonitor developers and AI-assisted coding tools.

It does not replace the domain, requirements, architecture, API or engineering documentation. Instead, it summarizes the information most frequently needed during implementation.

## Contents

| Document | Purpose |
| --- | --- |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | One-page operational reference for endpoints, DTOs, roles and modules. |
| [dto-catalog.md](./dto-catalog.md) | Canonical DTO names and fields. |
| [error-codes.md](./error-codes.md) | Standard API error codes and expected handling. |
| [http-status.md](./http-status.md) | HTTP status usage by scenario. |
| [roles-and-permissions.md](./roles-and-permissions.md) | User roles and authorization matrix. |
| [enumerations.md](./enumerations.md) | Canonical enums used across API, domain and UI. |
| [configuration.md](./configuration.md) | Environment variables and runtime configuration. |
| [naming-conventions.md](./naming-conventions.md) | Naming rules for backend, frontend, database and documentation. |
| [directory-map.md](./directory-map.md) | Recommended codebase directory layout. |
| [business-events.md](./business-events.md) | Business-level events and domain flow. |
| [glossary.md](./glossary.md) | Developer-focused glossary. |

## Usage Rule

Before implementing any feature, read:

1. The relevant domain document in `02-domain/`.
2. The related requirements in `03-requirements/`.
3. The API contract in `05-api/`.
4. The implementation guide in `06-engineering/`.
5. This reference section for naming, DTOs, errors and roles.

## OpenSpec Note

OpenSpec proposals and implementation changes are created manually by the project owner. This documentation only supports that process; it does not generate OpenSpec changes automatically.
