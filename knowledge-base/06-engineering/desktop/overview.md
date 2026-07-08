---
title: Desktop Overview
section: 05-engineering/desktop
technology: .NET MAUI Desktop
version: 0.6.0
status: approved
---

# Desktop Overview

The desktop client supports administrative workflows and may include a development event simulator for generating activity and inactivity events during the MVP.

## Responsibilities

- Login, with a runtime environment picker (Local/Development, Staging, Production) on Debug builds; Release builds always target Production.
- Logout from any authenticated screen, clearing the session and returning to login.
- Display dashboard-style summaries when required.
- Manage or view cattle data depending on MVP scope.
- Display alerts.
- Simulate activity and inactivity events for backend validation.
- Support local persistence when operating offline.

## MVP Priority

For the first implementation, the desktop event simulator is more important than duplicating every web dashboard feature.

## Architecture

See `maui-desktop.md` in this folder for the feature-based MVVM structure and the Clean Architecture layering applied inside features above a complexity threshold (ADR-017).
