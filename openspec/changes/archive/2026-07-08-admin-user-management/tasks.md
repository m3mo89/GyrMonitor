## 1. Database

- [x] 1.1 Add migration adding `status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE'` to the `users` table
- [x] 1.2 Run `db:migrate` locally and verify existing seeded users default to `ACTIVE`

## 2. Domain and repository port

- [x] 2.1 Add `status: 'ACTIVE' | 'DISABLED'` to the `User` domain type (`backend/src/authentication/domain/user.ts`)
- [x] 2.2 Extend `UserRepository` interface with `create`, `findAll`, `updateStatus`, `updatePasswordHash` (also added `findById`, needed by the disable/reactivate/reset-password use-cases)
- [x] 2.3 Implement the new `UserRepository` methods in `MariaDbUserRepository`
- [x] 2.4 Update `local-user.repository.ts` (in-memory/test double) with the same new methods

## 3. Login rejects disabled users

- [x] 3.1 Update `LoginUseCase.execute` to throw `InvalidCredentialsError` when the matched user's status is `DISABLED`
- [x] 3.2 Add/update authentication unit tests covering the disabled-user login scenario
- [x] 3.3 Add/update authentication e2e test asserting `POST /api/v1/auth/login` returns the same standardized `UNAUTHORIZED` response for a disabled user as for invalid credentials

## 4. User management backend module

- [x] 4.1 Scaffold `backend/src/user-management/` with `application`, `infrastructure`, `http` folders following the `authentication` module's hexagonal structure
- [x] 4.2 Implement `CreateUserUseCase` (validates unique email and approved role, hashes password via `NodePasswordHasher`, defaults status to `ACTIVE`)
- [x] 4.3 Implement `ListUsersUseCase` (returns id, name, email, role, status; excludes password material)
- [x] 4.4 Implement `DisableUserUseCase` (sets status to `DISABLED`; rejects disabling the authenticated caller's own account)
- [x] 4.5 Implement `ReactivateUserUseCase` (sets status to `ACTIVE`)
- [x] 4.6 Implement `ResetPasswordUseCase` (hashes and stores an admin-supplied new password)
- [x] 4.7 Implement `UserManagementController` with `POST /api/v1/users`, `GET /api/v1/users`, `POST /api/v1/users/:id/disable`, `POST /api/v1/users/:id/reactivate`, `POST /api/v1/users/:id/reset-password`, each guarded by the JWT auth guard and `@RolesAllowed(Roles.ADMIN)`
- [x] 4.8 Wire the new module into `AppModule`

## 5. Backend tests

- [x] 5.1 Unit tests for each new use-case (success path, validation failures, self-disable rejection, non-admin forbidden covered at guard level)
- [x] 5.2 E2E tests for each new endpoint: admin success path, non-admin `FORBIDDEN`, duplicate email validation error, self-disable validation error

## 6. Frontend user management feature

- [x] 6.1 Create `frontend/src/features/user-management/users.types.ts` (User, status, role types)
- [x] 6.2 Create `frontend/src/features/user-management/users.api.ts` (list, create, disable, reactivate, reset-password calls via the shared `ApiClient`)
- [x] 6.3 Create `useUsers.ts` TanStack Query hooks (list query; create/disable/reactivate/reset-password mutations with cache invalidation)
- [x] 6.4 Build `UserListPage.tsx` showing name, email, role, status, and row actions (disable/reactivate/reset-password) plus a create-user form/dialog
- [x] 6.5 Register the ADMIN-only route in the router, wrapped in `ProtectedRoute` with `allowedRoles={[Roles.ADMIN]}`
- [x] 6.6 Add navigation entry to reach the page (visible only to ADMIN)

## 7. Frontend tests

- [x] 7.1 Component/page test: non-admin session sees access-denied state on the route
- [x] 7.2 Component/page test: admin can create a user and sees it appear in the list
- [x] 7.3 Component/page test: admin can disable a user and sees status update in the list

## 8. Docs

- [x] 8.1 Update `docs/release/deployment-environments.md` production/staging user-provisioning guidance to reference the new admin user-management endpoints/page instead of `db:seed`
