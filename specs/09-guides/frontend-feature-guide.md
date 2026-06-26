---
title: Frontend Feature Guide
section: 09-guides
status: approved
version: 0.8.0
---

# Frontend Feature Guide

## Goal

Frontend features should be organized by business capability and consume the API through typed clients.

## Recommended Structure

```text
src/features/<feature>/
├── components/
├── hooks/
├── pages/
├── services/
├── types/
└── utils/
```

## Rules

- UI components should not implement business rules.
- Remote state should use TanStack Query.
- API calls should live in feature services or shared API clients.
- Form validation improves UX but backend validation is authoritative.
- Error, loading and empty states must be explicit.

## Query Naming

Use descriptive query keys:

```ts
['alerts', { status, severity, page }]
['dashboard', { from, to }]
['cattle', cattleId, 'events']
```
