---
title: Contributing to GyrMonitor Documentation
module: project
version: 0.1.0
status: approved
owner: GyrMonitor Team
last_updated: 2026-06-26
---

# Contributing

This document explains how to contribute to the GyrMonitor technical documentation.

## Purpose

The documentation repository is the living technical knowledge base for GyrMonitor. It should remain useful for humans, implementation work, AI assistants, and future OpenSpec proposals.

## Contribution Principles

- Keep documents small and focused.
- Use the canonical terminology from `GLOSSARY.md`.
- Follow `STYLE_GUIDE.md`.
- Add cross-links when a document depends on another document.
- Prefer Mermaid diagrams over embedded images.
- Prefer Markdown tables over screenshots of tables.
- Keep API examples valid JSON.
- Mark future ideas as future improvements, not current scope.
- Do not mix academic report style with technical reference style.

## Documentation Workflow

1. Identify the module or topic.
2. Check whether an existing document already covers it.
3. Update the existing document if the topic belongs there.
4. Create a new document only when the topic has a distinct responsibility.
5. Add references to related documents.
6. Update the glossary if a new canonical term is introduced.
7. Update the roadmap if the change affects implementation phases.
8. Update the AI context if the change affects how AI assistants should generate code or documentation.

## File Naming

Use lowercase kebab-case.

Correct:

```text
risk-analysis.md
offline-first.md
activity-events.md
frontend-security.md
```

Avoid:

```text
RiskAnalysis.md
risk_analysis.md
Activity Events.md
frontendSecurity.md
```

## Document Header

Every major document should include frontmatter.

```yaml
---
title: Example Document
module: example-module
version: 0.1.0
status: draft
owner: GyrMonitor Team
last_updated: 2026-06-26
---
```

## Change History

Every document should end with a change history table.

```markdown
## Change History

| Version | Date | Description |
| --- | --- | --- |
| 0.1.0 | 2026-06-26 | Initial version. |
```

## OpenSpec Workflow

OpenSpec proposals are created manually during implementation.

Recommended workflow:

1. Choose a feature.
2. Read the relevant Markdown documentation.
3. Create an OpenSpec change manually.
4. Write `proposal.md`.
5. Write `design.md` if needed.
6. Write `tasks.md`.
7. Review the proposal before implementation.
8. Implement only after approval.
9. Update documentation if the implementation changes a decision or contract.

Do not generate all OpenSpec changes automatically.

## AI Assistant Workflow

When using an AI assistant:

1. Ask it to read `AI_CONTEXT.md`.
2. Ask it to read the relevant module documentation.
3. Ask it to follow `STYLE_GUIDE.md`.
4. Ask it to avoid inventing architecture decisions.
5. Ask it to reference OpenSpec only when the change is being designed.

Example prompt:

```text
Read AI_CONTEXT.md, STYLE_GUIDE.md, and 05-api/activity-events.md.
Help me draft an OpenSpec proposal for add-activity-events.
Do not implement code yet.
```

## Change History

| Version | Date | Description |
| --- | --- | --- |
| 0.1.0 | 2026-06-26 | Initial contributing guide. |
