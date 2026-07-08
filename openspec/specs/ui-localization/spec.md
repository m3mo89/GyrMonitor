# UI Localization Specification

## Purpose

Define how human-authored UI text across the frontend, desktop, and mobile clients is sourced from resource-based localization systems, resolved to Spanish by default, and structured so additional languages and glossary terms can be supported without consumer code changes.

## Requirements

### Requirement: UI text is sourced from a resource-based localization system
All human-authored, UI-facing text in the `frontend`, `desktop`, and `mobile` clients SHALL be resolved through a resource-based localization system (i18next JSON namespaces in the frontend; `.resx` satellite resources in desktop and mobile) rather than being a literal string embedded in component, XAML, or ViewModel/service code. This covers page titles, labels, headings, table/column headers, form field labels and placeholders, button text, empty-state text, and validation/error/status messages that originate as literal strings in the client codebases (not values returned verbatim from the backend).

#### Scenario: Frontend component renders text via translation lookup
- **WHEN** a frontend presentation component (e.g. `DashboardPage`, `LoginPage`, `CattleListPage`, `AlertsListPage`, `UserListPage`) renders UI text
- **THEN** the text is produced by an `i18next` translation lookup (`useTranslation`/`t()`) against a JSON resource namespace, not a string literal inlined in the component

#### Scenario: Desktop page renders text via resx lookup
- **WHEN** a desktop client page (`AppShell`, `LoginPage`, `DashboardPage`, `CattlePage`, `AlertsPage`, `EventSimulatorPage`, `SyncPage`) renders UI text
- **THEN** the text is produced by a `.resx`-backed lookup (via MAUI's built-in `{x:Static}` markup extension in XAML, or the generated resx static class in C#), not a string literal in the `.xaml` or `.cs` file

#### Scenario: Mobile page renders text via resx lookup
- **WHEN** a mobile client page (`AppShell`, `LoginPage`, `AlertsPage`, `AlertDetailPage`, `ObservationCapturePage`, `SyncPage`) renders UI text
- **THEN** the text is produced by a `.resx`-backed lookup, not a string literal in the `.xaml` or `.cs` file

#### Scenario: Desktop and mobile validation/error messages use resx lookups
- **WHEN** a desktop or mobile ViewModel produces a validation error, authentication error, or connectivity error message
- **THEN** the message is read from the appropriate `AppStrings` resx resource (shared `Client.Core` resource for messages common to both apps, app-specific resource otherwise), not a string literal in the ViewModel

### Requirement: Resolved UI language is Spanish
The localization system SHALL resolve to Spanish by default at runtime in all three clients: the frontend's `i18next` instance defaults to the `es` locale, and desktop/mobile set `CultureInfo.CurrentUICulture` to `es` at app startup so the `.es.resx` satellite resources are used.

#### Scenario: Frontend renders Spanish text on load
- **WHEN** the frontend app loads with no explicit language override
- **THEN** all resource-backed text renders in Spanish

#### Scenario: Desktop and mobile render Spanish text on launch
- **WHEN** the desktop or mobile app launches
- **THEN** `CultureInfo.CurrentUICulture` is `es` and all resx-backed text renders using the `.es.resx` satellite values

#### Scenario: Frontend document language attribute matches content language
- **WHEN** the frontend `index.html` document's `<html>` tag `lang` attribute is inspected
- **THEN** it is set to `es`, matching the Spanish UI content

### Requirement: Localization system supports adding a language without consumer code changes
The resource structure SHALL allow a new language to be added by adding resource files (a new locale JSON namespace set for the frontend, or a new `.xx.resx` satellite per base `.resx` file for desktop/mobile) without modifying the components, XAML, or ViewModel/service code that consume those resources.

#### Scenario: Adding a frontend locale requires no component changes
- **WHEN** a new `frontend/src/shared/i18n/locales/<lang>/*.json` namespace set is added and the active language is switched to `<lang>`
- **THEN** components render the new language's text without any changes to their `.tsx` source

#### Scenario: Adding a desktop/mobile satellite resource requires no XAML/ViewModel changes
- **WHEN** a new `AppStrings.<lang>.resx` satellite file is added alongside an existing base `AppStrings.resx` and the app's `CultureInfo.CurrentUICulture` is set to `<lang>`
- **THEN** pages and ViewModels render the new language's text without any changes to their `.xaml` or `.cs` source

### Requirement: Do-not-translate glossary terms are resource-backed with identical values
Glossary terms (the product/brand name `GyrMonitor`/`Gyr`, and domain loanwords `cattle`, `dashboard`, `sync`, `score`, `backend`) SHALL be defined as resource keys whose value is identical across all shipped locales, rather than being left outside the resource system as untranslated literals. Backend-driven enum, status, and role codes rendered literally from data bindings (e.g. `PENDING`, `IN_PROGRESS`, `HIGH`, `MEDIUM`, `LOW`, `ADMIN`, `FIELD_OPERATOR`, `RESEARCHER`, `SYSTEM_GENERATOR`, `OPEN`, `UNAUTHORIZED`, `VALIDATION_ERROR`, `FAILED`, `DUPLICATE`) and code-level identifiers (variable/property/route/DTO field names, CSS classes) are excluded from the localization system entirely, as they are not localized UI text.

#### Scenario: Glossary term resolves identically across locales
- **WHEN** a resource key representing a glossary term (e.g. the app name or the `cattle` entity label) is resolved in the `es` locale
- **THEN** its value is the same untranslated term used in the base/neutral resource

#### Scenario: Backend-driven codes remain outside the localization system
- **WHEN** a desktop or mobile page renders a value bound directly from a backend response field (e.g. `Severity`, `Status`, `Role`)
- **THEN** the rendered value is the original backend code (e.g. `HIGH`, `PENDING`, `FIELD_OPERATOR`), sourced directly from the binding rather than a resource lookup

### Requirement: Tests assert against resource values
Automated tests that assert on literal UI-facing string values SHALL reference the same resource value the production code uses (e.g. the generated resx constant), rather than duplicating the expected text as a fresh literal, so tests cannot silently drift from what the resource system actually produces.

#### Scenario: Desktop login ViewModel tests assert against the shared resx constant
- **WHEN** `desktop/GyrMonitor.Desktop.Core.Tests/Features/Authentication/LoginViewModelTests.cs` runs after this change
- **THEN** its assertions compare `LoginViewModel.ErrorMessage` against the corresponding `AppStrings` resx constant rather than an independently retyped string literal

#### Scenario: Mobile login ViewModel tests assert against the shared resx constant
- **WHEN** `mobile/GyrMonitor.Mobile.Core.Tests/Features/Authentication/LoginViewModelTests.cs` runs after this change
- **THEN** its assertions compare `LoginViewModel.ErrorMessage` against the corresponding `AppStrings` resx constant rather than an independently retyped string literal
