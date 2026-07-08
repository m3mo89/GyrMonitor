# Deployment Environments Specification

## Purpose

Define the environment contract for development, staging, and production so that each frontend build targets the matching backend API, each backend only accepts browser requests from its intended frontend origin, and operators have documented steps to verify that a deployed environment is ready.

## Requirements

### Requirement: Environment frontend backend binding
The system SHALL define deployment contracts that bind each frontend environment to the matching backend API using explicit environment configuration.

#### Scenario: Development build uses local API
- **WHEN** the frontend runs in local development
- **THEN** it uses a local API base URL such as `http://localhost:3000/api/v1` or `http://127.0.0.1:3000/api/v1`

#### Scenario: Staging build uses Railway staging API
- **WHEN** the staging frontend is built for `https://gyr-monitor-staging.vercel.app`
- **THEN** the build configuration uses `https://gyrmonitor-staging.up.railway.app/api/v1` as the API base URL

#### Scenario: Production build requires explicit production API
- **WHEN** the frontend is built for production
- **THEN** the build configuration uses `https://gyrmonitor-production.up.railway.app/api/v1` and does not fall back to local or staging URLs

#### Scenario: Missing deployed API base URL is diagnosable
- **WHEN** a deployed frontend is missing the configured API base URL or is built with a localhost fallback
- **THEN** deployment documentation or verification output identifies the missing or invalid `VITE_API_BASE_URL` value

### Requirement: Environment backend browser access
Each deployed backend SHALL allow browser requests from the configured frontend origin for the same environment without allowing arbitrary origins.

#### Scenario: Development frontend origins are allowed locally
- **WHEN** the backend runs without explicit CORS origin configuration
- **THEN** local development origins `http://127.0.0.1:5173` and `http://localhost:5173` are allowed

#### Scenario: Staging frontend origin is allowed in staging
- **WHEN** a browser request originates from `https://gyr-monitor-staging.vercel.app`
- **THEN** the staging backend accepts CORS preflight and request handling for public API routes

#### Scenario: Production frontend origin is allowed in production
- **WHEN** a browser request originates from `https://gyr-monitor.vercel.app`
- **THEN** the production backend accepts CORS preflight and request handling for public API routes

#### Scenario: Unconfigured origin is not implicitly trusted
- **WHEN** a browser request originates from an origin not present in the configured allowlist
- **THEN** the backend does not treat that origin as allowed by default

### Requirement: Environment deployment verification
The project SHALL provide documented verification steps for confirming that each environment's API availability, CORS, database preparation, and login are ready.

#### Scenario: Operator verifies staging readiness
- **WHEN** an operator follows staging verification after deployment
- **THEN** they can confirm API availability, frontend-to-backend CORS allowance, migrated database schema, prepared staging users, and successful login response shape

#### Scenario: Operator verifies production readiness
- **WHEN** an operator follows production verification after deployment
- **THEN** they can confirm API availability, exact production CORS allowance, migrated database schema, provisioned production users, and successful login response shape without relying on seed credentials

#### Scenario: Login failure cause is isolated
- **WHEN** environment login fails during verification
- **THEN** the verification path distinguishes API reachability, CORS rejection, missing database user provisioning, and invalid credentials
