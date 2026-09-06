# ADR-003 — Denormalised enrolment across three documents

- **Status:** Accepted
- **Date:** Sprint 6, Week 1
- **Deciders:** TeamNova
- **Context:** SRS FR-10, FR-11; SDS §4.4

## Context

"This student is enrolled in this course" is the most-read fact in the system.
It is needed by the student dashboard, My Courses, the course roster, the
certificate eligibility query and the analytics dashboard.

MongoDB has no joins. Every relationship is either a reference resolved by a
second query, or an embedded copy.

## Options considered

### Option A — A single `Progress` collection, referenced

One document per enrolment, holding the student, the course and the progress.
Fully normalised: one place to write, no possibility of disagreement.

Reading suffers. The course roster needs a `Progress` query plus a `User`
lookup; the student dashboard needs a `Progress` query plus a `Course` lookup.
Both are on hot paths.

### Option B — Arrays only

`course.enrolledStudents` and `user.enrolledCourses`, with no `Progress`
document. Reads are fast. But there is nowhere to record progress percentage,
completion date or time spent, and a document with an unbounded array eventually
hits MongoDB's 16 MB limit.

### Option C — Both

A `Progress` document as the record of truth, plus id arrays on the course and
the user as read-side indexes.

## Decision

**Option C.** Enrolment is written in three places:

1. `Progress` — the record of truth, holding percentage, completion and timing;
2. `course.enrolledStudents` — the roster;
3. `user.enrolledCourses` — the student's course list.

`Progress` additionally carries a **unique compound index on
`{ student, course }`**, which is what actually prevents a duplicate enrolment.

## Consequences

**Good.** The roster and the dashboard each render from a single query with a
`populate`. Progress data has a home. The unique index makes duplicate enrolment
impossible even when two requests race — the application's "already enrolled?"
check is a nicer error message, not the guarantee.

**Bad.** Three writes must stay consistent, and MongoDB gives no multi-document
transaction here. A partial write leaves a student enrolled according to one
source and not another — and, critically, that inconsistency is **invisible**
until a user notices a course missing from their dashboard.

**Mitigation.** The enrolment and un-enrolment routes write all three, and the
integration tests assert **all three sides explicitly** rather than checking
only that the request succeeded:

```js
expect(await Progress.findOne({ student, course })).not.toBeNull();
expect((await Course.findById(course)).enrolledStudents).toContain(student);
expect((await User.findById(student)).enrolledCourses).toContain(course);
```

Without those three assertions a partial write would pass the test suite, which
is precisely the failure this decision creates.

**Known gap.** Course deletion removes the course but not the `Progress` records
or the `user.enrolledCourses` entries pointing at it — recorded as **DEFECT-18**.
This is the maintenance cost of the decision arriving exactly where predicted.

**Revisit if** the arrays grow large. A course with tens of thousands of
students would make `enrolledStudents` unwieldy, and the roster would be better
served by a paginated `Progress` query. At the expected scale — hundreds of
students per course — this is not close.
