---
title: ADR-010: Validate Forms in Frontend and Backend
area: Frontend/API
status: approved
version: 0.8.0
---

# ADR-010: Validate Forms in Frontend and Backend

## Status

Accepted

## Context

The frontend includes login, filters and observation forms, but backend validation remains authoritative.

## Decision

Validate simple input rules in frontend for UX while enforcing all critical validation in backend.

## Alternatives Considered

Backend-only validation reduces frontend complexity but harms UX. Duplicating all domain rules is risky.

## Consequences

Improves usability without moving business authority to the frontend.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
