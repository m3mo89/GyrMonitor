---
title: Configuration Reference
section: 07-reference
status: approved
version: 0.7.0
---

# Configuration Reference

This document defines recommended configuration keys. Final values should be set per environment.

## Backend Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `NODE_ENV` | Runtime environment. | `development` |
| `PORT` | Backend HTTP port. | `3000` |
| `API_PREFIX` | API route prefix. | `/api/v1` |
| `DATABASE_URL` | MariaDB connection string. | `mysql://user:pass@localhost:3306/gyrmonitor` |
| `JWT_SECRET` | JWT signing secret. | Use secure secret manager. |
| `JWT_EXPIRES_IN` | JWT expiration. | `3600s` |
| `IDEMPOTENCY_TTL_HOURS` | Idempotency key retention window. | `24` |
| `SYNC_BATCH_SIZE` | Max sync items per request. | `100` |
| `LOG_LEVEL` | Logging verbosity. | `info` |

## Frontend Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL. | `http://localhost:3000/api/v1` |
| `VITE_APP_NAME` | Application display name. | `GyrMonitor` |
| `VITE_ENABLE_MOCKS` | Enable mocked data for local UI development. | `false` |

## Mobile/Desktop Configuration

| Setting | Purpose | Recommended Default |
|---|---|---|
| `ApiBaseUrl` | Backend API base URL. | Environment-specific. |
| `ClientId` | Logical client identifier. | Generated per installation. |
| `SyncIntervalSeconds` | Sync polling interval after connectivity returns. | `30` |
| `MaxRetryCount` | Maximum sync retries before marking failed. | `5` |
| `LocalDatabaseName` | SQLite file name. | `gyrmonitor.db` |

## Configuration Principles

1. Never commit production secrets.
2. Use environment variables for infrastructure settings.
3. Use typed configuration objects in backend and clients.
4. Validate required configuration during application startup.
