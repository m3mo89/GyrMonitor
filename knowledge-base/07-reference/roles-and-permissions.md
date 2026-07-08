---
title: Roles and Permissions
section: 07-reference
status: approved
version: 0.7.0
---

# Roles and Permissions

## Roles

| Role | Purpose |
| --- | --- |
| `ADMIN` | Administrative and operational control. |
| `FIELD_OPERATOR` | Field inspection and alert handling. |
| `RESEARCHER` | Dashboard, trends and historical analysis. |
| `SYSTEM_GENERATOR` | Event ingestion from simulator, desktop client or controlled test data. |

## Permission Matrix

| Capability | ADMIN | FIELD_OPERATOR | RESEARCHER | SYSTEM_GENERATOR |
| --- | :---: | :---: | :---: | :---: |
| Login | ✓ | ✓ | ✓ | Optional |
| View dashboard | ✓ | | ✓ | |
| List cattle | ✓ | | ✓ | |
| View cattle history | ✓ | | ✓ | |
| Register activity event | ✓ | | | ✓ |
| List alerts | ✓ | ✓ | ✓ | |
| View alert detail | ✓ | ✓ | ✓ | |
| Update alert status | ✓ | ✓ | | |
| Add observation | ✓ | ✓ | | |
| Sync events | ✓ | ✓ | | ✓ |
| Sync observations | ✓ | ✓ | | |

## Security Rules

1. All endpoints except `/auth/login` and optionally `/health` require JWT.
2. Clients must use `Authorization: Bearer <token>`.
3. Sensitive data must not be stored in frontend state longer than required.
4. System-generated events must be traceable to a device or client identifier.
