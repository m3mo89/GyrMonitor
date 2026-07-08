# GyrMonitor

> **Offline-first livestock monitoring platform** designed to support cattle management through event registration, observations, alerts, dashboards, and synchronization in environments with intermittent connectivity.

![Status](https://img.shields.io/badge/status-MVP%20Development-blue)
![Architecture](https://img.shields.io/badge/architecture-Clean%20Architecture-success)
![Development](https://img.shields.io/badge/process-OpenSpec-orange)

---

## Overview

GyrMonitor is a modular software platform for livestock management.

The project follows a **Specification-Driven Development (SDD)** approach, where every functional change is proposed, reviewed, approved, and implemented through **OpenSpec**.

The current repository focuses exclusively on the **MVP**.

> **Computer Vision, Machine Learning, Edge Computing and IoT are intentionally out of scope for this repository.** These capabilities will be developed later as independent research projects built on top of the GyrMonitor platform.

---

# MVP Features

- Authentication
- Cattle Management
- Observations
- Activity Events
- Alerts
- Dashboard
- Offline Synchronization

---

# Architecture Principles

The project is built around the following principles:

- Clean Architecture
- Domain-Driven Design (Lite)
- Offline-First
- Modular Architecture
- Specification-Driven Development
- AI-Assisted Development

---

# Technology Stack

| Layer | Technology |
|--------|------------|
| Backend | NestJS |
| Frontend | React + TypeScript |
| Desktop | .NET MAUI |
| Mobile | .NET MAUI |
| Database | MariaDB |
| Local Database | SQLite |
| API | REST |

---

# Repository Structure

```text
.
├── docs/                  # Academic documentation and project deliverables
├── knowledge-base/        # Product Knowledge Base (Single Source of Truth)
├── openspec/              # OpenSpec proposals, designs and tasks
├── backend/               # Backend application (coming soon)
├── frontend/              # Frontend application (coming soon)
├── mobile/                # Mobile application (coming soon)
├── desktop/               # Desktop application (coming soon)
├── .agents/               # AI agents
├── .claude/               # Claude commands and skills
├── .codex/                # Codex skills
└── .github/               # GitHub configuration
```

---

# Documentation

| Folder | Purpose |
|----------|---------|
| `docs/` | Original academic documents and project deliverables |
| `knowledge-base/` | Product documentation and technical specifications (Single Source of Truth) |
| `openspec/` | Proposed software changes managed with OpenSpec |

---

# Development Workflow

Every feature follows the same lifecycle.

```text
Knowledge Base
        │
        ▼
OpenSpec Proposal
        │
        ▼
Architecture Review
        │
        ▼
Implementation
        │
        ▼
Testing
        │
        ▼
Documentation Update
```

The documentation inside **knowledge-base/** is considered the **Single Source of Truth** for the entire project.

---

# Project Status

| Phase | Status |
|--------|:------:|
| Knowledge Base | ✅ Frozen baseline |
| Phase 1 — Foundation | 🚧 In Progress |
| OpenSpec Proposals | ⏳ Pending |
| MVP Development | ⏳ Pending |

---

# MVP Scope

## Included

- User Authentication
- Cattle Management
- Observations
- Activity Events
- Alerts
- Dashboard
- Offline Synchronization

## Out of Scope

The following capabilities are intentionally excluded from the MVP:

- Computer Vision
- Machine Learning
- Edge Computing
- Raspberry Pi
- NVIDIA Jetson
- ONNX Runtime
- TensorRT
- IoT Devices
- Automatic Activity Detection

These capabilities belong to future research projects and are not part of this repository.

---

# Getting Started

The project is currently in the foundation stage.

The next milestone is:

```text
Create the project foundation
        ↓
Create the first OpenSpec proposal
        ↓
Implement Authentication
```

---

# Staging Deployment Checklist

For the complete development, staging, and production matrix, see `docs/release/deployment-environments.md`.

Expected staging URLs:

- Frontend: `https://gyr-monitor-staging.vercel.app`
- Backend API: `https://gyrmonitor-staging.up.railway.app/api/v1`

Expected production URLs:

- Frontend: `https://gyr-monitor.vercel.app`
- Backend API: `https://gyrmonitor-production.up.railway.app/api/v1`

Railway backend variables:

- `API_PREFIX=/api/v1`
- `BACKEND_HOST=0.0.0.0` when required by Railway
- `CORS_ALLOWED_ORIGINS=https://gyr-monitor-staging.vercel.app`
- `DATABASE_URL` or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` with a staging secret value

Vercel frontend variables:

- `VITE_API_BASE_URL=https://gyrmonitor-staging.up.railway.app/api/v1`
- `VITE_APP_NAME=GyrMonitor`
- `VITE_ENABLE_MOCKS=false`
- `VITE_AUTH_SESSION_STORAGE=localStorage`

For branch-based builds, configure the Vercel staging branch to run:

```sh
npm run build:staging --workspace frontend
```

Configure the Vercel production branch to run:

```sh
npm run build:production --workspace frontend
```

The generic frontend build also infers staging from `VERCEL_GIT_COMMIT_REF=staging` and production from `VERCEL_ENV=production`, but explicit branch build commands are easier to audit.

Local development keeps using `npm run dev --workspace frontend` or the default local `.env.example` values. After changing Vercel `VITE_*` variables, redeploy the frontend because Vite embeds them at build time. Before testing login, run Railway database migrations and seed deterministic non-production users or provision an equivalent staging user. If staging login fails, check API reachability first, then CORS allow-origin headers, then database seed/provisioning, then credentials.

Rollback for this config-only deployment is to restore the previous Railway/Vercel environment values and redeploy the affected service. No database rollback is expected unless staging seed/provisioning was changed separately.

---

# Contributing

Before contributing, please read:

- `CONTRIBUTING.md`
- `knowledge-base/09-guides/`
- `knowledge-base/11-openspec/README.md`

All functional changes **must start with an OpenSpec proposal** before implementation.

---

# License

This repository is currently private.

All rights reserved.

---

# Acknowledgments

GyrMonitor is being developed following a **Specification-Driven Development** workflow using **OpenSpec**, supported by a structured **Knowledge Base** and a modular **Clean Architecture**.

The goal is to build a maintainable, scalable, and well-documented platform where every architectural decision is traceable from requirements to implementation.
