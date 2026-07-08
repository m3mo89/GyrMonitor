## ADDED Requirements

### Requirement: Environment-configured CORS origins

The backend runtime SHALL configure browser CORS origins from environment configuration while preserving local development defaults.

#### Scenario: Default local CORS origins are available

- **WHEN** the backend starts without an explicit CORS origin configuration
- **THEN** local development origins `http://127.0.0.1:5173` and `http://localhost:5173` are allowed

#### Scenario: Staging CORS origin is configured

- **WHEN** the backend starts with a configured allowlist containing `https://gyr-monitor-staging.vercel.app`
- **THEN** browser requests from that origin are allowed by CORS

#### Scenario: Production CORS origin is configured

- **WHEN** the backend starts with a configured allowlist containing `https://gyr-monitor.vercel.app`
- **THEN** browser requests from that origin are allowed by CORS

#### Scenario: Multiple CORS origins are configured

- **WHEN** the backend starts with multiple configured origins
- **THEN** each listed origin is parsed and applied without requiring code changes

#### Scenario: CORS configuration avoids wildcard staging access

- **WHEN** the backend runs in staging or production
- **THEN** documented configuration uses exact allowed origins rather than a wildcard origin
