## 1. Backend Authentication Foundation

- [x] 1.1 Add authentication dependencies and non-secret configuration entries for JWT signing, expiration, and password hashing.
- [x] 1.2 Implement the authentication module structure for domain, application, infrastructure, and HTTP adapter boundaries.
- [x] 1.3 Add the user identity model, approved role enum, and authenticated user DTO mapping without exposing password material.
- [x] 1.4 Implement password hashing and verification utilities with tests.
- [x] 1.5 Add local/test user setup or fixtures using hashed passwords and no committed production secrets.

## 2. Backend Login and Guards

- [x] 2.1 Implement `POST /api/v1/auth/login` using the documented `LoginRequestDto` and `LoginResponseDto` shape.
- [x] 2.2 Return standardized validation and `UNAUTHORIZED` error envelopes for invalid login requests and credentials.
- [x] 2.3 Implement JWT creation with user identity and role claims.
- [x] 2.4 Implement a reusable JWT authentication guard for protected endpoints.
- [x] 2.5 Implement reusable role authorization primitives that return `FORBIDDEN` for authenticated users without an allowed role.
- [x] 2.6 Add a minimal protected test endpoint or test harness needed to verify guard behavior without implementing domain modules.

## 3. Frontend Authentication Foundation

- [x] 3.1 Build the login page and form validation under the frontend auth feature boundary.
- [x] 3.2 Implement frontend login API integration and user-friendly error states.
- [x] 3.3 Add centralized session state for access token, authenticated user summary, logout, and session cleanup.
- [x] 3.4 Update the shared HTTP client to attach `Authorization: Bearer <token>` for authenticated requests.
- [x] 3.5 Add 401 handling that clears session state and returns users to `/login`.
- [x] 3.6 Add protected-route and role-route behavior, including an access-denied state.

## 4. Documentation and Configuration

- [x] 4.1 Update backend and frontend README/setup notes with authentication commands and local-only credential guidance.
- [x] 4.2 Update environment examples with required non-secret authentication settings.
- [x] 4.3 Ensure documentation references point back to the relevant Knowledge Base documents instead of duplicating long requirements.

## 5. Verification

- [x] 5.1 Add backend tests for successful login, invalid credentials, request validation, password omission, JWT guard behavior, and role denial.
- [x] 5.2 Add frontend tests for login success, login failure, token attachment, logout cleanup, protected-route redirect, access denied, and 401 cleanup.
- [x] 5.3 Run backend verification commands and fix authentication-related failures.
- [x] 5.4 Run frontend verification commands and fix authentication-related failures.
- [x] 5.5 Run OpenSpec validation/status checks for `add-authentication`.
