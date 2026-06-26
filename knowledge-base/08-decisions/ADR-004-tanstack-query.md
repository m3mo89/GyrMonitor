---
title: ADR-004: Use TanStack Query for Remote State
area: Frontend Web
status: approved
version: 0.8.0
---

# ADR-004: Use TanStack Query for Remote State

## Status

Accepted

## Context

The frontend consumes dynamic backend data requiring cache, retries, invalidation and loading states.

## Decision

Use TanStack Query for remote server state. Use local React state or Context only for simple UI state.

## Alternatives Considered

Redux Toolkit, Zustand and Context-only approaches were evaluated. They do not solve server-state cache and retry behavior as directly.

## Consequences

Improves perceived performance and resilience. Requires query keys, staleTime and invalidation discipline.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
