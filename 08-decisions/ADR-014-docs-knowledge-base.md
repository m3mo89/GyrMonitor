---
title: ADR-014: Maintain a Product Knowledge Base as Source of Truth
area: Documentation
status: approved
version: 0.8.0
---

# ADR-014: Maintain a Product Knowledge Base as Source of Truth

## Status

Accepted

## Context

The project began with academic DOCX documents but needs living documentation for implementation and AI-assisted development.

## Decision

Maintain gyrmonitor-docs as a Product Knowledge Base organized by product, domain, requirements, architecture, API, engineering and reference.

## Alternatives Considered

Keeping only DOCX or generating isolated sprint ZIPs was rejected.

## Consequences

Documentation becomes the source of truth before OpenSpec and implementation. Requires discipline to update docs when decisions change.

## Impacted Documentation

- Domain documentation when the decision affects business concepts.
- Requirements when the decision changes expected behavior.
- Architecture when the decision affects system structure.
- API or Engineering documentation when the decision affects implementation.

## Review Notes

This ADR should be revisited if the MVP scope changes, if the system introduces new runtime constraints, or if future versions require a different trade-off.
