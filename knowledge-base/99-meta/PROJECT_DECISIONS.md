---
title: Project Decisions Log
section: 99-meta
status: approved
version: 1.0.1
---

# Project Decisions Log

This log captures project-structure and scope decisions that are broader than individual ADRs.

## 2026-06-26 - Freeze MVP Knowledge Base Structure

Decision: Keep the documentation structure stable after v1.0.

Reason: The repository is mature enough to support OpenSpec and development. Further structural changes would add more cost than value.

## 2026-06-26 - Keep OpenSpec Proposals Manual

Decision: `11-openspec/` contains only workflow guidance, checklists and best practices. It must not contain generated proposals or implementation changes.

Reason: The project owner wants to manually review proposals and implementations.

## 2026-06-26 - MVP Scope Excludes Automated Detection and Specialized Hardware

Decision: The MVP Knowledge Base describes only the software platform: authentication, cattle, observations, activity events, alerts, dashboard and offline sync.

Reason: Automated detection pipelines, model inference, physical sensors and specialized hardware deployment are outside the MVP and must not drive MVP architecture or implementation.

## 2026-06-26 - Remove Data as Top-Level Section

Decision: Database and persistence documentation belongs under `06-engineering/database/`.

Reason: Persistence is an implementation concern and should not be modeled as an independent top-level product layer.
