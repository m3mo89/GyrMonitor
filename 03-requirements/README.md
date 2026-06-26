---
title: Requirements Knowledge Base
area: requirements
status: approved
version: 1.0
last_updated: 2026-06-26
source_documents:
  - DOC-01_GyrMonitor_V2_Academico
  - DOC-03_GyrMonitor_Contratos_Backend_V2_Academico
---

# Requirements Knowledge Base

This folder contains the product and engineering requirements for GyrMonitor.

The goal is not to reproduce the academic requirements tables verbatim. The goal is to transform them into development-ready specifications that can be referenced from OpenSpec proposals, architecture decisions, implementation tasks, test cases, and future project documentation.

## Folder Contents

| Document | Purpose |
|---|---|
| [business-requirements.md](business-requirements.md) | Business outcomes and product motivations. |
| [user-requirements.md](user-requirements.md) | User needs by actor. |
| [functional-requirements.md](functional-requirements.md) | System capabilities expected from the MVP. |
| [quality-attributes.md](quality-attributes.md) | Non-functional requirements and quality constraints. |
| [user-stories.md](user-stories.md) | Development-ready user stories with acceptance criteria. |
| [use-cases.md](use-cases.md) | Main system use cases and flows. |
| [business-rules.md](business-rules.md) | Centralized business rules that drive the system. |
| [traceability.md](traceability.md) | Mapping between requirements, domain modules, use cases, API, UI and data. |
| [risk-register.md](risk-register.md) | Product, technical and operational risks with mitigations. |

## Requirement Categories

GyrMonitor uses the following requirement categories:

- **BRQ**: Business Requirement.
- **URQ**: User Requirement.
- **FRQ**: Functional Requirement.
- **QAR**: Quality Attribute Requirement.
- **USR**: User Story.
- **UC**: Use Case.
- **BR**: Business Rule.
- **RISK**: Risk Register item.

The original academic identifiers from DOC-01 are preserved when available, for example `RN-01`, `RU-01`, `RF-10`, `RNF-08`, `HU-05`, and `CU-03`.

## Design Principle

Requirements in this folder are intentionally connected to:

- domain modules in `02-domain/`;
- future architecture documents in `04-architecture/`;
- API reference documents in `06-reference/`;
- future OpenSpec changes.

This keeps the documentation usable for both human review and AI-assisted implementation.
