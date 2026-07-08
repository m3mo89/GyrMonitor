## Context

Three client UIs exist: `frontend` (React/TS), `desktop` (.NET MAUI), and `mobile` (.NET MAUI). None has a localization system today — every UI string is a literal embedded in JSX, XAML `Text`/`Title`/`Placeholder` attributes, or C# ViewModel/service code. The frontend is already mostly Spanish; desktop and mobile are entirely English. Two ViewModel unit test suites (`desktop/GyrMonitor.Desktop.Core.Tests/Features/Authentication/LoginViewModelTests.cs`, `mobile/GyrMonitor.Mobile.Core.Tests/Features/Authentication/LoginViewModelTests.cs`) assert on literal English error strings.

Desktop and mobile share a common library, `shared/GyrMonitor.Client.Core` (Networking, Storage, Alerts, Sync, Authentication, Session), referenced via `ProjectReference` from both `Desktop.Core` and `Mobile.Core`. Both apps' ViewModels are already constructor-injected and registered through `Microsoft.Extensions.DependencyInjection` in `MauiProgram.cs`, so adding a new injected/static dependency for strings fits the existing pattern. Backend DTOs and enums use English protocol values (`Severity = "HIGH"`, `SyncStatuses.Pending = "PENDING"`) that XAML binds to directly (`Text="{Binding Severity}"`); there is no display-mapping layer for these today (`SeverityToBrushConverter` exists only for color, not text).

The user has asked not just for a translation pass but for real localization infrastructure: UI text should live in resource files, resolvable per-language, so a future language change is a resource-file edit, not a source-code edit — while today only Spanish needs to actually render.

## Goals / Non-Goals

**Goals:**

- Every UI-facing string in all three clients — not just the currently-English ones — is sourced from a resource system (i18next JSON namespaces for frontend, `.resx` satellite resources for desktop/mobile) rather than being a literal in component/XAML/ViewModel code.
- The resource system resolves to Spanish by default in all three clients today.
- Adding a new language later is achievable by adding resource files (JSON namespace files for frontend, a new `.xx.resx` satellite per resx base file for desktop/mobile) without touching consuming component, XAML, or ViewModel code.
- The do-not-translate glossary (`GyrMonitor`, `Gyr`, `cattle`, `dashboard`, `sync`, `score`, `backend`) is enforced by keeping those resource *values* identical across languages, not by leaving those particular strings un-keyed.
- Existing ViewModel tests keep validating real behavior: they assert against the same resource values the UI renders, not duplicated literals that can drift.

**Non-Goals:**

- Building a runtime language switcher (in-app language picker, `Accept-Language` negotiation, persisted user language preference). The infrastructure supports adding languages; actually exposing a switch is a separate, later change.
- Reconstructing a maintained English resource set for the frontend. The frontend's neutral/default locale becomes `es`; we are not back-translating the newly-Spanish-ified strings into a parallel `en` bundle. (Desktop/mobile get an English neutral `.resx` "for free" as a byproduct of the standard .NET satellite-resource pattern — see Decisions — but that's a pattern artifact, not a maintained second language.)
- Translating or remapping backend-driven enum/status/role codes (`PENDING`, `HIGH`, `ADMIN`, `FIELD_OPERATOR`, etc.) bound directly from API responses. These are not routed through the localization system at all in this change.
- Locale-aware number/date formatting changes. The frontend's existing `Intl.NumberFormat('es-MX', ...)` usage is untouched.
- Changing route paths, CSS class names, C# member/property names, DTO field names, or other code-level identifiers.
- Changing backend, database, or `shared/GyrMonitor.Client.Core` DTO/contract code (only its new `AppStrings` resource files are added).

## Decisions

**Decision: Frontend uses `i18next` + `react-i18next`, JSON resources namespaced per feature.**
This is the de facto standard React i18n stack, has no runtime dependency conflicts with the existing React 18/Vite/TanStack Query setup, and supports namespace-based code-splitting that mirrors the existing `features/<name>` folder structure. Resource files live at `frontend/src/shared/i18n/locales/es/<namespace>.json` (namespaces: `common`, `auth`, `dashboard`, `cattle`, `alerts`, `userManagement`, `app` for shell/nav chrome), matching the existing `shared/` vs `features/` boundary documented in `web-frontend-architecture`. An `I18nProvider` is added under `frontend/src/app/providers/` (alongside the existing `QueryProvider.tsx`) and wraps the app root in `main.tsx`. Components call `useTranslation(namespace)` and `t('key')`. Alternative considered: a hand-rolled key/value lookup object — rejected, reinvents pluralization/interpolation/namespace-loading that `i18next` already solves.

