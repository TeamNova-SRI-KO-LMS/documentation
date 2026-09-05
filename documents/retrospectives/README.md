# Sprint Retrospectives

**Deliverable §10.1 #11** — retrospective reports for every sprint.
**Template source:** Appendix B.2 of the course guideline.

## Status

| Sprint | Weeks | Version | Retrospective | Status |
| --- | --- | --- | --- | --- |
| Sprint 5 — Foundation & Infrastructure | 1–4 | v0.1.0 | [sprint-05-retrospective.md](./sprint-05-retrospective.md) | ☐ To complete |
| Sprint 6 — Core Features | 5–8 | v0.2.0 | [sprint-06-retrospective.md](./sprint-06-retrospective.md) | ☐ To complete |
| Sprint 7 — Integration & UX | 9–12 | v0.3.0 | [sprint-07-retrospective.md](./sprint-07-retrospective.md) | ☐ To complete |
| Sprint 8 — Quality & Release | 13–16 | v1.0.0 | [sprint-08-retrospective.md](./sprint-08-retrospective.md) | ☐ To complete |

> **These are templates, not records.** Each file is pre-structured with the
> sections Appendix B.2 requires and with prompts drawn from what the sprint
> actually involved. The team fills in what happened — attendees, findings,
> action items and metrics — at the retrospective itself.
>
> Nothing about a meeting that has not yet happened has been written for you.
> A retrospective containing invented findings is worthless to the team and
> misleading to the supervisor.

## How to run one

**Time-box: 60 minutes**, at the end of each sprint, immediately after the
sprint review. Everyone attends.

| Phase | Minutes | Purpose |
| --- | --- | --- |
| Set the stage | 5 | Confirm attendance; restate the sprint goal |
| Gather data | 15 | Metrics: issues planned versus completed, velocity, CI pass rate, coverage delta |
| Generate insight | 20 | What went well · What to improve — discuss *causes*, not symptoms |
| Decide what to do | 15 | Agree action items with a named owner and a due date |
| Close | 5 | Read the actions back; confirm each owner accepts |

## What makes one useful

**Be specific.** "Communication was poor" leads nowhere. "The frontend was
blocked for two days waiting on the `/api/courses` contract, because it was
agreed verbally and not written down" leads to an action.

**Discuss causes, not people.** The purpose is to change the system the team
works in, not to attribute fault.

**Every action item has an owner and a due date.** An action with neither is a
wish. Carry unfinished actions into the next retrospective explicitly rather
than letting them lapse.

**Record what went well, honestly.** A retrospective that only lists problems
teaches the team nothing about what to keep doing.

**Metrics come from evidence, not memory.** Every figure in the metrics table
can be read from a tool:

| Metric | Where to read it |
| --- | --- |
| Issues planned / completed | GitHub Projects, sprint milestone |
| Velocity | Sum of estimates on completed issues |
| CI pass rate | GitHub Actions run history for the sprint |
| Test coverage | `testing/reports/coverage-summary.md` |
| Endpoint coverage | `testing/reports/endpoint-coverage.md` |
| Open defects | `documents/testing/defect-register.md` |
