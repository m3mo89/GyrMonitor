# Contributing to GyrMonitor

GyrMonitor follows a documentation-first and OpenSpec-guided workflow.

## Development workflow

1. Review the Knowledge Base.
2. Create or update an OpenSpec proposal manually.
3. Review the proposal, design, and tasks.
4. Implement only the approved scope.
5. Add or update tests.
6. Update documentation when behavior changes.
7. Open a pull request using the PR template.

## MVP boundary

Contributions must stay inside the MVP scope unless a new proposal explicitly changes the scope.

The MVP includes:

- Authentication.
- Cattle management.
- Activity events.
- Alerts.
- Observations.
- Dashboard.
- Offline synchronization.
- Web, mobile, desktop, backend, MariaDB, and SQLite.

## Documentation standards

- Use Markdown.
- Prefer small documents with one responsibility.
- Update `99-meta/` when adding important documents or module relationships.
- Keep `11-openspec/` as guidance only; actual OpenSpec proposals are created manually during development.

## Pull requests

Each pull request should include:

- Summary.
- Related OpenSpec change.
- Related requirement or module.
- Tests, when applicable.
- Documentation updates, when applicable.

## Commit guidance

Prefer clear, scoped commits:

- `docs: update API reference`
- `spec: add authentication proposal`
- `backend: implement login use case`
- `frontend: add dashboard route`
