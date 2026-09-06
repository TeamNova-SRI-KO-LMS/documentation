# Security Documentation

Deliverable §10.1 #8 asks for OWASP compliance *evidence*, not an assertion of
compliance. The distinction drives what is in this directory.

| File | What it is |
| --- | --- |
| [owasp-checklist.md](./owasp-checklist.md) | Generated. One section per OWASP Top 10 risk: the control §8.1 requires, how the application implements it, an honest assessment, and the test cases that prove it. |

## How the evidence is produced

`scripts/generate-owasp-report.js` in the testing repository walks the control
matrix in `src/registry/owasp.js`, resolves each cited test case against the
register produced by the last run, and renders the result. A citation that no
longer resolves — a test deleted, renamed, or never written — is reported as
**unevidenced** rather than passing quietly. That is the point: a compliance
document whose claims are not checked is a document that drifts into being
false without anyone noticing.

Import it with `npm run sync`; verify it is current with `npm run sync:check`.

## Current status

Nine of the ten risks are marked 🟡 **Partial** and two are covered by automated
CI checks. Partial is the honest reading: the control exists and is verified,
and at least one gap remains. Every gap is a numbered entry in the
[defect register](../testing/defect-register.md) with a failing-by-design test
attached, so the status here cannot go stale in the optimistic direction.

The four critical findings, all open:

| Defect | Risk | Summary |
| --- | --- | --- |
| DEFECT-11 | A01 Broken Access Control | Public registration accepts a client-supplied `role`, so anyone can create an administrator |
| DEFECT-03 | A05 Security Misconfiguration | `JWT_SECRET \|\| 'fallback-secret'` in three modules — a missing environment variable signs tokens with a published constant |
| DEFECT-05 | A09 Logging Failures | `middleware/auth.js` logs the JWT secret on every authenticated request |
| DEFECT-21 | — | Three user profile endpoints are unreachable, shadowed by a parameterised route |

## Secrets

§7 is unconditional: **no secret is committed, even to a private repository.**

- `.env` is git-ignored in every repository; `.env.example` documents the keys
  with empty or obviously fake values.
- CI reads secrets from GitHub Actions secrets, never from the repository.
- Demonstration credentials (§9.3) are shared with the supervisor through the
  channel they nominate, and only the usernames are recorded — see
  [TEAM.md](../../TEAM.md).
- A completed peer evaluation is confidential (§10.2) and is git-ignored here.

A secret that reaches a commit is compromised even after the commit is
rewritten: it is in every clone, every fork, and every CI cache that already
pulled it. The remedy is to rotate the credential, not to force-push.
