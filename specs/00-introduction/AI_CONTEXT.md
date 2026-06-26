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
- Cattle Management.
- Activity Events.
- Risk Analysis.
- Alerts.
- Observations.
- Dashboard.
- Offline Synchronization.

## OpenSpec Policy

The `11-openspec/` folder contains guidance only. Actual OpenSpec proposals, designs, tasks and implementation changes are created manually by the project owner.

## Development Rule

Do not implement functionality outside the MVP scope unless a new approved OpenSpec proposal explicitly changes the scope.
