# Database Foundation

GyrMonitor uses two persistence models:

- MariaDB for the backend system of record.
- SQLite for local mobile and desktop offline storage.

Source guidance:

- `knowledge-base/06-engineering/database/overview.md`
- `knowledge-base/07-reference/directory-map.md`

This Phase 1 foundation creates structure and guidance only. It does not create live migrations, production data, or authoritative domain schema.

## Structure

```text
database/
  mariadb/
    migrations/
    schema/
    seeds/
  sqlite/
    mobile/
    desktop/
    seeds/
```
