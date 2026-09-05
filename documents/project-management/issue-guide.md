# Writing Development Issues

SENG 34213 §4.3. Development tickets demand a higher level of technical
precision than design-phase tickets, and the reason is concrete: a design ticket
is read by the person who wrote it, a week later. A development ticket is read
by whoever picks it up, by the reviewer, and by whoever finds the resulting
commit in six months.

## Title convention

```text
[DDP-#NN] type(scope): summary
```

- `DDP-#NN` — the GitHub issue number, so the title is searchable outside GitHub
- `type` — one of the Conventional Commit types (`feat`, `fix`, `test`, …)
- `scope` — the module: `auth`, `payment`, `courses`, `ci`, …
- `summary` — imperative mood, no full stop

| ✅ | ❌ |
| --- | --- |
| `[DDP-#54] feat(auth): implement JWT refresh token rotation` | `Login stuff` |
| `[DDP-#89] fix(payment): prevent double-charge on network timeout` | `Bug in payments` |
| `[DDP-#117] test(certificates): cover expiry boundary` | `Add some tests` |

The title becomes the commit subject. Writing it as a commit message from the
start removes the small daily decision of what to call the commit, and makes
`git log` readable as a record of what was decided rather than what was typed.

---

## The template

Reproduces Listing 4.1. It is committed as
[`templates/development-issue.md`](./templates/development-issue.md) so GitHub
offers it when a new issue is opened.

````markdown
## User Story
As a [role], I want to [action] so that [benefit].

## Background / Context
<!-- Reference the SRS requirement and SDS design element that drives this
     ticket. Never implement without traceable design. -->
- SRS Reference: FR-<number>
- SDS Reference: Section <X.Y>, Class <ClassName>
- ADR Reference: ADR-<number> (if applicable)

## Acceptance Criteria
<!-- Written as BDD scenarios (Given-When-Then) or as precise testable
     statements. Each AC must have a corresponding test case. -->

### AC1: Happy Path
**Given** [precondition]
**When** [action]
**Then** [expected outcome]

### AC2: Error Handling
**Given** [invalid input or error condition]
**When** [action]
**Then** [expected error response with HTTP status and error body]

### AC3: Edge Case
**Given** [boundary condition]
**When** [action]
**Then** [expected outcome]

## Technical Notes
<!-- Implementation guidance: algorithms to use, patterns to follow, libraries
     recommended, known pitfalls, constraints -->

## Test Requirements
<!-- List specific tests that must be written and pass -->
- [ ] Unit test: <what is being tested>
- [ ] Integration test: <what is being tested>
- [ ] Negative test: <what error condition is being tested>

## Definition of Done (DoD)
- [ ] Code implemented and follows team coding standards
- [ ] All Acceptance Criteria unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Code coverage for new code >= 80%
- [ ] PR raised against `develop` branch
- [ ] At least 1 peer code review completed; all comments resolved
- [ ] No new linting errors introduced
- [ ] CI pipeline passes (build, lint, test)
- [ ] API documentation updated (if endpoint added/modified)
- [ ] Issue linked in commit messages

## Estimate
Estimated: X hours

## Dependencies
<!-- List any other issues that must be completed first -->
Blocked by: #<issue-number>
````

## Why each section is there

**User Story** — states who is worse off if this is not built. A ticket whose
user story is "As a developer, I want the code to be better" is a ticket without
a customer, and it will be the first thing dropped when the sprint is tight —
correctly.

**Background / Context** — "Never implement without traceable design" is the
strong claim in §4.3 and it is the one that matters. The SRS reference is what
lets the [traceability matrix](../testing/traceability-matrix.md) close the loop
from requirement to test. A ticket with no SRS reference is either implementing
something nobody asked for, or implementing something the SRS should have said
and does not — and both are worth finding out before the code is written.

**Acceptance Criteria** — Given–When–Then, because that form forces the
precondition to be stated. Most disputed tickets are disputes about the
precondition, not the outcome. Each AC becomes a test case; if an AC cannot be
written as a test, it is not yet an acceptance criterion.

**Technical Notes** — where the pitfalls go. The reviewer should not have to
rediscover that `route ordering matters here` (see
[ADR-005](../adr/ADR-005-route-declaration-order.md)) by reading a failing test.

**Test Requirements** — named before the code is written. A test list written
afterwards describes the code; a test list written first describes the
requirement.

