## Why

The desktop `.NET MAUI` client (`desktop/GyrMonitor.Desktop`) still ships with the unmodified MAUI project-template visuals: template accent colors that no page actually uses, plain `Label`/`Entry`/`Button` controls with no card or surface treatment, hard-coded literal colors (`Red`, `Gray`, `Crimson`) instead of theme resources, no consistent spacing/typography scale, tab items with no icons, and even the app's own window/dock/taskbar icon (`Resources/AppIcon/appicon.svg`) is still the stock MAUI placeholder — a solid purple square with a ".NET" mark, not a GyrMonitor mark. Every screen (Login, Dashboard, Cattle, Alerts, Sync, EventSimulator) looks like scaffolding rather than a finished product, which undermines trust in an app administrators use to make animal-health decisions.

## What Changes

- Replace the default MAUI template palette in `Resources/Styles/Colors.xaml` with a GyrMonitor brand palette (light + dark variants) and wire it through `Resources/Styles/Styles.xaml`.
- Define a small set of reusable styles/controls: page background, card/surface container, section headers, primary/secondary buttons, form inputs, status/severity badges (for alert severity, sync status, risk level), and empty-state layout.
- Replace hard-coded literal colors (`Red`, `Gray`, `Crimson`) on `DashboardPage`, `LoginPage`, and `AlertsPage` with semantic theme resources (e.g. `ErrorBrush`, `SeverityHighBrush`) that adapt to light/dark mode.
- Rework `DashboardPage` metric grid into visually distinct metric cards instead of bare `Label`s in a `Grid`.
- Rework `AlertsPage` and `CattlePage` list rows into card-style `CollectionView` items with clear visual hierarchy (primary text, secondary text, status badge) and row separation.
- Restyle `LoginPage` as a centered, branded card with consistent spacing instead of an unstyled stacked form.
- Add tab icons to `AppShell.xaml`'s `TabBar` items so navigation is not text-only.
- Replace the app icon (`Resources/AppIcon/appicon.svg` and `appiconfg.svg`) with a GyrMonitor mark so the window/dock/taskbar icon is no longer the default MAUI template placeholder.
- Add empty-state and loading-state visuals (currently list/detail screens show nothing or a bare spinner) for `AlertsPage`, `CattlePage`, `DashboardPage` risk ranking, and `SyncPage`.
- Audit and fix inconsistent spacing/padding values across pages (`Padding="16"`, `Padding="24"`, `Padding="12"`, `Padding="4"` used ad hoc) by standardizing on a shared spacing scale.

No backend, data, or navigation-flow changes are included — this is a visual/UI-only change.

## Capabilities

### New Capabilities

- `desktop-ui-design-system`: Defines the desktop client's shared visual design system (color palette, typography, spacing scale, and reusable styles for cards, buttons, inputs, badges, and empty/loading states) that all desktop feature screens must use.

### Modified Capabilities

- `desktop-client`: Screen-level scenarios for Dashboard, Cattle, Alerts, Sync, and Login gain a requirement that their visual presentation (metric cards, list rows, empty/loading states) uses the shared desktop UI design system rather than unstyled controls.

## Impact

- Affected files: `desktop/GyrMonitor.Desktop/Resources/Styles/Colors.xaml`, `desktop/GyrMonitor.Desktop/Resources/Styles/Styles.xaml`, `desktop/GyrMonitor.Desktop/AppShell.xaml`, `desktop/GyrMonitor.Desktop/Resources/AppIcon/appicon.svg`, `desktop/GyrMonitor.Desktop/Resources/AppIcon/appiconfg.svg`, and the XAML for `Features/Authentication/LoginPage.xaml`, `Features/Dashboard/DashboardPage.xaml`, `Features/Cattle/CattlePage.xaml`, `Features/Alerts/AlertsPage.xaml`, `Features/Sync/SyncPage.xaml`, `Features/EventSimulator/EventSimulatorPage.xaml`.
- No changes to `GyrMonitor.Desktop.Core` view models, backend APIs, or the mobile/frontend clients.
- Visual-only change: no new dependencies expected (uses built-in MAUI styling capabilities); tab icons will need image/font-icon assets added under `Resources/Images` or `Resources/Fonts`; the app icon SVGs will need a new GyrMonitor mark (MAUI regenerates all platform sizes from the two source SVGs via the existing `MauiIcon` build item).
