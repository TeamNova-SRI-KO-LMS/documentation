# Final Product Demonstration — Script

SENG 34213 §9.2. Week 16, before a panel of academic staff and, where possible,
an industry representative and the client.

| Field | Value |
| --- | --- |
| Format | Live demonstration + Q&A |
| Duration | **20 minutes** demonstration + **15 minutes** Q&A |
| Attendees | All team members must be present **and contribute** |
| Environment | Deployed **staging** environment — not localhost |
| Repositories | URLs shared with the panel before the session |

> **The demonstration runs on staging.** §9.1 is explicit, and so is the
> consequence: *a live deployment failure during the demo that has not been
> resolved before the session begins will be treated as a failed
> demonstration.* Staging is checked the morning of the demo and again
> thirty minutes before it — see the
> [demonstration checklist](./demonstration-checklist.md).

---

## Timings

| # | Segment | Time | Presenter |
| --- | --- | --- | --- |
| 1 | Context | 2 min | `[Student Name _]` |
| 2 | Live feature walk-through | 12 min | shared — see below |
| 3 | Technical architecture | 3 min | `[Student Name _]` |
| 4 | Limitations & future work | 2 min | `[Student Name _]` |
| 5 | Lessons learned | 1 min | one sentence each, all members |
| | **Total** | **20 min** | |

Rehearse against a clock. Twenty minutes is short, and the segment that always
overruns is segment 2 — which is also the segment the marks are in.

---

## 1 · Context (2 min)

Who the client is, who the users are, and what problem the product solves.

- **Client / stakeholder:** `[Client Name / Organisation]`
- **Users:** students taking online courses; instructors authoring and running
  them; administrators operating the platform.
- **Problem:** `[one or two sentences — the problem statement from SRS §1.2,
  said out loud rather than read]`

Do not open the application in this segment. Two minutes of product context is
what makes the next twelve minutes legible; a panel watching a login form while
someone explains the problem statement remembers neither.

## 2 · Live feature walk-through (12 min)

Demonstrate **all primary use cases identified in the SRS**, using realistic
test data. The use cases are UC-01 to UC-05 in
[srs-final.md §7](../srs/srs-final.md); the walk-through below covers each one
and follows a single narrative rather than a tour of menus.

| Time | What is shown | SRS | Account |
| --- | --- | --- | --- |
| 0:00–1:30 | A visitor browses the catalogue, filters and searches, opens a course | FR-08, UC-01 | anonymous |
| 1:30–3:00 | Registration, then login; the same visitor is now a student | FR-01, FR-02, UC-01 | new student |
| 3:00–4:30 | Choosing a subscription plan and completing a payment; the invoice appears | FR-13, FR-14, UC-03 | student |
| 4:30–6:00 | Enrolment, working through lessons, progress advancing | FR-10, FR-11, UC-02 | student |
| 6:00–7:00 | Course completion triggers a certificate; download and verify it | FR-15, UC-04 | student |
| 7:00–8:30 | Instructor view: authoring a course, publishing it, posting an announcement | FR-09, FR-16 | instructor |
| 8:30–10:00 | Forum thread and notifications — instructor answers, student is notified | FR-17, FR-18 | both |
| 10:00–11:30 | Administrator: user management, revenue dashboard, platform settings | FR-19, FR-21, FR-23, UC-05 | admin |
| 11:30–12:00 | Access control shown deliberately: the student URL for the admin page returns 403 | FR-05 | student |

**Use realistic data.** A catalogue of "Test Course 1" and a user called "asdf"
tells the panel the product has never been used. Seed staging with plausible
course titles, real-looking prices in LKR, and a handful of enrolments and
reviews already in place.

**Have every account already logged in, in separate browser profiles.** Three
minutes of the twelve disappears into typing passwords otherwise.

**Show the 403.** Access control is 20 % of the mark under Code Quality and the
whole of OWASP A01. It is invisible when it works, so make it visible once.

## 3 · Technical architecture (3 min)

Briefly show: the repository structure, a CI pipeline run, and the test coverage
report.

| Time | Artefact | Where |
| --- | --- | --- |
| 0:00–1:00 | The GitHub Organisation: four repositories and what each holds | github.com/TeamNova-SRI-KO-LMS |
| 1:00–2:00 | A CI run on `develop` — the five stages, green | Actions tab |
| 2:00–3:00 | Coverage and the endpoint gate: 81 % lines, 125/125 endpoints | [coverage-sprint8.md](../testing/coverage-sprint8.md) |

Have these open in tabs beforehand. Do not navigate GitHub live; a slow page
load costs a third of the segment.

One sentence worth saying out loud here: the coverage number and the endpoint
number are produced by the pipeline, not typed into a document — which is why
the register in the report cannot disagree with the suite.

## 4 · Limitations & future work (2 min)

An honest assessment of what was not completed and why.

Say the real numbers. There are **32 open defects** in the
[defect register](../testing/defect-register.md), four of them critical, and
each has a test asserting the correct behaviour that will fail the build the day
it is fixed. That is a stronger position than claiming none, and the panel will
find them anyway.

Prepare three specifics:

1. `[the most significant thing not built, and the trade-off that displaced it]`
2. `[the most serious open defect and the planned fix — DEFECT-11 is the
   obvious candidate]`
3. `[the one architectural decision you would revisit — see the ADRs]`

Then future work: what the next team should do first, and why that order.

## 5 · Lessons learned (1 min)

**One key engineering lesson per team member.** One sentence each, prepared and
rehearsed — this is sixty seconds for the whole team.

A lesson is something you would do differently, not something that went well.
"We learned to communicate better" is not a lesson; "we merged three features in
the last week of Sprint 6 and spent Sprint 7 untangling them, so we now cap
open branches at one per person" is.

| Member | Lesson |
| --- | --- |
| `[Student Name 1]` | `[one sentence]` |
| `[Student Name 2]` | `[one sentence]` |
| `[Student Name 3]` | `[one sentence]` |
| `[Student Name 4]` | `[one sentence]` |
| `[Student Name 5]` | `[one sentence]` |

---

## Q&A preparation (15 min)

The questions that get asked, and where the answer lives:

| Question | Answer lives in |
| --- | --- |
| "How do you know this is secure?" | [owasp-checklist.md](../security/owasp-checklist.md) — per-risk evidence, honestly marked Partial |
| "What is your test coverage, and what does it exclude?" | [coverage-sprint8.md](../testing/coverage-sprint8.md) |
| "How do you know every endpoint is tested?" | [endpoint-coverage.md](../testing/endpoint-coverage.md) — generated from the source, 125/125 |
| "Why MongoDB / why JWT / why one repository?" | The [ADRs](../adr/) — each records the alternatives that were rejected |
| "What happens under load?" | [performance-report.md](../testing/performance-report.md) |
| "Which requirements did you not meet?" | [srs-final.md](../srs/srs-final.md) Appendix D, and the defect register |
| "Who wrote which part?" | The Insights → Contributors graph, and the board |
| "What would you do differently?" | The [retrospectives](../retrospectives/) |

Two rules for the Q&A: **answer the question that was asked**, and **say "I
don't know, but it is recorded in X" rather than guessing.** A panel can tell
the difference, and the second answer demonstrates that the project has a
memory.
