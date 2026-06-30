## 1. Runtime Bootstrap

- [x] 1.1 Replace the placeholder `backend/src/main.ts` bootstrap with a NestFactory application that loads `AppModule`
- [x] 1.2 Apply the configured API prefix before starting the HTTP server
- [x] 1.3 Start listening on the configured port and log a concise startup message
- [x] 1.4 Add a minimal public availability endpoint under the API prefix that returns a successful non-secret response

## 2. Package Scripts and Tooling

- [x] 2.1 Add backend development script for starting the Nest app from TypeScript source
- [x] 2.2 Add backend compiled start script for running built output
- [x] 2.3 Add or adjust build tooling so compiled output includes the runnable backend entrypoint
- [x] 2.4 Add backend HTTP smoke script entry in `backend/package.json`

## 3. HTTP Smoke Test

- [x] 3.1 Implement a Node smoke test script that starts the backend on a deterministic test port
- [x] 3.2 Poll the public availability endpoint until it returns a successful response or times out
- [x] 3.3 Fail the smoke test when the backend exits early, times out, or returns an unexpected response
- [x] 3.4 Ensure the smoke test terminates the backend child process on success and failure

## 4. Verification and Documentation

- [x] 4.1 Run backend build and existing verification commands after runtime wiring
- [x] 4.2 Run the HTTP smoke test command and confirm it passes
- [x] 4.3 Update backend documentation or README script references so developers can discover `dev`, `start`, and smoke commands
