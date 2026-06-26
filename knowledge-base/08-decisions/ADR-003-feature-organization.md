---
title: ADR-003: Organize Frontend by Features and Screaming Architecture
area: Frontend Web
status: approved
version: 0.8.0
---

# ADR-003: Organize Frontend by Features and Screaming Architecture

## Status

Accepted

## Context

The project must communicate the business domain clearly and avoid a generic technical folder structure.

## Decision

Organize frontend code by business features: auth, dashboard, cattle, events, alerts and metrics.

## Alternatives Considered

Technical folders such as components/pages/services were considered but scale poorly and hide domain intent.

## Consequences

Improves module ownership and maintainability. Requires clear rules for what belongs in shared.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
