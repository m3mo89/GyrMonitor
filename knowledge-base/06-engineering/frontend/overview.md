---
title: Frontend Overview
section: 05-engineering/frontend
technology: React + TypeScript
version: 0.6.0
status: approved
---

# Frontend Overview

The frontend web application is the primary interface for administrators and researchers. It presents dashboards, cattle history, alerts, trends and risk ranking using the REST API.

## Responsibilities

- Authenticate users.
- Protect private routes.
- Display dashboard metrics.
- List cattle and view individual history.
- Display active and historical alerts.
- Present trends and risk ranking.
- Handle loading, empty, error and stale data states.
- Consume the API through typed clients.

## Recommended Stack

| Concern | Decision |
| --- | --- |
| Framework | React |
| Language | TypeScript |
| Build tool | Vite |
| Routing | React Router |
| Remote state | TanStack Query |
| Local UI state | React state or Context API when justified |
| Forms | React Hook Form or equivalent |
| Charts | Lightweight chart library selected during implementation |
| Testing | Vitest + Testing Library |

## Scope Boundary

The web frontend provides resilient reading through cache, but full offline operation belongs to mobile and desktop clients.
