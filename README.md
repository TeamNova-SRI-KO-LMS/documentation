# SRI-KO LMS — Documentation

[![Docs CI](https://github.com/TeamNova-SRI-KO-LMS/documentation/actions/workflows/docs.yml/badge.svg?branch=develop)](https://github.com/TeamNova-SRI-KO-LMS/documentation/actions/workflows/docs.yml)
[![Coverage](https://img.shields.io/badge/coverage-81.4%25-brightgreen)](./documents/testing/coverage-sprint8.md)
[![Endpoints](https://img.shields.io/badge/endpoints-125%2F125-brightgreen)](./documents/testing/endpoint-coverage.md)
[![Requirements](https://img.shields.io/badge/requirements-30%2F30%20traced-brightgreen)](./documents/testing/traceability-matrix.md)
[![Open defects](https://img.shields.io/badge/open%20defects-32-orange)](./documents/testing/defect-register.md)

Project documentation for the **SRI-KO Learning Management System**, built for
**SENG 34213 — System Development Project**, Software Engineering Teaching Unit,
University of Kelaniya.

This is the `documents` repository of §3.1: the SRS, the SDS, the ADRs, the
standards the team works to, the sprint records, and the generated evidence
submitted as §10.1 deliverables.

| | |
| --- | --- |
| **Team** | TeamNova |
| **Organisation** | <https://github.com/TeamNova-SRI-KO-LMS> |
| **Application** | `[staging URL]` — see [TEAM.md](./TEAM.md) |
| **Release** | `v1.0.0` |

---

## Where things are

```text
.
├── TEAM.md                      Roster. Filled in once; propagated by npm run fill-team
├── documents/
│   ├── srs/srs-final.md         §10.1 #1  Software Requirements Specification
│   ├── sds/sds-final.md         §10.1 #2  Software Design Specification
│   ├── report/                  §10.1 #3  Final Development Report
│   ├── testing/                 §10.1 #6, #7, #9 — generated, see below
│   ├── security/                §10.1 #8  OWASP compliance evidence — generated
│   ├── retrospectives/          §10.1 #11 Sprint 5–8 retrospectives
│   ├── forms/                   §10.1 #12 Peer evaluation form (blank)
│   ├── adr/                     Architectural Decision Records
│   ├── standards/               Coding standards, git workflow, review, DoD
│   ├── ceremonies/              Sprint planning and review agendas
│   ├── project-management/      Board, epics, labels, issue templates
│   └── deployment/              Demonstration script and checklist
├── scripts/                     Sync, PDF build, link check, roster fill
└── assets/styles/print.css      Print stylesheet for the rendered PDFs
```

## Deliverables map (§10.1)

| # | Artefact | Here | Source |
| --- | --- | --- | --- |
| 1 | Updated SRS | [`documents/srs/srs-final.md`](./documents/srs/srs-final.md) | Written |
| 2 | Updated SDS | [`documents/sds/sds-final.md`](./documents/sds/sds-final.md) | Written |
| 3 | Final Development Report | [`documents/report/final-development-report.md`](./documents/report/final-development-report.md) | Written |
| 4 | Source code | <https://github.com/TeamNova-SRI-KO-LMS> | — |
| 5 | CI/CD pipeline | `.github/workflows/` in each repository | — |
| 6 | Test Coverage Report | [`documents/testing/coverage-sprint8.md`](./documents/testing/coverage-sprint8.md) | **Generated** |
| 7 | Test Case Register | [`documents/testing/test-register.md`](./documents/testing/test-register.md) | **Generated** |
| 8 | OWASP Compliance Evidence | [`documents/security/owasp-checklist.md`](./documents/security/owasp-checklist.md) | **Generated** |
| 9 | Performance Test Results | [`documents/testing/performance-report.md`](./documents/testing/performance-report.md) | **Generated** — awaiting a k6 run |
| 10 | Deployed application | [`TEAM.md`](./TEAM.md) | — |
| 11 | Retrospective reports | [`documents/retrospectives/`](./documents/retrospectives/) | Written per sprint |
| 12 | Peer Evaluation Form | [`documents/forms/peer-evaluation-form.md`](./documents/forms/peer-evaluation-form.md) | Blank; submitted individually to eKelaniya |

---

## Prerequisites

| Requirement | Version | Why |
| --- | --- | --- |
| Node.js | ≥ 18.18.0 | The scripts in `scripts/` |
| npm | ≥ 9 | Dependency installation |
| The `testing` repository | any | Source of the generated artefacts |
| Chromium (optional) | via Playwright | PDF rendering. Without it the scripts still produce print-ready HTML |

No environment variables are required. `TESTING_REPO` may be set to point at the
testing repository if it is not in a conventional sibling location.

## Installation

Works on a fresh machine, in this order:

```bash
git clone https://github.com/TeamNova-SRI-KO-LMS/documentation.git
cd documentation
npm install

# Optional — only needed to render PDFs rather than HTML
npm run build:install
```

## Usage

```bash
npm run sync            # import generated artefacts from the testing repository
npm run sync:check      # CI gate: fails if a committed copy is stale
npm run fill-team       # substitute the TEAM.md roster into every document
npm run build:pdf:all   # render every §10.1 deliverable to build/pdf/
npm run links           # verify every relative link resolves
npm run lint            # markdownlint
npm run verify          # lint + links + sync:check, in the order CI runs them
```

Render one document:

```bash
npm run build:pdf -- documents/report/final-development-report.md
```

### Finding the testing repository

`npm run sync` needs it. Resolution order:

1. `TESTING_REPO` environment variable
2. `.testing-repo` — a git-ignored file containing one path
3. Conventional siblings: `../../SRI-KO_Testing/testing`, `../SRI-KO_Testing/testing`, `../testing`, `../../testing`

If none matches, the error names every path it tried and the three ways to fix
it.

---

## How this repository is meant to be used

**The Markdown is the source of truth; the PDF is a rendering.** §10.1 asks for
PDFs at specific paths. They are produced by `npm run build:pdf:all` into
`build/pdf/`, which is git-ignored — because a PDF in version control is a
binary that silently disagrees with the text beside it.

**Four of the deliverables are generated, not written.** The test register, the
coverage report, the endpoint report and the OWASP evidence are produced by the
testing repository's pipeline and imported by `npm run sync`, with a provenance
banner on each. `npm run sync:check` re-renders them and fails if the committed
bytes differ, so a submitted document cannot quote a figure the suite no longer
produces. Editing one of those files directly will break CI. That is the
intended behaviour: the error is in the generator.

**The team roster lives in exactly one place.** Every document refers to members
through placeholders — `[Student Name 1]`, `[Registration No. 1]`.
`npm run fill-team` reads [TEAM.md](./TEAM.md) and substitutes them. Until it is
filled in, the placeholders stay visible, which is deliberate: a cover page
carrying `[Student Name 2]` is obviously incomplete, and one carrying a
plausible but wrong name is not.

**Square brackets that survive `fill-team` are prompts, not bugs.** Sprint
dates, client feedback, the metrics for each retrospective, the lesson each
member will present at the demonstration — those are the team's own record.
They are left blank rather than filled with plausible text.

---

## Contributing

Same standards as the code repositories:
[git-workflow.md](./documents/standards/git-workflow.md),
[code-review-standards.md](./documents/standards/code-review-standards.md).

- Branch from `develop`; `docs/<issue>-<slug>` for documentation work.
- Conventional Commits — `docs(srs): add FR-26 for bulk enrolment`.
- One approval before merge; `npm run verify` must pass.
- Never commit a completed peer evaluation, a real password, or a `.env` file.

## Related repositories

| Repository | Contents |
| --- | --- |
| [`SRI-KO_LMS_MERN`](https://github.com/TeamNova-SRI-KO-LMS) | The application — Express API and React frontend |
| [`testing`](https://github.com/TeamNova-SRI-KO-LMS) | Test suites and the generators behind the artefacts here |
| [`infrastructure`](https://github.com/TeamNova-SRI-KO-LMS) | Docker, compose files, deployment |

## Licence

Coursework produced for SENG 34213 at the University of Kelaniya. Not licensed
for redistribution.
