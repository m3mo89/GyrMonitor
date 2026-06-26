---
title: ADR-007: Use JWT, Route Guards and Minimal Sensitive State
area: Security
status: approved
version: 0.8.0
---

# ADR-007: Use JWT, Route Guards and Minimal Sensitive State

## Status

Accepted

## Context

The system uses JWT authentication and protected private routes.

## Decision

Implement login with JWT, protected routes, session expiration and centralized token handling in the HTTP client.

## Alternatives Considered

Server sessions and unprotected routes were rejected for the MVP SPA model.

## Consequences

Improves access control. Requires careful handling of 401 responses and token cleanup.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
