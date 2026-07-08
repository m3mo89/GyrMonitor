## 1. Frontend: i18n infrastructure

- [x] 1.1 Add `i18next` and `react-i18next` to `frontend/package.json`.
- [x] 1.2 Create `frontend/src/shared/i18n/index.ts` initializing `i18next` with `es` as the language and fallback language, and namespaces: `common`, `auth`, `dashboard`, `cattle`, `alerts`, `userManagement`, `app`.
- [x] 1.3 Create the `frontend/src/shared/i18n/locales/es/*.json` files (one per namespace above), initially empty/scaffolded.
- [x] 1.4 Create `I18nProvider` under `frontend/src/app/providers/` (matching the pattern of `QueryProvider.tsx`) and wrap the app root with it in `frontend/src/main.tsx` (or `app/App.tsx`, whichever composes providers today).
- [x] 1.5 Add glossary keys (`common.json`: `appName`, `entityCattle`, `entityDashboard`, `entitySync`, `entityScore`, `entityBackend`) with untranslated values (`GyrMonitor`, `cattle`, `dashboard`, `sync`, `score`, `backend`).
- [x] 1.6 Wire the i18n provider into the shared test-render helper used by `*.spec.tsx` files so component tests don't break on `useTranslation` without a provider.
- [x] 1.7 Confirm the app builds and renders (empty namespaces are fine at this point) before starting feature migration.

## 2. Frontend: feature migration to translation keys

- [x] 2.1 Migrate `auth` (`LoginPage.tsx`, `ProtectedRoute.tsx`, `SystemGeneratorMessage.tsx`) to `t('auth:...')` keys; move existing Spanish strings into `locales/es/auth.json` verbatim (no wording changes).
- [x] 2.2 Migrate `dashboard` (`DashboardPage.tsx`, including `metricConfig` labels/hints) to `t('dashboard:...')` keys.
- [x] 2.3 Migrate `cattle` (`CattleListPage.tsx`, `CattleDetailPage.tsx`) to `t('cattle:...')` keys, translating the remaining English table headers/`<dt>` labels (`Tag`, `Breed`, `Sex`, `Status`, `Risk`, `Birth date`, `History`, `Captured at`, `Inactive`, `Confidence`, `Source`) to Spanish as part of the migration, using `cattle` as the glossary loanword where the entity is referenced.
- [x] 2.4 Migrate `alerts` (`AlertsListPage.tsx`, `AlertDetailPage.tsx`) to `t('alerts:...')` keys, translating the remaining English table headers/`<dt>` labels (`Cattle`, `Severity`, `Status`, `Risk`, `Reason`, `Created`, `Risk score`, `Created at`, `Attended at`, `Event id`, `Cattle id`) to Spanish.
- [x] 2.5 Migrate `user-management` (`UserListPage.tsx`) to `t('userManagement:...')` keys.
- [x] 2.6 Migrate `app` shell/nav chrome (`AppShell.tsx`, `AppRouter.tsx`, including the `Dashboard`/`Cattle` nav labels) to `t('app:...')` keys, using glossary loanwords for `Dashboard`/`Cattle`.
- [x] 2.7 Migrate `shared/components/UiState.tsx` (`LoadingState` default title/subtitle) to `t('common:...')` keys.
- [x] 2.8 Change `<html lang="en">` to `<html lang="es">` in `frontend/index.html`.
- [x] 2.9 Run `npm test` and fix any spec asserting on now-relocated literal text.

## 3. Desktop: resx infrastructure