**Decision: Desktop/mobile use `.resx` satellite resources, consumed via `x:Static` in XAML and direct static access in C# — no custom markup extension, no `IStringLocalizer` DI.**
Each resx base file (e.g. `AppStrings.resx`) is paired with a small hand-written `public static class AppStrings` wrapper (a thin `ResourceManager.GetString(key, CultureInfo.CurrentUICulture)` accessor per key) rather than relying on Visual Studio's `PublicResXFileCodeGenerator` custom tool, since that tool doesn't run under plain `dotnet build` outside Visual Studio and this environment builds from the CLI. XAML then reads these public static string properties via MAUI's built-in `{x:Static}` markup extension (e.g. `Text="{x:Static strings:AppStrings.SignIn}"`) — no custom `IMarkupExtension<string>` needed. `x:Static` resolves once, at page-construction time, which is sufficient because `CultureInfo.CurrentUICulture` is fixed to `es` before any page is ever constructed (see culture-bootstrap decision below) and this change explicitly excludes runtime language switching (Non-Goals). A custom `TranslateExtension` would only earn its keep if the UI culture could change while pages are already alive; building one here would be unused complexity. `IStringLocalizer<T>` (`Microsoft.Extensions.Localization`) was rejected for the reason already noted: it's designed around ASP.NET Core's request-scoped culture resolution and adds a DI-wiring layer with no benefit in an app with one active UI culture per run.

**Decision: Three resx pairs, split by sharing boundary — not one giant shared file.**

