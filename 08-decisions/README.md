---
title: Architecture Decisions
section: 08-decisions
status: approved
version: 0.8.0
---

# Architecture Decisions

This section contains the Architecture Decision Records (ADRs) for GyrMonitor.

ADRs document relevant architectural decisions, their context, alternatives, trade-offs and consequences. They are not implementation tasks and they are not OpenSpec proposals.

## Decision Index

| ADR | Decision | Area | Status |
|---|---|---|---|
| [ADR-001](ADR-001-rendering-csr.md) | Use Client Side Rendering for the Web Dashboard | Frontend | Accepted |
| [ADR-002](ADR-002-react-typescript.md) | Use React + TypeScript with Vite | Frontend | Accepted |
| [ADR-003](ADR-003-feature-organization.md) | Organize Frontend by Features and Screaming Architecture | Frontend | Accepted |
| [ADR-004](ADR-004-tanstack-query.md) | Use TanStack Query for Remote State | Frontend | Accepted |
| [ADR-005](ADR-005-rest-client.md) | Use REST with a Typed HTTP Client | Frontend/API | Accepted |
| [ADR-006](ADR-006-cache-strategy.md) | Use Resilient Read Cache for Web Views | Frontend | Accepted |
| [ADR-007](ADR-007-jwt-route-guards.md) | Use JWT, Route Guards and Minimal Sensitive State | Security | Accepted |
| [ADR-008](ADR-008-error-empty-states.md) | Standardize Loading, Error and Empty States | Frontend/API | Accepted |
| [ADR-009](ADR-009-metrics-visualization.md) | Visualize Metrics from Backend Aggregates | Dashboard | Accepted |
| [ADR-010](ADR-010-form-validation.md) | Validate Forms in Frontend and Backend | Frontend/API | Accepted |
| [ADR-011](ADR-011-frontend-observability.md) | Add Basic Frontend Observability | Frontend | Accepted |
| [ADR-012](ADR-012-frontend-testing.md) | Test Critical Frontend Flows | Frontend | Accepted |
| [ADR-013](ADR-013-accessibility.md) | Apply Basic Accessibility Practices | Frontend/UX | Accepted |
| [ADR-014](ADR-014-docs-knowledge-base.md) | Maintain a Product Knowledge Base as Source of Truth | Documentation | Accepted |
| [ADR-015](ADR-015-openspec-manual-proposals.md) | Create OpenSpec Proposals Manually | Process | Accepted |

## How to Use ADRs

Use ADRs when a decision affects architecture, maintainability, security, scalability, interoperability, testing or long-term evolution.

Do not use ADRs for simple implementation details, temporary fixes or one-time tasks.

## Related Sections

- [Architecture](../04-architecture/README.md)
- [API](../05-api/README.md)
- [Engineering](../06-engineering/README.md)
- [Developer Reference](../07-reference/README.md)
- [OpenSpec Workflow](../11-openspec/README.md)
