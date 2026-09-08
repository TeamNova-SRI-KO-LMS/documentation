---
title: Final Development Report
subtitle: SRI-KO Learning Management System
course: SENG 34213 — System Development Project
version: 1.0
status: Draft for submission
---

<div class="cover">

# Final Development Report

## SRI-KO Learning Management System

**SENG 34213 — System Development Project**
BSc (Hons.) in Software Engineering
Software Engineering Teaching Unit · Faculty of Science · University of Kelaniya

| | |
| --- | --- |
| **Team** | TeamNova |
| **GitHub Organisation** | <https://github.com/TeamNova-SRI-KO-LMS> |
| **Supervisor** | `[Supervisor Name]` |
| **Client / Stakeholder** | `[Client Name / Organisation]` |
| **Academic year** | `[YYYY/YYYY]` |
| **Release** | `v1.0.0` |
| **Date** | `[submission date]` |

### Authors

| # | Name | Registration No. | Role |
| --- | --- | --- | --- |
| 1 | `[Student Name 1]` | `[Registration No. 1]` | `[Role 1]` |
| 2 | `[Student Name 2]` | `[Registration No. 2]` | `[Role 2]` |
| 3 | `[Student Name 3]` | `[Registration No. 3]` | `[Role 3]` |
| 4 | `[Student Name 4]` | `[Registration No. 4]` | `[Role 4]` |
| 5 | `[Student Name 5]` | `[Registration No. 5]` | `[Role 5]` |

Names are filled in from [TEAM.md](../../TEAM.md) by `npm run fill-team`.

</div>

---

> **On the status of this document.**
> Structure follows SENG 34213 §10.4. Sections 4, 5 and 6 are written from the
> delivered system and from the artefacts the pipeline generates — every figure
> in them is traceable to a file in this repository or a run in CI. Passages in
> `[square brackets]` are the team's own record: dates, client feedback, the
> narrative of what happened in each sprint, and the individual lessons. They
> are left blank rather than filled with plausible text, because a report that
> invents its own history is worth less than one with gaps.

---

## Table of contents

