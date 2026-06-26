---
title: Traceability Matrix
section: 99-meta
status: approved
version: 1.0.1
---

# Traceability Matrix

| Requirement Area | Use Cases | Domain Modules | API Contracts | Roadmap Phase |
|---|---|---|---|---|
| Authentication and roles | Login, protected access | User Roles | `POST /auth/login` | Phase 2 |
| Cattle management | List and consult cattle | Cattle | `GET /cattle`, `GET /cattle/{id}` | Phase 3 |
| Field observations | Register observation | Observations, Inspections | `POST /alerts/{id}/observations` | Phase 4 |
| Activity/inactivity events | Register event | Activity Events | `POST /events`, `GET /events` | Phase 5 |
| Risk and alerts | Calculate risk, generate alert | Risk Analysis, Alerts | `GET /alerts`, `PATCH /alerts/{id}/status` | Phase 6 |
| Dashboard metrics | Consult dashboard | Dashboard, Alerts, Activity Events | `GET /dashboard` | Phase 7 |
| Offline synchronization | Sync pending work | Offline Sync | `POST /sync/events`, `POST /sync/observations` | Phase 8 |
