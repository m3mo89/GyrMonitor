---
title: AI-Assisted Development Guide
section: 09-guides
status: approved
version: 0.8.0
---

# AI-Assisted Development Guide

## Purpose

This guide explains how to use AI tools without losing architectural control.

## Recommended Prompt Pattern

```text
Read these files first:
- 02-domain/<module>.md
- 03-requirements/functional-requirements.md
- 05-api/<module>.md
- 06-engineering/backend/<relevant-file>.md
- 07-reference/naming-conventions.md

Then implement only the requested change.
Do not invent new requirements.
Do not modify architecture unless explicitly asked.
```

## Rules

- AI may help write code, tests and documentation.
- AI must not silently create new requirements.
- AI must not generate OpenSpec proposals automatically unless explicitly requested.
- AI outputs must be reviewed against the Knowledge Base.
- API payloads must match `05-api` and `07-reference`.

## Red Flags

Reject AI-generated code when it:

- places business rules in controllers;
- duplicates DTO definitions inconsistently;
- bypasses idempotency for sync operations;
- ignores role-based access;
- adds undocumented endpoints;
- changes folder structure without justification.
