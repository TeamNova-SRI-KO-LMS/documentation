# Sprint Review Agenda

**Template source:** Appendix B.1 of the course guideline.
**Copy this file per sprint** as `sprint-<N>-review.md`.

| | |
| --- | --- |
| **Sprint** | `[N]` — `[theme]` |
| **Date** | `[YYYY-MM-DD]` |
| **Attendees** | `[team members, supervisor, client if present]` |
| **Duration** | 45–60 minutes |

---

## 1. Demonstration of completed issues (3–5 minutes per issue, maximum)

Demonstrate **working software**, not slides. Each item is shown by a team
member other than the one who is presenting the rest — the review is where the
team proves collective ownership.

| # | Issue | Title | Demonstrated by | Accepted |
| --- | --- | --- | --- | --- |
| 1 | `[#nn]` | `[…]` | `[@name]` | ☐ |
| 2 | `[#nn]` | `[…]` | `[@name]` | ☐ |
| 3 | `[#nn]` | `[…]` | `[@name]` | ☐ |

**Demonstrate on staging, not on a laptop.** §9.1 requires the final
demonstration to run on the deployed environment; treating every sprint review
the same way means the deployment is exercised sixteen times before it matters.

## 2. Sprint metrics

Read from tooling, not from memory (§6.4: coverage reports are "linked in each
Sprint Review").

| Metric | Planned | Actual | Source |
| --- | --- | --- | --- |
| Issues completed | `[n]` | `[n]` | GitHub Projects |
| Velocity (story points) | `[n]` | `[n]` | Sum of completed estimates |
| CI pipeline pass rate | 100 % | `[n]` % | GitHub Actions history |
| Test coverage — lines | ≥ 80 % | `[n]` % | `testing/reports/coverage-summary.md` |
| Coverage delta since last sprint | — | `[+/- n]` % | |
| API endpoint coverage | 100 % | `[n]` % | `testing/reports/endpoint-coverage.md` |
| Open defects | — | `[n]` | `documents/testing/defect-register.md` |

**Links for this review**

- Coverage report: `[URL to the CI artefact]`
- Test register: `[URL]`
- Latest pipeline run: `[URL]`
- Staging deployment: `[URL]`

## 3. Supervisor feedback

| # | Feedback | Action | Owner | Due |
| --- | --- | --- | --- | --- |
| 1 | `[…]` | `[…]` | `[@name]` | `[…]` |

## 4. Unfinished items

Every incomplete item moves to the next sprint's backlog **with a root cause
note**. "Ran out of time" is not a root cause; "the issue was three issues and
should have been split at planning" is.

| Issue | Title | % complete | Root cause | Moved to |
| --- | --- | --- | --- | --- |
| `[#nn]` | `[…]` | `[n]` % | `[…]` | Sprint `[N+1]` |

## 5. Next sprint

| | |
| --- | --- |
| **Goal** | `[one sentence]` |
| **Milestone** | `[vX.Y.0]` |
| **Capacity** | `[hours available across the team]` |
| **Key risks** | `[…]` |

---

**Retrospective follows immediately** — see
`documents/retrospectives/sprint-[N]-retrospective.md`.
