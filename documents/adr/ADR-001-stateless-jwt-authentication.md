# ADR-001 — Stateless JWT authentication over server-side sessions

- **Status:** Accepted
- **Date:** Sprint 5, Week 1
- **Deciders:** TeamNova
- **Context:** SRS FR-02, FR-04, NFR-03; SDS §6.1

## Context

Every protected endpoint needs to know who is calling. The choice of mechanism
constrains how the API tier scales, how quickly access can be revoked, and what
a future mobile client would have to implement.

Two constraints shaped the decision. The API is deployed to Choreo, where
instances may be replaced or scaled without warning, so anything held in a
single instance's memory is unreliable. And the frontend is a single-page
application on a different origin from the API, which makes cookie-based
sessions awkward — they require `SameSite=None`, `Secure`, and a CORS
configuration that permits credentials.

## Options considered

### Option A — Server-side sessions in memory

Simple, and revocation is instant: delete the session. But the session dies with
the instance, so every deployment signs every user out, and a second instance
cannot see the first's sessions. Unworkable on a platform that recycles
containers.

### Option B — Server-side sessions in a shared store

Solves both problems and keeps instant revocation. It adds an infrastructure
dependency — Redis or a sessions collection — that must be provisioned,
monitored and paid for, and every authenticated request becomes an extra network
round trip.

### Option C — Stateless JWT bearer tokens

No server-side state at all. Any instance can serve any request. The same
credential works for a browser and for any future client. The cost is the one
thing sessions do well: a token cannot be withdrawn before it expires without
reintroducing state.

## Decision

**Stateless JWT bearer tokens.** The token carries only `{ id, iat, exp }`,
signed with HMAC-SHA256 and a 7-day lifetime. `middleware/auth.js` verifies the
signature, then **loads the user from the database on every request**.

That last part is deliberate and is where the design differs from a naive JWT
implementation. Trusting claims embedded in the token would avoid the read, but
a deactivated account would keep working until its token expired. Reading the
user means deactivation takes effect on the next request.

## Consequences

**Good.** The API tier is horizontally scalable with no shared state. No
additional infrastructure. One credential mechanism for every client. A
deactivated or deleted account is refused immediately, despite the token being
stateless.

**Bad.** A token cannot be revoked. Sign-out is a client-side gesture: the
client discards the token, but a copy captured beforehand — from a shared
machine, a proxy log, or browser storage — stays valid for up to seven days.
This is recorded as **DEFECT-14** and is covered by test case `TC-FR-04-04`,
which fails by design until it is fixed.

There is also a database read per authenticated request. At the expected load
this is a negligible cost, and it buys immediate revocation of deactivated
accounts, which is the more valuable property.

**Mitigation.** The fix for DEFECT-14 is small and does not overturn this
decision: add a `tokenVersion` to the user document, include it in the JWT
payload, bump it on sign-out and on password change, and compare it in
`protect`. That is one extra field on a record already being read — so
revocation becomes possible at no additional cost.

**Revisit if** the token lifetime needs to fall below an hour, or a regulatory
requirement demands provable immediate revocation. At that point Option B
becomes the right answer.
