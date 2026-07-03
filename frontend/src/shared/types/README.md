# Shared Types

`ApiEnvelope<T>` describes the `{ success, data, pagination? }` response shape returned by every backend endpoint. Defined once here and imported by each feature's `*.api.ts` module instead of being redeclared per feature.
