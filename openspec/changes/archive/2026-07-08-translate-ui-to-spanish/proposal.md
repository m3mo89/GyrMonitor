## Why

The frontend, desktop, and mobile clients are inconsistent in language: the React frontend is already almost entirely in Spanish, but the desktop and mobile `.NET MAUI` apps are still hardcoded in English across nearly every page, ViewModel, and validation message. More fundamentally, none of the three clients has a localization system — every string in every client is a literal baked directly into JSX, XAML, or C#. Beyond fixing the language mismatch today, we want the UI text architecture to support adding or changing languages later without another repo-wide find-and-replace. This change both translates the remaining English text to Spanish **and** moves all UI-facing text in all three clients behind a resource-based localization system, so "change the language" becomes "edit or add a resource file" instead of "edit source code."

## What Changes

- Introduce `i18next` + `react-i18next` in the frontend, with per-feature JSON resource namespaces under a new `frontend/src/shared/i18n/locales/es/` directory, wired up via a provider in `frontend/src/app/providers/`. Replace **all** literal UI text in frontend components — not just the leftover English strings, but the already-Spanish text too — with translation-key lookups (`t('namespace:key')`), so every user-facing string in the frontend is resource-backed.
- Introduce `.resx`-based localization in the desktop and mobile `.NET MAUI` clients:
  - Strings shared by both apps (common validation/auth/connectivity error messages) move to a new `AppStrings.resx` (+ `AppStrings.es.resx`) pair in `shared/GyrMonitor.Client.Core`, referenced by both `Desktop.Core` and `Mobile.Core`.
  - App-specific strings (page titles, labels, per-screen messages) move to a new `AppStrings.resx` (+ `AppStrings.es.resx`) pair in each of `desktop/GyrMonitor.Desktop.Core` and `mobile/GyrMonitor.Mobile.Core`.
  - A small `TranslateExtension` XAML markup extension is added to each app's `Shared/` folder so XAML can bind to resx entries directly; ViewModels reference the generated resx static class directly.
  - App startup (`MauiProgram.cs` in both apps) sets `CultureInfo.CurrentUICulture` to `es` so the Spanish satellite resources resolve by default.
- Replace **all** literal UI text in desktop and mobile XAML and ViewModels/services (not just the previously-English strings) with resx lookups, so every user-facing string in both apps is resource-backed.
- Where XAML currently uses `StringFormat='...{0}'` directly on a binding (desktop `DashboardPage`, mobile `AlertDetailPage`/`SyncPage`), move the formatting into a computed ViewModel property built from a resx format string (`string.Format(AppStrings.PendingItemsFormat, count)`), because MAUI's XAML `StringFormat` cannot itself be data-bound to a resource lookup.
- Change `frontend/index.html`'s `<html lang="en">` to `<html lang="es">` to match the actual UI language.
- Establish and apply a do-not-translate glossary so recognized loanwords, the product/brand name, and backend-driven codes are stored as identical, untranslated values inside the resource files (not skipped/left un-keyed):
  - Proper nouns / brand: `GyrMonitor`, `Gyr`.
  - Domain loanwords already used untranslated in the existing Spanish frontend text: `cattle`, `dashboard`, `sync`, `score`, `backend`.
  - Backend-driven enum/status/role codes rendered literally by data bindings (e.g. `PENDING`, `IN_PROGRESS`, `ADMIN`, `FIELD_OPERATOR`, `RESEARCHER`, `HIGH`/`MEDIUM`/`LOW` severities) — these are protocol values, not free UI text, are **not** routed through the resource system, and remain unchanged. Introducing a display-mapping/converter layer for these is **out of scope** for this change.
  - Code-level identifiers: C#/TS variable, property, route, and DTO field names, CSS class names, and API contract strings — never touched.
- Update the two ViewModel test suites that assert on literal English strings to assert against the new resx-backed values instead.
- **BREAKING**: None for end users (text-only + internal architecture change; no API/contract/prop shape changes). Internally, any code that imported a component and relied on its previous hardcoded string output (e.g. snapshot tests) will need updating — called out in Impact.

## Capabilities

### New Capabilities
- `ui-localization`: Defines that all UI-facing text in the frontend, desktop, and mobile clients is sourced from a resource-based localization system (i18next JSON namespaces for frontend, `.resx` satellite resources for desktop/mobile), resolves to Spanish by default, keeps do-not-translate glossary terms as untranslated resource values, and is structured so a new language can be added by adding resource files without changing consuming component/XAML/ViewModel code.

### Modified Capabilities
(none — this change does not alter behavior, data flow, or structural requirements of `web-frontend-architecture`, `desktop-client`, `desktop-ui-design-system`, or `mobile-client`; it changes how and where UI text is sourced, which is scoped entirely under the new `ui-localization` capability.)

## Impact

- **Frontend**: new dependency (`i18next`, `react-i18next`); new `frontend/src/shared/i18n/` module and locale JSON files; a new i18n provider under `frontend/src/app/providers/`; every presentation component across `auth`, `dashboard`, `cattle`, `alerts`, `user-management`, `app/layouts` (`AppShell`, nav), and `shared/components` (`UiState`) is edited to consume translation keys instead of literal strings. Component tests that assert on rendered literal text (e.g. `DashboardPage.spec.tsx`) need to wrap render helpers with the i18n provider and may need their expected-text assertions adjusted.
- **Desktop**: new resx resource files and a `TranslateExtension` in `shared/GyrMonitor.Client.Core`, `desktop/GyrMonitor.Desktop.Core`; `MauiProgram.cs` culture bootstrap; every XAML file and ViewModel listed in the original scope survey (`AppShell.xaml`, `LoginPage.xaml`, `DashboardPage.xaml`, `CattlePage.xaml`, `AlertsPage.xaml`, `EventSimulatorPage.xaml`, `SyncPage.xaml`, `OfflineBannerView.xaml`, `EmptyStateView.xaml.cs`, and the `LoginViewModel`/`CattleViewModel`/`AlertsViewModel`/`DashboardViewModel`/`EventSimulatorViewModel`/`SyncViewModel`/`AppShell.xaml.cs`) is edited to use resx lookups instead of literals. `LoginViewModelTests.cs` updated to assert resx values.
- **Mobile**: same shape of change as desktop — new resx files in `mobile/GyrMonitor.Mobile.Core`, `MauiProgram.cs` culture bootstrap, every XAML/ViewModel/service in the original scope survey (`AppShell.xaml`, `LoginPage.xaml`, `AlertsPage.xaml`, `AlertDetailPage.xaml`, `ObservationCapturePage.xaml`, `SyncPage.xaml`, `LoginViewModel`, `AlertsViewModel`, `ObservationCaptureViewModel`, `SyncViewModel`, `MobileSyncService`) edited to use resx lookups. `LoginViewModelTests.cs` updated to assert resx values.
- **No impact** on `backend/`, `database/`, DTO/enum definitions in `shared/GyrMonitor.Client.Core` (protocol values stay in English), or any public API contract. Number/date formatting (`Intl.NumberFormat('es-MX', ...)` in the frontend) is unaffected — locale-aware formatting is not part of this change.
