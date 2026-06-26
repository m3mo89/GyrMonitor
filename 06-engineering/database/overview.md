---
title: Database Overview
section: 05-engineering/database
version: 0.6.0
status: approved
---

# Database Overview

GyrMonitor uses two persistence models:

- MariaDB as the central system of record.
- SQLite as local storage for mobile and desktop offline operation.

## Central Database

MariaDB stores users, cattle, activity events, alerts, observations and sync logs.

## Local Database

SQLite stores local alerts, pending events, pending observations and sync queue items.

## Persistence Principle

The backend is authoritative after synchronization. Offline clients may temporarily store unsynchronized records, but final consistency is achieved through sync endpoints and idempotency rules.
