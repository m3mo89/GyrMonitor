# Router Boundary

Declarative route definitions for the web SPA, built with `react-router-dom`.

`AppRouter.tsx` maps every path (`/dashboard`, `/cattle`, `/cattle/:cattleId`, `/alerts`, `/alerts/:alertId`) to its feature page, applies authentication and role gating through the shared `ProtectedRoute` component, and renders the `SYSTEM_GENERATOR` integration-account message in place of the routed content when applicable. Unmatched paths render a 404 state.
