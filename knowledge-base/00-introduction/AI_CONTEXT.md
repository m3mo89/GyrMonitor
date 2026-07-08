---
title: AI Context
section: introduction
status: approved
version: 1.0
---

# AI Context

This file provides a compact context summary for AI-assisted development tools working on **GyrMonitor MVP**.

## Product Boundary

GyrMonitor MVP is a livestock monitoring platform for managing cattle records, activity events, alerts, observations, dashboard metrics and offline synchronization.

The MVP is intentionally limited to structured data entry, simulated events and synchronization workflows. It does not include automated video analysis, model inference, hardware acceleration, sensor deployments or advanced animal detection pipelines.

## Core Goal

Build a maintainable, offline-capable software platform that can:

- Manage Gyr cattle records.
- Register activity and inactivity events.
- Calculate risk indicators from structured events.
- Generate and attend alerts.
- Record field observations.
- Display dashboard metrics.
- Synchronize mobile and desktop data after connectivity is restored.

## Architecture Principles

- Clean Architecture.
- Screaming Architecture.
- SOLID principles.
- Domain-first documentation.
- REST API contracts.
- Offline First for mobile and desktop.
- Idempotency for synchronization and retry-safe operations.
- Modular monolith for the backend MVP.

## Main Technologies

- Backend: NestJS + TypeScript.
- Frontend: React + TypeScript + Vite.
- Mobile: .NET MAUI.
- Desktop: .NET MAUI.
- Central database: MariaDB.
- Local database: SQLite.
- Authentication: JWT.

## Main Domains

- Authentication.
- User Management (ADMIN-only account administration).
- Cattle Management.
- Activity Events.
- Risk Analysis.
- Alerts.
- Observations.
- Dashboard.
- Offline Synchronization.

## Live Post-MVP Concerns

Beyond the 9 MVP roadmap phases, these are now real, shipped concerns an AI agent should be aware of when touching related code:

- **Staging deployment**: a Railway/Vercel staging environment exists (`docs/release/deployment-environments.md`, `configure-staging-environment`).
- **UI localization**: all human-authored UI text in frontend/desktop/mobile is resource-based and defaults to Spanish (ADR-016, `openspec/specs/ui-localization/spec.md`). Do not add literal UI strings to components, XAML, or ViewModels — add resource keys instead.
- **Client target platforms**: desktop targets Mac Catalyst/Windows only; mobile targets Android/iOS only (`restrict-client-target-platforms`).
- **Client environment selection**: desktop/mobile no longer hardcode the backend URL. Debug builds default to Local/Development and expose a login-screen picker (Local/Development, Staging, Production); Release builds always start on, and stay on, Production. The picker disappears once the current environment is Production, in either build configuration — there is no in-app way back (`configure-client-environments`, `shared/GyrMonitor.Client.Core/Networking/ApiEnvironmentService.cs`). Both clients also gained a logout action.

## OpenSpec Policy

The `11-openspec/` folder contains guidance only. Actual OpenSpec proposals, designs, tasks and implementation changes are created manually by the project owner.

## Development Rule

Do not implement functionality outside the MVP scope unless a new approved OpenSpec proposal explicitly changes the scope.
