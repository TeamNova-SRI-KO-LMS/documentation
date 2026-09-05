# ADR-005 — Literal routes precede parameterised routes

- **Status:** Accepted
- **Date:** Sprint 8, Week 1
- **Deciders:** TeamNova
- **Context:** SDS §9.4; DEFECT-21, DEFECT-24

## Context

Express matches routes in declaration order. `GET /:id` declared before
`GET /stats` will match the request `/stats`, binding `id = "stats"` — the
literal route can never run.

This happened twice in this codebase, and neither instance produced an error at
start-up, a warning in the logs, or a failing test until the endpoint-coverage
gate was built.

**`routes/userRoutes.js`** declares `PUT /:id` with `authorize('admin')` at line
610, then `/notifications` (668), `/privacy` (694) and `/last-login` (720).
Consequences:

- a student receives **403** from the admin guard on all three;
- an administrator reaches the handler, which calls
  `User.findByIdAndUpdate('notifications')`, fails to cast, and returns **500**.

All three endpoints are unreachable for every caller. Notification preferences
and privacy settings cannot be changed by anyone. Recorded as **DEFECT-21**.

**`routes/notificationRoutes.js`** declares `GET /:id` at line 85 and
`/target-users` at line 508, so the administrative console cannot list
notification recipients. Recorded as **DEFECT-24**.

Notably, `/all` and `/stats` in the same router *are* declared before `/:id` and
work correctly — which is what makes the failure so easy to miss in review. The
router looks fine, because most of it is.

## Options considered

### Option A — Rely on review

Ask reviewers to watch for it. Two instances already reached `develop` under
exactly that policy. Route order is invisible in a diff that adds a route at the
bottom of a file.

### Option B — One file per endpoint

Removes ordering within a file by removing the file. It is a large restructuring
of twelve routers for a problem with a simpler fix, and it moves the ordering
question to the mount points rather than eliminating it.

### Option C — A convention plus an automated detector

State the rule, and let the endpoint-coverage gate surface any endpoint that
becomes unreachable.

## Decision

**Option C.** The convention, added to the coding standards (§7):

> **Within a router, literal paths are declared before parameterised ones.**
> `/stats`, `/all`, `/target-users` and `/my-courses` come before `/:id`.

Recommended ordering within each router:

1. Collection routes — `GET /`, `POST /`
2. Literal sub-paths — `/all`, `/stats`, `/export`, `/my-courses`
3. Parameterised routes — `/:id`, `/:id/…`

## Consequences

**Good.** A single rule, applicable in review by reading the file top to bottom.
Both existing defects are fixed by moving lines, with no behaviour change to
anything else.

**Bad.** It is still a convention, and conventions are forgotten. It is not
enforced by the framework — Express will happily accept a shadowed route
forever.

**Mitigation, and why this is not merely a convention.** The
endpoint-coverage gate in the `testing` repository derives the endpoint
inventory from the source and fails when any declared endpoint is never
successfully exercised. A newly shadowed route shows up there, because a test
for it cannot pass. That is how both defects were found.

The gate detects the *symptom*; the convention prevents the *cause*. Both are
needed: the gate would not have caught it if nobody had written a test for the
endpoint, and the convention alone did not survive two sprints.

**Verification.** `TC-FR-06-04`, `TC-FR-06-05`, `TC-FR-06-06` and `TC-FR-18-02`
all fail by design today and will start passing when the routes are reordered —
at which point the companion tests pinning the broken behaviour are deleted and
the defect register entries retired.
