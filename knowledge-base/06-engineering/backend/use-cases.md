# Backend Use Cases

Use cases represent application actions. Each use case should be small, testable and named after a business action.

## Initial Use Case Catalog

| Use Case | Module | Purpose |
| --- | --- | --- |
| `LoginUseCase` | Authentication | Authenticate user and issue JWT |
| `GetDashboardMetricsUseCase` | Dashboard | Return system metrics and risk ranking |
| `GetCattleListUseCase` | Cattle | List cattle with status and risk summary |
| `GetCattleHistoryUseCase` | Cattle | Return events and related alerts for one animal |
| `RegisterActivityEventUseCase` | Activity Events | Store event and trigger risk evaluation |
| `CalculateRiskScoreUseCase` | Risk Analysis | Calculate risk from inactivity inputs |
| `GenerateAlertUseCase` | Alerts | Create alert when threshold is exceeded |
| `GetAlertsUseCase` | Alerts | List alerts by filters |
| `AttendAlertUseCase` | Alerts | Update alert status |
| `AddAlertObservationUseCase` | Inspections | Register observation for an alert |
| `SyncEventsUseCase` | Offline Sync | Process offline event batches |
| `SyncObservationsUseCase` | Offline Sync | Process offline observation batches |

## Use Case Rules

- One use case should represent one business intention.
- Use cases should return application results, not HTTP responses.
- Use cases should validate business preconditions.
- Transport validation belongs in DTOs; business validation belongs in use cases or domain services.
