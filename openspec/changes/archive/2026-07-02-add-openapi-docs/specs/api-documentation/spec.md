## ADDED Requirements

### Requirement: Interactive API documentation UI

The backend SHALL serve an interactive OpenAPI (Swagger) documentation UI describing all registered HTTP controllers and routes.

#### Scenario: Docs UI is reachable in development

- **WHEN** the backend runtime starts in a non-production environment
- **THEN** a browsable Swagger UI is served at `/api/docs`

#### Scenario: Docs UI reflects registered controllers

- **WHEN** a client loads `/api/docs`
- **THEN** the page lists every controller registered in `AppModule`, grouped by tag

#### Scenario: Docs UI can be disabled

- **WHEN** the backend is started with API documentation explicitly disabled via configuration
- **THEN** requests to `/api/docs` do not return the documentation UI

### Requirement: Machine-readable OpenAPI document

The backend SHALL expose the generated OpenAPI document as JSON for tooling and codegen use.

#### Scenario: OpenAPI JSON is retrievable

- **WHEN** a client requests `/api/docs-json`
- **THEN** the backend returns a valid OpenAPI document in JSON format

#### Scenario: OpenAPI document lists all routes

- **WHEN** the OpenAPI document is generated
- **THEN** it includes a path entry for every route exposed by the backend's controllers

### Requirement: Authenticated routes documented with bearer auth

The backend SHALL mark routes protected by the existing JWT authentication guard as requiring bearer authentication in the generated OpenAPI document.

#### Scenario: Protected route requires bearer auth in docs

- **WHEN** the OpenAPI document is generated for a route guarded by the authentication guard
- **THEN** that route's documented security requirements include bearer token authentication

#### Scenario: Public route has no auth requirement in docs

- **WHEN** the OpenAPI document is generated for an unguarded public route
- **THEN** that route's documented security requirements are empty
