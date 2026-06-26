---
title: Mobile Overview
section: 05-engineering/mobile
technology: .NET MAUI
version: 0.6.0
status: approved
---

# Mobile Overview

The mobile client is used by field operators to review alerts, register observations and continue working when connectivity is unavailable.

## Responsibilities

- Login and session handling.
- Display pending and active alerts.
- Show alert detail.
- Register observations.
- Mark alerts as attended when allowed.
- Persist offline operations in SQLite.
- Synchronize pending operations when connectivity returns.

## Scope Boundary

The mobile client does not calculate authoritative risk scores. It may show cached risk and severity values provided by the backend.
