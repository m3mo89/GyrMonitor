---
title: Technical Debt Register
section: 10-roadmap
status: approved
version: 0.9.0
---

# Technical Debt Register

This document tracks conscious tradeoffs accepted for the MVP.

| ID | Debt | Reason | Priority | Future Resolution |
|---|---|---|---|---|
| TD-001 | Monolithic modular backend | Lower operational complexity for MVP. | Medium | Split services only if scale requires it. |
| TD-002 | Simple JWT session model | Sufficient for academic MVP. | Medium | Add refresh tokens and stricter session policies later. |
| TD-003 | No message queue | Event volume is simulated/controlled in MVP. | Low | Add queue if ingestion grows. |
| TD-004 | No distributed cache | Dashboard load is limited in MVP. | Low | Add Redis/cache layer if metrics become expensive. |
| TD-005 | Basic observability | MVP focuses on functional validation. | Medium | Add centralized logs/tracing later. |
| TD-006 | No push notifications | Not required for MVP workflow. | Low | Add notifications in post-MVP version. |

