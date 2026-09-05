# ADR-004 — Retire the global input filter

- **Status:** Proposed
- **Date:** Sprint 8, Week 1
- **Deciders:** TeamNova
- **Context:** SRS NFR-03; SDS §6.2, §9.3; DEFECT-01, DEFECT-30

## Context

`server.js` installs a middleware that scans request bodies and query strings
against a regular expression and rejects anything that matches:

```js
const sqlInjectionPattern =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|OR|AND)\b)|(;|--|\/\*|\*\/)/i;
```

It was added as defence in depth against injection. Building the test suite
established that it does not do that, in two independent ways.

**It never inspects a request body.** The middleware is mounted at line 101;
`express.json()` at line 155. `req.body` is still `undefined` when the guard
runs, so `if (req.body && checkBody(req.body))` is always false. Every body in
the application passes unexamined. Recorded as **DEFECT-30**.

**On query strings, it rejects ordinary English.** The pattern matches `\bOR\b`
and `\bAND\b` case-insensitively, plus any semicolon, double hyphen or comment
sequence. A student searching for `grammar and vocabulary`, `beginner or
intermediate`, or anything hyphenated receives "Invalid input detected".
Recorded as **DEFECT-01**.

So the control a reviewer would credit for injection defence does not exist,
while the part that does run breaks legitimate use.

## Options considered

### Option A — Leave it

Zero effort, and the false-positive rate on query strings stays. Worse, it
remains in `server.js` looking like a security control, so the next reviewer
credits the system with protection it does not have. A control that misleads a
reviewer is worse than no control.

### Option B — Move it after `express.json()`

Makes it actually inspect bodies. It would then reject every course description
containing "and", every forum post containing a semicolon, and every enquiry
message with a hyphenated phrase. This is the fix that *looks* right and would
take the product down on the first realistic input. The test suite has this
pinned: five ordinary descriptions currently accepted would all start failing.

### Option C — Fix the pattern and move it

Narrow it to genuine attack signatures, then move it after the body parser.
Plausible, but it is an attempt to blocklist attacks — a strategy that fails
against anything not anticipated, and produces false positives forever. And the
database is MongoDB: SQL keywords are not the threat model.

### Option D — Remove it, and rely on the layers that work

Mongoose casts every query against its schema and drops unknown paths under
`strict` mode, which is what actually blocks operator injection. express-validator
guards every write endpoint. Both are already in place, and the security suite
demonstrates that they hold: `{"email": {"$ne": null}}` in a login body
authenticates nobody; unknown fields in a registration body are discarded.

If stripping `$`-prefixed keys is still wanted, `express-mongo-sanitize` does
exactly that, correctly, in four lines.

## Decision

**Option D.** Remove the global input filter. Where operator stripping is
wanted, add `express-mongo-sanitize` after the body parser.

## Consequences

**Good.** Search stops rejecting ordinary words — the user-facing defect closes.
`server.js` no longer advertises a control that does not exist. Injection
defence is where it belongs: schema casting and per-endpoint validation, both
already tested.

**Bad.** The system loses a layer of "defence in depth". This is less than it
sounds: the layer inspects nothing on the body path, and on the query path it
blocks SQL keywords against a database that does not execute SQL.

**Mitigation.** The security suite already covers the properties this filter was
meant to provide — `TC-SEC-A03-01` through `TC-SEC-A03-04` verify that operator
injection fails against login, path parameters and the registration body. Those
tests pass today and will keep passing after removal, which is the evidence that
this is safe to do.

**Verification.** Two test cases change state on removal:
`TC-SEC-A03-06` (currently failing by design) starts passing, and the five
companion tests pinning the false-positive behaviour must be deleted. Both are
noted in the defect register entries.
