---
title: 'ADR-016: Source UI Text from Resource-Based Localization, Default to Spanish'
area: Frontend/Desktop/Mobile
status: approved
version: 0.9.0
---

# ADR-016: Source UI Text from Resource-Based Localization, Default to Spanish

## Status

Accepted

## Context

The frontend, desktop, and mobile clients originally embedded human-authored UI text (labels, headings, button text, validation/error messages) as string literals directly in components, XAML, and ViewModels/services. The product's primary users operate in Spanish, and the project needed a way to add or adjust languages without touching consumer code.

## Decision

All human-authored, UI-facing text in `frontend`, `desktop`, and `mobile` is sourced from a resource-based localization system: `i18next` JSON namespaces in the frontend (`frontend/src/shared/i18n/locales/<lang>/*.json`), and `.resx` satellite resources in desktop/mobile (`AppStrings.<lang>.resx`). All three clients resolve to Spanish (`es`) by default at runtime — the frontend's `i18next` instance defaults to `es` and sets `<html lang="es">`; desktop/mobile set `CultureInfo.CurrentUICulture` to `es` at startup.

Backend-driven enum/status/role codes rendered literally from data bindings (e.g. `HIGH`, `PENDING`, `FIELD_OPERATOR`) and code-level identifiers (variable/DTO/route names, CSS classes) are excluded from the localization system — they are not localized UI text.

Glossary terms (`GyrMonitor`, `Gyr`, and domain loanwords `cattle`, `dashboard`, `sync`, `score`, `backend`) are still resource keys, but with an identical value across all shipped locales, so they stay inside the resource system instead of being untranslated literals.

## Alternatives Considered

- Keeping literal strings and adding Spanish as the only supported language was rejected: it would require touching every component/page/ViewModel again the next time a language changes or a new one is added.
- A single shared resource format across all three clients was rejected: `i18next` is the idiomatic choice for the React frontend, while `.resx` is the idiomatic, tooling-supported choice for .NET MAUI; forcing one format onto both stacks would fight each platform's ecosystem.

## Consequences

Adding a language means adding resource files only (a new locale JSON namespace set, or a new `.xx.resx` satellite per base `.resx`), with no changes to consuming `.tsx`, `.xaml`, or `.cs` files. Tests that assert on UI string values must reference the same resource constant the production code uses, not a re-typed literal, so tests cannot silently drift from the resource system.

## Impacted Documentation

- `knowledge-base/04-architecture/screaming-architecture.md` and `clean-architecture.md` (frontend feature/layer structure).
- `frontend/README.md`, `desktop/README.md`, `mobile/README.md`.
- `openspec/specs/ui-localization/spec.md` (full requirement detail).

## Review Notes

This ADR should be revisited if a language beyond Spanish/English-neutral base resources is added, or if the frontend and desktop/mobile clients converge on a single resource format.
