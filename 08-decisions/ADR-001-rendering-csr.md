---
title: ADR-001: Use Client Side Rendering for the Web Dashboard
area: Frontend Web
status: approved
version: 0.8.0
---

# ADR-001: Use Client Side Rendering for the Web Dashboard

## Status

Accepted

## Context

The web application is a private, authenticated and highly interactive dashboard. It does not require SEO or public content rendering.

## Decision

Use Client Side Rendering (CSR) with React and TypeScript. The web app will behave as a SPA that consumes the REST API dynamically.

## Alternatives Considered

SSR, SSG, ISR and Islands Architecture were evaluated. They add value for public or semi-static content, but GyrMonitor is operational and highly interactive.

## Consequences

Simpler MVP, direct integration with React Router and TanStack Query, limited SEO, possible bundle-size concerns mitigated with code splitting.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
