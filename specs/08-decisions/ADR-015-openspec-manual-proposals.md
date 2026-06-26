---
title: ADR-015: Create OpenSpec Proposals Manually
area: Process
status: approved
version: 0.8.0
---

# ADR-015: Create OpenSpec Proposals Manually

## Status

Accepted

## Context

The user wants to review proposals and implementations manually to keep control over design decisions.

## Decision

Do not generate OpenSpec changes or implementation proposals automatically. The repository only provides guidance, checklists and templates.

## Alternatives Considered

Automatically generating all proposals was rejected because it reduces deliberate review.

## Consequences

Improves ownership and learning. The documentation must make manual proposal creation easier.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
