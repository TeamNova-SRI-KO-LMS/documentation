# GitHub Project Board — Development Phase

SENG 34213 §4.1 and §4.2.

## The board is extended, not replaced

The Project board from SENG 31242 continues. **No new board is created.** The
design-phase cards stay where they are, and every development issue sets the
`Phase` field to **Development** so the two can be told apart.

The reason to keep one board is traceability. A development ticket that
implements `FR-14` should sit on the same board as the design card that produced
`FR-14`, because the question "why does this exist?" is answerable by looking
one column to the left rather than in a different tool.

## Columns

Issues flow left to right.

```text
Backlog  →  To Do  →  In Progress  →  In Review  →  Done
```

| Column | Means | Entry condition | Exit condition |
| --- | --- | --- | --- |
| **Backlog** | Identified, not committed to a sprint | Issue exists with a title and a one-line summary | Refined: acceptance criteria written, estimate agreed, epic and priority labelled |
| **To Do** | Committed to the current sprint, not started | Sprint milestone assigned, assignee set | Someone starts work |
| **In Progress** | Actively being worked | A `feature/` or `fix/` branch exists | A PR is open against `develop` |
| **In Review** | PR open, awaiting review | CI green, description complete | Approved and merged |
| **Done** | Merged and deployed to staging | Every Definition of Done box ticked | — |

Two rules keep the board honest:

**One card in In Progress per person.** Two cards in progress means neither is
finished, and the board stops predicting anything. If work is genuinely blocked,
it moves back to To Do with a comment saying what it is blocked on — not
sideways into a second in-progress card.

**A card moves when the work moves, not at stand-up.** A board updated in a
batch on Monday is a report, not a signal.

## Fields

| Field | Values | Set by |
| --- | --- | --- |
| Phase | Design · **Development** | Whoever opens the issue |
| Sprint | Sprint 5 · 6 · 7 · 8 (milestone) | Sprint planning |
| Estimate | Hours | Sprint planning, by the person who will do it |
| Priority | P0-Blocker · P1-High · P2-Critical · P3-Medium · P4-Low | Sprint planning |
| Epic | One `epic:` label | Whoever opens the issue |
| Assignee | One person | Sprint planning |

---

## Development epics (§4.2)

These are created in addition to any epics continuing from the design phase.

| Epic label | Description | Where the work lands |
| --- | --- | --- |
| `epic:dev-setup` | Repos, CI/CD scaffold, coding standards, local dev environment | All repositories |
| `epic:data-layer` | Database schema, migrations, ORM models, repositories | `Backend/models` |
| `epic:api` | REST endpoints, request validation, error handling | `Backend/routes`, `Backend/middleware` |
| `epic:auth` | Authentication, authorisation, session management | `Backend/middleware/auth.js`, `authRoutes.js` |
| `epic:core-features` | Primary business logic — one epic per domain | Courses, enrolment, payments, certificates |
| `epic:ui-frontend` | Frontend components, state management, routing | `Frontend/src` |
| `epic:integration` | Service integration, third-party APIs, event handling | Google OAuth, payment gateway, email |
| `epic:testing` | Unit, integration and E2E tests; coverage | `testing` repository |
| `epic:ci-cd` | Pipeline configuration, deployment scripts, environments | `.github/workflows`, `infrastructure` |
| `epic:security` | Vulnerability scanning, input validation, secrets management | Cross-cutting |
| `epic:performance` | Load testing, query optimisation, caching | `tests/performance`, indexes |
| `epic:documentation` | API docs, README updates, developer guides | This repository |

## Priority labels

| Label | Means | Response |
| --- | --- | --- |
| `P0-Blocker` | Nothing else can proceed; or production is down | Dropped onto immediately, ahead of sprint commitments |
| `P1-High` | Core to the sprint goal | Scheduled first in the sprint |
| `P2-Critical` | Important, has a deadline | Scheduled in the sprint |
| `P3-Medium` | Should be done, no urgency | Scheduled if capacity allows |
| `P4-Low` | Nice to have | Backlog until a sprint has room |

## Type labels

Aligned with the Conventional Commit types in
[git-workflow.md](../standards/git-workflow.md), so the label on the issue and
the type on the commit are the same word.

`feat` · `fix` · `test` · `ci` · `build` · `perf` · `refactor` · `docs` ·
`chore` · `style` · `revert`

## Status labels

| Label | Means |
| --- | --- |
| `blocked` | Cannot proceed; the blocking issue is named in a comment |
| `needs-discussion` | Requires a decision before it can be estimated |
| `good-first-issue` | Self-contained, low-context — suitable for whoever has capacity |
| `carried-over` | Moved from a previous sprint; the comment records the root cause |

`carried-over` exists because Appendix B.1 item 4 asks for unfinished items to
move to the next sprint **with a root cause note**. The label makes the pattern
visible across sprints: three carried-over cards on one epic is an estimation
problem, not three unlucky sprints.

## Creating the labels

```bash
gh label create "epic:dev-setup"     --color 0E8A16 --description "Repos, CI/CD scaffold, coding standards, local dev environment"
gh label create "epic:data-layer"    --color 0E8A16 --description "Database schema, migrations, ORM models, repositories"
gh label create "epic:api"           --color 0E8A16 --description "REST endpoints, request validation, error handling"
gh label create "epic:auth"          --color 0E8A16 --description "Authentication, authorisation, session management"
gh label create "epic:core-features" --color 0E8A16 --description "Primary business logic features"
gh label create "epic:ui-frontend"   --color 0E8A16 --description "Frontend components, state management, routing"
gh label create "epic:integration"   --color 0E8A16 --description "Service integration, third-party APIs, event handling"
gh label create "epic:testing"       --color 0E8A16 --description "Unit tests, integration tests, E2E tests, coverage"
gh label create "epic:ci-cd"         --color 0E8A16 --description "Pipeline configuration, deployment scripts, environments"
gh label create "epic:security"      --color 0E8A16 --description "Vulnerability scanning, input validation, secrets management"
gh label create "epic:performance"   --color 0E8A16 --description "Load testing, query optimisation, caching"
gh label create "epic:documentation" --color 0E8A16 --description "API docs, README updates, developer guides"

gh label create "P0-Blocker"  --color B60205
gh label create "P1-High"     --color D93F0B
gh label create "P2-Critical" --color E99695
gh label create "P3-Medium"   --color FBCA04
gh label create "P4-Low"      --color C2E0C6

gh label create "blocked"          --color 000000
gh label create "needs-discussion" --color D4C5F9
gh label create "carried-over"     --color BFD4F2
```

Run once, from any repository in the organisation — labels are per repository,
so repeat with `--repo` for each one.

## Metrics the board should produce

The retrospective template (Appendix B.2) asks for these. They come off the
board rather than from memory:

| Metric | Where it comes from |
| --- | --- |
| Issues planned | Cards in the milestone at sprint start |
| Issues completed | Cards in Done at sprint end |
| Velocity | Sum of estimates on completed cards |
| CI pipeline pass rate | Actions tab → runs on `develop` for the sprint window |
| Test coverage | [coverage report](../testing/coverage-sprint8.md) at sprint end |

Record the planned figure **at the start of the sprint**. A "planned" number
read off the board at the end has quietly absorbed everything added mid-sprint,
which is exactly the number the metric exists to expose.
