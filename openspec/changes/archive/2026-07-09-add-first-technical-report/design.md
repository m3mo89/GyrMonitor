## Context

The repository stores academic deliverables under `docs/`, but it does not yet contain a dedicated first technical report package with production audit evidence. The updated audit scope is production-only and uses Lighthouse plus ZAP by Checkmarx/OWASP ZAP. WebPageTest is explicitly out of scope for this report.

The production targets are:

- Frontend: `https://gyr-monitor.vercel.app/`
- Backend: `https://gyrmonitor-production.up.railway.app/api/v1`

The final deliverable must be a PDF stored under `docs/reports/first-report/exports/`. Source Markdown/HTML and raw evidence remain in the repository for traceability.

## Goals / Non-Goals

**Goals:**

- Run Lighthouse against the production frontend and store JSON/HTML evidence.
- Run ZAP by Checkmarx/OWASP ZAP against production frontend and backend and store HTML evidence.
- Capture production HTTP headers for frontend and backend as supporting evidence.
- Generate a completed Spanish academic-professional report with measured results and justified corrections.
- Export the final report to PDF.

**Non-Goals:**

- Run WebPageTest for this report.
- Modify production code, deployment configuration, dependencies, or database state.
- Invent metrics or security findings when a tool cannot complete part of the audit.

## Decisions

1. Store the first report package under `docs/reports/first-report/`.

   Rationale: This keeps audit evidence and the PDF deliverable close to project documentation while avoiding noise in the top-level `docs/` directory.

2. Use Lighthouse only for production frontend performance metrics.

   Rationale: Lighthouse directly measures the deployed web application and provides exportable JSON/HTML evidence. The backend API is not a browser page and is not appropriate for Lighthouse scoring.

3. Use ZAP normal startup through `zap.sh`.

   Rationale: The user confirmed ZAP can now be opened normally. The audit should therefore use the standard ZAP launcher rather than a direct JAR invocation with constrained memory.

4. Include frontend and backend production targets in the security section.

   Rationale: The frontend is the public browser surface, while the backend is the public API surface. Both are relevant for HTTP security headers and passive/active ZAP findings.

5. Keep PDF as the only final deliverable.

   Rationale: Markdown and HTML are traceability sources; the academic handoff is the exported PDF.

## Risks / Trade-offs

- Production ZAP active scan may be blocked by provider protections -> Preserve the generated report and document the observed block rather than fabricating findings.
- Tool outputs can vary across runs -> Record exact target URLs, timestamps, and evidence file paths.
- Header findings may originate from platform-level configuration -> Assign corrections to deployment/backend/frontend areas as appropriate.