- [x] 3.1 Create `shared/GyrMonitor.Client.Core/Resources/Strings/AppStrings.resx` (neutral, public hand-written accessor class) and `AppStrings.es.resx`, seeded with the strings shared verbatim between desktop and mobile (`InvalidCredentials`, `EmailAndPasswordRequired`, `UnableToSignInRetry`, `UnableToReachServerRetry`, `SyncFailedFormat`, `SyncSummaryFormat`) plus glossary keys (`AppName`, `EntityCattle`) with identical values in both files. (`FieldOperatorOnly` turned out to be mobile-only on inspection — moved to task 5.1's mobile resx instead.)
- [x] 3.2 Create `desktop/GyrMonitor.Desktop.Core/Resources/Strings/AppStrings.resx` (neutral, public accessor class) and `AppStrings.es.resx` for desktop-only strings.
- [x] 3.3 Use MAUI's built-in `{x:Static}` markup extension for XAML resx binding instead of a custom `TranslateExtension` — simpler and sufficient since the app doesn't support runtime language switching (see design.md decision). No new file needed for this task.
- [x] 3.4 In `desktop/GyrMonitor.Desktop/MauiProgram.cs`, set `CultureInfo.CurrentUICulture = new CultureInfo("es")` before `builder.Build()`. Deliberately left `CurrentCulture` untouched — that also drives numeric/date formatting (e.g. `StringFormat='{0:F1}'` risk scores), and the generic `es` culture uses a comma decimal separator, which would have silently changed number rendering outside this change's scope.
- [x] 3.5 Build the desktop project to confirm the resx code generation compiles cleanly and `{x:Static}` lookups resolve before migrating pages.

## 4. Desktop: feature migration to resx

- [x] 4.1 Migrate `Features/Authentication/LoginPage.xaml` and `LoginViewModel.cs` to resx lookups (shared `Client.Core` resource for the error strings). Update `LoginViewModelTests.cs` to assert against the `AppStrings` constant.
- [x] 4.2 Migrate `AppShell.xaml`/`AppShell.xaml.cs` (title, tab titles, sync summary strings) to resx lookups, using glossary keys for `GyrMonitor`/`Dashboard`/`Cattle`/`Sync`.
- [x] 4.3 Migrate `Features/Dashboard/DashboardPage.xaml` and `DashboardViewModel.cs` to resx lookups.
- [x] 4.4 Migrate `Features/Cattle/CattlePage.xaml` and `CattleViewModel.cs` to resx lookups.
- [x] 4.5 Migrate `Features/Alerts/AlertsPage.xaml` and `AlertsViewModel.cs` to resx lookups.
- [x] 4.6 Migrate `Features/EventSimulator/EventSimulatorPage.xaml` and `EventSimulatorViewModel.cs` to resx lookups.
- [x] 4.7 Migrate `Features/Sync/SyncPage.xaml` and `SyncViewModel.cs` to resx lookups; move any `StringFormat='...{0}'` binding into a computed ViewModel property backed by a resx format string, per design.md.
- [x] 4.8 Migrate `Shared/Controls/OfflineBannerView.xaml` and `Shared/Controls/EmptyStateView.xaml.cs` (default `Nothing here yet` text) to resx lookups.
- [x] 4.9 Grep the desktop solution for remaining literal English or hardcoded Spanish UI strings outside the resx files; fix any hits.
- [x] 4.10 Build and run `GyrMonitor.Desktop.Core.Tests` to confirm the suite passes.

## 5. Mobile: resx infrastructure

- [x] 5.1 Create `mobile/GyrMonitor.Mobile.Core/Resources/Strings/AppStrings.resx` (neutral, public accessor class) and `AppStrings.es.resx` for mobile-only strings (including `FieldOperatorOnly`, which is mobile-only), reusing the shared `Client.Core` resx pair (from task 3.1) for strings identical to desktop.
- [x] 5.2 Use MAUI's built-in `{x:Static}` markup extension for XAML resx binding, matching desktop's approach (task 3.3) — no custom markup extension needed.
- [x] 5.3 In `mobile/GyrMonitor.Mobile/MauiProgram.cs`, set `CultureInfo.CurrentUICulture = new CultureInfo("es")` before `builder.Build()`.
- [x] 5.4 Build the mobile project to confirm resx generation compiles cleanly and `{x:Static}` lookups resolve before migrating pages.

## 6. Mobile: feature migration to resx

- [x] 6.1 Migrate `Features/Authentication/LoginPage.xaml` and `LoginViewModel.cs` to resx lookups (shared `Client.Core` resource for error strings and the field-operator-only message). Update `LoginViewModelTests.cs` to assert against the `AppStrings` constant.
- [x] 6.2 Migrate `AppShell.xaml` (title, tab titles) to resx lookups, using glossary keys for `GyrMonitor`/`Sync`.
- [x] 6.3 Migrate `Features/Alerts/AlertsPage.xaml` and `AlertsViewModel.cs` to resx lookups.
- [x] 6.4 Migrate `Features/Alerts/AlertDetailPage.xaml` and any related ViewModel code to resx lookups; move the `StringFormat='Severity: {0}'`/`'Status: {0}'`/`'Risk score: {0}'`/`'Reason: {0}'`/`'Created at: {0}'` bindings into computed ViewModel properties backed by resx format strings, per design.md.
- [x] 6.5 Migrate `Features/Observations/ObservationCapturePage.xaml` and `ObservationCaptureViewModel.cs` to resx lookups.
- [x] 6.6 Migrate `Features/Sync/SyncPage.xaml`, `SyncViewModel.cs`, and `MobileSyncService.cs` to resx lookups; move the `'Pending items: {0}'` binding into a computed property per design.md.
- [x] 6.7 Grep the mobile solution for remaining literal English or hardcoded Spanish UI strings outside the resx files; fix any hits.
- [x] 6.8 Build and run `GyrMonitor.Mobile.Core.Tests` to confirm the suite passes.

## 7. Cross-cutting verification

- [x] 7.1 Confirm glossary terms (`GyrMonitor`, `Gyr`, `cattle`, `dashboard`, `sync`, `score`, `backend`) resolve to identical values in every resource file they appear in, across all three clients.
- [x] 7.2 Confirm backend-driven codes (severity/status/role values) are still bound directly and are not routed through any resource lookup.
- [x] 7.3 Confirm adding a throwaway second locale (a temp `fr.json` namespace set for frontend, or a temp `AppStrings.fr.resx` for one desktop resx file) renders without touching any component/XAML/ViewModel code, then remove the throwaway files — this validates the "no consumer code changes to add a language" requirement without shipping an unsupported language.
- [x] 7.4 Launch the frontend dev server and the desktop app locally (or via the project's `run` workflow) and visually confirm login, dashboard, cattle, alerts, and sync screens read correctly in Spanish with no leftover English or broken bindings.