**Estimate in hours** — hours, not story points, because §4.3 asks for hours and
because capacity is planned in hours. An estimate over 8 hours is a signal to
split the issue: §3.2 says a branch open for more than five working days
indicates a work-breakdown problem, and the estimate is where that is visible
first.

---

## Worked example

A real ticket from this project — the fix for `DEFECT-11`, the critical
privilege-escalation finding in the
[defect register](../testing/defect-register.md).

````markdown
Title:    [DDP-#131] fix(auth): reject client-supplied role on public registration
Labels:   epic:auth, epic:security, P0-Blocker, fix
Assignee: @<handle>
Sprint:   Sprint 8 (Week 13)
Estimate: 4 hours

## User Story
As the operator of the platform, I want the public registration endpoint to
ignore any role supplied by the client, so that a stranger cannot make
themselves an administrator by adding one field to a request body.

## Background / Context
- SRS Reference: FR-01 (User Registration), FR-05 (Role-Based Access Control),
  NFR-03 (Security)
- SDS Reference: Section 6.1 (Security Design — A01 Broken Access Control)
- ADR Reference: none
- Defect: DEFECT-11 (Critical). `POST /api/auth/register` passes `req.body`
  through to `User.create`, and `role` is a schema field, so
  `{"role":"admin"}` in the registration payload creates an administrator.
  Currently pinned by TC-SEC-A01-07 (`testCase.failing`).

## Acceptance Criteria

### AC1: Happy Path
**Given** an anonymous visitor
**When** they POST valid registration details with no `role` field
**Then** the account is created with role `student` and a 201 is returned

### AC2: Privilege escalation is refused
**Given** an anonymous visitor
**When** they POST valid registration details including `"role": "admin"`
**Then** the account is created with role `student`
**And** the response body does not echo an `admin` role
**And** no document with role `admin` exists for that email

### AC3: Error Handling
**Given** an anonymous visitor
**When** they POST `"role": "not-a-role"`
**Then** the request is not rejected for the role — it is ignored, as AC2 —
and the account is created as a student

### AC4: Administrators are still creatable
**Given** an authenticated administrator
**When** they POST to `/api/admin/users` with `"role": "instructor"`
**Then** the account is created with role `instructor`

## Technical Notes
- Whitelist the fields taken from `req.body` rather than blacklisting `role`.
  A blacklist has to be updated every time the schema grows a privileged
  field; a whitelist fails closed. `const { name, email, password } = req.body;`
- `role` already has a schema default of `student`; the bug is that an explicit
  value overrides it. Do not remove the default.
- The administrative creation path (`adminRoutes.js`) is a separate handler and
  must keep accepting `role` — AC4 guards against fixing this one by breaking
  that one.

## Test Requirements
- [ ] Integration test: registration with `role: "admin"` yields a student
- [ ] Integration test: registration with no role yields a student
- [ ] Negative test: the created document's `role` is asserted from the
      database, not from the response body
- [ ] Integration test: an admin can still create an instructor via
      `/api/admin/users`
- [ ] Retire `testCase.failing` on TC-SEC-A01-07 — convert it to `testCase`
      and remove DEFECT-11 from the defect register

## Definition of Done (DoD)
- [ ] Code implemented and follows team coding standards
- [ ] All Acceptance Criteria unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Code coverage for new code >= 80%
- [ ] PR raised against `develop` branch
- [ ] At least 1 peer code review completed; all comments resolved
- [ ] No new linting errors introduced
- [ ] CI pipeline passes (build, lint, test)
- [ ] API documentation updated (if endpoint added/modified)
- [ ] Issue linked in commit messages

## Estimate
Estimated: 4 hours

## Dependencies
Blocked by: none
````

Note the last item under Test Requirements. Because the correct behaviour is
already asserted by a `testCase.failing`, the suite **breaks when this ticket is
finished** — that is the signal the fix landed, and retiring the entry is part
of the work rather than a follow-up nobody does.

---

## Anti-patterns

| Ticket says | Problem |
| --- | --- |
| "Fix the login bug" | Which bug? What is the correct behaviour? No AC means no way to know it is done. |
| "Refactor the user module" | No user story, no acceptance criteria, no boundary. This runs until the sprint ends. |
| AC: "It should work correctly" | Not testable. Correct according to what? |
| No SRS reference | Either untraceable work, or a gap in the SRS. Both need resolving before coding. |
| Estimate: 40 hours | Not an issue, an epic. Split it. |
| "Also fixes the header spacing while I was in there" | Two changes in one review. The reviewer now approves both or neither. |