1. [Introduction](#1-introduction)
2. [System analysis](#2-system-analysis)
3. [System design](#3-system-design)
4. [System implementation](#4-system-implementation)
5. [Testing](#5-testing)
6. [Evaluation](#6-evaluation)
7. [Conclusion](#7-conclusion)
8. [References](#8-references)
9. [Appendices](#9-appendices)

---

# 1. Introduction

## 1.1 Purpose of this report

This report documents the development phase of the SRI-KO Learning Management
System: what was built, how it was built, how it was verified, and how far it
met the objectives set out in the design phase. It extends the design report
submitted for SENG 31242 rather than replacing it — Section 2 is carried
forward, Section 3 records how the design changed under contact with
implementation, and Sections 4 to 6 are new.

It is written to be read by someone who was not in the room: a panel member, a
supervisor, or the team that maintains this system next.

## 1.2 The product

SRI-KO is a web-based learning management system. It serves three user classes:

- **Students** browse a course catalogue, subscribe to a plan, enrol in courses,
  work through lessons, and receive a verifiable certificate on completion.
- **Instructors** author and publish courses, post announcements, and answer
  questions in per-course discussion forums.
- **Administrators** manage users and courses, configure platform settings, and
  read revenue and engagement analytics.

The delivered system is a MERN application: a React 18 single-page frontend, an
Express 5 REST API of **125 endpoints**, and MongoDB accessed through Mongoose 8.
It is deployed as two units — a static frontend bundle and a Node API — against
a managed MongoDB instance.

## 1.3 Scope of the development phase

| In scope | Out of scope |
| --- | --- |
| All 25 functional requirements in the [SRS](../srs/srs-final.md) | Native mobile applications |
| The seven non-functional requirements NFR-01 to NFR-07 | Live video conferencing |
| Automated test suites at five layers | Multi-tenancy |
| A CI/CD pipeline with the stages required by §7.2 | Offline content |
| Staging and production deployment | `[anything else the team descoped — record it here]` |

## 1.4 What changed since the design report

| Area | Design report | As delivered | Recorded in |
| --- | --- | --- | --- |
| Repository topology | Separate `backend` and `frontend` repositories | One application repository containing both tiers | [SDS §2.4](../sds/sds-final.md), justified per §3.1 |
| Service layer | A service layer between routes and models | Business logic lives in Mongoose models; routes call them directly | [ADR-002](../adr/ADR-002-business-logic-in-models.md) |
| Session handling | Server-side sessions considered | Stateless JWTs | [ADR-001](../adr/ADR-001-stateless-jwt-authentication.md) |
| Input sanitisation | A global sanitising filter | Filter retired; per-route validation chains | [ADR-004](../adr/ADR-004-retire-global-input-filter.md) |
| `[other]` | `[design]` | `[delivered]` | `[ADR]` |

§1.3 of the course specification requires any significant deviation from the
approved SDS to be documented as a new ADR and reviewed with the supervisor
within one sprint. The ADR index is in [documents/adr/](../adr/); the deviation
table to be completed before submission is Appendix B of the
[SDS](../sds/sds-final.md).

## 1.5 Document structure

Section 2 restates the analysis carried forward from SENG 31242. Section 3
summarises the final design and points at the SDS for the detail. Section 4 is
the implementation: stack, components, database, pipeline, and the engineering
decisions made along the way. Section 5 is testing. Section 6 evaluates the
result against the objectives — including the parts that were not met. Sections
7 to 9 conclude, cite, and append.

---

# 2. System analysis

> §10.4 item 2: *unchanged from SENG 31242, unless scope changed.*
>
> The analysis is carried forward. This section summarises it so the report
> stands alone, and records the two places where implementation changed the
> analysis. The full analysis — stakeholder interviews, as-is process model,
> feasibility study — is in the SENG 31242 design report and is not reproduced.

## 2.1 Problem statement

`[Carried forward from the SENG 31242 design report §2. Two or three paragraphs:
what the client does today, what it costs them, and what a learning management
system changes about that.]`

## 2.2 Stakeholders

| Stakeholder | Interest | Primary requirements |
| --- | --- | --- |
| Student | Find, buy and complete courses; prove completion | FR-01, FR-02, FR-08, FR-10, FR-11, FR-15 |
| Instructor | Author courses, reach enrolled students | FR-09, FR-16, FR-17 |
| Administrator | Operate the platform, understand revenue | FR-19, FR-20, FR-21, FR-22 |
| Client / owner | A system that runs without daily intervention | NFR-01, NFR-02, NFR-06 |
| Prospective partner | Submit an enquiry and get a response | FR-23 |

## 2.3 User classes

Summarised from [SRS §2.3](../srs/srs-final.md). Three roles, hierarchical in
privilege but not in function: an administrator is not a student with extra
buttons, and the analytics and settings surfaces exist only for that role.

## 2.4 Scope changes during development

| Change | Reason | Effect on the SRS |
| --- | --- | --- |
| `[change]` | `[why]` | `[which requirement was added, altered or dropped]` |

If this table is empty, say so explicitly — "no scope changes were made during
the development phase" is a finding, not an omission.

---

# 3. System design

> §10.4 item 3: *updated SDS to reflect final implementation.*
>
> The full design is [documents/sds/sds-final.md](../sds/sds-final.md), which
> has been rewritten to describe the system as built rather than as planned.
> This section is the summary a reader needs before Section 4.

## 3.1 Architecture

A three-tier client–server architecture with a stateless API.

```text
┌──────────────┐    HTTPS/JSON    ┌──────────────┐   Mongoose   ┌──────────────┐
│  React SPA   │ ───────────────► │  Express API │ ───────────► │   MongoDB    │
│  (browser)   │ ◄─────────────── │   (Node.js)  │ ◄─────────── │  (Atlas)     │
└──────────────┘   Bearer token   └──────────────┘   BSON       └──────────────┘
```

The API holds no session state. Every request carries its own authorisation in a
JWT, which is what allows the API tier to scale horizontally without a shared
session store — and what makes server-side logout hard, a trade-off recorded in
[ADR-001](../adr/ADR-001-stateless-jwt-authentication.md) and showing up as
`DEFECT-14`.

## 3.2 Component structure

| Layer | Location | Responsibility |
| --- | --- | --- |
| Routes | `Backend/routes/*.js` | HTTP concerns: parse, validate, delegate, respond |
| Middleware | `Backend/middleware/*.js` | Cross-cutting: authentication, authorisation, validation, uploads |
| Models | `Backend/models/*.js` | Schema, invariants, and domain behaviour |
| Frontend pages | `Frontend/src/pages/` | Route-level composition |
| Frontend components | `Frontend/src/components/` | Reusable UI |
| Frontend services | `Frontend/src/services/` | The single axios instance and API wrappers |

There is deliberately **no service layer**. The reasoning, and the cost, are in
[ADR-002](../adr/ADR-002-business-logic-in-models.md).

## 3.3 Data model

Eleven collections. The core relationships:

```text
User ──< Progress >── Course ──< DiscussionForum ──< DiscussionPost
 │                      │
 ├──< Subscription ──< Payment
 ├──< Certificate ─────┘
 └──< Notification
```

`Course.enrolledStudents`, `User.enrolledCourses` and the `Progress` document
all record the same enrolment fact. That denormalisation is intentional and its
consistency risk is documented in
[ADR-003](../adr/ADR-003-denormalised-enrolment.md).

## 3.4 Security design

Per-risk controls are in [SDS §6](../sds/sds-final.md) and the evidence is in
[owasp-checklist.md](../security/owasp-checklist.md). The shape: `protect`
establishes identity from a bearer token, `authorize(...roles)` establishes
privilege, and resource-scoped handlers filter by the caller's own id so that
authorisation does not stop at the route.

## 3.5 Design changes forced by implementation

Five decisions were made during development that changed the design. Each has an
ADR; each ADR records what was rejected, which is the part that is useful later.

| ADR | Decision | Forced by |
| --- | --- | --- |
| [ADR-001](../adr/ADR-001-stateless-jwt-authentication.md) | Stateless JWT authentication | Horizontal scaling of the API tier |
| [ADR-002](../adr/ADR-002-business-logic-in-models.md) | Business logic in Mongoose models | Time budget; the cost is testability of pure logic |
| [ADR-003](../adr/ADR-003-denormalised-enrolment.md) | Enrolment denormalised across three documents | Read performance on the catalogue and dashboard |
| [ADR-004](../adr/ADR-004-retire-global-input-filter.md) | Retire the global input filter | It silently corrupted legitimate payloads |
| [ADR-005](../adr/ADR-005-route-declaration-order.md) | Literal routes declared before parameterised ones | Three endpoints were unreachable (`DEFECT-21`) |

---

# 4. System implementation

## 4.1 Technology stack

The stack was inherited from the design phase; what follows is the justification
as it stands after building on it, including where the choice cost something.

### Backend

| Choice | Version | Why | What it cost |
| --- | --- | --- | --- |
| **Node.js + Express** | 5.2.1 | One language across both tiers; the team's existing fluency; the largest middleware ecosystem for the security controls §8.1 requires | Express gives no structure of its own — the route/middleware/model split is a convention this team enforces, not one the framework imposes |
| **MongoDB + Mongoose** | 8.24.0 | Course content is a nested, irregular document (modules containing lessons containing resources); modelling it relationally would mean four join tables for something that is naturally one document | No foreign keys. Referential integrity is application-enforced, which is the origin of `DEFECT-23` and the risk in [ADR-003](../adr/ADR-003-denormalised-enrolment.md) |
| **jsonwebtoken** | 9.0.3 | Stateless auth, no session store to run or scale | Tokens cannot be revoked before expiry (`DEFECT-14`) |
| **bcryptjs** | 3.0.3 | Deliberately slow password hashing, per §8.1 A02 | Cost factor is 10, not the ≥ 12 §8.1 asks for — `DEFECT-02`, open |
| **express-validator** | 7.3.2 | Declarative per-route validation chains; §8.1 A03 | Validation lives beside the route, so a route added without a chain is silently unvalidated. The endpoint gate catches the route; only review catches the missing chain |
| **helmet / cors / express-rate-limit** | 8.2.0 / 2.8.6 / 8.5.2 | The §8.1 A05 baseline: security headers, an explicit origin allow-list, and a global request ceiling | The global limiter is not a login-specific one — `DEFECT-31` |
| **multer + sharp** | 2.1.1 / 0.34.5 | Multipart uploads with server-side image normalisation, which also strips EXIF | Local disk storage does not survive a container restart; production needs object storage |

### Frontend

| Choice | Version | Why |
| --- | --- | --- |
| **React** | 18.2.0 | Component model suits a dashboard-heavy product; the team's strongest skill |
| **Vite** | 8.0.14 | Sub-second dev server start; native ESM; no bundler configuration to maintain |
| **React Router** | 7.15.1 | Nested layouts map directly onto the role-gated route tree |
| **React Query** | 3.39.3 | Server state is cache state. Hand-rolling loading/error/refetch across ~40 screens is where the bugs would have been |
| **React Hook Form** | 7.76.1 | Uncontrolled inputs: no re-render per keystroke on the long course-authoring form |
| **Tailwind CSS** | 4.3.0 | Styling in the component file; no separate stylesheet drifting away from the markup |
| **Chart.js** | 4.5.1 | The analytics dashboard needed four chart types and nothing more exotic |

### Testing

| Choice | Why |
| --- | --- |
| **Jest + Supertest** | Backend unit, integration and security layers. Supertest exercises the real Express app over a real socket — no route-handler mocking |
| **mongodb-memory-server** | A real MongoDB per test run. Unique indexes, aggregation pipelines and Mongoose middleware all behave differently against a mock, and that difference is where production bugs live |
| **Vitest + Testing Library** | Frontend. Shares Vite's transform pipeline, so the tests compile the same way the app does |
| **Playwright** | End-to-end. Real browser, real network, three critical journeys |
| **k6** | Performance. Scriptable load profiles with threshold assertions that fail a build |

Selection reasoning is recorded in
[ADR-T02](https://github.com/TeamNova-SRI-KO-LMS/testing/blob/develop/docs/adr/ADR-T02-test-runner-selection.md).

## 4.2 Module and component descriptions

### 4.2.1 Authentication middleware — `Backend/middleware/auth.js`

Two composable middlewares, applied in order on every non-public route.
`protect` establishes *who*; `authorize` establishes *what they may do*.

```js
// Protect routes - Verify token and add user to request
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, jwtSecret);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }
    if (!req.user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};
```

Three properties are worth naming, because each is asserted by a test:

- The user is **re-loaded from the database on every request**, not trusted from
  the token payload. A user deactivated at 10:00 is refused at 10:01 even though
  their token remains cryptographically valid for another six days
  (`TC-FR-04-03`).
- Every failure returns the **same** 401 body. A different message for "no such
  user" than for "bad signature" is an oracle (`TC-SEC-A07-02`).
- The cost is a database round trip per authenticated request. That is the
  price of the revocation the stateless design otherwise cannot offer.

Two defects are visible in the excerpt as it stands in the delivered system and
are recorded rather than quietly fixed here:

- The shipped version logs `JWT_SECRET` to stdout on every request — `DEFECT-05`,
  OWASP A09. Removed from the excerpt above for the obvious reason; still
  present in `develop-03`.
- `process.env.JWT_SECRET || 'fallback-secret'` means a deployment that forgets
  to set the variable signs tokens with a public constant — `DEFECT-03`. The
  process should refuse to start instead.

```js
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
```

`authorize` assumes `protect` ran first — `req.user` is dereferenced without a
guard. That coupling is intentional and is enforced by a data-driven security
test that walks the generated endpoint inventory and asserts every
administrative route rejects both an anonymous request and a student token
(`TC-SEC-A01-01`, `TC-SEC-A01-02`). A new admin route is covered the moment it
is declared, without anyone remembering to write a test.

### 4.2.2 Password handling — `Backend/models/User.js`

Hashing is a schema concern, not a route concern. Putting it in a `pre('save')`
hook means there is no code path that writes a plaintext password, including the
seed scripts and the admin user-creation endpoint.

```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

The `isModified` guard is load-bearing: without it, every `save()` on a user
document — updating an avatar, toggling `isActive` — would re-hash the already
hashed password and lock the account out. `TC-FR-01-U05` asserts an unchanged
password is not re-hashed.

`!this.password` allows Google-only accounts, which have no password at all.

The cost factor is **10**. §8.1 A02 requires ≥ 12. This is `DEFECT-02`: a
one-character change with a measurable latency cost that was not made in time,
and the test asserting 12 is pinned `testCase.failing` so the day it is changed,
the build tells us.

### 4.2.3 A representative route — `POST /api/auth/register`

```js
router.post(
  '/register',
  validateUserRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      const user = await User.create({ name, email, password, role: role || 'student' });
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error during registration' });
    }
  },
);
```

This handler demonstrates the shape every route follows — validation chain,
error handler, then a thin async handler that delegates to the model — and it
also contains the most serious defect in the system.

`role` is destructured from `req.body` and passed to `User.create`. `role || 'student'`
defends against a *missing* role, not against a *supplied* one. A request
carrying `{"role": "admin"}` creates an administrator, from an unauthenticated
public endpoint. That is `DEFECT-11`: OWASP A01, critical, and the worked
example in [issue-guide.md](../project-management/issue-guide.md) is the ticket
to fix it.

The fix is one line — destructure only `name`, `email` and `password` — and the
general lesson is the one worth carrying: **whitelist the fields taken from a
request body; never blacklist.** A blacklist has to be updated every time the
schema grows a privileged field. A whitelist fails closed.

The response body is also worth noting for what it *omits*. It is constructed
field by field rather than returning the Mongoose document, so `password` cannot
leak. `TC-FR-01-02` asserts no password material appears in the response, and
the custom matcher `toExposePassword` makes that assertion reusable across every
endpoint that returns a user.

### 4.2.4 Frontend API layer — `Frontend/src/services/`

One axios instance, created once, with two interceptors:

- **Request:** attach `Authorization: Bearer <token>` from storage.
- **Response:** on 401, clear the token and redirect to login.

Centralising this means no component knows how authentication is transported. It
also means the token-expiry path is implemented once instead of forty times,
which is the difference between a session expiring cleanly and forty different
error states.

## 4.3 Database implementation

### Collections

Eleven collections; full schema in [SDS §4](../sds/sds-final.md).

| Collection | Documents | Notable indexes |
| --- | --- | --- |
| `users` | Accounts across all three roles | unique `email` |
| `courses` | Course content, nested modules and lessons | text index on `title` + `description`; `category`, `level`, `isPublished` |
| `progress` | One per (user, course) enrolment | compound unique `(user, course)` |
| `subscriptions` | Plan definitions and user subscriptions | `user`, `status` |
| `payments` | Payment records with invoice and receipt numbers | unique `invoiceNumber`, unique `receiptNumber` |
| `certificates` | Issued certificates | unique `certificateNumber`, `verificationCode` |
| `announcements` | Course and platform announcements | `course`, `createdAt` |
| `discussionforums` | One per course | `course` |
| `discussionposts` | Threaded posts | `forum`, `createdAt` |
| `notifications` | Per-user notifications | `(user, isRead)` |
| `joinussubmissions` | Enquiries | `status`, `createdAt` |
| `settings` | Singleton platform configuration | — |

### Integrity without foreign keys

MongoDB enforces no referential integrity, so the application must. Three
mechanisms, in decreasing order of reliability:

1. **Unique indexes** — the only guarantee the database itself makes. Duplicate
   emails, invoice numbers and certificate numbers are rejected by the storage
   engine regardless of what the application does. Integration tests assert
   this by attempting the duplicate insert directly (`TC-FR-01-06`).
2. **Mongoose validators** — required fields, enums, ranges, `min`/`max`.
   Enforced on `save()`, and bypassed by `updateOne` unless
   `runValidators: true` is passed. That bypass is a live risk in the codebase.
3. **Application checks** — existence of a referenced document before writing a
   reference. Not atomic. Between the check and the write, the referent can be
   deleted.

`DEFECT-23` is the third category made concrete: deleting a course does not
remove the enrolments, forums or progress records that point at it, leaving
orphans that surface as nulls in the dashboard.

### Denormalisation, deliberately

Enrolment is recorded in three places: `Progress`, `Course.enrolledStudents`,
and `User.enrolledCourses`. This is not an oversight — it is what makes "my
courses" and "students on this course" single-document reads instead of
aggregations. The cost is that an enrolment is three writes with no transaction
around them, so a failure between them leaves the three disagreeing.

The mitigation actually in place is a repair path, not a transaction:
`Progress` is treated as the source of truth, and the two arrays are
reconstructible from it. That is written down in
[ADR-003](../adr/ADR-003-denormalised-enrolment.md) so the next person to see
divergent counts knows which one to believe.

### Index creation

Indexes are declared in the schemas and created by Mongoose on connection.
One declaration is malformed — `Settings.js:201` calls `index({}, {unique: true})`
with an empty key specification, which MongoDB rejects. It surfaced because the
test harness calls `syncIndexes()` explicitly at startup and the whole setup
aborted. That is `DEFECT-12`, and it is a good illustration of why the harness
synchronises indexes rather than assuming them: a broken index declaration in
production fails silently at connection time and shows up months later as a slow
query.

## 4.4 CI/CD pipeline

Implemented in GitHub Actions across the repositories, matching the stages §7.2
requires.

| §7.2 stage | Trigger | Implementation |
| --- | --- | --- |
| **Lint & Format** | Every push, any branch | `npm run lint` (ESLint, zero errors) then `npm run format:check` (Prettier) |
| **Build** | Every push, any branch | Application checked out and installed; harness verifies it can load the app; API endpoint inventory extracted |
| **Unit Tests** | Every push, any branch | Backend Jest unit project + frontend Vitest, with coverage |
| **Integration Tests** | Push/PR to `develop` | MongoDB service container; integration and security projects; coverage merged; **coverage gate**; **endpoint gate**; register, traceability and OWASP evidence generated and uploaded |
| **Security Scan** | Push to `develop` or `main` | `npm audit --audit-level=high` on both repositories; Dependabot enabled |
| **Deploy — Staging** | Merge to `develop` | Automatic deployment to the staging environment |
| **Deploy — Production** | Merge to `main`, manual approval | Tagged release deployed to production |

Two additional workflows run outside the main pipeline because of their cost:
`e2e.yml` (Playwright, boots both tiers) and `performance.yml` (installs k6 and
runs the load scenarios).

### The gates that fail the build

§8.2 requires the pipeline to enforce quality gates rather than report on them.
Four do:

| Gate | Threshold | Enforced by |
| --- | --- | --- |
| Zero lint errors | 0 | `npm run lint` |
| Coverage, overall | ≥ 80 % lines and statements | `scripts/check-coverage.js` |
| Coverage, critical business logic | ≥ 90 % | `scripts/check-coverage.js`, against the `criticalPaths` list in `testing.config.js` |
| **API endpoints exercised** | 100 % | `scripts/check-endpoint-coverage.js` |
| Dependency vulnerabilities | no high or critical | `npm audit --audit-level=high` |

The endpoint gate is the one that is unusual and the one that has repaid the
effort. §6.4 suggests tracking endpoint coverage "manually in the test
register", which decays the first time somebody adds a route in a hurry.
Instead:

1. A static pass parses the application's route files and mount points into an
   inventory — 125 testable endpoints today.
2. Every request the suite makes through the `api()` helper is journalled.
3. The gate joins the two and fails on any endpoint with zero recorded hits.

A route added in a feature branch is reported as uncovered on that branch's
first CI run, before review. The same inventory drives the security suite, so a
new admin endpoint is probed for access control automatically.

An aggregate `pipeline` job depends on every stage, so branch protection has one
required check to point at rather than five that can be reconfigured
independently.

## 4.5 Challenges and engineering decisions

Five problems that changed how the system or its verification is built. Each is
recorded because the decision, not the incident, is the useful part.

### 4.5.1 Module identity across two `node_modules` trees

The test suite lives in its own repository (§3.1 `tests`), so a naive
`require('mongoose')` in a test resolved to a *different* mongoose instance than
the one inside the application. Two instances mean two model registries and two
connection pools: the harness connected one while the application queried the
other, and every database call hung until Mongoose's buffering timeout expired.

The symptom — "tests time out, no error" — pointed nowhere near the cause.

**Decision:** point Jest's `modulePaths` at the application's `node_modules`, so
both sides resolve to one instance. All access to the application goes through a
single resolver (`src/support/sut.js`) that finds it from an environment
variable, a git-ignored pointer file, or a list of conventional sibling paths.
No test file contains a path to the application.

**Why it matters beyond this project:** a standalone test repository is worth
having — it keeps test infrastructure out of the application's dependency tree
and lets the suite version independently — but it is only viable if module
identity is solved once, centrally, rather than in each test.

### 4.5.2 Parallel workers sharing one database

Jest runs test files in parallel workers. All of them connected to the same
`mongodb-memory-server` database, and each truncated collections in `afterEach`
— so one file's cleanup deleted another file's fixtures mid-test.

The failure appeared only in full runs, never in isolation, and moved between
files from run to run. It looked like flakiness.

**Decision:** each worker gets its own database, `<name>_w<JEST_WORKER_ID>`.
Truncate collections between tests rather than dropping them, because dropping
also drops the indexes several assertions depend on.

**Lesson:** "passes alone, fails together" is almost always shared state, and
the cheapest fix is to stop sharing rather than to coordinate.

### 4.5.3 The rate limiter interfering with its own tests

The application applies a 2 000-request limit to `/api/`, with a store that
lives for the lifetime of the Express app. A long integration file eventually
started receiving 429s unrelated to what it was testing.

**Decision:** functional suites load the application with a passthrough limiter
injected into the module cache; one security file loads it *un*-stubbed and
proves the control is real. The trade-off is asserted explicitly in
`TC-SEC-A04-03` rather than left as an unexamined habit — stubbing a security
control in most tests is only defensible if exactly one test does not stub it.

### 4.5.4 Documenting defects without either fixing or hiding them

Building the suite surfaced 32 defects, four critical. Two obvious options were
both wrong: fix them all (out of scope for the phase, and some are design
changes) or write tests that assert the buggy behaviour (which makes the fix
break the suite, teaching the team that fixing bugs is expensive).

**Decision:** each defect gets a test that asserts the **correct** behaviour,
declared with `testCase.failing`. Jest reports such a test as passing while the
defect reproduces, and **fails the build the moment it is fixed** — which is the
signal to retire the entry. A defect cannot be silently fixed, silently
reintroduced, or silently forgotten. Recorded as
[ADR-T03](https://github.com/TeamNova-SRI-KO-LMS/testing/blob/develop/docs/adr/ADR-T03-known-defect-tests.md).

This is why the suite is green with 32 open defects: it does not assert that the
application is correct, it asserts that the application behaves exactly as
documented — correct or not.

### 4.5.5 A failing-by-design test that was not deterministic

One known-defect test asserted that 200 invoice numbers generated in a month are
distinct. The suffix is `Math.floor(Math.random() * 10000)`, so by the birthday
bound a collision is likely — but only *likely*. Roughly one run in seven
produced no collision, the `testCase.failing` unexpectedly passed, and the
build went red for a reason that had nothing to do with the code.

**Decision:** replace the probabilistic assertion with a deterministic one. With
`Math.random` pinned to a single value, the current implementation returns two
identical invoice numbers; any generator that does not stake uniqueness on the
RNG — a per-month counter, an ObjectId-derived suffix — returns two different
ones. The defect is still asserted, the argument is still the birthday bound,
and the test now fails for exactly one reason.

**Lesson:** the rule that a flaky test is a build-blocking defect applies to the
harness's own tests. A suite that is sometimes red for unrelated reasons trains
the team to ignore red, which costs more than any individual flaky test saves.

---

# 5. Testing

## 5.1 Testing strategy

> *"In industry, code that has no tests is considered unfinished, not
> 'working'."* — SENG 34213 §6.1

The full strategy is [test-strategy.md](../testing/test-strategy.md). Three
principles decide every judgement call in it.

**A test earns its place by the failure it would catch.** Before writing a test,
name the bug it prevents. "Covers the login route" is not a reason. "An attacker
who guesses a password gets the same message as one who guesses an email, so the
endpoint cannot be used to enumerate accounts" is. Tests written for coverage
alone are the first ones deleted when they become inconvenient.

**Test behaviour, not implementation.** Assertions describe what a caller
observes — status codes, response bodies, persisted state — never which internal
function ran. A refactor that preserves behaviour breaks no test. That property
is what makes a suite an asset during a rewrite instead of an obstacle to one.

**A test that cannot fail is worse than no test.** It costs runtime, occupies a
line in the coverage report, and manufactures confidence. Every mechanism in the
harness that could silently stop working — the endpoint inventory, the security
tables, the register — carries a guard that fails when it is empty.

### The pyramid

Five layers, matching §6.2 with a security layer §8.1 requires separately.

| Layer | Scope | Runner | Tests | Runtime |
| --- | --- | --- | --- | --- |
| **Unit** | One function or class, collaborators mocked | Jest | 353 | ~5 s |
| **Integration** | Real HTTP → real Express → real MongoDB | Jest + Supertest | 628 | ~20 s |
| **Security** | OWASP Top 10 controls, data-driven from the endpoint inventory | Jest + Supertest | 118 | ~5 s |
| **Frontend** | Modules and components | Vitest + Testing Library | 60 | < 1 s |
| **E2E** | Full journeys through a real browser | Playwright | 56 | minutes |
| **Performance** | Throughput and latency under load | k6 | 4 scenarios | minutes |

**1 099 Jest tests + 60 Vitest tests = 1 159**, all passing, in 35 backend
suites and 56 Playwright cases across two browser projects.

The shape is deliberate. Unit tests are where a branch is *reachable* — a
database error, an expired token, a boundary value — because the collaborators
are mocked. Integration tests are where a contract is *real*: they run against a
genuine MongoDB, because unique indexes, aggregation pipelines and Mongoose
middleware all behave differently against a mock, and those differences are
exactly where production bugs live.

### Standards every test follows

- **Arrange–Act–Assert** (§6.3.1), visible in the structure.
- **Given–When–Then names** a non-programmer can read, so a CI failure is
  diagnosable from the test list without opening a file.
- **One reason to fail.** Related assertions about a single outcome belong
  together; unrelated scenarios get their own test.
- **Boundaries, not midpoints.** `duration` is validated as 1–52 weeks, so the
  tests use 0, 1, 52 and 53. Testing "10" says nothing about where the boundary
  actually is.
- **Documented cases** carry `testCase({...})` metadata — id, requirement,
  priority, preconditions, input, expected output — beside the assertion, per
  §6.3.3.

## 5.2 Test case register

The register required by §6.3.3 and submitted as deliverable §10.1 #7 is
[test-register.md](../testing/test-register.md), reproduced in
[Appendix A](#appendix-a--test-case-register).

**283 documented test cases**, each generated from a `testCase({...})`
declaration that sits directly beside the assertion it describes. The *Actual
Output* and *Status* columns are filled from the most recent execution.

The register cannot drift from the suite, because it **is** the suite: renaming
a test renames its row, deleting a test deletes its row, and a case whose
assertion changes gets a changed expectation in the register on the next run.
A hand-maintained register is a snapshot of what someone believed on the
afternoon they wrote it.

| Layer | Documented cases |
| --- | --- |
| Integration | 196 |
| Unit | 57 |
| Security | 30 |
| **Total** | **283** |

| Status | Count |
| --- | --- |
| Pass | 255 |
| Known defect (`testCase.failing`) | 28 |

## 5.3 Coverage report summary

Full report: [coverage-sprint8.md](../testing/coverage-sprint8.md).
Generated 2026-09-05 against `develop-03`.

### Against the §6.4 requirements

| Requirement | Threshold | Achieved | Result |
| --- | --- | --- | --- |
| All new code — lines | 80 % | **81.4 %** | ✅ |
| All new code — statements | 80 % | **80.0 %** | ✅ |
| Critical business logic — branches | 90 % | **90.5 – 100 %** | ✅ |
| API endpoints exercised | 100 % | **125 / 125** | ✅ |

### Backend, by metric

| Metric | Covered | Required |
| --- | --- | --- |
| Lines | 81.4 % (2 236 / 2 747) | 80 % |
| Statements | 80.0 % (2 263 / 2 827) | 80 % |
| Branches | 73.4 % (1 029 / 1 402) | 70 % overall, 90 % critical |
| Functions | 84.4 % (259 / 307) | 80 % |

### Critical business logic (§6.4)

The files where a missed branch costs money or a privilege escalation. The
threshold is 90 % on all four metrics, and the list is configuration
(`testing.config.js`), not a convention someone has to remember.

| File | Lines | Branches | Functions |
| --- | --- | --- | --- |
| `middleware/auth.js` | 100 % | 96.2 % | 100 % |
| `middleware/validation.js` | 100 % | 100 % | 100 % |
| `models/User.js` | 100 % | 100 % | 100 % |
| `models/Payment.js` | 100 % | 96.8 % | 100 % |
| `models/Progress.js` | 100 % | 100 % | 100 % |
| `models/Subscription.js` | 100 % | 100 % | 100 % |
| `routes/authRoutes.js` | 90.4 % | 90.5 % | 100 % |

### Frontend

| Metric | Covered |
| --- | --- |
| Lines / statements | 92.6 % (527 / 569) |
| Branches | 90.1 % (128 / 142) |
| Functions | 100 % (99 / 99) |

### What the numbers do not say

Two honest qualifications, because a coverage figure quoted without them is
misleading:

**`server.js` sits at 54.4 %.** The uncovered half is process-level startup —
`connectDB()` retry loops, `process.on('unhandledRejection')`, the
`app.listen()` callback — which cannot execute under Supertest without starting
a real listener and killing the process to test the handler. Excluding it would
have produced a prettier headline number and a less honest one, so it is
measured and reported.

**Branch coverage is 73.4 %, above the 70 % floor but well below line coverage.**
The gap is concentrated in defensive `catch` blocks on database calls that
integration tests cannot reach, since the database does not fail on demand.
Where a branch guards something that matters, a unit test mocks the failure;
where it guards a `console.error`, it does not.

**Endpoint coverage is not endpoint *quality*.** 125/125 means every route is
exercised at least once. It does not mean every route is exercised
*thoroughly* — that is what the 283 documented cases and the review standard are
for.

## 5.4 Performance test results

> **Not yet executed.** See [performance-report.md](../testing/performance-report.md).

The suite is written, committed and wired into CI (`performance.yml`). k6 is a
standalone Go binary rather than an npm dependency, and it was not installed on
the machine that prepared this submission, so no measurements exist. Inventing
them would defeat the purpose of the deliverable.

What will be measured, and against what:

| Scenario | Shape | Purpose |
| --- | --- | --- |
| `smoke` | 1 virtual user, 30 s | Confirms the scenario and the target are healthy before spending time on load |
| `load` | Ramp to 50 concurrent users, sustained | The NFR-01 case: expected peak with realistic think time |
| `spike` | Sudden jump to 4× nominal | Whether the system degrades or collapses when a cohort logs in at once |
| `stress` | Ramp until thresholds break | Locates the ceiling, so capacity planning has a number |

| Threshold | Limit | Requirement |
| --- | --- | --- |
| Request failure rate | < 1 % | NFR-01 |
| Request duration p95 | < 500 ms | NFR-01 |
| Request duration p99 | < 1 200 ms | NFR-01 |
| Login duration p95 | < 800 ms | NFR-01 |

Login carries a looser bound deliberately: authentication runs bcrypt at a work
factor chosen to be slow. A login endpoint answering in 50 ms would be a finding.

To produce the results: install k6, point `PERF_BASE_URL` at **staging** (a
laptop measures a laptop), run `npm run test:perf`, then `npm run sync` in this
repository.

## 5.5 Security compliance evidence

Full evidence: [owasp-checklist.md](../security/owasp-checklist.md),
deliverable §10.1 #8, reproduced in
[Appendix C](#appendix-c--owasp-compliance-evidence).

Each of the ten risks in §8.1 is documented with the control required, how the
application implements it, an assessment, and the test cases that prove it.
Citations are resolved against the register when the document is generated, so a
control whose evidence has been deleted or renamed is reported as **unevidenced**
rather than passing quietly.

| Risk | Status | Evidence | Open defects |
| --- | --- | --- | --- |
| A01 Broken Access Control | 🟡 Partial | 14/14 cases | DEFECT-11 |
| A02 Cryptographic Failures | 🟡 Partial | 7/9 cases | DEFECT-02 |
| A03 Injection | 🟡 Partial | 7/8 cases | DEFECT-01, -16, -30 |
| A04 Insecure Design | 🟡 Partial | 9/10 cases | DEFECT-22, -32 |
| A05 Security Misconfiguration | 🟡 Partial | 5/6 cases | DEFECT-03 |
| A06 Vulnerable Components | ⚙️ Automated in CI | `npm audit` + Dependabot | — |
| A07 Authentication Failures | 🟡 Partial | 7/8 cases | DEFECT-31, -14, -20 |
| A08 Integrity Failures | ⚙️ Automated in CI | lockfiles committed, verified in CI | — |
| A09 Logging Failures | 🟡 Partial | 1/3 cases | DEFECT-05, -13 |
| A10 SSRF | 🟡 Partial | 0/1 cases | DEFECT-06 |

**Partial, not Pass, on eight of ten.** That is the honest reading: each control
exists and is verified, and each has at least one remaining gap with a numbered
defect and a failing-by-design test attached. A compliance table that reported
ten green ticks would be easier to submit and would be false.

The security suite's most useful property is that it is **data-driven from the
generated endpoint inventory**. `TC-SEC-A01-01` and `-02` iterate every one of
the 82 administrative endpoints and assert an anonymous request and a student
token are both refused. Adding a route to `adminRoutes.js` extends that test
automatically. Access control is the control most likely to be forgotten on a
new endpoint, so it is the one that should not depend on remembering.

## 5.6 Defects found

**32 defects**, recorded in [defect-register.md](../testing/defect-register.md)
and reproduced in [Appendix D](#appendix-d--defect-register). Every one was
found by the suite; none was reported by a user, because the system has not had
users yet.

| Severity | Count |
| --- | --- |
| 🔴 Critical | 4 |
| 🟠 High | 10 |
| 🟡 Medium | 13 |
| 🔵 Low | 5 |

The four critical:

| Defect | Risk | Summary |
| --- | --- | --- |
| `DEFECT-11` | A01 | Public registration accepts a client-supplied `role` — anyone can create an administrator |
| `DEFECT-03` | A05 | All three token modules read `process.env.JWT_SECRET \|\| 'fallback-secret'`, so a missing environment variable signs every token with a value published in the source |
| `DEFECT-05` | A09 | `middleware/auth.js` logs the JWT secret on every authenticated request |
| `DEFECT-21` | — | Three user endpoints are unreachable: a parameterised route is declared before the literal routes it shadows |

`DEFECT-21` is instructive because it is not a security bug and no test of the
handler would have found it. The handlers are correct; they are simply never
reached, because `/users/:id` was declared before `/users/profile` and Express
matches in declaration order. It was found by the **endpoint coverage gate** —
the routes existed in the inventory and no request ever reached them — and it
produced [ADR-005](../adr/ADR-005-route-declaration-order.md), which makes
literal-before-parameterised a reviewable rule.

---

# 6. Evaluation

## 6.1 Degree of objectives met

Cross-referenced to the [SRS](../srs/srs-final.md). "Met" means every acceptance
criterion in the requirement is satisfied by the delivered system and verified
by at least one test case. "Partial" means the requirement functions but one or
more acceptance criteria are not satisfied — each with a numbered defect.

Requirement coverage is **30/30**: every catalogued requirement has at least one
test. That is a statement about verification, not about correctness — a
requirement can be fully tested and partially met, and eleven of them are.

### Functional requirements

| Req | Title | Tests | Endpoints | Status |
| --- | --- | --- | --- | --- |
| FR-01 | User registration | 20 | 2/2 | ✅ Met |
| FR-02 | Authentication | 15 | 2/2 | 🟡 Partial — `DEFECT-15` |
| FR-03 | Google OAuth | 6 | 1/1 | ✅ Met |
| FR-04 | Session and token management | 19 | 2/2 | 🟡 Partial — `DEFECT-14` (no server-side logout) |
| FR-05 | Role-based access control | 23 | 25/25 | ✅ Met |
| FR-06 | Profile management | 6 | 5/5 | 🟡 Partial — `DEFECT-21` (three endpoints unreachable) |
| FR-07 | Password management | 6 | 1/1 | 🟡 Partial — `DEFECT-20` |
| FR-08 | Course catalogue and search | 14 | 2/2 | ✅ Met |
| FR-09 | Course authoring | 6 | 3/3 | 🟡 Partial — `DEFECT-18` |
| FR-10 | Course enrolment | 15 | 3/3 | ✅ Met |
| FR-11 | Progress and completion | 12 | 2/2 | ✅ Met |
| FR-12 | Reviews and ratings | 4 | 1/1 | 🟡 Partial — `DEFECT-19` |
| FR-13 | Subscription plans | 16 | 6/6 | ✅ Met |
| FR-14 | Payments and invoicing | 21 | 11/11 | 🟡 Partial — `DEFECT-22`, `DEFECT-08` |
| FR-15 | Certificates | 24 | 10/10 | 🟡 Partial — `DEFECT-29` |
| FR-16 | Announcements | 10 | 10/10 | ✅ Met |
| FR-17 | Discussion forums | 11 | 13/13 | ✅ Met |
| FR-18 | Notifications | 10 | 14/14 | 🟡 Partial — `DEFECT-24`, `-25`, `-26` |
| FR-19 | Administrative user management | 16 | 9/9 | ✅ Met |
| FR-20 | Administrative course management | 11 | 5/5 | ✅ Met |
| FR-21 | Analytics and reporting | 15 | 7/7 | 🟡 Partial — `DEFECT-28` |
| FR-22 | System settings | 6 | 7/7 | ✅ Met |
| FR-23 | Enquiry submission | 11 | 6/6 | ✅ Met |
| FR-24 | File upload | 8 | 1/1 | ✅ Met |
| FR-25 | Health and observability | 5 | 3/3 | ✅ Met |

**14 of 25 fully met; 11 partial; 0 not delivered.** Every functional
requirement has a working implementation; none was dropped.

### Non-functional requirements

| Req | Title | Status | Evidence |
| --- | --- | --- | --- |
| NFR-01 | Performance | ⏳ **Unverified** | Suite written, thresholds declared, not yet executed — §5.4 |
| NFR-02 | Availability and data integrity | 🟡 Partial | 5 cases; `DEFECT-12` (malformed index declaration) |
| NFR-03 | Security | 🟡 Partial | 44 cases; 11 open defects — §5.5 |
| NFR-04 | Input validation | ✅ Met | Per-route `express-validator` chains; boundary tests on every constrained field |
| NFR-05 | Usability and responsiveness | ✅ Met | Playwright `mobile-chrome` project; responsive assertions |
| NFR-06 | Maintainability | ✅ Met | Zero lint errors; Prettier enforced; 81 % coverage; five ADRs |
| NFR-07 | Portability | ✅ Met | Node 18+, environment-driven configuration, containerised deployment |

**NFR-01 is the one unverified requirement in the project.** It is called out
here rather than buried, because "we wrote the tests" is not the same as "the
system meets the threshold", and the report should not blur that.

## 6.2 Client feedback

`[Record the client's or supervisor's assessment here — from the sprint reviews
and the pre-demo sign-off in Week 15. Quote what was actually said. If no
client review took place, state that plainly rather than leaving the section
implying one did.]`

| Sprint | Reviewer | Feedback | Action taken |
| --- | --- | --- | --- |
| Sprint 5 | `[name/role]` | `[feedback]` | `[issue #]` |
| Sprint 6 | `[name/role]` | `[feedback]` | `[issue #]` |
| Sprint 7 | `[name/role]` | `[feedback]` | `[issue #]` |
| Sprint 8 | `[name/role]` | `[feedback]` | `[issue #]` |

## 6.3 Limitations and known defects

### The four critical defects

| Defect | Risk | Effect | Fix |
| --- | --- | --- | --- |
| `DEFECT-11` | A01 | `POST /api/auth/register` honours a client-supplied `role`, so an anonymous request can create an administrator | Destructure only `name`, `email`, `password` from `req.body`. One line |
| `DEFECT-03` | A05 | A deployment that forgets `JWT_SECRET` silently signs tokens with a constant published in the repository; anyone who has read the source can mint an administrator token | Fail fast at startup when the variable is absent, in all three modules |
| `DEFECT-05` | A09 | The JWT secret is written to stdout on every authenticated request; anyone with log access can forge any token | Delete the debug logging; rotate the secret |
| `DEFECT-21` | — | `GET /api/users/profile`, `PUT /api/users/profile`, `PUT /api/users/password` are unreachable — `/users/:id` shadows them | Move literal routes above parameterised ones ([ADR-005](../adr/ADR-005-route-declaration-order.md)) |

All four are one-file changes. They are open because the development phase ended
before the fixes were scheduled, not because they are hard — and each is pinned
by a `testCase.failing` that will fail the build on the day it is fixed, which
is the point.

### Architectural limitations

**Tokens cannot be revoked.** A stateless JWT is valid until it expires, so
logout is client-side only ([ADR-001](../adr/ADR-001-stateless-jwt-authentication.md),
`DEFECT-14`). A stolen token remains usable for its full seven-day lifetime. The
mitigation would be a short-lived access token with a refresh token held
server-side — which reintroduces the state the design chose to avoid.

**Enrolment consistency is not transactional.** Three documents record the same
fact with no transaction around them
([ADR-003](../adr/ADR-003-denormalised-enrolment.md)). MongoDB supports
multi-document transactions on a replica set; the deployment does not use one.

**No service layer.** Business logic in Mongoose models
([ADR-002](../adr/ADR-002-business-logic-in-models.md)) means pure logic cannot
be tested without instantiating a model, and route handlers carry orchestration
they should not. This is the decision most likely to be revisited.

**Uploads are on local disk.** Files do not survive a container restart and are
not shared between instances. Production needs object storage.

**No caching layer.** Every request hits the database. The catalogue is the
obvious candidate — it is read constantly and written rarely.

### Process limitations

`[The team's honest account. Candidates, if they apply: where estimates were
wrong and why; where the Definition of Done was waived under deadline pressure;
which sprint carried the most items over and what caused it; where review became
a rubber stamp. The retrospectives in documents/retrospectives/ are the source.
This section is worth more than a list of features — panels read it to see
whether the team can assess itself.]`

## 6.4 Future work

In the order the next team should take them.

| # | Work | Why first |
| --- | --- | --- |
| 1 | Fix the four critical defects | Two are exploitable by an anonymous user. Nothing else matters more, and each is a single-file change |
| 2 | Run the performance suite against staging | NFR-01 is the only unverified requirement. The suite exists; it needs one k6 install and one run |
| 3 | Close the remaining 28 defects, highest severity first | Each has a failing test already asserting the correct behaviour, so the work is scoped and self-verifying |
| 4 | Raise bcrypt cost to 12 and add login-specific rate limiting | `DEFECT-02` and `DEFECT-31` — the two §8.1 controls that are declared but under-configured |
| 5 | Refresh-token rotation | Removes the seven-day exposure of a stolen token and closes `DEFECT-14` |
| 6 | Move uploads to object storage | Required before running more than one API instance |
| 7 | Introduce a service layer for payments and enrolment | The two domains where orchestration in the route handler has already caused defects |
| 8 | Cache the catalogue | The cheapest large performance win, once the performance baseline exists to measure it against |
| 9 | Raise branch coverage toward 80 % | Concentrated in error paths; needs fault injection at the database boundary |

Items 1 to 3 are recorded as GitHub issues with acceptance criteria; the rest
are backlog entries.

---

# 7. Conclusion

The project delivered a working learning management system: 125 API endpoints
across 25 functional requirements, a React frontend covering all three user
classes, and a deployment pipeline that takes a merge to `develop` through lint,
build, unit tests, integration tests, a security scan and five quality gates
before it reaches staging.

Measured against the course's own criteria, the outcome is uneven in a way worth
stating precisely. Testing and code quality came out strong: 1 159 automated
tests, 81.4 % line coverage with 90 %+ on the paths where a missed branch costs
money, 100 % of endpoints exercised by an integration test, zero lint errors,
and a register that is generated from the suite rather than typed. Functional
completeness is good — every requirement is implemented, 14 of 25 fully meet
their acceptance criteria. Security is the weakest dimension: eight of the ten
OWASP risks are Partial, and one of the gaps lets an anonymous request create an
administrator.

The single most valuable thing built was not a feature. It was the decision to
record every defect the suite found as a **test asserting the correct
behaviour**, marked failing-by-design. It produced a suite that is green while
32 defects remain open, without hiding any of them — the suite asserts that the
system behaves exactly as documented, and the moment a defect is fixed, the
build breaks to say so. That is what makes the defect register in this report
trustworthy: it cannot be optimistic, because the tests would not allow it.

The lesson underneath it generalises. Nearly every mechanism in this project
that survived contact with a deadline was one where the correct thing was
*enforced* rather than *remembered* — the endpoint gate rather than a manual
tracking column, the generated register rather than a maintained one, the
coverage thresholds in configuration rather than in a code review comment.
The things that decayed were the ones that depended on discipline alone.

`[One or two closing sentences from the team on what the project meant for the
client and for the team's own development. Written last, in the team's voice.]`

---

# 8. References

## Course materials

1. Software Engineering Teaching Unit, University of Kelaniya. *SENG 34213 —
   System Development Project: Project Specification and Guidelines.*
   `SENG34213_System_Development_Project.pdf`.
2. Software Engineering Teaching Unit, University of Kelaniya. *SENG 31242 —
   Software Design Project: Design Report.* `[team's own design report]`.

## Project documents

3. TeamNova. *Software Requirements Specification — SRI-KO LMS*, v1.0.
   [`documents/srs/srs-final.md`](../srs/srs-final.md).
4. TeamNova. *Software Design Specification — SRI-KO LMS*, v1.0.
   [`documents/sds/sds-final.md`](../sds/sds-final.md).
5. TeamNova. *Architectural Decision Records ADR-001 to ADR-005.*
   [`documents/adr/`](../adr/).
6. TeamNova. *Test Strategy.* [`documents/testing/test-strategy.md`](../testing/test-strategy.md).
7. TeamNova. *Coding Standards.* [`documents/standards/coding-standards.md`](../standards/coding-standards.md).

## Standards and specifications

8. OWASP Foundation. *OWASP Top 10:2021 — The Ten Most Critical Web Application
   Security Risks.* <https://owasp.org/Top10/>
9. Preston-Werner, T. *Semantic Versioning 2.0.0.* <https://semver.org/>
10. *Conventional Commits 1.0.0.* <https://www.conventionalcommits.org/>
11. IEEE. *IEEE 830-1998 — Recommended Practice for Software Requirements
    Specifications.* IEEE, 1998.
12. Internet Engineering Task Force. *RFC 7519 — JSON Web Token (JWT).* 2015.
13. Provos, N. and Mazières, D. *A Future-Adaptable Password Scheme.*
    USENIX Annual Technical Conference, 1999.

## Technical documentation

14. OpenJS Foundation. *Express 5.x API Reference.* <https://expressjs.com/>
15. MongoDB, Inc. *MongoDB Manual — Data Modeling and Indexes.*
    <https://www.mongodb.com/docs/manual/>
16. Automattic. *Mongoose Documentation.* <https://mongoosejs.com/docs/>
17. Meta Open Source. *React Documentation.* <https://react.dev/>
18. Meta Open Source. *Jest Documentation.* <https://jestjs.io/docs/>
19. Microsoft. *Playwright Documentation.* <https://playwright.dev/>
20. Grafana Labs. *k6 Documentation.* <https://k6.io/docs/>

## Books

21. Beck, K. *Test-Driven Development: By Example.* Addison-Wesley, 2002.
22. Martin, R. C. *Clean Code: A Handbook of Agile Software Craftsmanship.*
    Prentice Hall, 2008.
23. Fowler, M. *Refactoring: Improving the Design of Existing Code*, 2nd ed.
    Addison-Wesley, 2018.
24. Humble, J. and Farley, D. *Continuous Delivery.* Addison-Wesley, 2010.
25. Nygard, M. *Release It!*, 2nd ed. Pragmatic Bookshelf, 2018.

---

# 9. Appendices

The appendices are generated artefacts. They are bound into the submitted PDF by
`npm run build:pdf:all`; in this repository they are separate files so that each
one stays current with the suite that produced it.

## Appendix A — Test case register

[`documents/testing/test-register.md`](../testing/test-register.md) — 283
documented cases with id, requirement, priority, preconditions, input, expected
output, actual output and status. Deliverable §10.1 #7.

## Appendix B — Coverage report

[`documents/testing/coverage-sprint8.md`](../testing/coverage-sprint8.md) —
per-file line, statement, branch and function coverage, with the §6.4 gates
evaluated. Deliverable §10.1 #6.
The HTML report with line-by-line highlighting is published as a CI artefact.

## Appendix C — OWASP compliance evidence

[`documents/security/owasp-checklist.md`](../security/owasp-checklist.md) — one
section per risk: required control, implementation, assessment, cited test
cases. Deliverable §10.1 #8.

## Appendix D — Defect register

[`documents/testing/defect-register.md`](../testing/defect-register.md) — 32
defects with severity, location, reproduction, effect, and the test case pinning
each one.

## Appendix E — Requirements traceability matrix

[`documents/testing/traceability-matrix.md`](../testing/traceability-matrix.md) —
every requirement mapped to the test cases that verify it and the endpoints that
implement it. 30/30 requirements covered.

## Appendix F — API endpoint coverage

[`documents/testing/endpoint-coverage.md`](../testing/endpoint-coverage.md) —
all 125 endpoints, derived from the application source and from the requests the
suite actually made. 125/125 covered.

## Appendix G — Performance test results

[`documents/testing/performance-report.md`](../testing/performance-report.md) —
deliverable §10.1 #9. Awaiting execution; see §5.4.

## Appendix H — Architectural decision records

[`documents/adr/`](../adr/) — ADR-001 to ADR-005 for the application, ADR-T01 to
ADR-T03 for the test infrastructure. Each records the context, the decision, the
alternatives rejected, and the consequences accepted.

## Appendix I — Sprint retrospectives

[`documents/retrospectives/`](../retrospectives/) — Sprints 5 to 8, in the
Appendix B.2 format: Went Well, To Improve, Action Items, Metrics.
Deliverable §10.1 #11.

## Appendix J — Peer evaluation form

[`documents/forms/peer-evaluation-form.md`](../forms/peer-evaluation-form.md) —
Appendix D of the course specification. Submitted individually to eKelaniya per
§10.2, **not** through this repository.
