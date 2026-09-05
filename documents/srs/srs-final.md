---
title: 'Software Requirements Specification'
subtitle: 'SRI-KO Learning Management System'
course: 'SENG 34213 — System Development Project'
team: 'TeamNova'
version: '2.0 (Final)'
status: 'For submission'
---

# Software Requirements Specification

## SRI-KO Learning Management System

| | |
| --- | --- |
| **Document** | Software Requirements Specification (SRS) |
| **Version** | 2.0 — Final |
| **Project** | SRI-KO Learning Management System |
| **Team** | TeamNova |
| **Course** | SENG 34213 — System Development Project |
| **Programme** | BSc (Hons.) in Software Engineering, University of Kelaniya |
| **Supervisor** | `[Supervisor Name]` |
| **Date** | `[Submission Date]` |
| **Deliverable** | §10.1 #1 — `documents/srs/srs-final.pdf` |

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
| 1.0 | SENG 31242 | TeamNova | Original SRS, design phase |
| 2.0 | `[Date]` | TeamNova | Updated to reflect the implemented system (§10.1 #1) |

---

> ### ⚠️ Provenance of this document
>
> This version was **reconstructed from the implemented system**. Every
> requirement below was derived by reading the delivered source — routes,
> models, middleware and the frontend — and by cross-referencing the automated
> test suite, which exercises all 125 API endpoints.
>
> It is therefore an accurate description of **what the system does**. It is not
> automatically identical to the requirements the client agreed in SENG 31242.
>
> **Before submission, reconcile it with the version 1.0 SRS:**
>
> 1. Map each `FR-xx` / `NFR-xx` below onto its original SRS number.
> 2. Any requirement here with no counterpart in v1.0 is **scope that was added
>    during implementation** — record it in the revision history and, if it
>    changed the architecture, raise an ADR (§1.3).
> 3. Any v1.0 requirement with no counterpart here is **scope that was not
>    delivered** — it belongs in §10.4 "Limitations and known defects" of the
>    final report, with the reason.
> 4. Renumber in `src/registry/requirements.js` in the `testing` repository.
>    Every automated test names a requirement id, and
>    `npm run report:traceability` fails on an unknown one, so the renumbering
>    cannot drift.
>
> The reconciliation table in [Appendix C](#appendix-c--reconciliation-with-the-seng-31242-srs) is provided for step 1.

---

## Table of contents

1. [Introduction](#1-introduction)
2. [Overall description](#2-overall-description)
3. [Functional requirements](#3-functional-requirements)
4. [Non-functional requirements](#4-non-functional-requirements)
5. [External interface requirements](#5-external-interface-requirements)
6. [Data requirements](#6-data-requirements)
7. [Use cases](#7-use-cases)
8. [Verification](#8-verification)
9. [Appendices](#appendix-a--glossary)

---

# 1. Introduction

## 1.1 Purpose

This document specifies the requirements for the **SRI-KO Learning Management
System**, a web platform through which a Korean language academy in Sri Lanka
publishes courses, enrols students, tracks their progress, issues certificates
and manages the subscriptions that pay for it.

The intended readers are the development team, the academic supervisor, the
evaluation panel, and the client acting as product owner. It is written to be
verifiable: every requirement states an observable behaviour, and §8 links each
one to the automated tests that check it.

## 1.2 Scope

The product is a single web application with two halves:

- a **REST API** (Node.js, Express, MongoDB) holding all business logic and
  data;
- a **single-page web client** (React) that consumes it.

**In scope.** Account registration and authentication including Google sign-in;
role-based access for students, instructors and administrators; a public course
catalogue with search and filtering; course authoring with a weekly curriculum;
enrolment and progress tracking; course completion and certificate issuance;
reviews and ratings; three-tier subscriptions with monthly and yearly billing;
payment recording, invoicing and refunds; announcements, discussion forums and
notifications; a public enquiry form; an administrative console with user and
course management and a revenue dashboard.

**Out of scope.** Live video conferencing; automated assessment and grading;
a mobile application; an integrated payment gateway (payments are *recorded*
and their status managed, but no card is charged by this system); email or SMS
delivery (notifications are stored and surfaced in the application, not sent);
and multi-tenant hosting for more than one academy.

## 1.3 Definitions, acronyms and abbreviations

See [Appendix A](#appendix-a--glossary).

## 1.4 References

| Ref | Document |
| --- | --- |
| R1 | SENG 34213 — Course Guideline & Industrial Standards, Version 1.0, 2026 |
| R2 | Software Design Specification, `documents/sds/sds-final.md` |
| R3 | Test Strategy, `testing` repository, `docs/TEST_STRATEGY.md` |
| R4 | Test Case Register, `documents/testing/test-register.md` |
| R5 | OWASP Top 10:2021 |
| R6 | Defect Register, `documents/testing/defect-register.md` |
| R7 | IEEE 830-1998, Recommended Practice for Software Requirements Specifications |

## 1.5 Overview

§2 describes the product and its users in prose. §3 and §4 state the functional
and non-functional requirements, each with a unique identifier, a priority and
acceptance criteria. §5 covers external interfaces, §6 the data the system
holds, §7 the principal use cases, and §8 how the requirements are verified.

---

# 2. Overall description

## 2.1 Product perspective

SRI-KO LMS is a self-contained product, not a component of a larger system. It
depends on three external services:

| Dependency | Purpose | Failure behaviour |
| --- | --- | --- |
| MongoDB Atlas | Primary data store | The API answers 503 and retries the connection |
| Google Identity Services | Optional federated sign-in | Local email/password sign-in continues to work |
| WSO2 Choreo | Hosting for both tiers | — |

The API is stateless apart from its database connection, so it can be scaled
horizontally. Authentication is by bearer token rather than server-side session
state, which is what makes that possible.

## 2.2 Product functions

| Area | Functions |
| --- | --- |
| Identity | Registration, sign-in, Google sign-in, session management, role-based access |
| Profile | Profile maintenance, password change, notification and privacy preferences, avatar upload |
| Learning | Catalogue browsing and search, enrolment, progress tracking, completion, reviews |
| Teaching | Course authoring with weekly curriculum and lessons, publication control |
| Recognition | Certificate eligibility, issuance, delivery and viewing |
| Commerce | Subscription plans, upgrades, cancellation, payment recording, invoicing, refunds |
| Communication | Announcements, discussion forums and posts, notifications |
| Administration | User and course management, revenue and usage analytics, system settings, enquiry triage |

## 2.3 User classes and characteristics

| Class | Description | Technical skill | Frequency |
| --- | --- | --- | --- |
| **Visitor** | Unauthenticated. Browses the catalogue, reads pricing, submits an enquiry, registers. | Low | High |
| **Student** | Enrols in courses, tracks progress, earns certificates, participates in forums. The largest class. | Low | Daily |
| **Instructor** | Authors and maintains their own courses. May not act on another instructor's courses. | Medium | Weekly |
| **Administrator** | Manages users, courses, certificates, communications, settings and billing. Full read access. | Medium–high | Daily |

Roles are mutually exclusive: an account holds exactly one of `student`,
`instructor` or `admin`.

## 2.4 Operating environment

| Tier | Requirement |
| --- | --- |
| Client | Any evergreen browser — Chrome, Firefox, Safari, Edge — on desktop, tablet or phone |
| Server | Node.js 20 or later |
| Database | MongoDB 6.0 or later |
| Transport | HTTPS in production |

## 2.5 Design and implementation constraints

| ID | Constraint | Origin |
| --- | --- | --- |
| C-01 | The MERN stack (MongoDB, Express, React, Node.js) | Approved SDS |
| C-02 | Deployment to WSO2 Choreo | Client infrastructure |
| C-03 | Currency is Sri Lankan Rupees (LKR) | Client market |
| C-04 | Interface language is English | Approved scope |
| C-05 | No card is charged; payment records are managed manually | Out of scope |
| C-06 | Secrets are supplied through the environment, never committed | §7 Secrets Management |
| C-07 | 80 % test coverage and 100 % API endpoint coverage before release | §6.4 |

## 2.6 Assumptions and dependencies

| ID | Assumption |
| --- | --- |
| A-01 | Users have reliable internet access sufficient for a single-page application |
| A-02 | The academy administers the platform; there is no self-service tenant onboarding |
| A-03 | Course content is text and links; the system stores no video |
| A-04 | Enrolment volume is in the hundreds, not the hundreds of thousands |
| A-05 | Certificates are issued by an administrator after verifying completion, not automatically |

## 2.7 Prioritisation

| Priority | Meaning |
| --- | --- |
| **P1 — Must** | The product is not usable or not safe without it |
| **P2 — Should** | Materially reduces value if absent, but the product still works |
| **P3 — Could** | Desirable; deferred first under schedule pressure |

---

# 3. Functional requirements

Each requirement states an observable behaviour, its priority, its acceptance
criteria in Given–When–Then form, and the API endpoints that implement it.
Verification is in §8.

## 3.1 Identity and access

### FR-01 — User registration

**Priority:** P1 · **Endpoints:** `POST /api/auth/register`, `POST /api/admin/users`

A visitor shall be able to create an account with a name, an email address and a
password. Email addresses shall be unique and treated case-insensitively.
Passwords shall be stored only as a one-way hash, never in a recoverable form.
An administrator shall additionally be able to provision an account of any role.

**Acceptance criteria**

- **AC1 (happy path).** *Given* no account exists for an email address, *when* a
  visitor submits a valid name, email and password, *then* the account is
  created with the role `student`, an access token is returned, and the
  response contains no password material.
- **AC2 (duplicate).** *Given* an account already exists for an email address,
  *when* a visitor registers with that address, *then* the system responds
  HTTP 400 and no second account is created.
- **AC3 (password policy).** *Given* a password shorter than 6 characters, or
  lacking an uppercase letter, a lowercase letter or a digit, *when* a visitor
  registers, *then* the system responds HTTP 400 naming the `password` field.
- **AC4 (name bounds).** *Given* a name shorter than 2 or longer than 50
  characters, *when* a visitor registers, *then* the system responds HTTP 400.
- **AC5 (storage).** *Given* a successful registration, *when* the stored record
  is read, *then* the password field holds a bcrypt hash and not the submitted
  value.
- **AC6 (privilege).** *Given* an unauthenticated request, *when* it asks for
  the `admin` role, *then* the account shall **not** be created as an
  administrator.

> **AC6 is not met by the delivered system** — see DEFECT-11 [R6]. The
> registration endpoint accepts a client-supplied role. This is recorded as a
> critical open defect and is covered by test case `TC-NFR-03-01`, which fails
> by design until it is fixed.

### FR-02 — Authentication

**Priority:** P1 · **Endpoints:** `POST /api/auth/login`, `POST /api/auth/admin-login`

A registered user shall exchange their email and password for a signed access
token. A separate administrator sign-in endpoint shall admit only accounts
holding the `admin` role.

**Acceptance criteria**

- **AC1.** *Given* correct credentials for an active account, *when* the user
  signs in, *then* HTTP 200 is returned with a token valid for the configured
  lifetime and a summary of the user.
- **AC2.** *Given* incorrect credentials, *when* the user signs in, *then*
  HTTP 401 is returned and no token is issued.
- **AC3 (no enumeration).** *Given* an unknown email and *given* a known email
  with a wrong password, *when* each is submitted, *then* both responses carry
  an identical status and message, so the endpoint cannot be used to discover
  which accounts exist.
- **AC4 (deactivated).** *Given* an account with `isActive` false, *when* the
  user signs in with correct credentials, *then* HTTP 401 "Account is
  deactivated" is returned.
- **AC5 (admin gate).** *Given* a non-administrator's correct credentials,
  *when* they are submitted to the administrator sign-in endpoint, *then*
  HTTP 403 is returned.

### FR-03 — Federated sign-in with Google

**Priority:** P2 · **Endpoint:** `POST /api/auth/google`

A user shall be able to sign in with a Google account. The Google ID token shall
be verified against Google before any account is created or linked.

**Acceptance criteria**

- **AC1 (new user).** *Given* a verified credential and no existing account,
  *when* a role of `student` or `instructor` is supplied, *then* an account is
  created with `authProvider` `google`, `emailVerified` true and no local
  password.
- **AC2 (link).** *Given* a verified credential whose email matches an existing
  account, *when* the user signs in, *then* the existing account is reused and
  gains the Google identifier — no second account is created.
- **AC3 (role required).** *Given* a verified credential and no existing
  account, *when* no role is supplied, *then* HTTP 400 is returned and no
  account is created.
- **AC4 (no escalation).** *Given* a verified credential, *when* the role
  `admin` is requested, *then* HTTP 400 is returned and no account is created.
- **AC5 (unverified).** *Given* a credential Google does not verify, *when* it
  is submitted, *then* HTTP 401 is returned and no account is created.
- **AC6 (deactivated).** *Given* a deactivated account, *when* the user signs in
  with Google, *then* HTTP 401 is returned.

### FR-04 — Session and token management

**Priority:** P1 · **Endpoints:** `GET /api/auth/me`, `POST /api/auth/logout`

Every protected endpoint shall require a valid, unexpired token belonging to an
account that still exists and is still active. A user shall be able to read
their own identity and to sign out.

**Acceptance criteria**

- **AC1.** *Given* a valid token, *when* the user requests their identity,
  *then* HTTP 200 is returned with their profile and no password material.
- **AC2.** *Given* no token, a malformed token, an expired token, or a token
  signed with a different key, *when* a protected endpoint is called, *then*
  HTTP 401 is returned.
- **AC3.** *Given* a valid token whose account has since been deleted or
  deactivated, *when* a protected endpoint is called, *then* HTTP 401 is
  returned.
- **AC4 (revocation).** *Given* a user has signed out, *when* the same token is
  presented again, *then* HTTP 401 shall be returned.

> **AC4 is not met by the delivered system** — see DEFECT-14 [R6]. Sign-out is
> client-side only; a captured token stays valid for its full lifetime.

### FR-05 — Role-based access control

**Priority:** P1 · **Endpoints:** all `/api/admin/*` and every role-restricted route

Every endpoint shall enforce the roles it declares. A caller holding a valid
token but an insufficient role shall be refused.

**Acceptance criteria**

- **AC1.** *Given* an authenticated student, *when* any administrator-only
  endpoint is called, *then* HTTP 403 is returned and no data is disclosed.
- **AC2.** *Given* an unauthenticated caller, *when* any administrator-only
  endpoint is called, *then* HTTP 401 is returned.
- **AC3.** *Given* an instructor, *when* they modify or delete a course owned by
  a different instructor, *then* HTTP 403 is returned and the course is
  unchanged.
- **AC4.** *Given* an administrator, *when* they act on any course, *then* the
  action succeeds regardless of ownership.

## 3.2 Profile and account

### FR-06 — Profile management

**Priority:** P1 · **Endpoints:** `GET|PUT /api/users/profile`, `PUT /api/users/notifications`, `PUT /api/users/privacy`, `PUT /api/users/last-login`

A user shall maintain their own display name, biography, contact details, social
links, notification preferences and privacy settings.

**Acceptance criteria**

- **AC1.** *Given* an authenticated user, *when* they submit changed profile
  fields, *then* those fields are persisted and returned.
- **AC2 (allow-list).** *Given* a profile update that also contains `role` or
  `email`, *when* it is submitted, *then* those two fields are ignored and the
  stored values are unchanged.
- **AC3 (bounds).** *Given* a biography over 500, a location over 100 or a
  phone number over 20 characters, *when* submitted, *then* HTTP 400 is returned
  naming the field.
- **AC4 (partial).** *Given* an update containing only some fields, *when* it is
  submitted, *then* fields not mentioned retain their previous values.
- **AC5 (preferences).** *Given* an authenticated user, *when* they change a
  notification or privacy preference, *then* it is persisted.

> **AC5 is not met by the delivered system** — see DEFECT-21 [R6]. The
> preference endpoints are shadowed by `PUT /api/users/:id` and are unreachable
> for every caller.

### FR-07 — Password management

**Priority:** P1 · **Endpoint:** `PUT /api/users/password`

A signed-in user shall change their password by supplying the current one.
Password reset tokens shall be single-use, expire after ten minutes, and be
stored only as a hash.

**Acceptance criteria**

- **AC1.** *Given* the correct current password, *when* a new one is submitted,
  *then* it is stored, sign-in with the new password succeeds, and sign-in with
  the old one fails.
- **AC2.** *Given* an incorrect current password, *when* a change is attempted,
  *then* HTTP 400 is returned and the existing password still works.
- **AC3.** *Given* a reset token is generated, *when* the user record is read,
  *then* only a SHA-256 hash of the token is stored and the expiry is exactly
  ten minutes ahead.
- **AC4 (policy).** *Given* a new password that does not meet the registration
  policy, *when* it is submitted, *then* HTTP 400 is returned.

> **AC4 is not met by the delivered system** — see DEFECT-20 [R6]. The change
> endpoint checks length only.

## 3.3 Courses and learning

### FR-08 — Course catalogue and search

**Priority:** P1 · **Endpoints:** `GET /api/courses`, `GET /api/courses/:id`

Anyone, signed in or not, shall be able to browse, filter, search and paginate
the course catalogue, and open a course detail page.

**Acceptance criteria**

- **AC1.** *Given* published courses exist, *when* an unauthenticated visitor
  requests the catalogue, *then* HTTP 200 is returned with the courses and
  pagination metadata (`count`, `total`, `page`, `pages`).
- **AC2.** *Given* a `page` and `limit`, *when* the catalogue is requested,
  *then* exactly that page is returned; defaults are page 1 and 10 per page.
- **AC3.** *Given* `category`, `level` or `published` filters, *when* the
  catalogue is requested, *then* only courses matching every supplied filter are
  returned.
- **AC4.** *Given* a `search` term, *when* the catalogue is requested, *then*
  courses whose title matches case-insensitively are returned.
- **AC5.** *Given* a course id that matches no course, *when* the detail page is
  requested, *then* HTTP 404 is returned.
- **AC6 (privacy).** *Given* the catalogue is public, *when* it is requested,
  *then* no instructor or enrolled-student email address appears in the
  response.

### FR-09 — Course authoring

**Priority:** P1 · **Endpoints:** `POST|PUT|DELETE /api/courses[/:id]`

An instructor shall create, update and delete their own courses, including a
weekly curriculum of lessons. An administrator may act on any course.

**Acceptance criteria**

- **AC1.** *Given* an authenticated instructor, *when* they submit a valid
  course, *then* HTTP 201 is returned and the course is stored with the caller
  recorded as its instructor.
- **AC2 (ownership from token).** *Given* a course payload naming a different
  instructor, *when* it is submitted, *then* the caller is recorded as the
  instructor regardless.
- **AC3 (role).** *Given* a student, *when* they attempt to create a course,
  *then* HTTP 403 is returned and no course is created.
- **AC4 (validation).** *Given* a title outside 5–100 characters, a description
  outside 10–1000, an unknown category or level, a duration outside 1–52 weeks,
  or a negative price, *when* submitted, *then* HTTP 400 is returned naming the
  field.
- **AC5 (default state).** *Given* a newly created course, *when* it is read,
  *then* `isPublished` is false.
- **AC6 (cascade).** *Given* a course with enrolments, *when* it is deleted,
  *then* its enrolment records are removed as well.

> **AC6 is not met by the delivered system** — see DEFECT-18 [R6].

### FR-10 — Course enrolment

**Priority:** P1 · **Endpoints:** `POST|DELETE /api/courses/:id/enroll`, `GET /api/courses/my-courses`

A student shall enrol in a published course and may un-enrol. Enrolment shall be
reflected in three places: a progress record, the course roster, and the
student's account.

**Acceptance criteria**

- **AC1.** *Given* a published course and a student not yet enrolled, *when*
  they enrol, *then* HTTP 200 is returned, a progress record is created at 0 %,
  the student is added to the course roster, and the course is added to the
  student's enrolled courses.
- **AC2 (idempotence).** *Given* a student already enrolled, *when* they enrol
  again, *then* HTTP 400 is returned and exactly one progress record exists.
- **AC3 (unpublished).** *Given* an unpublished course, *when* a student
  attempts to enrol, *then* HTTP 400 is returned and no progress record is
  created.
- **AC4 (un-enrolment).** *Given* an enrolled student, *when* they un-enrol,
  *then* all three records above are reversed.
- **AC5 (isolation).** *Given* several students, *when* one requests their
  enrolled courses, *then* only their own enrolments are returned.
- **AC6 (integrity).** *Given* two concurrent enrolment requests for the same
  student and course, *when* both are processed, *then* at most one progress
  record exists — enforced by a unique compound database index.

### FR-11 — Progress tracking and completion

**Priority:** P1 · **Endpoints:** `POST /api/courses/:id/complete`, `GET /api/users/dashboard`

Progress shall be tracked per enrolment as the percentage of lessons completed.
Marking a course complete shall stamp a completion date, which drives both
certificate eligibility and the analytics dashboard.

**Acceptance criteria**

- **AC1.** *Given* an enrolled student, *when* they mark the course complete,
  *then* the record shows completed, 100 % progress and a completion date.
- **AC2.** *Given* an already completed course, *when* completion is requested
  again, *then* HTTP 400 is returned.
- **AC3.** *Given* a student not enrolled, *when* completion is requested,
  *then* HTTP 400 is returned and no progress record is created.
- **AC4 (calculation).** *Given* a course with N lessons and M completed, *when*
  progress is calculated, *then* it equals `round(M / N × 100)`, and 0 when the
  course has no lessons.
- **AC5 (reversal).** *Given* a completed record, *when* it is marked
  incomplete, *then* the completion date is cleared so analytics no longer count
  it.

### FR-12 — Course reviews and ratings

**Priority:** P2 · **Endpoint:** `POST /api/courses/:id/reviews`

A user shall review a course once, with a rating of 1–5 and an optional comment.
The course average shall be recalculated on every change.

**Acceptance criteria**

- **AC1.** *Given* a course, *when* a user submits a rating and comment, *then*
  the review is stored and the course average is updated.
- **AC2.** *Given* a user who has already reviewed a course, *when* they submit
  again, *then* HTTP 400 is returned and the original review is unchanged.
- **AC3.** *Given* a rating outside 1–5, a non-integer rating, or a comment over
  500 characters, *when* submitted, *then* HTTP 400 is returned.
- **AC4 (average).** *Given* reviews rated 5, 4 and 3, *when* the average is
  read, *then* it is exactly 4, retaining any fractional part.
- **AC5 (eligibility).** *Given* a user not enrolled in a course, *when* they
  attempt to review it, *then* HTTP 403 shall be returned.

> **AC5 is not met by the delivered system** — see DEFECT-19 [R6]. Any
> authenticated account can rate any course, which leaves the public catalogue
> ordering open to manipulation.

## 3.4 Commerce

### FR-13 — Subscription plan management

**Priority:** P1 · **Endpoints:** `GET /api/subscriptions/plans|current|usage`, `POST /api/subscriptions/create`, `PUT /api/subscriptions/upgrade|cancel`

The system shall offer three plans — starter, pro and premium — each billed
monthly or yearly. A user shall hold at most one active subscription.

| Plan | Monthly (LKR) | Yearly (LKR) | Courses | Students | Notable features |
| --- | --- | --- | --- | --- | --- |
| Starter | 0 | 0 | 5 | 50 | — |
| Pro | 15,000 | 150,000 | Unlimited | 500 | API access, custom branding, priority support |
| Premium | 35,000 | 350,000 | Unlimited | Unlimited | White label, SSO, custom domain, dedicated manager |

**Acceptance criteria**

- **AC1 (public pricing).** *Given* no authentication, *when* the plans are
  requested, *then* all three are returned with their features and both prices.
- **AC2 (trial).** *Given* a user with no subscription, *when* they select pro
  or premium, *then* a 14-day trial begins and a pending payment is scheduled
  for the trial end date.
- **AC3 (free plan).** *Given* a user selects starter, *when* it is created,
  *then* it is immediately active with amount 0, auto-renewal off, and **no**
  payment record.
- **AC4 (single subscription).** *Given* an active subscription, *when* another
  is requested, *then* HTTP 400 is returned.
- **AC5 (upgrade only).** *Given* a premium subscriber, *when* they request pro
  through the upgrade endpoint, *then* HTTP 400 is returned and the plan is
  unchanged.
- **AC6 (cancellation).** *Given* an active subscription, *when* it is
  cancelled, *then* the status becomes cancelled, the reason and timestamp are
  recorded, and auto-renewal is switched off.
- **AC7 (usage).** *Given* an active subscription, *when* usage is requested,
  *then* courses, students and API calls are each reported as used, limit and
  whether the limit is unlimited.
- **AC8 (annual discount).** *Given* a paid plan, *when* the yearly price is
  compared with the monthly, *then* the yearly price equals ten monthly
  payments — two months free.

### FR-14 — Payment processing and invoicing

**Priority:** P1 · **Endpoints:** `POST /api/payments/create`, `PUT /api/payments/:id/complete|fail`, `POST /api/payments/:id/refund`, `GET /api/payments/*`, `GET /api/subscriptions/payments|invoice/:id`, `PUT /api/admin/payments/:id/status`

Payments shall be recorded against a subscription, completed or failed with a
gateway reference, and refundable once completed. Every payment shall receive a
unique invoice number.

**Acceptance criteria**

- **AC1.** *Given* a subscription belonging to the caller, *when* a payment is
  created, *then* HTTP 201 is returned with a pending payment carrying a
  generated invoice number of the form `INV-YYYYMM-NNNN`.
- **AC2 (ownership).** *Given* a subscription belonging to another user, *when*
  a payment is created against it, *then* HTTP 404 is returned and no payment is
  created.
- **AC3 (completion).** *Given* a pending payment, *when* it is completed, *then*
  the status, paid date, payment date and gateway reference are all recorded.
- **AC4 (idempotence).** *Given* a completed payment, *when* completion is
  requested again, *then* HTTP 400 is returned — a retried gateway callback must
  not double-count revenue.
- **AC5 (refund eligibility).** *Given* a payment that is not completed, *when*
  a refund is requested, *then* HTTP 400 is returned.
- **AC6 (invoice isolation).** *Given* an invoice belonging to another customer,
  *when* it is requested, *then* HTTP 404 is returned and no data is disclosed.
- **AC7 (uniqueness).** *Given* two payments, *when* both are stored, *then*
  their invoice numbers differ — enforced by a unique index.
- **AC8 (refund ceiling).** *Given* a completed payment, *when* a refund larger
  than the amount collected is requested, *then* HTTP 400 shall be returned.

> **AC7 is at risk and AC8 is not met** — see DEFECT-08 and DEFECT-22 [R6].

### FR-15 — Certificate issuance and delivery

**Priority:** P1 · **Endpoints:** `GET /api/certificates[/:id|/stats|/eligible-students|/my-certificates]`, `POST /api/certificates[/:id/send|/:id/mark-viewed]`, `PUT /api/certificates/:id/status`, `DELETE /api/certificates/:id`

An administrator shall issue a certificate to a student who has completed a
course. Certificate numbers shall be unique and sequential within a year.

**Acceptance criteria**

- **AC1 (eligibility).** *Given* a student who has completed a course and holds
  no certificate for it, *when* eligible students are listed, *then* they
  appear with the course and completion date.
- **AC2 (no duplicates).** *Given* a certificate already issued for a student
  and course, *when* eligible students are listed, *then* that pair does not
  appear.
- **AC3 (issuance).** *Given* an eligible student, *when* an administrator
  issues a certificate, *then* HTTP 201 is returned and a certificate is stored
  with a number of the form `CERT-NNNNNN-YYYY`.
- **AC4 (completion required).** *Given* a student who has not completed the
  course, *when* issuance is attempted, *then* HTTP 400 is returned and no
  certificate is created.
- **AC5 (numbering).** *Given* certificates issued in sequence within a year,
  *when* their numbers are read, *then* they increment by one and restart at
  000001 each year.
- **AC6 (student isolation).** *Given* several students, *when* one lists their
  certificates, *then* only their own are returned; a request for another
  student's certificate is refused with HTTP 403.
- **AC7 (first view).** *Given* an unviewed certificate, *when* the student
  views it twice, *then* the first-viewed date is recorded once and never
  updated.
- **AC8 (concurrency).** *Given* certificates issued concurrently, *when* all
  are stored, *then* every number is distinct and no issuance fails.

> **AC8 is not met by the delivered system** — see DEFECT-29 [R6].

## 3.5 Communication

### FR-16 — Announcements

**Priority:** P2 · **Endpoints:** `GET /api/announcements[/all|/stats|/:id]`, `POST /api/announcements[/:id/read]`, `PUT /api/announcements/:id[/pin|/toggle]`, `DELETE /api/announcements/:id`

An administrator shall publish announcements targeted at an audience and a date
window. Users shall see only announcements addressed to them and currently live.

**Acceptance criteria**

- **AC1.** *Given* an active announcement targeted at everyone and inside its
  date window, *when* any user requests their announcements, *then* it appears.
- **AC2 (audience).** *Given* an announcement targeted at instructors, *when* a
  student requests theirs, *then* it does not appear, and a direct request for
  it by id is refused with HTTP 403.
- **AC3 (window).** *Given* an announcement that has expired or has not yet
  started, *when* announcements are requested, *then* it does not appear.
- **AC4 (withdrawal).** *Given* an active announcement, *when* an administrator
  deactivates it, *then* it disappears from the user feed.
- **AC5 (read tracking).** *Given* an announcement, *when* a user marks it read
  twice, *then* they are recorded once.
- **AC6 (validation).** *Given* an announcement missing a title, content or end
  date, *when* it is submitted, *then* HTTP 400 is returned.

### FR-17 — Discussion forums

**Priority:** P2 · **Endpoints:** `GET /api/forums[/all|/stats|/:id|/:id/posts]`, `POST /api/forums[/:id/posts|/:id/subscribe|/:id/unsubscribe]`, `PUT /api/forums/:id[/pin|/toggle]`, `DELETE /api/forums/:id`

An administrator shall manage discussion forums by category and level. Users
shall read forums, subscribe, and post.

**Acceptance criteria**

- **AC1.** *Given* active forums, *when* an authenticated user lists them,
  *then* they are returned.
- **AC2 (posting).** *Given* an active, unlocked forum, *when* a user posts a
  title and content, *then* HTTP 201 is returned, the post is stored against the
  author, and the forum post count and last-post pointer are updated.
- **AC3 (locked).** *Given* a locked forum, *when* a post is attempted, *then*
  HTTP 400 "Forum is locked" is returned and no post is created.
- **AC4 (inactive).** *Given* a deactivated forum, *when* a post is attempted,
  *then* HTTP 400 is returned.
- **AC5 (subscription).** *Given* a forum, *when* a user subscribes twice and
  then unsubscribes, *then* they are recorded once and then removed.
- **AC6 (reactions).** *Given* a post, *when* a user likes it and then dislikes
  it, *then* the like is replaced — a user is never counted as both.

### FR-18 — Notifications

**Priority:** P2 · **Endpoints:** `GET /api/notifications[/all|/stats|/target-users|/:id]`, `POST /api/notifications[/:id/read|/:id/click|/send-to-users|/send-to-parents]`, `PUT /api/notifications/:id[/pin|/toggle]`, `DELETE /api/notifications/:id`

An administrator shall send notifications to an audience, to named users, or to
the parents of named students. Users shall see notifications addressed to them
within their scheduling window.

**Acceptance criteria**

- **AC1.** *Given* an active notification scheduled in the past and not yet
  expired, *when* a user requests theirs, *then* it appears.
- **AC2 (scheduling).** *Given* a notification scheduled for the future or
  already expired, *when* notifications are requested, *then* it does not
  appear.
- **AC3 (targeting).** *Given* named recipients, *when* a notification is sent
  to them, *then* one notification is created per recipient, targeted at that
  user alone.
- **AC4 (validation).** *Given* a notification missing a title, message or
  expiry, *when* it is submitted, *then* HTTP 400 is returned.
- **AC5 (engagement).** *Given* a notification, *when* a user marks it read or
  clicked, *then* the engagement is recorded.
- **AC6 (parents).** *Given* a student with a recorded parent, *when* a parent
  notification is sent, *then* the parent receives it.

> **AC6 is not met by the delivered system** — see DEFECT-26 [R6]. The user
> record has no parent relationship, so the feature is inert.

## 3.6 Administration

### FR-19 — Administrative user management

**Priority:** P1 · **Endpoints:** `GET /api/users[/:id]`, `PUT|DELETE /api/users/:id`, `GET|POST /api/admin/users`, `PUT /api/admin/users/:id[/status]`, `DELETE /api/admin/users/:id`

An administrator shall list, search, filter, create, edit, suspend and delete
user accounts.

**Acceptance criteria**

- **AC1.** *Given* users exist, *when* an administrator lists them, *then* they
  are returned with pagination metadata and no password material.
- **AC2 (filters).** *Given* a role, status or search term, *when* the directory
  is requested, *then* only matching users are returned.
- **AC3 (suspension).** *Given* an active account, *when* an administrator
  deactivates it, *then* that user can no longer sign in; reactivation restores
  access.
- **AC4 (role change).** *Given* a student, *when* an administrator changes
  their role to instructor, *then* the change is persisted.
- **AC5 (isolation).** *Given* a student, *when* they request another user's
  record, *then* HTTP 403 is returned.

### FR-20 — Administrative course management

**Priority:** P1 · **Endpoints:** `GET|POST /api/admin/courses`, `PUT /api/admin/courses/:id[/status]`, `DELETE /api/admin/courses/:id`

An administrator shall manage every course regardless of ownership, including
publication.

**Acceptance criteria**

- **AC1.** *Given* published and unpublished courses, *when* an administrator
  lists them, *then* both appear.
- **AC2 (on behalf).** *Given* an instructor id, *when* an administrator creates
  a course naming them, *then* the course is attributed to that instructor.
- **AC3 (validation).** *Given* a missing, malformed or unknown instructor id,
  *when* a course is created, *then* HTTP 400 is returned.
- **AC4 (publication).** *Given* an unpublished course, *when* an administrator
  publishes it, *then* it appears in the public catalogue; withdrawing it
  removes it again.

### FR-21 — Analytics and reporting

**Priority:** P1 · **Endpoints:** `GET /api/admin/stats|analytics|analytics/export|activities|payment-stats|recent-payments|all-payments`

The administrative dashboard shall report user, course and revenue totals over a
selectable period, together with a recent-activity feed.

**Acceptance criteria**

- **AC1.** *Given* users, courses and completed payments, *when* the dashboard
  is requested, *then* totals for users, courses, revenue, active users and
  completed courses are returned.
- **AC2 (revenue definition).** *Given* completed, pending and failed payments,
  *when* revenue is calculated, *then* only completed payments contribute.
- **AC3 (empty system).** *Given* no data, *when* the dashboard is requested,
  *then* zeroes are returned rather than an error.
- **AC4 (period).** *Given* a period of 7, 30, 90 or 365 days, *when* analytics
  are requested, *then* the report covers that rolling window.
- **AC5 (activity feed).** *Given* recent records, *when* the feed is requested,
  *then* activities are returned newest first.
- **AC6 (breakdowns).** *Given* completed payments across plans and months,
  *when* revenue is broken down, *then* per-plan and per-month totals are
  correct, and a payment on 31 December is counted in its own year.

> **The 31 December case of AC6 is not met** — see DEFECT-28 [R6].

### FR-22 — System settings

**Priority:** P2 · **Endpoints:** `GET|PUT /api/admin/settings[/:section]`, `POST /api/admin/settings/reset|import`, `GET /api/admin/settings/export/json`

A single settings document shall hold site configuration. An administrator shall
read and update it whole or by section, reset it, and export or import it.

**Acceptance criteria**

- **AC1 (singleton).** *Given* no settings exist, *when* they are first
  requested, *then* a default document is created and exactly one exists.
- **AC2 (audit).** *Given* a settings change, *when* the record is read, *then*
  the administrator who made it is recorded.
- **AC3 (sections).** *Given* a section name, *when* it is requested or updated,
  *then* only that section is returned or changed; an unknown section returns
  HTTP 404.
- **AC4 (reset).** *Given* customised settings, *when* they are reset, *then*
  the defaults are restored and exactly one document remains.
- **AC5 (round trip).** *Given* exported settings, *when* they are re-imported,
  *then* the values are restored.

### FR-23 — Enquiry submission (Join Us)

**Priority:** P2 · **Endpoints:** `POST /api/join-us/submit`, `GET /api/join-us/submissions[/:id]|/stats`, `PUT /api/join-us/submissions/:id/status`, `DELETE /api/join-us/submissions/:id`

A prospective student shall submit an enquiry without an account. Administrators
shall triage the queue through a status workflow.

**Acceptance criteria**

- **AC1.** *Given* no account, *when* a visitor submits a valid enquiry, *then*
  HTTP 201 is returned with a submission id and the record is stored as pending.
- **AC2 (minimal).** *Given* only a name and email, *when* an enquiry is
  submitted, *then* it is accepted.
- **AC3 (duplicate).** *Given* an enquiry already exists for an email address,
  *when* another is submitted, *then* HTTP 400 is returned.
- **AC4 (validation).** *Given* an age outside 16–80, an unrecognised
  proficiency level, preferred time, interest or referral source, or a message
  over 1000 characters, *when* submitted, *then* HTTP 400 is returned.
- **AC5 (triage).** *Given* a pending enquiry, *when* an administrator sets its
  status to contacted with a note, *then* the status, note, timestamp and acting
  administrator are recorded.
- **AC6 (confidentiality).** *Given* an enquiry containing personal data, *when*
  a student requests the queue, *then* HTTP 403 is returned.
- **AC7 (traceability).** *Given* an enquiry, *when* it is stored, *then* the
  submitter's IP address and user agent are recorded for abuse triage.

### FR-24 — File upload

**Priority:** P2 · **Endpoints:** `POST /api/users/avatar`, `POST /api/certificates`

Users shall upload an avatar image; administrators shall attach certificate
documents. Only permitted types shall be accepted and sizes shall be capped.

**Acceptance criteria**

- **AC1.** *Given* a PNG or JPEG, *when* a user uploads an avatar, *then*
  HTTP 200 is returned and the stored URL is recorded on the user.
- **AC2 (type).** *Given* a non-image file, *when* an avatar upload is
  attempted, *then* HTTP 400 "Only image files are allowed!" is returned.
- **AC3 (documents).** *Given* a certificate upload, *when* the file is an image
  or a PDF, *then* it is accepted; anything else is refused.
- **AC4 (size).** *Given* a file above the configured limit, *when* it is
  uploaded, *then* HTTP 400 is returned. Avatars are limited to 5 MB and
  certificate documents to 10 MB.
- **AC5 (filename).** *Given* any uploaded file, *when* it is stored, *then* the
  stored name is generated by the server and contains no path separator,
  whatever the client called it.
- **AC6 (missing file).** *Given* a request with no file part, *when* it is
  submitted, *then* HTTP 400 "No file uploaded" is returned.

### FR-25 — Health and observability

**Priority:** P1 · **Endpoints:** `GET /health`, `GET /api/health`, `GET /api/test`

The service shall expose unauthenticated health endpoints for the hosting
platform, answer unknown routes with a JSON 404, and work behind the Choreo
deployment prefix.

**Acceptance criteria**

- **AC1.** *Given* the service is running, *when* the health endpoint is polled
  without authentication, *then* HTTP 200 is returned with the service status,
  version, timestamp and database connection state.
- **AC2 (no disclosure).** *Given* the health endpoint is public, *when* it is
  polled, *then* the response reports only *whether* the database URI and
  secrets are configured, never their values.
- **AC3 (unknown route).** *Given* a path that matches no route, *when* it is
  requested, *then* HTTP 404 is returned as JSON, not HTML.
- **AC4 (deployment prefix).** *Given* the Choreo gateway prefix, *when* a
  request arrives with it, *then* it is routed to the same handler with the same
  authorisation rules.

---

# 4. Non-functional requirements

## NFR-01 — Performance

**Priority:** P1

Under the expected load of 50 concurrent users:

| Metric | Target |
| --- | --- |
| Response time, 95th percentile | < 500 ms |
| Response time, 99th percentile | < 1200 ms |
| Sign-in, 95th percentile | < 800 ms (bcrypt is intentionally costly) |
| Catalogue, 95th percentile | < 400 ms |
| Health probe, 95th percentile | < 150 ms |
| Request failure rate | < 1 % |

**Verification.** The k6 suite in the `testing` repository — smoke, load, stress
and spike scenarios. Results in `documents/testing/performance-report.md`.

## NFR-02 — Availability and data integrity

**Priority:** P1

The service shall survive a transient loss of its database connection: requests
during an outage shall receive HTTP 503 with a retry hint rather than hanging,
and the connection shall be re-established automatically.

Data integrity shall be enforced **by the database**, not only by application
checks, because two concurrent requests can both pass an application check:

| Constraint | Enforced by |
| --- | --- |
| One account per email address | Unique index on `users.email` |
| One Google identity per account | Sparse unique index on `users.googleId` |
| One enrolment per student per course | Unique compound index on `progress.{student, course}` |
| Unique invoice and receipt numbers | Sparse unique indexes on `payments` |
| Unique certificate numbers | Sparse unique index on `certificates.certificateNumber` |

## NFR-03 — Security

**Priority:** P1

The system shall address the OWASP Top 10 as set out in §8.1 of the course
guideline. The full control matrix, with evidence, is in
`documents/security/owasp-checklist.md`. Summary:

| Risk | Control |
| --- | --- |
| A01 Broken Access Control | Role checks on every endpoint; resource lookups scoped to the caller |
| A02 Cryptographic Failures | bcrypt password hashing; reset tokens stored as SHA-256; TLS in production |
| A03 Injection | Mongoose parameterised queries and strict schemas; express-validator on every write |
| A04 Insecure Design | Rate limiting; upload type and size limits; business-rule guards in application and database |
| A05 Security Misconfiguration | helmet plus explicit headers; no technology disclosure; no stack traces in production |
| A06 Vulnerable Components | `npm audit --audit-level=high` in CI |
| A07 Authentication Failures | Password complexity policy; deactivation; bounded token lifetime; HTTP-only session cookie |
| A08 Integrity Failures | Lockfiles committed; CI installs with `npm ci` |
| A09 Logging Failures | Every authentication outcome and administrative action logged |
| A10 SSRF | No route dereferences a user-supplied URL |

Eight of the ten controls are **partially** met. Every gap is a numbered entry
in the defect register with a failing-by-design test.

## NFR-04 — Input validation

**Priority:** P1

Every write endpoint shall validate its input before it reaches the database,
and shall report **every** offending field in a single response rather than one
at a time, so a user is not made to resubmit repeatedly.

## NFR-05 — Usability and responsiveness

**Priority:** P2

The interface shall be usable on a phone-sized viewport: no page shall scroll
horizontally, and primary actions shall remain within the viewport. Verified by
the Playwright suite on both a desktop and a Pixel 7 profile.

## NFR-06 — Maintainability

**Priority:** P2

| Metric | Target |
| --- | --- |
| Line and statement coverage | ≥ 80 % of application code |
| Branch coverage of critical business logic | ≥ 90 % |
| API endpoints with an integration test | 100 % |
| Linting errors on new or modified files | 0 |
| Known high or critical dependency vulnerabilities | 0 |

Each is a hard gate in the CI pipeline (§7.2, §8.2).

## NFR-07 — Portability

**Priority:** P3

The system shall run on Linux, macOS and Windows for development, and shall be
deployable as a container. Nothing shall depend on a path, a port or a service
that is not configurable through the environment.

---

# 5. External interface requirements

## 5.1 User interfaces

A single-page React application. Principal screens:

| Area | Screens |
| --- | --- |
| Public | Home, Courses, Course Detail, Pricing, Join Us, Help Centre, Documentation, Privacy Policy, Terms of Service |
| Authentication | Login, Register, Admin Login |
| Student | Dashboard, My Courses, Learning Progress, Profile, Settings, Public Profile, Payment |
| Instructor | Create Course, Edit Course |
| Administrator | Dashboard, Users, Courses, Analytics, Subscriptions, Certificates, Announcements, Forums, Notifications, Join Us, Settings |

## 5.2 Software interfaces

| Interface | Protocol | Purpose |
| --- | --- | --- |
| MongoDB | MongoDB wire protocol over TLS | Persistence |
| Google Identity Services | HTTPS / OpenID Connect | Verification of federated sign-in credentials |

## 5.3 Communication interfaces

A JSON REST API over HTTPS. Every response carries a consistent envelope:

```json
{ "success": true,  "message": "…", "<resource>": { } }
{ "success": false, "message": "…", "errors": [ ] }
```

Authentication is by `Authorization: Bearer <JWT>`. Cross-origin requests are
accepted only from configured origins.

---

# 6. Data requirements

## 6.1 Entities

Twelve collections. Field counts are as implemented.

| Entity | Fields | Purpose |
| --- | --- | --- |
| `User` | 33 | Accounts, roles, preferences, credentials |
| `Course` | 18 | Course definition, curriculum, roster, reviews |
| `Progress` | 13 | One student's progress through one course |
| `Certificate` | 18 | An issued certificate and its delivery state |
| `Subscription` | 31 | A user's plan, its features, limits and usage |
| `Payment` | 27 | A payment against a subscription, with invoicing |
| `Announcement` | 16 | An announcement, its audience and date window |
| `DiscussionForum` | 20 | A forum, its category, moderators and subscribers |
| `DiscussionPost` | 21 | A post, its replies and reactions |
| `Notification` | 32 | A notification, its targeting and engagement |
| `JoinUsSubmission` | 19 | A prospective student's enquiry and its triage state |
| `Settings` | 79 | Site-wide configuration, held as a single document |

## 6.2 Relationships

```text
User 1─────n Course            (instructor)
User n─────n Course            (enrolment, via Progress and roster arrays)
User 1─────n Progress          (student)
Course 1───n Progress          (course)
User 1─────n Certificate       (student, and separately issuedBy)
Course 1───n Certificate
User 1─────n Subscription
Subscription 1─n Payment
User 1─────n Payment
User 1─────n Announcement      (createdBy)
User 1─────n DiscussionForum   (createdBy, moderators, subscribers)
DiscussionForum 1─n DiscussionPost
User 1─────n DiscussionPost    (author)
User 1─────n Notification      (createdBy, targetUsers)
User 1─────1 Settings          (lastUpdatedBy)
```

A full entity–relationship diagram with attributes is in the SDS, §4.

## 6.3 Retention and privacy

| Data | Retention | Notes |
| --- | --- | --- |
| Account records | Until deletion is requested | Deletion is immediate and permanent |
| Passwords | Never stored recoverably | bcrypt hash only |
| Reset tokens | 10 minutes | SHA-256 hash only |
| Enquiry submissions | Until an administrator deletes them | Contains name, email, phone and age |
| IP address and user agent | With the enquiry | Abuse triage only |
| Payment records | Retained for audit | No card data is ever stored |

---

# 7. Use cases

## UC-01 — A student enrols in a course and completes it

| | |
| --- | --- |
| **Actor** | Student |
| **Requirements** | FR-08, FR-10, FR-11, FR-15 |
| **Precondition** | The student holds an account; a published course exists |

**Main flow**

1. The student browses the catalogue and opens a course.
2. The student enrols. The system creates a progress record, adds them to the
   roster and adds the course to their account.
3. The course appears on the student's dashboard and My Courses.
4. The student works through the curriculum; progress is tracked.
5. The student marks the course complete. The system records 100 %, sets the
   completion date, and the student becomes eligible for a certificate.
6. An administrator issues the certificate; the student sees it under their
   certificates, and the first view is recorded.

**Alternative flows**

- 2a. The course is unpublished → HTTP 400, no enrolment.
- 2b. The student is already enrolled → HTTP 400, no second record.
- 5a. The course is already complete → HTTP 400.

## UC-02 — An instructor publishes a course

| | |
| --- | --- |
| **Actor** | Instructor, Administrator |
| **Requirements** | FR-09, FR-20 |
| **Precondition** | The instructor holds an account |

**Main flow**

1. The instructor creates a course with title, description, category, level,
   duration, price and weekly curriculum.
2. The system stores it, attributed to the instructor, unpublished.
3. The instructor refines it.
4. An administrator publishes it.
5. It appears in the public catalogue and can be enrolled in.

**Alternative flows**

- 1a. Validation fails → HTTP 400 naming every offending field.
- 3a. A different instructor attempts to edit it → HTTP 403.

## UC-03 — An administrator triages an enquiry

| | |
| --- | --- |
| **Actor** | Visitor, Administrator |
| **Requirements** | FR-23 |

**Main flow**

1. A visitor submits the Join Us form without an account.
2. The system stores the enquiry as pending with the IP address and user agent.
3. An administrator reviews the queue, filtered by status.
4. The administrator contacts the enquirer and records the outcome, which stamps
   the time and the acting administrator.
5. The enquirer registers; the enquiry is marked enrolled.

## UC-04 — A customer subscribes and is billed

| | |
| --- | --- |
| **Actor** | Instructor or academy customer |
| **Requirements** | FR-13, FR-14 |

**Main flow**

1. The customer reads the plans on the public pricing page.
2. The customer selects pro, monthly. A 14-day trial begins and a pending
   payment is scheduled for the trial end date.
3. At the end of the trial the payment is completed with a gateway reference.
4. The customer downloads the invoice.
5. Usage against the plan limits is visible throughout.

**Alternative flows**

- 2a. The customer already has an active subscription → HTTP 400.
- 3a. The payment fails → the reason is recorded and it remains unpaid.
- 4a. A refund is issued against a completed payment.

## UC-05 — An administrator reviews the business

| | |
| --- | --- |
| **Actor** | Administrator |
| **Requirements** | FR-19, FR-20, FR-21 |

**Main flow**

1. The administrator signs in through the administrator endpoint.
2. The dashboard reports users, courses, revenue and active users.
3. Analytics are reviewed over a rolling period.
4. Revenue is broken down by plan and by month.
5. Users are searched, filtered, suspended or promoted as needed.

---

# 8. Verification

Every requirement in this document is verified by automated tests in the
`testing` repository, and the mapping is generated rather than maintained by
hand.

| Artefact | Location |
| --- | --- |
| Traceability matrix | `documents/testing/traceability-matrix.md` |
| Test case register | `documents/testing/test-register.md` |
| Coverage report | `documents/testing/coverage-sprint8.md` |
| OWASP evidence | `documents/security/owasp-checklist.md` |
| Performance results | `documents/testing/performance-report.md` |
| Defect register | `documents/testing/defect-register.md` |

## 8.1 Verification summary

| Method | Applies to |
| --- | --- |
| **Unit test** | Business rules reachable in isolation — validation, calculations, state transitions |
| **Integration test** | Every API endpoint, through real HTTP against a real database |
| **Security test** | The OWASP control matrix, driven from the generated endpoint inventory |
| **End-to-end test** | User journeys through the browser |
| **Performance test** | NFR-01 thresholds under load |
| **Inspection** | Constraints and configuration that no test can observe |

| Measure | Value |
| --- | --- |
| Automated tests | 1,158 |
| Documented test cases | 283 |
| API endpoints with at least one integration test | 125 / 125 (100 %) |
| Requirements with at least one test | 30 / 30 (100 %) |
| Backend line coverage | 81.4 % |
| Frontend line coverage | 92.6 % |
| Open defects | 32 |

---

# Appendix A — Glossary

| Term | Definition |
| --- | --- |
| **ADR** | Architectural Decision Record — a short document capturing one design decision and its consequences |
| **Bearer token** | A credential sent in the `Authorization` header that grants access by possession alone |
| **bcrypt** | A deliberately slow password-hashing function; its cost factor sets how slow |
| **Choreo** | WSO2's platform-as-a-service, the deployment target for this project |
| **Curriculum** | A course's weeks, each containing lessons |
| **Enrolment** | The relationship between a student and a course, represented by a Progress record |
| **JWT** | JSON Web Token — the signed token format used for authentication |
| **LMS** | Learning Management System |
| **MERN** | MongoDB, Express, React, Node.js |
| **OWASP** | Open Worldwide Application Security Project |
| **Progress record** | The document tracking one student's progress through one course |
| **Role** | One of `student`, `instructor` or `admin`; an account holds exactly one |
| **SPA** | Single-Page Application |
| **Trial** | A 14-day period at the start of a paid subscription before the first payment falls due |

# Appendix B — Requirements index

| ID | Title | Priority | §3 / §4 |
| --- | --- | --- | --- |
| FR-01 | User registration | P1 | 3.1 |
| FR-02 | Authentication | P1 | 3.1 |
| FR-03 | Federated sign-in with Google | P2 | 3.1 |
| FR-04 | Session and token management | P1 | 3.1 |
| FR-05 | Role-based access control | P1 | 3.1 |
| FR-06 | Profile management | P1 | 3.2 |
| FR-07 | Password management | P1 | 3.2 |
| FR-08 | Course catalogue and search | P1 | 3.3 |
| FR-09 | Course authoring | P1 | 3.3 |
| FR-10 | Course enrolment | P1 | 3.3 |
| FR-11 | Progress tracking and completion | P1 | 3.3 |
| FR-12 | Course reviews and ratings | P2 | 3.3 |
| FR-13 | Subscription plan management | P1 | 3.4 |
| FR-14 | Payment processing and invoicing | P1 | 3.4 |
| FR-15 | Certificate issuance and delivery | P1 | 3.4 |
| FR-16 | Announcements | P2 | 3.5 |
| FR-17 | Discussion forums | P2 | 3.5 |
| FR-18 | Notifications | P2 | 3.5 |
| FR-19 | Administrative user management | P1 | 3.6 |
| FR-20 | Administrative course management | P1 | 3.6 |
| FR-21 | Analytics and reporting | P1 | 3.6 |
| FR-22 | System settings | P2 | 3.6 |
| FR-23 | Enquiry submission (Join Us) | P2 | 3.6 |
| FR-24 | File upload | P2 | 3.6 |
| FR-25 | Health and observability | P1 | 3.6 |
| NFR-01 | Performance | P1 | 4 |
| NFR-02 | Availability and data integrity | P1 | 4 |
| NFR-03 | Security | P1 | 4 |
| NFR-04 | Input validation | P1 | 4 |
| NFR-05 | Usability and responsiveness | P2 | 4 |
| NFR-06 | Maintainability | P2 | 4 |
| NFR-07 | Portability | P3 | 4 |

# Appendix C — Reconciliation with the SENG 31242 SRS

**Complete this table before submission.** It is the evidence that version 2.0
is genuinely an *update* of version 1.0 rather than a replacement for it, which
is what §10.1 #1 asks for.

| This SRS | SENG 31242 SRS | Status | Notes |
| --- | --- | --- | --- |
| FR-01 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-02 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-03 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-04 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-05 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-06 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-07 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-08 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-09 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-10 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-11 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-12 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-13 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-14 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-15 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-16 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-17 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-18 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-19 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-20 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-21 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-22 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-23 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-24 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| FR-25 | `[FR-??]` | ☐ Unchanged ☐ Amended ☐ New | |
| NFR-01 … NFR-07 | `[NFR-??]` | ☐ Unchanged ☐ Amended ☐ New | |

## Requirements in v1.0 that were **not** delivered

List them here. Each belongs in §10.4 "Limitations and known defects" of the
final report, with the reason it was descoped.

| SENG 31242 ID | Title | Reason not delivered |
| --- | --- | --- |
| `[FR-??]` | `[title]` | `[reason]` |

# Appendix D — Open defects affecting requirements

Requirements whose acceptance criteria are not fully met by the delivered
system. The full register is in `documents/testing/defect-register.md`; each
defect has a test that fails by design until it is fixed.

| Requirement | AC | Defect | Severity |
| --- | --- | --- | --- |
| FR-01 | AC6 | DEFECT-11 — registration accepts a client-supplied `admin` role | 🔴 Critical |
| FR-04 | AC4 | DEFECT-14 — sign-out does not invalidate the token | 🟠 High |
| FR-06 | AC5 | DEFECT-21 — preference endpoints unreachable | 🔴 Critical |
| FR-07 | AC4 | DEFECT-20 — password change omits the complexity policy | 🟠 High |
| FR-09 | AC6 | DEFECT-18 — course deletion orphans enrolments | 🟡 Medium |
| FR-12 | AC5 | DEFECT-19 — reviews accepted without enrolment | 🟠 High |
| FR-14 | AC7 | DEFECT-08 — invoice numbers can collide | 🟠 High |
| FR-14 | AC8 | DEFECT-22 — refunds are not capped at the amount collected | 🟠 High |
| FR-15 | AC8 | DEFECT-29 — concurrent issuance collides | 🟠 High |
| FR-18 | AC6 | DEFECT-26 — parent notifications are inert | 🟡 Medium |
| FR-21 | AC6 | DEFECT-28 — 31 December revenue is dropped | 🟡 Medium |
| NFR-03 | — | DEFECT-02, 03, 05, 13, 31, 32 and others | 🔴 – 🟡 |

---

**End of document.**
