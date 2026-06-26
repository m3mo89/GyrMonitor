---
title: Testing Guide
section: 09-guides
status: approved
version: 0.8.0
---

# Testing Guide

## Backend Testing

Prioritize tests for:

- risk calculation;
- alert generation;
- idempotency;
- sync processing;
- role-based access;
- validation and error mapping.

## Frontend Testing

Prioritize tests for:

- login flow;
- dashboard loading and error states;
- alert list filters;
- alert detail and status update;
- observation form validation.

## Offline Testing

Simulate:

- no connectivity;
- retry after failure;
- duplicate sync requests;
- partial sync success;
- stale local data.

## Test Data

Use deterministic sample data:

- cattle tag numbers: `GYR-001`, `GYR-002`, `GYR-003`;
- device IDs: `SIM-001`, `MOBILE-001`, `DESKTOP-001`;
- roles: `ADMIN`, `FIELD_OPERATOR`, `RESEARCHER`, `SYSTEM_GENERATOR`.
