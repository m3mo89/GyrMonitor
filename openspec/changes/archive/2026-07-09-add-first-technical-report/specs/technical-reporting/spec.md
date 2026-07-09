## ADDED Requirements

### Requirement: First technical report package structure

The repository SHALL provide a first technical report package at `docs/reports/first-report/` with report sources, production audit evidence, screenshots, and PDF exports.

#### Scenario: Report package directories exist

- **WHEN** the first technical report change is implemented
- **THEN** `docs/reports/first-report/README.md`, `docs/reports/first-report/report.md`, `docs/reports/first-report/report.html`, `docs/reports/first-report/evidence/lighthouse/`, `docs/reports/first-report/evidence/zap/`, `docs/reports/first-report/exports/`, and `docs/reports/first-report/screenshots/` exist

### Requirement: Production Lighthouse evidence

The report SHALL include Lighthouse metrics for the production frontend and cite the generated evidence files.

#### Scenario: Lighthouse production metrics are recorded

- **WHEN** the report is completed
- **THEN** it records the production frontend URL, audit timestamp, Performance score, Accessibility score, Best Practices score, SEO score, First Contentful Paint, Largest Contentful Paint, Total Blocking Time, Cumulative Layout Shift, Speed Index, and evidence file references

#### Scenario: Lighthouse metrics are evidence-based

- **WHEN** a Lighthouse value appears in the report
- **THEN** it is derived from `docs/reports/first-report/evidence/lighthouse/` evidence rather than invented manually

### Requirement: ZAP by Checkmarx production audit evidence

The report SHALL include ZAP by Checkmarx/OWASP ZAP results for the production frontend and backend targets.

#### Scenario: ZAP production targets are recorded

- **WHEN** the ZAP audit section is completed
- **THEN** it identifies `https://gyr-monitor.vercel.app/` and `https://gyrmonitor-production.up.railway.app/api/v1` as production targets

#### Scenario: ZAP findings are structured

- **WHEN** a ZAP finding is recorded in the report
- **THEN** it includes target, identifier when available, title, severity, instance count or execution result, evidence file reference, recommendation, and status

#### Scenario: Blocked ZAP execution is not misrepresented

- **WHEN** a production target blocks or limits ZAP scanning
- **THEN** the report documents the observed limitation and cites the generated ZAP evidence instead of reporting fabricated vulnerabilities

### Requirement: Corrections and technical justification

The report SHALL include a corrections table where each proposed correction is traceable to Lighthouse, ZAP, or HTTP header evidence.

#### Scenario: Correction entry captures required fields

- **WHEN** a contributor adds a correction to the report
- **THEN** the entry includes priority, related evidence, proposed solution, technical justification, expected impact, responsible area, and implementation status

### Requirement: PDF final deliverable

The report package SHALL export the completed report to PDF and identify the PDF as the final deliverable.

#### Scenario: PDF exists

- **WHEN** the report generation is complete
- **THEN** `docs/reports/first-report/exports/` contains the final PDF report file

#### Scenario: README states PDF-only delivery

- **WHEN** a contributor opens `docs/reports/first-report/README.md`
- **THEN** it states that the final deliverable is the PDF file and not a link to an editable document
