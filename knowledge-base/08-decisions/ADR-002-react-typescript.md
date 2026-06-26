---
title: ADR-002: Use React + TypeScript with Vite
area: Frontend Web
status: approved
version: 0.8.0
---

# ADR-002: Use React + TypeScript with Vite

## Status

Accepted

## Context

The frontend requires reusable components, strict typing, modular features and fast iteration.

## Decision

Use React + TypeScript with Vite for the MVP.

## Alternatives Considered

Angular, Vue and Next.js were considered. Angular adds more framework weight; Vue is viable but less aligned with the current plan; Next.js is unnecessary while SSR is out of scope.

## Consequences

Improves type safety and developer experience. Requires disciplined folder structure and shared conventions.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
