---
title: 'Software Design Specification'
subtitle: 'SRI-KO Learning Management System'
course: 'SENG 34213 — System Development Project'
team: 'TeamNova'
version: '2.0 (Final — as implemented)'
---

# Software Design Specification

## SRI-KO Learning Management System

| | |
| --- | --- |
| **Document** | Software Design Specification (SDS) |
| **Version** | 2.0 — Final, reflecting the implemented system |
| **Project** | SRI-KO Learning Management System |
| **Team** | TeamNova |
| **Course** | SENG 34213 — System Development Project |
| **Programme** | BSc (Hons.) in Software Engineering, University of Kelaniya |
| **Supervisor** | `[Supervisor Name]` |
| **Date** | `[Submission Date]` |
| **Deliverable** | §10.1 #2 — `documents/sds/sds-final.pdf` |

### Authors

| # | Name | Registration No. | Role |
| --- | --- | --- | --- |
| 1 | `[Student Name 1]` | `[Registration No. 1]` | `[Role 1]` |
| 2 | `[Student Name 2]` | `[Registration No. 2]` | `[Role 2]` |
| 3 | `[Student Name 3]` | `[Registration No. 3]` | `[Role 3]` |
| 4 | `[Student Name 4]` | `[Registration No. 4]` | `[Role 4]` |
| 5 | `[Student Name 5]` | `[Registration No. 5]` | `[Role 5]` |

### Revision history

