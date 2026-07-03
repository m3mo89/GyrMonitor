## ADDED Requirements

### Requirement: Shared color palette with light/dark support
The desktop client SHALL define a single set of semantic color brushes (surface, card surface, primary text, secondary text, error, and severity/status accents) in the shared resource dictionaries, each adapting to the OS light/dark theme via `AppThemeBinding`. Feature pages SHALL reference these semantic brushes instead of literal color names (e.g. `Red`, `Gray`, `Crimson`).

#### Scenario: Semantic brush resolves per theme
- **WHEN** the OS theme is set to Dark and a page renders a `Label` bound to `TextPrimaryBrush`
- **THEN** the label displays the dark-theme variant of that brush without any page-level override

#### Scenario: No literal color names remain in feature pages
- **WHEN** the XAML for `LoginPage`, `DashboardPage`, `AlertsPage`, `CattlePage`, and `SyncPage` is inspected
- **THEN** none of them set `TextColor` (or an equivalent color property) to a literal color name; each uses a shared semantic brush resource

### Requirement: Shared spacing and typography scale
The desktop client SHALL define a shared spacing scale (e.g. compact, default, section) and a small typography style set (page title, section header, body, caption) in the shared resource dictionaries, used consistently across feature pages instead of ad hoc numeric `Padding`/`Spacing`/`FontSize` values.

#### Scenario: Page adopts shared spacing tokens
- **WHEN** a feature page under `Features/` sets `Padding` or `Spacing` on its root layout
- **THEN** the value is one of the shared spacing scale resources rather than an unlisted literal number

### Requirement: Reusable card, badge, and empty-state styles
The desktop client SHALL provide reusable, theme-aware styles for card/surface containers, status or severity badges, and an empty-state layout, available to any feature page that lists or summarizes data.

#### Scenario: List screen uses card styling for rows
- **WHEN** `AlertsPage` or `CattlePage` renders a `CollectionView` item
- **THEN** the item is wrapped in the shared card style rather than a bare, unstyled `Grid`

#### Scenario: Empty collection shows the shared empty state
- **WHEN** a list-backed screen's bound collection is empty and loading has completed
- **THEN** the screen displays the shared empty-state view instead of a blank area

### Requirement: Tab navigation icons
The desktop client's primary `TabBar` SHALL display an icon alongside each tab's title.

#### Scenario: Tab bar shows icons
- **WHEN** the desktop app's main `TabBar` (`Dashboard`, `Cattle`, `Alerts`, `Simulator`, `Sync`) is rendered
- **THEN** each `ShellContent` entry displays a distinct icon in addition to its title text

### Requirement: Branded application icon
The desktop client SHALL use a GyrMonitor-branded application icon for its window, dock, and taskbar representation, rather than the default `.NET MAUI` template placeholder icon.

#### Scenario: Application icon is not the template placeholder
- **WHEN** the desktop app's compiled icon assets (from `Resources/AppIcon/appicon.svg` and `appiconfg.svg`) are inspected
- **THEN** they render a GyrMonitor mark, not a solid template-color square with a ".NET" glyph
