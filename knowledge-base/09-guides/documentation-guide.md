---
title: Documentation Guide
section: 09-guides
status: approved
version: 0.8.0
---

# Documentation Guide

## Document Types

| Type | Purpose |
| --- | --- |
| Product | Explains the product vision, scope and users. |
| Domain | Explains business concepts without technology. |
| Requirements | Defines what the system must do. |
| Architecture | Explains high-level structure and trade-offs. |
| API | Defines integration contracts. |
| Engineering | Explains implementation approach. |
| Reference | Provides fast lookup tables and catalogs. |
| ADR | Records architectural decisions. |
| Guide | Explains how to perform work. |

## Writing Rules

- One document should answer one main question.
- Prefer explicit sections over long paragraphs.
- Use tables for lookup and comparisons.
- Use Mermaid for diagrams.
- Use code blocks for JSON, HTTP and folder structures.
- Avoid duplicating authoritative content; link to the source of truth.

## Update Rules

Update documentation when:

- a requirement changes;
- an endpoint changes;
- a DTO changes;
- a business rule changes;
- an architectural decision changes;
- a module boundary changes.
