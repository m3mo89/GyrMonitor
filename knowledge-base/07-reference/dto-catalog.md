---
title: DTO Catalog
section: 07-reference
status: approved
version: 0.7.0
---

# DTO Catalog

This document defines the canonical DTO names and fields used by the API and clients.

## Naming Rule

Use explicit DTO names:

```text
<Action><Resource>RequestDto
<Resource>ResponseDto
<Resource>ListItemDto
```

Avoid generic names such as `CreateDto`, `Response`, `DataDto` or `Payload`.

## Authentication

### LoginRequestDto

| Field      | Type   | Required | Notes                                          |
| ---------- | ------ | -------: | ---------------------------------------------- |
| `email`    | string |      Yes | User email.                                    |
| `password` | string |      Yes | Plain password in request only. Never persist. |

### LoginResponseDto

| Field         | Type                 | Notes                       |
| ------------- | -------------------- | --------------------------- |
| `accessToken` | string               | JWT access token.           |
| `expiresIn`   | number               | Seconds until expiration.   |
| `user`        | AuthenticatedUserDto | Authenticated user summary. |

### AuthenticatedUserDto

| Field   | Type   |
| ------- | ------ |
| `id`    | UUID   |
| `name`  | string |
| `email` | string |
| `role`  | Role   |

## User Management

### UserSummaryDto

| Field    | Type       | Notes                                                        |
| -------- | ---------- | ------------------------------------------------------------ |
| `id`     | UUID       | Server identifier.                                           |
| `name`   | string     |                                                              |
| `email`  | string     |                                                              |
| `role`   | Role       | `ADMIN`, `FIELD_OPERATOR`, `RESEARCHER`, `SYSTEM_GENERATOR`. |
| `status` | UserStatus | `ACTIVE` or `DISABLED`.                                      |

### CreateUserRequestDto

| Field      | Type   | Required | Notes                                          |
| ---------- | ------ | -------: | ---------------------------------------------- |
| `name`     | string |      Yes |                                                |
| `email`    | string |      Yes | Must be unique.                                |
| `role`     | string |      Yes | Must be an approved `Role` value.              |
| `password` | string |      Yes | Plain password in request only. Never persist. |

### ResetPasswordRequestDto

| Field         | Type   | Required | Notes                                                               |
| ------------- | ------ | -------: | ------------------------------------------------------------------- |
| `newPassword` | string |      Yes | Must satisfy the minimum password length enforced by user creation. |

## Cattle

### CattleListItemDto

| Field           | Type         | Notes                          |
| --------------- | ------------ | ------------------------------ |
| `id`            | UUID         | Server identifier.             |
| `tagNumber`     | string       | Visible cattle identifier.     |
| `breed`         | string       | Expected value: `Gyr` for MVP. |
| `sex`           | Sex          | `MALE` or `FEMALE`.            |
| `status`        | CattleStatus | Operational status.            |
| `lastRiskScore` | decimal      | Last known risk score.         |

## Activity Events

### RegisterActivityEventRequestDto

| Field             | Type      |    Required | Notes                                       |
| ----------------- | --------- | ----------: | ------------------------------------------- |
| `eventId`         | UUID      |         Yes | Client/system-generated id for idempotency. |
| `deviceId`        | string    |         Yes | Source device identifier.                   |
| `cattleId`        | UUID      |         Yes | Target cattle.                              |
| `eventType`       | EventType |         Yes | `ACTIVITY` or `INACTIVITY`.                 |
| `inactiveMinutes` | integer   | Conditional | Required for inactivity events.             |
| `confidence`      | decimal   |         Yes | Source confidence, 0 to 1.                  |
| `capturedAt`      | ISO-8601  |         Yes | Real capture time.                          |
| `source`          | string    |         Yes | Example: `DESKTOP_SIMULATOR`.               |

### RegisterActivityEventResponseDto

| Field            | Type         |
| ---------------- | ------------ |
| `eventId`        | UUID         |
| `riskScore`      | decimal      |
| `severity`       | Severity     |
| `alertGenerated` | boolean      |
| `alertId`        | UUID or null |

## Alerts

### AlertListItemDto

| Field       | Type        |
| ----------- | ----------- |
| `id`        | UUID        |
| `cattleId`  | UUID        |
| `tagNumber` | string      |
| `severity`  | Severity    |
| `riskScore` | decimal     |
| `status`    | AlertStatus |
| `reason`    | string      |
| `createdAt` | ISO-8601    |

### UpdateAlertStatusRequestDto

| Field        | Type        |    Required |
| ------------ | ----------- | ----------: |
| `status`     | AlertStatus |         Yes |
| `attendedAt` | ISO-8601    | Conditional |

### UpdateAlertStatusResponseDto

| Field        | Type             |
| ------------ | ---------------- |
| `id`         | UUID             |
| `status`     | AlertStatus      |
| `attendedAt` | ISO-8601 or null |

## Observations

### CreateObservationRequestDto

| Field           | Type     | Required | Notes                                |
| --------------- | -------- | -------: | ------------------------------------ |
| `observationId` | UUID     |      Yes | Client-generated id for idempotency. |
| `comment`       | string   |      Yes | Field inspection note.               |
| `createdAt`     | ISO-8601 |      Yes | Local creation time.                 |
| `clientId`      | string   |      Yes | Mobile/Desktop client id.            |

### ObservationResponseDto

| Field       | Type     |
| ----------- | -------- |
| `id`        | UUID     |
| `alertId`   | UUID     |
| `userId`    | UUID     |
| `comment`   | string   |
| `createdAt` | ISO-8601 |

## Offline Sync

### SyncEventsRequestDto

| Field      | Type               | Required |
| ---------- | ------------------ | -------: |
| `clientId` | string             |      Yes |
| `deviceId` | string             |      Yes |
| `items`    | SyncEventItemDto[] |      Yes |

### SyncEventItemDto

| Field             | Type           |
| ----------------- | -------------- |
| `localId`         | string or UUID |
| `eventId`         | UUID           |
| `cattleId`        | UUID           |
| `eventType`       | EventType      |
| `inactiveMinutes` | integer        |
| `confidence`      | decimal        |
| `capturedAt`      | ISO-8601       |

### SyncResultDto

| Field          | Type           |
| -------------- | -------------- |
| `localId`      | string or UUID |
| `status`       | SyncStatus     |
| `serverId`     | UUID or null   |
| `errorCode`    | string or null |
| `errorMessage` | string or null |

### SyncBatchResponseDto

| Field        | Type            |
| ------------ | --------------- |
| `processed`  | integer         |
| `created`    | integer         |
| `duplicates` | integer         |
| `failed`     | integer         |
| `results`    | SyncResultDto[] |