- `shared/GyrMonitor.Client.Core/Resources/Strings/AppStrings.resx` (+ `AppStrings.es.resx`): strings genuinely identical in wording across both apps today — the four `LoginViewModel` auth errors ("Invalid email or password.", "Email and password are required.", "Unable to sign in. Please try again.", "Unable to reach the server. Please try again.") and the two sync-summary format strings shared by both apps' `SyncViewModel` ("Sync failed: {0}", "Synced {0}, duplicates {1}, failed {2}.").
- `desktop/GyrMonitor.Desktop.Core/Resources/Strings/AppStrings.resx` (+ `.es.resx`): desktop-only strings (Dashboard metrics, EventSimulator, Cattle/Alerts page chrome, desktop-specific tab titles, the `AppShell` sync-notification-popup format strings which use different wording than `SyncViewModel`'s).
- `mobile/GyrMonitor.Mobile.Core/Resources/Strings/AppStrings.resx` (+ `.es.resx`): mobile-only strings (Observation capture, mobile Alert detail formatting, mobile tab titles, and the field-operator-only restriction message — reused across three mobile ViewModels but, on inspection of the actual code, never present on desktop, so it belongs here rather than in the shared file as originally assumed).
This mirrors the existing `Client.Core` vs `Desktop.Core`/`Mobile.Core` project boundary instead of inventing a new one, and avoids the two apps drifting out of sync on wording for messages that are supposed to read identically. Alternative considered: one resx per app only (duplicating the shared strings) — rejected because `LoginViewModel`'s error strings are word-for-word identical today between desktop and mobile, and duplicating them invites future drift.

**Decision: Force `CultureInfo.CurrentUICulture` (only) to `es` at MauiProgram startup.**
The English strings become the *neutral* (culture-invariant) resx per .NET's standard fallback convention — this is not a deliberate "keep English as a second language" choice, it's simply how resx satellite resolution works (the base `.resx` file is the fallback when no satellite matches). Setting `CurrentUICulture` to `es` in `MauiProgram.CreateMauiApp()` before building the app ensures the `.es.resx` satellite is what actually renders. This also means a missing key in the Spanish satellite fails safe by falling back to the neutral (English) value instead of throwing or showing a blank string — a safety net, not a feature. `CurrentCulture` (which drives numeric/date formatting, not resource lookup) is deliberately left untouched: the generic `es` culture formats decimals with a comma, and flipping it would silently change existing numeric `StringFormat` bindings (e.g. risk scores) — an unintended formatting change outside this change's scope (see Non-Goals).

**Decision: Move XAML `StringFormat`-on-binding usages into ViewModel computed properties.**
Desktop `DashboardPage.xaml` (`StringFormat='{0:F1}'` is fine, numeric — unaffected) and mobile `AlertDetailPage.xaml`/`SyncPage.xaml` (`StringFormat='Severity: {0}'`, `'Pending items: {0}'`) currently splice a literal English format string directly into the binding. MAUI's `Binding.StringFormat` is parsed at XAML-compile time as a literal and cannot itself pull from a resx lookup. So each of these becomes a computed, resx-backed string property on the ViewModel (e.g. `DisplaySeverity => string.Format(AppStrings.SeverityFormat, Severity)`), and the XAML binds directly to that property with no `StringFormat`. This is the only structural (not just mechanical) change required by the localization goal.

**Decision: Glossary terms are still resource-backed, with an identical value per language.**
Rather than special-casing glossary terms as string literals left outside the resource system (which would make it look like an isolated oversight rather than an intentional exception), they get resource keys too (e.g. `AppName`, `EntityCattleLabel`) whose Spanish and neutral values are identical. This keeps 100% of UI text flowing through one system and makes the do-not-translate rule enforceable by review (same value both places) rather than by convention (some strings are keyed, some aren't).

**Decision: Update existing tests to assert against resource values, not re-duplicated literals.**
`LoginViewModelTests.cs` (desktop and mobile) currently assert `Assert.Equal("Invalid email or password.", vm.ErrorMessage)`. After this change they assert `Assert.Equal(AppStrings.InvalidCredentials, vm.ErrorMessage)`, referencing the same resx-generated constant the ViewModel uses. This means the test can never drift from the real message and stays meaningful if the wording changes later — the alternative (re-typing the expected Spanish string as a fresh literal in the test) would silently reintroduce the exact literal-duplication problem this change eliminates.

## Risks / Trade-offs

- [Risk] This is now a much larger diff than a pure text swap — every presentation file in all three clients changes, even ones that were already correct Spanish. → Mitigation: `tasks.md` sequences infra-first (so partial progress is buildable), then migrates one feature area at a time, so review can happen incrementally rather than as one giant diff.
- [Risk] Moving `StringFormat` bindings into ViewModel computed properties changes ViewModel public surface (new computed properties) beyond a pure string-content edit. → Mitigation: keep the new properties additive and narrowly scoped to the existing formatted-display cases found in the scope survey; don't refactor unrelated ViewModel members.
- [Risk] `i18next`/`react-i18next` is a new runtime dependency shipped to the browser bundle. → Mitigation: both packages are small, well-maintained, and already implicitly expected by the user's ask for "real" localization; no alternative avoids adding *some* dependency unless a hand-rolled system is built (rejected above as reinventing the wheel).
- [Risk] Component tests that currently assert on rendered literal Spanish text (e.g. `DashboardPage.spec.tsx`) will fail to render without the i18n provider wired into the test harness, and some assertions may need to match via the same `t()` key rather than a hardcoded string. → Mitigation: add the `I18nProvider` to the shared test-render helper (or wrap each spec) as part of the frontend infra task, before per-feature key migration begins.
- [Trade-off] Neither desktop/mobile nor frontend get a language-switcher UI in this change — the "readiness" is structural (resource files + lookup mechanism), not a shipped feature. Accepted per Non-Goals; a follow-up change can add the switcher once there's a second language to switch to.

## Migration Plan

1. Frontend: add `i18next`/`react-i18next`, scaffold `shared/i18n/` and the `I18nProvider`, with an empty/minimal `common` namespace — confirm the app still builds and renders with the provider wired in before touching any feature.
2. Frontend: migrate one feature at a time (`auth` → `dashboard` → `cattle` → `alerts` → `user-management` → `app` shell/nav → `shared/components`), extracting literals to `t()` calls and JSON keys, running that feature's tests after each migration.
3. Desktop: add the `Client.Core` shared resx pair + `TranslateExtension` + culture bootstrap in `MauiProgram.cs`; migrate `Authentication` (the feature with existing test coverage) first and get `LoginViewModelTests.cs` green against resx values.
4. Desktop: migrate remaining features (`Dashboard`, `Cattle`, `Alerts`, `EventSimulator`, `Sync`, `Shared/Controls`) one at a time.
5. Mobile: repeat steps 3–4 for the mobile app, reusing the already-built `Client.Core` shared resx pair for the strings that are identical across apps.
6. Cross-cutting verification pass (grep for remaining literal English/Spanish strings outside the resource files; manual run-through of each app).

No rollback complexity beyond normal source control — this is a compile-time/build-time system with no runtime migration, data model, or deployed-service impact.

## Open Questions

- Should number/date formatting eventually move into the same resource-driven system (e.g. locale-aware `Intl` config sourced from the active i18next language) so a future non-`es-MX` locale doesn't need a separate code change? Left as a follow-up; not needed while only Spanish is supported.
- If a language switcher is added later, should language preference be a per-user backend setting (synced across devices) or a local device setting per client? Out of scope for this change; flag for whoever scopes that follow-up.
