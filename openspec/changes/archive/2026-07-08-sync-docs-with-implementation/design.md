## Context

`knowledge-base/` is the designated "single source of truth" (ADR-014), meant to be updated whenever implementation or decisions change. In practice, 26 changes have been implemented and archived since the knowledge base was frozen at v1.1.0 (see `knowledge-base/RELEASE_NOTES.md`), and the narrative docs were never revisited. Meanwhile `openspec/specs/*` (the capability spec tracker) has stayed accurate, because it's mechanically updated by the OpenSpec archive workflow. This change is a one-time reconciliation pass plus a small governance addition to stop the drift from recurring. It touches only Markdown documentation — no application code, API, or schema.

The three academic `.docx` deliverables in `docs/` (DOC-01 Requerimientos y Arquitectura, DOC-02 ADR Frontend, DOC-03 Contratos de Servicio Backend) are a separate, higher-stakes case: they are versioned thesis/academic artifacts ("V2.0 académica"), generated once (via `python-docx`, per their `docProps/core.xml` metadata) around the same knowledge-base freeze point, and have no in-repo generator script to regenerate them from the current knowledge base. DOC-01's C4 diagrams and DOC-03's endpoint contracts (`/auth`, `/dashboard`, `/cattle`, `/events`, `/alerts`, `/sync`) predate `user-management`; DOC-02's ADR list (ADR-001 through ADR-013) predates the frontend Clean Architecture restructuring and has no ADR for i18n.

## Goals / Non-Goals

**Goals:**
- Bring `knowledge-base/`, root `README.md`/`FOUNDATION.md`, and the handful of stale module `README.md` files back in line with what `openspec/specs/*` and the actual code already show is implemented.
- Close the specific gaps identified by the audit: missing `user-management` API/domain docs, missing i18n and frontend Clean Architecture documentation, incorrect mobile build target, incomplete `PROJECT_STRUCTURE.md`, and a roadmap/release-notes trail that stops at `stabilize-mvp-release`.
- Add a minimal, checkable rule (via the new `documentation-governance` capability) for when knowledge-base updates must happen relative to an OpenSpec change being archived.
- Produce a V3 revision of DOC-01/02/03 that reflects the same reconciled state as the knowledge-base updates above (new `user-management` domain/contracts, frontend i18n, updated architecture), without discarding the V2 files.

**Non-Goals:**
- No changes to `openspec/specs/*` capability content itself — those are already accurate and are treated as the reference/ground truth for this pass.
- No re-architecture of the knowledge-base folder structure (00-13 layout stays as-is).
- No tooling/CI enforcement of documentation freshness in this change — the governance spec states the process rule; automated enforcement (e.g., a CI check diffing archived changes against KB edits) is left as a follow-up if the manual process proves insufficient.
- No changes to `docs/release/*`, which the audit found already accurate.
- No renumbering or removal of ADR-001..013 in DOC-02 — new frontend decisions (i18n, Clean Architecture) are appended as new ADR entries, not retrofitted into existing ones.

## Decisions

- **Use `openspec/specs/*` as the reconciliation reference, not the code directly, wherever a spec already exists.** The spec tracker is confirmed accurate for `user-management`, `ui-localization`, `mobile-client`, `desktop-client`, etc. Rationale: reduces risk of re-deriving facts incorrectly from source and keeps the knowledge base and the spec tracker telling the same story. Code is still checked directly for the handful of areas with no corresponding spec (e.g. exact DTO field names for the KB's DTO catalog).
- **Add a `documentation-governance` capability spec rather than a CI check.** Rationale: the project has no CI documentation-lint step today, and introducing one is a larger, separate decision (tooling choice, false-positive risk). A written, reviewable requirement ("update the KB entry for any capability touched by an archived change, before or as part of archiving it") is lower-risk and gives the next drift audit something concrete to check compliance against.
- **Treat this as documentation-only, no `MODIFIED Requirements` deltas against existing specs.** None of the audit findings contradict what `openspec/specs/*` says the system does — they contradict what `knowledge-base/` says. So only one new capability spec (`documentation-governance`) is needed; no existing spec's requirements change.
- **Add new V3 `.docx` files rather than overwriting V2.** The V2 files may already be submitted/evaluated academic deliverables; overwriting them risks destroying a graded historical record. V3 is generated as new files (`..._V3_Academico.docx`) with the same structure (DOC-01 requirements/architecture, DOC-02 frontend ADRs, DOC-03 backend contracts), reusing each document's existing section layout and only updating/adding the sections affected by the audit (new endpoints/DTOs in DOC-03 §8-13, new C4 detail in DOC-01 §18 if needed, new ADR entries appended after ADR-013 in DOC-02 §5 and its traceability matrix in §7).
- **Generate V3 via a one-off `python-docx` script, not manual XML editing.** The V2 files' metadata shows they were produced by `python-docx`; no generator script was committed, so `apply` will need to write a small script (not committed as project tooling unless the user wants it kept) that opens each V2 file as a structural reference and produces the corresponding V3 file with the updated content. Rationale: editing OOXML by hand is error-prone; python-docx gives reliable, re-runnable output.

## Risks / Trade-offs

- [Risk] Fixing today's drift doesn't prevent the next 26 changes from drifting again → Mitigation: the `documentation-governance` spec requirement makes the update step an explicit, reviewable part of the archive workflow, and names the specific files most prone to going stale (root README status table, module placeholder READMEs, roadmap phase lists).
- [Risk] Large surface area (13+ files) increases chance of missing a spot or introducing a new inconsistency → Mitigation: tasks.md enumerates each file with the specific correction needed, sourced directly from the three-part audit already performed.
- [Risk] Governance requirement is process-only (no automated check), so compliance depends on discipline → Mitigation: explicitly flagged as a Non-Goal for automation; acceptable given this is a documentation-only, low-blast-radius change, but should be revisited if drift recurs.

## Migration Plan

Not applicable — no runtime component. Rollout is simply merging the documentation edits; no rollback risk beyond a normal doc revert.
