# Shared Services

`ApiClient` is the typed fetch wrapper used by feature infrastructure API adapters: it injects the bearer token, sets JSON headers, and triggers session clearing on `401` responses. It is created through the auth application layer and exposed by `AuthProvider`.
