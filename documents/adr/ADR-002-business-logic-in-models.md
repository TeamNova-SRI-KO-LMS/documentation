# ADR-002 — Business logic in Mongoose models rather than a service layer

- **Status:** Accepted
- **Date:** Sprint 5, Week 2
- **Deciders:** TeamNova
- **Context:** SDS §2.2, §3.3

## Context

Business rules have to live somewhere. The conventional layered answer is a
service layer between the routes and the data access layer. The question is
whether that layer earns its place in *this* application.

The domain is a conventional CRUD system with a moderate amount of logic:
password hashing, rating averages, completion dating, plan limits, invoice
numbering, certificate numbering. There is exactly one consumer of that
logic — the HTTP API. There is no scheduled job, no message consumer, and no
second interface.

## Options considered

### Option A — A service layer

`routes → services → models`. The textbook structure. Each service is unit
testable with a mocked model, and a second consumer could reuse it.

The cost is real: twelve more files, an extra hop for every operation, and a
layer that in this application would mostly forward calls. And the promised
reuse is hypothetical — there is no second consumer, and YAGNI (§5.1) says not
to build for one.

### Option B — Logic in the route handlers

Fewest files. But a rule written in a route holds only for callers who go
through that route, and the same rule then gets duplicated — or, worse,
subtly diverges — the next time the entity is touched from somewhere else.

### Option C — Logic in the models

Mongoose supports pre-save hooks, instance methods and statics. A rule in a
`pre('save')` hook holds however the document was created, including from a
migration script or a test factory. Routes shrink to HTTP translation.

## Decision

**Option C.** Business rules live in the models:

- **Pre-save hooks** enforce invariants — password hashing, average-rating
  recalculation, completion dating, invoice and certificate numbering.
- **Instance methods** are operations on one document — `matchPassword`,
  `canCreateCourse`, `cancel`, `renew`, `markCompleted`, `processRefund`.
- **Statics** are queries over the collection — `getPlanPricing`,
  `getRevenueByPlan`, `getActiveAnnouncements`.

Route handlers translate HTTP to a domain operation and back, and contain no
rules.

## Consequences

**Good.** A rule cannot be bypassed by a caller who forgets to use the service —
the hook runs on every save. Route handlers stay short and readable. Twelve
fewer files, and no layer that only forwards.

**Bad.** Model methods that query the database are hard to unit test in
isolation: `Payment.getRevenueByPlan` runs an aggregation pipeline, and a mocked
version would only prove that the pipeline object was constructed, not that it
computes the right number.

There is also a coupling cost. The domain is tied to Mongoose. Replacing the ODM
would touch every model — though it would touch every service in Option A too.

**Mitigation.** The test strategy splits accordingly, and this is the reason for
the split rather than an accident of it:

- Rules reachable without I/O — hooks driven directly, plan-limit boundaries,
  progress calculation — are **unit tested** with the collaborators mocked.
- Rules that need the database — aggregations, unique-index behaviour,
  sequential certificate numbering — are **integration tested** against a real
  MongoDB, where their behaviour is actually observable.

This is why the models sit at 90 %+ branch coverage while remaining testable.

**Revisit if** a second consumer appears — a scheduled billing job, a webhook
receiver, or a message consumer. At that point the reuse Option A promises
becomes real, and extracting a service layer from well-tested models is
straightforward.
