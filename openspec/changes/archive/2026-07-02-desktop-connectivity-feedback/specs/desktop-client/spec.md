## MODIFIED Requirements

### Requirement: Desktop connectivity and sync status UX

The desktop client SHALL clearly indicate offline state, pending saves, sync in progress, sync failure, and stale data, per the User Experience Requirements in `knowledge-base/04-architecture/offline-first.md`. The offline indicator SHALL be visible from any tab and SHALL update live as connectivity changes, and the outcome of a synchronization run (automatic or manual) SHALL be surfaced to the user without requiring them to already be on the Sync tab.

#### Scenario: App indicates offline state on any tab, live

- **WHEN** the desktop app's network access transitions from available to unavailable while an administrator is on any tab
- **THEN** the app displays an offline indicator without requiring the administrator to navigate away from and back to the current tab

#### Scenario: Offline indicator clears on connectivity restoration

- **WHEN** the desktop app's network access transitions from unavailable to available while the offline indicator is shown
- **THEN** the app hides the offline indicator without requiring navigation

#### Scenario: Screens remain usable while offline

- **WHEN** the offline indicator is shown
- **THEN** the administrator can still open the Dashboard, Cattle, Alerts, Simulator, and Sync tabs, and can still generate simulated events

#### Scenario: App indicates pending sync count

- **WHEN** pending `SyncQueue` items exist
- **THEN** the app displays how many items are waiting to be synchronized

#### Scenario: App indicates sync failure

- **WHEN** a queued item's status is `FAILED`
- **THEN** the app surfaces the failure to the user instead of silently discarding it

#### Scenario: Automatic reconnect sync shows a confirmation

- **WHEN** connectivity is restored and the desktop client automatically synchronizes pending events
- **THEN** the app displays a confirmation summarizing how many events were synchronized, without the administrator needing to open the Sync tab

#### Scenario: Manual sync shows a confirmation

- **WHEN** an administrator taps "Sync now" on the Sync tab and the synchronization run completes
- **THEN** the app displays a confirmation summarizing the outcome, including any failures
