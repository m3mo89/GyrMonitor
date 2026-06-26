# Frontend State Management

Frontend state is divided into remote state and local UI state.

## Remote State

Use TanStack Query for:

- dashboard metrics;
- cattle lists and details;
- event history;
- alert lists and details;
- metrics and trends.

## Local State

Use React state for:

- selected filters;
- modal visibility;
- temporary form state;
- UI-only toggles.

Use Context only for true cross-cutting UI concerns such as session information or theme preferences.

## Rule

Do not copy remote data into global state unless there is a clear reason. TanStack Query owns server state.
