---
title: ADR-006: Use Resilient Read Cache for Web Views
area: Frontend Web
status: approved
version: 0.8.0
---

# ADR-006: Use Resilient Read Cache for Web Views

## Status

Accepted

## Context

The web dashboard should tolerate temporary network failures, although full offline-first behavior belongs to mobile and desktop clients.

## Decision

Use TanStack Query in-memory cache and keep the last successful result for critical read views.

## Alternatives Considered

No cache, IndexedDB persistence and full PWA service worker strategies were considered. Full persistence is deferred.

## Consequences

Improves UX during transient failures. Users must see when data may be stale.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
