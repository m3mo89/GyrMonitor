## ADDED Requirements

### Requirement: Deployed API base URL configuration
The web frontend SHALL document and verify the API base URL used by local, staging, and production builds.

#### Scenario: Local frontend targets local backend
- **WHEN** the frontend runs in development
- **THEN** its API base URL points to a local backend API root

#### Scenario: Staging frontend targets staging backend
- **WHEN** the frontend is built for staging
- **THEN** its configured API base URL points to `https://gyrmonitor-staging.up.railway.app/api/v1`

#### Scenario: Production frontend targets production backend
- **WHEN** the frontend is built for production
- **THEN** its configured API base URL points to `https://gyrmonitor-production.up.railway.app/api/v1` and does not reuse local or staging values

#### Scenario: Build-time configuration is documented
- **WHEN** a developer or operator configures Vercel environment variables
- **THEN** project documentation states that `VITE_API_BASE_URL` is evaluated at build time and requires a redeploy after changes

#### Scenario: Local fallback is not mistaken for deployed environment
- **WHEN** a deployed frontend uses the local development fallback API URL
- **THEN** documentation or verification identifies that as an environment misconfiguration
