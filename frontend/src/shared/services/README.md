# Shared Services

`ApiClient` is the typed fetch wrapper used by every feature's `*.api.ts` module: it injects the bearer token, sets JSON headers, and triggers session clearing on `401` responses. Instantiated once per session in `AuthProvider`.
