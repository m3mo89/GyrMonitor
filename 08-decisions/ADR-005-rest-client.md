---
title: ADR-005: Use REST with a Typed HTTP Client
area: Frontend/API
status: approved
version: 0.8.0
---

# ADR-005: Use REST with a Typed HTTP Client

## Status

Accepted

## Context

The backend exposes REST contracts and the frontend must consume authentication, dashboard, cattle, event, alert and sync endpoints.

## Decision

Implement typed HTTP clients per module with centralized base URL, JWT handling, error mapping and DTO serialization.

## Alternatives Considered

GraphQL and gRPC were considered but exceed the MVP complexity and are less direct for browser clients.

## Consequences

Separates UI from transport logic and supports testing. DTOs must remain synchronized with the API reference.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
