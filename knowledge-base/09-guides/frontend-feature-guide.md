---
title: Frontend Feature Guide
section: 09-guides
status: approved
version: 0.9.0
---

# Frontend Feature Guide

## Goal

Frontend features should be organized by business capability and consume the API through typed clients.

## Recommended Structure

Complex features use Clean Architecture layers inside the business capability folder:

```text
src/features/<feature>/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

Use this layout when a feature has mutations, client-side business validation, multiple pages, route-level orchestration, browser/storage adapters, or feature-specific calculations. Very small read-only features may stay flat temporarily, but new behavior should promote them to the layered shape.

## Rules

- UI components should not implement business rules.
- Presentation code consumes feature application hooks/use-cases and domain types; it must not import API adapters directly.
- Domain code must not import React, router APIs, TanStack Query, browser storage or HTTP clients.
- Remote state should use TanStack Query.
- API calls should live in feature infrastructure adapters or shared API clients.
- Form validation improves UX but backend validation is authoritative.
- Error, loading and empty states must be explicit.

## Query Naming

Use descriptive query keys:

```ts
['alerts', { status, severity, page }]
['dashboard', { from, to }]
['cattle', cattleId, 'events']
```