| Version | Date | Author | Change |
| --- | --- | --- | --- |
| 1.0 | SENG 31242 | TeamNova | Original design |
| 2.0 | `[Date]` | TeamNova | Updated to the final implemented design (§10.1 #2) |

---

> ### ⚠️ Provenance of this document
>
> §1.3 of the course guideline requires that "the SDS must be updated to reflect
> the final implemented design". This version was **reconstructed from the
> delivered source code** — every module, collection, endpoint and control
> described below was read from the repository, not designed on paper.
>
> It is therefore an accurate description of **the system as built**. Where the
> implementation departs from the version 1.0 design, that departure must be
> recorded as an ADR (§1.3). [Appendix B](#appendix-b--deviations-from-the-seng-31242-sds)
> is provided for that purpose, and the ADRs themselves live in
> `documents/adr/`.

---

## Table of contents

1. [Introduction](#1-introduction)
2. [System architecture](#2-system-architecture)
3. [Component design](#3-component-design)
4. [Data design](#4-data-design)
5. [API design](#5-api-design)
6. [Security design](#6-security-design)
7. [Frontend design](#7-frontend-design)
8. [Deployment design](#8-deployment-design)
9. [Design decisions and trade-offs](#9-design-decisions-and-trade-offs)
10. [Appendices](#appendix-a--technology-stack)

---

# 1. Introduction

## 1.1 Purpose

This document describes how the SRI-KO Learning Management System is built: its
architecture, the responsibilities of each component, the shape of its data, the
contract of its API, and the controls that protect it. It is the bridge between
the requirements in the SRS and the source code that satisfies them.

Its readers are the development team, the supervisor, the evaluation panel, and
whoever maintains the system next.

## 1.2 Scope

Covers the deployed system: the Express API, the React client, the MongoDB
schema, and the deployment topology on WSO2 Choreo. The test architecture is
described separately in the `testing` repository's Test Strategy, and referenced
here where it is part of the design rather than a description of it.

## 1.3 Definitions

See the [SRS glossary](../srs/srs-final.md#appendix-a--glossary).

## 1.4 References

| Ref | Document |
| --- | --- |
| R1 | Software Requirements Specification, `documents/srs/srs-final.md` |
| R2 | SENG 34213 Course Guideline & Industrial Standards, Version 1.0, 2026 |
| R3 | Test Strategy, `testing` repository |
| R4 | Architectural Decision Records, `documents/adr/` |
| R5 | Coding Standards, `documents/standards/coding-standards.md` |

---

# 2. System architecture

## 2.1 Architectural style

A **three-tier client–server architecture** with a **layered backend**.

```text
┌────────────────────────────────────────────────────────────────────┐
│  PRESENTATION TIER                                                 │
│  React 18 single-page application, served as static assets         │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────────────┐    │
│  │  Pages   │  │Components│  │ Contexts  │  │ Service layer  │    │
│  │  (33)    │  │          │  │Auth/Admin │  │  (axios)       │    │
│  └──────────┘  └──────────┘  └───────────┘  └────────────────┘    │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ HTTPS · JSON · Bearer token
┌──────────────────────────────▼─────────────────────────────────────┐
│  APPLICATION TIER — Express 5 on Node.js 20                        │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Cross-cutting middleware                                      │ │
│  │ helmet → compression → rate limit → CORS → body parser →      │ │
│  │ session → morgan → database availability                      │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Route layer — 12 routers, 125 endpoints                       │ │
│  │ auth · users · courses · admin · subscriptions · payments ·   │ │
│  │ certificates · announcements · forums · notifications ·       │ │
│  │ settings · join-us                                            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Guard layer — protect · authorize · checkCourseAccess ·       │ │
│  │ express-validator chains · multer upload filters              │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Domain layer — 12 Mongoose models carrying business logic in  │ │
│  │ hooks, instance methods and statics                           │ │
│  └───────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ MongoDB wire protocol over TLS
┌──────────────────────────────▼─────────────────────────────────────┐
│  DATA TIER — MongoDB Atlas, 12 collections                         │
└────────────────────────────────────────────────────────────────────┘
```

## 2.2 Why this architecture

**Layered, not hexagonal or event-driven.** The domain is a conventional CRUD
application with a modest amount of business logic and no asynchronous
workflows. A layered architecture is the least machinery that meets the
requirements, and it is the shape every member of the team could work in
productively from Sprint 5.

**Business logic in the model, not in a service layer.** Mongoose schemas carry
the rules that must hold for every caller — password hashing, average-rating
calculation, completion dating, plan limits, invoice numbering. A separate
service layer would have added a hop without adding a rule, because there is no
second consumer of the domain. The cost of this choice is that model methods
that touch the database are harder to unit test; the mitigation is that those
methods are covered by integration tests against a real database instead
(see §9.2).

**Stateless API.** Authentication is by bearer token rather than server-side
session state, so any instance can serve any request and the tier scales
horizontally. An `express-session` middleware is configured but carries no
application state.

## 2.3 Request lifecycle

A representative authenticated request, `POST /api/courses/:id/enroll`:

```text
 1. helmet                     security headers
 2. compression                gzip
 3. express-rate-limit         2000 req / 15 min per IP on /api/
 4. security headers           CSP, X-Frame-Options, X-Content-Type-Options
 5. input filter               regex scan of query strings          ⚠ see §9.3
 6. CORS                       origin allow-list
 7. express.json               body parsing, 10 MB limit
 8. Choreo prefix rewrite      strips the deployment prefix if present
 9. session                    cookie handling
10. morgan                     access log
11. checkDatabase              503 with retry hint if the DB is down
12. protect                    verify JWT, load the user, reject if inactive
13. authorize('student')       role check
14. route handler              business logic
15. Mongoose                   validation, hooks, persistence
16. response                   JSON envelope
    ── on throw ──────────────────────────────────────────────────
17. error handler              generic 500; detail only outside production
```

## 2.4 Repository topology

Four repositories in the GitHub Organisation, per §3.1:

| Repository | Contents |
| --- | --- |
| `app` | Application source — `Backend/` and `Frontend/` |
| `testing` | The complete automated test suite (§3.1 "tests") |
| `infrastructure` | Docker, deployment scripts, environment definitions |
| `documentation` | This document, the SRS, the report and every other artefact |

Keeping the tests in their own repository was a deliberate decision, recorded in
ADR-T01 in the `testing` repository. It follows §3.1 and lets the suite be
reviewed and graded on its own.

---

# 3. Component design

## 3.1 Backend module structure

```text
Backend/
├── server.js              application assembly, middleware chain, bootstrap
├── routes/                12 routers — HTTP contract and orchestration
├── models/                12 Mongoose schemas — data shape and business rules
├── middleware/
│   ├── auth.js            protect · authorize · checkCourseAccess
│   ├── validation.js      express-validator chains, one per payload shape
│   └── upload.js          multer configuration and error mapping
└── uploads/               user-uploaded files
```

## 3.2 Middleware components

### `protect` — authentication

| | |
| --- | --- |
| **Responsibility** | Establish who is calling, or refuse |
| **Input** | `Authorization: Bearer <jwt>` |
| **Output** | `req.user`, or HTTP 401 |

Extracts the token, verifies its signature and expiry, loads the user, and
refuses if the account no longer exists or has been deactivated. Every failure
path returns 401 with a generic message — it never distinguishes "no such user"
from "bad signature", because that distinction is information an attacker can
use.

**Design note.** Loading the user on every request costs a database read per
call. The alternative — trusting claims embedded in the token — would be faster
but would let a deactivated account keep working until its token expired. The
read is the right trade: revocation takes effect immediately.

### `authorize(...roles)` — authorisation

A curried guard mounted after `protect`. Returns 403 naming the rejected role,
which is the response a client can act on; the 401/403 distinction matters
because they mean different things to a UI — "sign in" versus "you cannot do
this".

### `checkCourseAccess` — resource authorisation

Loads the course and decides access by role: administrators pass; the owning
instructor passes; an enrolled student passes with their progress attached; an
unenrolled student is refused with 403.

> **Known gap.** A non-owning *instructor* also passes, because the enrolment
> branch is guarded by `role === 'student'`. The route handlers perform their
> own ownership check, which limits the impact today, but a future route relying
> on this middleware alone would be unguarded. Recorded as DEFECT-04.

### Validation chains

`middleware/validation.js` exports one express-validator chain per payload
shape. Chains are mounted before the handler and followed by
`handleValidationErrors`, which returns HTTP 400 with **every** offending field
at once rather than stopping at the first — so a user fixes one form, not five.

### Upload handling

`multer` with disk storage. Two configurations: avatars (images only, 5 MB) and
certificate documents (images and PDFs, 10 MB). Stored filenames are generated
server-side from the field name, a timestamp and a random suffix, so a
client-supplied name can never become a path.

## 3.3 Domain models

Business logic lives in three places on each schema.

**Pre-save hooks** enforce invariants that must hold however the document was
created:

| Model | Hook | Rule |
| --- | --- | --- |
| `User` | `pre('save')` | Hash the password with bcrypt, but only when it changed — re-hashing a hash would lock the user out |
| `Course` | `pre('save')` | Recalculate `averageRating` from the reviews |
| `Progress` | `pre('save')` | Stamp `completionDate` when completed; clear it when reverted |
| `Payment` | `pre('save')` | Generate an invoice number for a new payment |
| `Certificate` | `pre('save')` | Generate the next sequential certificate number for the year |

**Instance methods** are operations on one document:
`user.matchPassword()`, `user.getSignedJwtToken()`, `user.getResetPasswordToken()`,
`progress.calculateProgress(course)`, `subscription.canCreateCourse()`,
`subscription.canEnrollStudents(n)`, `subscription.cancel(reason)`,
`subscription.renew()`, `payment.markCompleted()`, `payment.markFailed()`,
`payment.processRefund()`.

**Statics** are queries over the collection:
`Subscription.getPlanFeatures(plan)`, `Subscription.getPlanPricing(plan, cycle)`,
`Payment.getPaymentStats(from, to)`, `Payment.getRevenueByPlan(from, to)`,
`Payment.getMonthlyRevenue(year)`, `Certificate.getCertificateStats()`,
`Announcement.getActiveAnnouncements(audience)`,
`Notification.getActiveNotifications(userId, role)`.

---

# 4. Data design

## 4.1 Entity–relationship diagram

```text
                            ┌───────────────────┐
                            │       User        │
                            │───────────────────│
                            │ _id               │
                            │ name              │
                            │ email      UNIQUE │
                            │ password  (bcrypt)│
                            │ googleId   SPARSE │
                            │ role  {student|   │
                            │        instructor|│
                            │        admin}     │
                            │ isActive          │
                            │ enrolledCourses[] │
                            │ notifications{}   │
                            │ privacy{}         │
                            └─┬───┬───┬───┬───┬─┘
              instructor      │   │   │   │   │      createdBy
        ┌──────────────────── ┘   │   │   │   └──────────────────┐
        │            student      │   │   │  user               │
        │        ┌───────────────┘    │   └──────────┐          │
        ▼        ▼                    │              ▼          ▼
┌───────────────┐  ┌──────────────┐   │   ┌──────────────┐ ┌──────────────┐
│    Course     │  │   Progress   │   │   │ Subscription │ │ Announcement │
│───────────────│  │──────────────│   │   │──────────────│ │──────────────│
│ _id           │◄─┤ course       │   │   │ user         │ │ createdBy    │
│ title         │  │ student      │   │   │ plan {3}     │ │ targetAudience│
│ instructor ───┘  │ completed    │   │   │ billingCycle │ │ startDate    │
│ category {6}  │  │   Lessons[]  │   │   │ status {5}   │ │ endDate      │
│ level {3}     │  │ overall      │   │   │ features{}   │ │ isActive     │
│ duration      │  │   Progress   │   │   │ usage{}      │ │ readBy[]     │
│ price         │  │ isCompleted  │   │   │ endDate      │ └──────────────┘
│ curriculum[]  │  │ completion   │   │   └──────┬───────┘
│  └ week       │  │   Date       │   │          │ subscription
│    lessons[]  │  └──────────────┘   │          ▼
│ enrolled      │   UNIQUE(student,   │   ┌──────────────┐
│   Students[]  │          course)    │   │   Payment    │
│ reviews[]     │                     │   │──────────────│
│ averageRating │  ┌──────────────┐   │   │ user         │
│ isPublished   │◄─┤ Certificate  │   │   │ subscription │
└───────────────┘  │──────────────│   │   │ amount       │
                   │ student      │───┘   │ status {6}   │
                   │ course       │       │ invoiceNumber│
                   │ issuedBy     │       │   UNIQUE     │
                   │ certificate  │       │ receiptNumber│
                   │  Number      │       │   UNIQUE     │
                   │   UNIQUE     │       │ paidDate     │
                   │ status {4}   │       │ refundAmount │
                   │ viewedBy     │       └──────────────┘
                   │   Student    │
                   └──────────────┘

┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ DiscussionForum  │   │  DiscussionPost  │   │   Notification   │
│──────────────────│   │──────────────────│   │──────────────────│
│ createdBy        │◄──┤ forum            │   │ createdBy        │
│ category {12}    │   │ author           │   │ type {13}        │
│ level {4}        │   │ title            │   │ targetAudience{6}│
│ isActive         │   │ content          │   │ targetUsers[]    │
│ isLocked         │   │ replies[]        │   │ scheduledFor     │
│ moderators[]     │   │ likes[]          │   │ expiresAt        │
│ subscribers[]    │   │ dislikes[]       │   │ readBy[]         │
│ postCount        │   │ isPinned         │   │ deliveryStats{}  │
│ lastPost{}       │   │ isApproved       │   └──────────────────┘
└──────────────────┘   └──────────────────┘

┌──────────────────┐   ┌──────────────────┐
│ JoinUsSubmission │   │     Settings     │
│──────────────────│   │──────────────────│
│ name, email      │   │ (singleton)      │
│ phone, age       │   │ siteName         │
│ currentLevel {5} │   │ contactEmail     │
│ preferredTime {5}│   │ emailSettings{}  │
│ interests[] {8}  │   │ courseSettings{} │
│ hearAboutUs {6}  │   │ paymentSettings{}│
│ status {4}       │   │ securitySettings{}│
│ contactedBy      │   │ uploadSettings{} │
│ ipAddress        │   │ lastUpdatedBy    │
└──────────────────┘   └──────────────────┘

  {n} = enumerated with n permitted values
  [] = array          {} = embedded document
```

## 4.2 Collections

| Collection | Fields | Indexes |
| --- | --- | --- |
| `users` | 33 | `email` (unique), `googleId` (unique, sparse) |
| `courses` | 18 | `_id` |
| `progress` | 13 | `{student, course}` (unique compound) |
| `certificates` | 18 | `certificateNumber` (unique, sparse) |
| `subscriptions` | 31 | `{user, status}`, `endDate`, `nextBillingDate` |
| `payments` | 27 | `{user, status}`, `subscription`, `paymentDate`, `paidDate`, `gatewayTransactionId`, `invoiceNumber` (unique, sparse), `receiptNumber` (unique, sparse) |
| `announcements` | 16 | `{isActive, endDate}`, `{targetAudience, isActive}`, `createdBy`, `{startDate, endDate}` |
| `discussionforums` | 20 | `{category, isActive}`, `{level, isActive}`, `createdBy`, `{isPinned, lastPost}`, `postCount` |
| `discussionposts` | 21 | `{forum, createdAt}`, `author`, `{isPinned, createdAt}`, `{isApproved, createdAt}`, `likeCount` |
| `notifications` | 32 | `{isActive, expiresAt}`, `{targetAudience, isActive}`, `createdBy`, `{scheduledFor, expiresAt}`, `{type, isActive}` |
| `joinussubmissions` | 19 | `email`, `status`, `submittedAt`, `currentLevel` |
| `settings` | 79 | — |

## 4.3 Integrity strategy

Constraints that matter are enforced **in the database**, not only in the
application, because an application-level "does this already exist?" check is a
race that two concurrent requests can both pass.

| Invariant | Application check | Database guarantee |
| --- | --- | --- |
| One account per email | Registration route | Unique index on `users.email` |
| One enrolment per student per course | Enrolment route | Unique compound index on `progress` |
| Unique invoice number | Generator | Unique sparse index on `payments.invoiceNumber` |
| Unique certificate number | Generator | Unique sparse index on `certificates.certificateNumber` |
| One Google identity per account | Sign-in route | Unique sparse index on `users.googleId` |

**Sparse matters as much as unique.** A pending payment has no receipt number; a
plain unique index would reject the *second* such document because both would
hold null.

> **Known defect.** `Settings` declares `index({}, { unique: true })`, presumably
> intending to enforce a single settings document. MongoDB rejects an index with
> no keys, Mongoose logs the failure and continues, so the constraint has never
> existed. Recorded as DEFECT-12.

## 4.4 Denormalisation

Two deliberate redundancies, both chosen to avoid a join on a hot read path:

**Enrolment is stored three times** — as a `Progress` document, in
`course.enrolledStudents`, and in `user.enrolledCourses`. The arrays let the
course roster and the student dashboard render without a second query. The cost
is that all three must be written together, which the enrolment and un-enrolment
routes do, and which the integration tests verify explicitly.

**Certificates copy `studentName` and `courseName`.** A certificate is a
statement about a moment in time. If a student later changes their display name,
the certificate must still read as issued — so the names are snapshotted rather
than resolved through a reference.

---

# 5. API design

## 5.1 Conventions

| Aspect | Convention |
| --- | --- |
| Base path | `/api` |
| Format | JSON request and response |
| Authentication | `Authorization: Bearer <jwt>` |
| Success envelope | `{ success: true, message?, <resource> }` |
| Error envelope | `{ success: false, message, errors? }` |
| Pagination | `?page=1&limit=10`; response carries `count`, `total`, `page`, `pages` |
| Naming | Plural resource nouns, lower-case, hyphenated |

## 5.2 Status codes

| Code | Meaning in this API |
| --- | --- |
| 200 | Success |
| 201 | Resource created |
| 400 | Validation failed, or a business rule refused the request |
| 401 | Not authenticated, or the credential is invalid or expired |
| 403 | Authenticated, but not permitted |
| 404 | No such resource — also returned when a resource exists but belongs to another user, so the API does not confirm its existence |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error; no detail is disclosed in production |
| 503 | The database is unavailable; the response carries a retry hint |

## 5.3 Endpoint inventory

125 endpoints across 12 routers. Access is as declared in the source.

| Router | Endpoints | Public | Protected | Role-restricted | Admin |
| --- | --- | --- | --- | --- | --- |
| `authRoutes` | 6 | 4 | 2 | — | — |
| `userRoutes` | 12 | — | 8 | — | 4 |
| `courseRoutes` | 10 | 2 | 1 | 7 | — |
| `adminRoutes` | 18 | — | — | — | 18 |
| `subscriptionRoutes` | 8 | 1 | 7 | — | — |
| `paymentRoutes` | 8 | — | 5 | — | 3 |
| `certificateRoutes` | 10 | — | 2 | — | 8 |
| `announcementRoutes` | 10 | — | 3 | — | 7 |
| `discussionForumRoutes` | 13 | — | 6 | — | 7 |
| `notificationRoutes` | 14 | — | 5 | — | 9 |
| `settingsRoutes` | 7 | — | — | — | 7 |
| `joinUsRoutes` | 6 | 1 | 5 | — | — |
| System (`server.js`) | 3 | 3 | — | — | — |
| **Total** | **125** | **11** | **44** | **7** | **63** |

The full inventory, machine-generated from the source, is at
`testing/reports/endpoint-inventory.json`.

## 5.4 Representative contracts

### `POST /api/auth/login`

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "ayesha@sriko.lk", "password": "TestPass123" }
```

```json
200 OK
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…",
  "user": { "id": "…", "name": "Ayesha Perera", "email": "…", "role": "student", "avatar": "" }
}
```

```json
401 Unauthorized
{ "success": false, "message": "Invalid email or password" }
```

The 401 body is byte-identical for an unknown email and a wrong password, so the
endpoint cannot be used to discover which accounts exist.

### `POST /api/courses/:id/enroll`

```json
200 OK
{
  "success": true,
  "message": "Enrolled in course successfully",
  "course": { "id": "…", "title": "Korean for Beginners", "progress": 0 }
}
```

```json
400 Bad Request
{ "success": false, "message": "You are already enrolled in this course" }
```

### Validation failure

```json
400 Bad Request
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "type": "field", "path": "email",    "msg": "Please provide a valid email address" },
    { "type": "field", "path": "password", "msg": "Password must be at least 6 characters long" }
  ]
}
```

Every offending field is reported at once.

---

# 6. Security design

Structured against the OWASP Top 10 control matrix in §8.1 of the course
guideline. Evidence, with test case references, is in
`documents/security/owasp-checklist.md`.

## 6.1 Authentication flow

```text
  Client                        API                         Database
    │                            │                              │
    │  POST /auth/login          │                              │
    ├───────────────────────────►│                              │
    │                            │  findOne(email)              │
    │                            │  .select('+password')        │
    │                            ├─────────────────────────────►│
    │                            │◄─────────────────────────────┤
    │                            │                              │
    │                            │  isActive?  ── no ──► 401    │
    │                            │  bcrypt.compare()            │
    │                            │             ── no ──► 401    │
    │                            │  jwt.sign({ id }, SECRET)    │
    │◄───────────────────────────┤  200 { token, user }         │
    │                            │                              │
    │  GET /api/… + Bearer       │                              │
    ├───────────────────────────►│                              │
    │                            │  jwt.verify()  ── fail ► 401 │
    │                            │  findById(payload.id)        │
    │                            ├─────────────────────────────►│
    │                            │  exists & active? ─ no ► 401 │
    │                            │  → req.user, next()          │
```

## 6.2 Controls by risk

### A01 — Broken access control

Every non-public route composes `protect` and, where a role is required,
`authorize(...roles)`. Resource-scoped lookups filter by the caller's own id, so
a guessed identifier for another user's payment, invoice or certificate returns
404 rather than the record.

Verified exhaustively rather than by sampling: the security suite reads the
generated endpoint inventory and probes **every** administrator-only endpoint
anonymously and with a student token, so a newly added admin route is covered
the moment it is written.

> **Open gap.** Public registration accepts a client-supplied `role`
> (DEFECT-11). This is the highest-severity open defect in the system.

### A02 — Cryptographic failures

Passwords are hashed with bcrypt in a pre-save hook and the field is
`select: false`, so it is excluded from every query unless explicitly requested.
Reset tokens are returned raw to the caller and stored only as a SHA-256 hash.
Strict-Transport-Security is set in production.

> **Open gap.** The cost factor is 10; §8.1 requires 12 (DEFECT-02).

### A03 — Injection

Mongoose casts every query against its schema and `strict` mode drops unknown
paths, which blocks operator injection: `{"email": {"$ne": null}}` in a login
body does not authenticate anyone, and unknown fields in a registration body are
discarded rather than stored.

`server.js` also installs a global regular-expression filter. Testing
established two problems with it, both recorded: it is mounted *before*
`express.json()` and so never inspects a request body at all (DEFECT-30), and on
query strings it rejects the English words "and" and "or" (DEFECT-01). The
recommendation is to remove it and rely on the ORM and express-validator, which
are doing the actual work.

### A04 — Insecure design

Rate limiting over `/api/`; upload type and size restrictions; and business-rule
guards enforced in both the application and the database — no duplicate
enrolment, no double completion, no refund of an uncollected payment, no second
active subscription.

### A05 — Security misconfiguration

`helmet`, plus explicit `X-Frame-Options: DENY`, `X-Content-Type-Options:
nosniff` and a Content-Security-Policy. `X-Powered-By` is removed. The error
handler discloses `error.message` only outside production. CORS is restricted to
configured origins. The public health endpoint reports only *whether* the
database URI and secrets are configured, never their values.

> **Open gap.** A hard-coded `'fallback-secret'` is used for JWT signing whenever
> `JWT_SECRET` is unset (DEFECT-03), so a deployment that forgets one variable
> is trivially forgeable.

### A06 / A08 — Components and integrity

`npm audit --audit-level=high` runs on every push against both repositories.
Lockfiles are committed and CI installs with `npm ci`, which verifies the
integrity hash of every package and refuses to proceed on a mismatch.

### A07 — Authentication failures

Password complexity policy at registration; bcrypt verification; deactivated
accounts refused; bounded token lifetime; HTTP-only session cookie, `secure` in
production.

> **Open gaps.** No account lockout after repeated failures (DEFECT-31);
> sign-out does not invalidate the token (DEFECT-14); the change-password route
> does not apply the registration policy (DEFECT-20).

### A09 — Logging failures

`morgan` logs every request; `server.js` adds explicit audit lines for
authentication successes and failures and for every administrative action,
naming the acting user.

> **Open gap.** `middleware/auth.js` logs the JWT signing secret and a token
> prefix on every authenticated request (DEFECT-05). Anyone with log access can
> forge tokens. This is a one-line removal and the highest-priority security fix
> after DEFECT-11.

### A10 — Server-side request forgery

No route dereferences a user-supplied URL, so classic SSRF is unreachable. The
profile `website` field is nonetheless unvalidated beyond its length
(DEFECT-06), so the live risk is stored-XSS and phishing through the rendered
profile link.

## 6.3 Data protection summary

| Data | At rest | In transit | In responses |
| --- | --- | --- | --- |
| Password | bcrypt hash | TLS | Never |
| Reset token | SHA-256 hash | TLS | Raw value returned once, to the requester only |
| JWT | Not stored server-side | TLS | Returned at sign-in |
| Email | Plain | TLS | Only to the owner and administrators |
| Payment record | Plain | TLS | Only to the owner and administrators |
| Card details | **Never collected** | — | — |

---

# 7. Frontend design

## 7.1 Structure

```text
Frontend/src/
├── App.jsx              route table
├── main.jsx             entry point
├── config/apiConfig.ts  resolves the API base URL for the environment
├── services/            API clients — apiService.ts plus 7 feature services
├── context/             AuthContext, AdminAuthContext
├── components/          Layout, Header, Footer, ProtectedRoute, LoadingSpinner, charts
└── pages/               33 screens
```

## 7.2 State management

React Context plus `useReducer`, not Redux. The application's shared state is
"who is signed in" and little else; everything else is server state fetched per
screen. Redux would have added a store, actions and middleware to hold one
object.

`AuthContext` owns the token, the user and the derived `isAuthenticated` flag.
`AdminAuthContext` mirrors it for the administrative console, which uses a
separate token so an administrator can hold both sessions.

## 7.3 API layer

A single axios instance in `apiService.ts` with two interceptors:

- **Request** — attaches the bearer token, preferring `adminToken` over `token`
  when both are present, so an administrator browsing the console sends the
  right credential.
- **Response** — on HTTP 401, clears stored credentials and redirects to sign-in,
  so a rejected token cannot leave the user in a permanently broken session.
  Other statuses pass through untouched: a 403 means "not permitted", not "sign
  in again".

## 7.4 Routing and guards

`ProtectedRoute` wraps guarded routes. Unauthenticated visitors are redirected
to sign-in with the intended location preserved; authenticated users with the
wrong role are redirected home rather than to sign-in, because bouncing a
signed-in user to a login form they have already completed is confusing.

This is a usability guard, not a security boundary. The API enforces access
control independently, and the security suite proves it.

## 7.5 API base URL resolution

`apiConfig.ts` decides the base URL at module load:

| Condition | Base URL |
| --- | --- |
| `window.configs.apiUrl` names a Choreo host | Used verbatim — the gateway URL already carries the full path |
| `window.configs.apiUrl` names any other host | `<host>/api` |
| No runtime configuration | `http://localhost:5001/api` |

Appending `/api` to a Choreo URL would produce `/api/api` and 404 every request
in production while local development kept working — which is precisely the
failure that gets discovered at the demonstration. It is covered by unit tests.

---

# 8. Deployment design

## 8.1 Topology

```text
                       ┌──────────────────────┐
   Browser ──HTTPS────►│   Choreo Gateway     │
                       └───────┬──────────┬───┘
                               │          │
                ┌──────────────▼──┐   ┌───▼───────────────┐
                │ Frontend        │   │ Backend           │
                │ static assets   │   │ Node.js container │
                │ (Vite build)    │   │ Express, port 5001│
                └─────────────────┘   └───┬───────────────┘
                                          │ TLS
                                    ┌─────▼────────┐
                                    │ MongoDB Atlas│
                                    └──────────────┘
```

## 8.2 Environments

| Environment | Branch | Deployment | Purpose |
| --- | --- | --- | --- |
| Development | `feature/*` | Local | Day-to-day work |
| Staging | `develop` | Automatic on merge | Integration; **the demonstration runs here** (§9.1) |
| Production | `main` | Manual approval on a tagged release | Live |

## 8.3 Configuration

Everything environment-specific is supplied through the environment. Nothing is
committed (§7 Secrets Management).

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Selects the configuration profile; gates error detail and cookie `secure` |
| `PORT` | Listening port |
| `MONGODB_URI` | Database connection string |
| `JWT_SECRET` | Token signing key — **must** be set; see DEFECT-03 |
| `JWT_EXPIRE` | Token lifetime, default 7 days |
| `SESSION_SECRET` | Session cookie signing key |
| `CORS_ORIGIN`, `FRONTEND_URL` | Permitted origins |
| `GOOGLE_CLIENT_ID` | Google sign-in audience |
| `HTTPS_ENABLE`, `SSL_KEY_PATH`, `SSL_CERT_PATH` | Optional direct TLS termination |

## 8.4 Resilience

- **Connection pooling** — 1 to 10 connections, 30-second selection timeout.
- **Automatic reconnection** — a disconnect schedules a retry after 5 seconds.
- **Keep-alive** — a ping every 5 minutes prevents idle connection drops on
  platforms that reap them.
- **Request-time recovery** — `checkDatabase` attempts a reconnect before
  failing a request, and returns 503 with a retry hint rather than hanging.
- **Graceful shutdown** — `SIGTERM` and `SIGINT` close the server and the
  database connection before exit.

## 8.5 CI/CD

Per §7.2, the pipeline runs Lint & Format → Build → Unit Tests → Integration
Tests → Security Scan, and each stage must pass before the next begins. The
quality gates in §8.2 — zero lint errors, 80 % coverage on new code, no high or
critical vulnerabilities — are enforced as job failures, not as advice.

---

# 9. Design decisions and trade-offs

Decisions recorded here are those whose *consequences* are worth knowing. Each
significant one has an ADR in `documents/adr/`.

## 9.1 Business logic in Mongoose models

**Decision.** Rules that must hold for every caller live in schema hooks,
instance methods and statics rather than in a service layer.

**Why.** There is one consumer of the domain — the HTTP API. A service layer
would have added a hop and a file per resource without adding a rule. Putting
the rule in the hook also means it cannot be bypassed by a future caller who
forgets to go through the service.

**Cost.** Model methods that query the database are harder to unit test in
isolation. Accepted, and mitigated: those methods are covered by integration
tests against a real database, where an aggregation pipeline's behaviour is
actually observable. See ADR-002.

## 9.2 Denormalised enrolment

**Decision.** Enrolment is written to three places.

**Why.** The course roster and the student dashboard are the two most-read
screens; the arrays let both render without a second query.

**Cost.** Three writes must stay consistent. The enrolment and un-enrolment
routes do this, and the integration tests assert all three sides explicitly —
without that, a partial write would be invisible until a user noticed a course
missing from their dashboard. See ADR-003.

## 9.3 The global input filter

**Decision (original).** A regular-expression filter over every request body and
query string, intended as defence in depth against injection.

**Outcome.** Testing established that it does not work as intended, in two
independent ways: it runs before the body parser and so never sees a body
(DEFECT-30), and its pattern matches the English words "and" and "or", rejecting
ordinary search terms (DEFECT-01).

**Recommendation.** Remove it. Mongoose already parameterises every query and
express-validator already validates every write; the filter adds no protection
against the injection it is named for while breaking legitimate input. If
operator stripping is wanted, `express-mongo-sanitize` does that job correctly.
See ADR-004.

## 9.4 Route declaration order

**Decision (implicit).** Express matches routes in declaration order.

**Outcome.** Two routers declare a parameterised route before more specific
literal ones, making four endpoints unreachable: `PUT /api/users/:id` shadows
`/notifications`, `/privacy` and `/last-login` (DEFECT-21), and
`GET /api/notifications/:id` shadows `/target-users` (DEFECT-24).

**Recommendation.** Adopt a convention — literal paths always precede
parameterised ones within a router — and check it in review. The endpoint
coverage gate in the test suite surfaces the symptom; the convention prevents
the cause. See ADR-005.

## 9.5 Stateless authentication

**Decision.** JWT bearer tokens rather than server-side sessions.

**Why.** The API tier scales horizontally without shared session storage, and
the same credential works for the web client and any future mobile client.

**Cost.** A token cannot be revoked before it expires without additional
machinery, which is the root of DEFECT-14. The fix — a token version on the user
document, bumped on sign-out and password change — is recorded in the defect
register. See ADR-001.

---

# Appendix A — Technology stack

## Backend

| Package | Version | Purpose |
| --- | --- | --- |
| express | 5.2.1 | HTTP framework |
| mongoose | 8.24.0 | MongoDB ODM |
| jsonwebtoken | 9.0.3 | Token signing and verification |
| bcryptjs | 3.0.3 | Password hashing |
| express-validator | 7.3.2 | Request validation |
| helmet | 8.2.0 | Security headers |
| express-rate-limit | 8.5.2 | Rate limiting |
| cors | 2.8.6 | Cross-origin policy |
| multer | 2.1.1 | Multipart upload handling |
| sharp | 0.34.5 | Image processing |
| morgan | 1.10.0 | Access logging |
| compression | 1.7.4 | Response compression |
| express-session | 1.19.0 | Session cookie handling |
| google-auth-library | 9.0.0 | Google credential verification |
| dotenv | 17.4.2 | Environment configuration |

## Frontend

| Package | Version | Purpose |
| --- | --- | --- |
| react | 18.2.0 | UI library |
| react-router-dom | 7.15.1 | Routing |
| axios | 1.16.1 | HTTP client |
| react-query | 3.39.3 | Server-state caching |
| react-hook-form | 7.76.1 | Form state and validation |
| chart.js + react-chartjs-2 | 4.5.1 / 5.3.1 | Analytics charts |
| @headlessui/react | 2.2.10 | Accessible primitives |
| @heroicons/react | 2.0.18 | Icons |
| react-hot-toast | 2.4.1 | Notifications |
| tailwindcss | 4.3.0 | Styling |
| vite | 8.0.14 | Build tooling |

## Testing

| Package | Purpose |
| --- | --- |
| jest + supertest | Backend unit, integration and security layers |
| mongodb-memory-server | Ephemeral database for integration tests |
| vitest + @testing-library/react | Frontend unit and component layers |
| @playwright/test | End-to-end layer |
| k6 | Performance layer |

# Appendix B — Deviations from the SENG 31242 SDS

§1.3 requires that "any significant deviation from the approved SDS must be
documented as a new Architectural Decision Record and reviewed with the
supervisor within one sprint".

**Complete this table before submission**, and raise an ADR for each row marked
significant.

| Area | v1.0 design | As implemented | Significant? | ADR |
| --- | --- | --- | --- | --- |
| `[area]` | `[original]` | `[actual]` | ☐ Yes ☐ No | `[ADR-nnn]` |

Decisions already recorded:

| ADR | Title |
| --- | --- |
| ADR-001 | Stateless JWT authentication over server-side sessions |
| ADR-002 | Business logic in Mongoose models rather than a service layer |
| ADR-003 | Denormalised enrolment across three documents |
| ADR-004 | Retire the global input filter |
| ADR-005 | Route declaration order convention |
| ADR-T01 | A standalone test repository (`testing` repo) |
| ADR-T02 | Jest for the backend, Vitest for the frontend (`testing` repo) |
| ADR-T03 | Known defects as failing-by-design tests (`testing` repo) |

# Appendix C — Traceability to requirements

| Design element | Requirements satisfied |
| --- | --- |
| `middleware/auth.js` | FR-04, FR-05, NFR-03 |
| `middleware/validation.js` | NFR-04, and the validation criteria of FR-01, FR-06, FR-09, FR-12, FR-23 |
| `middleware/upload.js` | FR-24 |
| `models/User.js` | FR-01, FR-02, FR-06, FR-07, NFR-03 |
| `models/Course.js` | FR-08, FR-09, FR-12 |
| `models/Progress.js` | FR-10, FR-11 |
| `models/Certificate.js` | FR-15 |
| `models/Subscription.js` | FR-13 |
| `models/Payment.js` | FR-14, FR-21 |
| `models/Announcement.js` | FR-16 |
| `models/DiscussionForum.js`, `DiscussionPost.js` | FR-17 |
| `models/Notification.js` | FR-18 |
| `models/JoinUsSubmission.js` | FR-23 |
| `models/Settings.js` | FR-22 |
| `routes/adminRoutes.js` | FR-19, FR-20, FR-21 |
| Database indexes | NFR-02 |
| CI/CD pipeline | NFR-06 |
| Choreo deployment | FR-25, NFR-07 |

---

**End of document.**
