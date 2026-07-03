# Metrics Feature Boundary

No implementation exists here, and no distinct roadmap item backs a standalone "metrics" feature: `knowledge-base/10-roadmap/` has no metrics-specific phase, and ADR-009 ("Visualize Metrics from Backend Aggregates") scopes metrics visualization to the dashboard, which `features/dashboard` already fully implements (total cattle, active alerts, risk ranking, trend, etc.).

Recommendation from the `frontend-architecture-alignment` OpenSpec change: treat this folder as superseded by `features/dashboard` and remove it, unless product/roadmap ownership identifies a metrics capability distinct from the dashboard. This folder is left in place pending that explicit decision rather than being deleted unilaterally.
