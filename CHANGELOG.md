# Changelog

All notable changes to the project documentation.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/), tracking the application
release it documents (§3.3).

## [Unreleased]

Nothing yet.

## [1.0.0] — 2026-09-05

Sprint 8 — Quality & Release. The submission set for §10.1.

### Added

- **SRS** (`documents/srs/srs-final.md`) — 25 functional requirements with
  Given–When–Then acceptance criteria, 7 non-functional requirements, five use
  cases, constraints, assumptions, and a reconciliation appendix against the
  SENG 31242 SRS.
- **SDS** (`documents/sds/sds-final.md`) — architecture, request lifecycle,
  component and data design with an ER diagram, the 125-endpoint inventory,
  per-risk security design, frontend and deployment design, and five recorded
  design decisions.
- **Final Development Report** (`documents/report/final-development-report.md`)
  — the nine-section structure required by §10.4.
- **Architectural Decision Records** ADR-001 to ADR-005, with a template and an
  index.
- **Standards** — coding standards, git workflow, code review standards, and the
  Appendix A Definition of Done.
- **Project management** — Appendix C sprint checklist, project board and epic
  definitions, the §4.3 issue guide, and issue and pull-request templates.
- **Ceremonies** — sprint planning and Appendix B.1 sprint review agendas.
- **Retrospectives** — Sprint 5 to 8 in the Appendix B.2 format.
- **Peer evaluation form** (`documents/forms/peer-evaluation-form.md`) —
  Appendix D, blank, with the §10.2 submission instructions.
- **Demonstration** — the §9.2 script with timings and SRS-mapped walk-through,
  and a T−7-days-to-T+48-hours checklist.
- **Generated evidence**, imported from the testing repository: test register
  (283 documented cases), coverage report (81.4 % lines), endpoint coverage
  (125/125), traceability matrix (30/30 requirements), defect register (32
  defects), and OWASP compliance evidence.
- **Tooling** — `sync` (import generated artefacts, with a `--check` gate),
  `fill-team` (propagate the roster), `build-pdf` (Markdown → print HTML → PDF),
  and `links` (relative-link validation).

### Known gaps

- Performance results (§10.1 #9) are a placeholder: the k6 suite is written and
  wired into CI but has not been executed, so no measurements exist. NFR-01 is
  the project's one unverified requirement.
- The team roster, sprint dates, sprint metrics and client feedback are
  placeholders awaiting the team's own record.

[Unreleased]: https://github.com/TeamNova-SRI-KO-LMS/documentation/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/TeamNova-SRI-KO-LMS/documentation/releases/tag/v1.0.0
