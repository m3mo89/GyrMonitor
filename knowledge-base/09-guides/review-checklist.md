---
title: Review Checklist
section: 09-guides
status: approved
version: 0.8.0
---

# Review Checklist

## Architecture

- [ ] The change respects Clean Architecture boundaries.
- [ ] Domain rules remain independent from framework details.
- [ ] Module boundaries are clear.

## Requirements

- [ ] The change maps to an existing requirement or approved OpenSpec proposal.
- [ ] Acceptance criteria are satisfied.
- [ ] Business rules are preserved.

## API

- [ ] Endpoint names follow conventions.
- [ ] DTOs match the catalog.
- [ ] Errors follow the standard error model.
- [ ] Security and roles are enforced.

## Offline First

- [ ] Local persistence is considered when required.
- [ ] Sync operations use idempotency where required.
- [ ] Duplicate events are not created during retries.

## Quality

- [ ] Tests are included or updated.
- [ ] Logs do not expose sensitive data.
- [ ] Documentation is updated.
