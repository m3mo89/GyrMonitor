## 1. Design tokens (palette, spacing, typography)

- [x] 1.1 Replace the default MAUI template accent colors in `Resources/Styles/Colors.xaml` with a GyrMonitor brand palette (primary, surface, text, error/severity/status raw colors), keeping existing key names intact
- [x] 1.2 Add semantic color brushes with light/dark `AppThemeBinding` (`SurfaceBrush`, `SurfaceCardBrush`, `TextPrimaryBrush`, `TextSecondaryBrush`, `ErrorBrush`, `SeverityHighBrush`, `SeverityMediumBrush`, `SeverityLowBrush`, `StatusPendingBrush`, `StatusSyncedBrush`) to `Resources/Styles/Colors.xaml`
- [x] 1.3 Add a shared spacing scale (e.g. `SpacingCompact`, `SpacingDefault`, `SpacingSection`) and corner-radius token(s) as keyed resources, either in `Colors.xaml` or a new `Resources/Styles/Spacing.xaml` merged into `App.xaml`
- [x] 1.4 Add a small typography style set to `Resources/Styles/Styles.xaml` (page title, section header, body, caption), replacing/extending the existing unused `Headline`/`SubHeadline` styles

## 2. Reusable styles and shared controls

- [x] 2.1 Add a `CardStyle` (`Border`-based) to `Styles.xaml` for metric tiles and list rows
- [x] 2.2 Add `PrimaryButtonStyle` and default `Entry`/`Button` styling to `Styles.xaml` so form controls pick up the shared look without per-page overrides
- [x] 2.3 Add a `BadgeStyle` (or per-severity/status badge styles) to `Styles.xaml` for alert severity and sync status indicators
- [x] 2.4 Create `Shared/Controls/EmptyStateView.xaml` (+ code-behind) as a reusable empty-state layout (icon/glyph, title, optional subtitle)
- [x] 2.5 Add a severity/status-to-brush value converter under `Shared/Converters/` if XAML-only binding can't select the right badge brush

## 3. Screen restyling

- [x] 3.1 Restyle `Features/Authentication/LoginPage.xaml` as a centered branded card using the shared spacing/typography/button styles and `ErrorBrush` for the error label
- [x] 3.2 Restyle `Features/Dashboard/DashboardPage.xaml` metrics grid into individual metric cards using `CardStyle`; wire the risk ranking list to `EmptyStateView` when empty
- [x] 3.3 Restyle `Features/Alerts/AlertsPage.xaml` list rows into card-style rows with a severity badge; wire `EmptyStateView` for the empty-alerts case
- [x] 3.4 Restyle `Features/Cattle/CattlePage.xaml` list rows into card-style rows with consistent hierarchy; wire `EmptyStateView` for the empty-cattle case
- [x] 3.5 Restyle `Features/Sync/SyncPage.xaml` pending-items list with status badges and wire `EmptyStateView` for the empty-queue case (note: `SyncViewModel` only exposes a `PendingCount` total, not a per-item list — implemented as a summary card + badge rather than a `CollectionView`; see design.md non-goal on not changing ViewModels)
- [x] 3.6 Pass over `Features/EventSimulator/EventSimulatorPage.xaml` and bring its layout/spacing/colors in line with the shared design system
- [x] 3.7 Replace remaining literal color usages (`Red`, `Gray`, `Crimson`, etc.) across all feature pages with the semantic brushes from task 1.2

## 4. Navigation polish

- [x] 4.1 Source or create small icon assets for the five main tabs (Dashboard, Cattle, Alerts, Simulator, Sync) under `Resources/Images`
- [x] 4.2 Wire `Icon` on each `ShellContent` in `AppShell.xaml`'s `TabBar`

## 5. Application icon

- [x] 5.1 Design/source a GyrMonitor mark and replace `Resources/AppIcon/appicon.svg` (background) and `appiconfg.svg` (foreground) with it, keeping the existing `MauiIcon` build item in the `.csproj` pointed at the same file names
- [ ] 5.2 Rebuild the desktop app and verify the new app icon renders correctly in the window title bar, dock (macCatalyst), and taskbar (Windows) — build succeeded and the app launched, but this environment has no Screen Recording permission for `screencapture`, so the icon has not been visually confirmed; needs a manual look

## 6. Verification

- [ ] 6.1 Run the desktop app on at least one configured target (macCatalyst or Windows) and visually check every restyled screen (Login, Dashboard, Cattle, Alerts, Sync, EventSimulator) — app builds and launches cleanly on macCatalyst (no startup exceptions in the log), but screens were not visually inspected (no screen-capture permission in this environment); needs a manual pass
- [ ] 6.2 Toggle OS light/dark theme and re-check each restyled screen for correct semantic-brush resolution and readable contrast — not done, requires manual/visual verification
- [ ] 6.3 Verify empty states render correctly for Dashboard risk ranking, Cattle, Alerts, and Sync when their backing collections are empty — not done, requires manual/visual verification
- [x] 6.4 Confirm `GyrMonitor.Desktop.Core.Tests` still pass (styling changes should not affect view-model/test behavior) — 16/16 passed
