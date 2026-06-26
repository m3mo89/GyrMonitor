---
title: Backend Module Guide
section: 09-guides
status: approved
version: 0.8.0
---

# Backend Module Guide

## Goal

Backend modules should expose domain capabilities through clear use cases, controllers and repositories.

## Recommended Structure

```text
src/<module>/
├── application/
│   ├── ports/
│   └── use-cases/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── services/
├── infrastructure/
│   ├── persistence/
│   └── adapters/
└── presentation/
    ├── controllers/
    └── dto/
```

## Rules

- Controllers adapt HTTP to use cases.
- Use cases orchestrate application flow.
- Domain entities enforce invariants.
- Repositories are accessed through ports.
- Infrastructure implements persistence and external integrations.

## Naming

- Use case: `RegisterActivityEventUseCase`
- Controller: `ActivityEventsController`
- Repository port: `IActivityEventRepository`
- DTO: `RegisterActivityEventRequestDto`
