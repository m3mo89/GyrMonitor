---
title: Directory Map
section: 07-reference
status: approved
version: 0.8.0
---

# Directory Map

This document defines the recommended source code organization.

## Backend

```text
backend/
  src/
    authentication/
    cattle-monitoring/
    inactivity-analysis/
    alerts/
    inspections/
    dashboard/
    offline-sync/
    shared/
```

Each business module should follow Clean Architecture internally:

```text
alerts/
  domain/
    entities/
    value-objects/
    services/
  application/
    use-cases/
    ports/
    dto/
  infrastructure/
    persistence/
    mappers/
  presentation/
    controllers/
```

## Frontend

```text
frontend/
  src/
    app/
      router/
      providers/
      layouts/
    features/
      auth/
      dashboard/
      cattle/
      events/
      alerts/
      metrics/
    shared/
      components/
      hooks/
      services/
      types/
      utils/
```

## Mobile

`mobile/` holds two projects: `GyrMonitor.Mobile.Core` (MAUI-neutral ViewModels and feature logic) and `GyrMonitor.Mobile` (the Android/iOS head — XAML pages, Shell, platform code). Both reference the shared `GyrMonitor.Client.Core` project (see Shared Client Core below).

```text
mobile/
  GyrMonitor.Mobile.Core/
    Features/
      Authentication/          # flat: single API call + session write
      Alerts/
        Domain/                # LocalAlert
        Application/            # AlertsService
        Infrastructure/         # SqliteLocalAlertRepository
        Presentation/            # AlertsViewModel, AlertDetailViewModel
      Observations/
        Domain/                # PendingObservation, ObservationValidator
        Application/            # ObservationCaptureService
        Infrastructure/         # SqlitePendingObservationRepository
        Presentation/            # ObservationCaptureViewModel
      Sync/
        Application/            # MobileSyncService
        Infrastructure/         # SqliteSyncQueueRepository, SyncObservationsApiClient, DTOs, mapper
        Presentation/            # SyncViewModel
    Shared/
      Authorization/            # MobileRoleAccess
  GyrMonitor.Mobile/
    Features/                  # XAML pages + code-behind per feature (Presentation, head project)
    Platforms/
    Shared/
      Navigation/
      Networking/
      Storage/
```

`Authentication` stays flat (see ADR-017); `Alerts`, `Observations`, and `Sync` are layered because each meets the complexity threshold (local validation, more than one composed dependency, or a multi-step workflow).

## Desktop

`desktop/` mirrors mobile's two-project split: `GyrMonitor.Desktop.Core` and `GyrMonitor.Desktop` (the Mac Catalyst/Windows head).

```text
desktop/
  GyrMonitor.Desktop.Core/
    Features/
      Authentication/           # flat
      Dashboard/                 # flat
      Cattle/                    # flat
      Alerts/                    # flat
      EventSimulator/
        Domain/                 # PendingEvent, CattleSelectionItem, EventSimulationValidator
        Application/             # EventSimulatorService
        Infrastructure/          # SqlitePendingEventRepository
        Presentation/             # EventSimulatorViewModel
      Sync/
        Application/             # DesktopSyncService
        Infrastructure/          # SyncEventsApiClient, DTOs, mapper
        Presentation/             # SyncViewModel, ConnectivityStatusViewModel
  GyrMonitor.Desktop/
    Features/                   # XAML pages + code-behind per feature (Presentation, head project)
    Platforms/
    Shared/
      Controls/
      Navigation/
      Networking/
      Storage/
```

`Authentication`, `Dashboard`, `Cattle`, and `Alerts` stay flat (single API call, no local validation or multi-step orchestration, see ADR-017); `EventSimulator` and `Sync` are layered.

## Shared Client Core

Both clients reference `shared/GyrMonitor.Client.Core` for MAUI-neutral primitives (see `openspec/specs/maui-shared-client-core/spec.md`).

```text
shared/
  GyrMonitor.Client.Core/
    Authentication/              # flat: DTO + IAuthApi + AuthApiClient
    Alerts/                      # flat: DTO + IAlertsApi + AlertsApiClient
    Networking/                  # ApiRequestSender, ApiEnvironment*, ApiOptions
    Session/                     # IAuthSession, SecureAuthSession
    Storage/                     # ISqliteConnectionProvider
    Sync/
      Domain/                    # SyncQueueItem, SyncStatuses, SyncIdempotency
      Infrastructure/             # SqliteSyncQueueRepository (base class both clients extend)
```

See `knowledge-base/04-architecture/clean-architecture.md` ("Mobile/Desktop Clean Architecture Layering") and ADR-017 for the full layering rule and when a feature is promoted versus kept flat.

## Documentation

```text
gyrmonitor-docs/
  00-introduction/
  01-product/
  02-domain/
  03-requirements/
  04-architecture/
  05-api/
  06-engineering/
  07-reference/
  08-decisions/
  09-guides/
  10-roadmap/
  11-openspec/
  12-examples/
  13-templates/
```
