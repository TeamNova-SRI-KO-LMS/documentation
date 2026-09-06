# Definition of Done

SENG 34213 Appendix A, applied to this project.

An issue is **Done** when every box below is ticked. Not "the code works" — the
whole list. The value of a Definition of Done is that it is not negotiated per
issue: the moment one item becomes optional under deadline pressure, the
checklist stops describing anything.

Most of it is machine-checked. That is deliberate — a criterion a reviewer has
to *judge* gets waived on a Friday; a criterion the pipeline decides does not.

---

## The master checklist

| # | Criterion (Appendix A) | How it is checked |
| --- | --- | --- |
| 1 | Acceptance criteria in the issue are all verified as true | Reviewer, against the Given–When–Then in the issue; each AC named by a test case |
| 2 | Code follows the agreed style guide (linter passes) | `npm run lint` — CI stage 1 |
| 3 | Unit tests written for all new logic; all tests pass | `npm run test:unit` — CI stage 3 |
| 4 | Integration tests written for new API endpoints; all tests pass | `npm run test:integration` — CI stage 4 |
| 5 | Code coverage on new code ≥ 80 % | `npm run coverage:check` — CI stage 5 |
| 6 | No hardcoded secrets or credentials | `TC-SEC-A05-03` plus secret scanning in CI |
| 7 | PR raised against `develop`; description completed in full | Branch protection + PR template |
| 8 | At least 1 peer code review completed; all `[blocker]` comments resolved | Branch protection: 1 required approval |
| 9 | CI pipeline passes: lint + build + unit + integration tests | Required status check on `develop` |
| 10 | Feature deployed to staging and manually smoke-tested | Staging deploy on merge to `develop`; smoke recorded on the issue |
| 11 | API documentation updated (Swagger/OpenAPI or Postman collection) | Reviewer; the endpoint gate catches an undocumented *new* route |
| 12 | `CHANGELOG.md` updated under `[Unreleased]` | Reviewer; see [git-workflow.md](./git-workflow.md) |
| 13 | GitHub Issue linked in commit messages (`Closes #XX`) | Conventional Commits footer; verified by the commit-lint step |
| 14 | GitHub Issue moved to Done on Project board | Automated by the `Closes #XX` link on merge |

### Copy-paste version

Paste this into the PR description. GitHub renders it as a checklist and shows
the completion count in the PR list.

```markdown
## Definition of Done
- [ ] All acceptance criteria in the issue verified as true
- [ ] Linter passes (`npm run lint`)
- [ ] Unit tests written for all new logic; all pass
- [ ] Integration tests written for new API endpoints; all pass
- [ ] Coverage on new code >= 80%
- [ ] No hardcoded secrets or credentials
- [ ] PR raised against `develop`; description completed in full
- [ ] >= 1 peer review completed; all [blocker] comments resolved
- [ ] CI pipeline green (lint + build + unit + integration)
- [ ] Deployed to staging and manually smoke-tested
- [ ] API documentation updated
- [ ] CHANGELOG.md updated under [Unreleased]
- [ ] Issue linked in commit messages (Closes #XX)
- [ ] Issue moved to Done on the Project board
```

---

## What each item actually means

The checklist is short enough to become ritual. These are the readings that
matter when an item is contested.

**1 — Acceptance criteria verified as true.** Verified means *demonstrated*, by
a test or by a reviewer following the steps. "I implemented it" is not
verification; neither is a green build on tests written to match whatever the
code happened to do. Each AC should be traceable to a named test case in the
[test register](../testing/test-register.md).

**5 — Coverage on new code ≥ 80 %.** On *new* code. A PR that adds 200 lines and
covers 40 of them passes a repository-wide 80 % gate while making the codebase
worse. The gate in `scripts/check-coverage.js` also enforces 90 % on the
critical paths listed in `testing.config.js` — authentication, authorisation,
payments, progress — where the cost of a missed branch is money or a
privilege escalation.

**6 — No hardcoded secrets.** Including in tests, including in a private
repository, including "temporarily". A secret in a commit is compromised in
every clone and every CI cache that already pulled it; rewriting history does
not un-share it. The remedy is rotation.

**8 — Peer review with `[blocker]`s resolved.** Resolved means the comment
author marked it resolved, not that the author of the PR replied to it. See
[code-review-standards.md](./code-review-standards.md) for the comment prefixes.

**10 — Deployed to staging and smoke-tested.** §9.1 requires the final
demonstration to run on staging, and a deployment first exercised in Week 16 is
a deployment that fails in Week 16. Every merge to `develop` deploys; the smoke
test is a human loading the feature and using it once.

**12 — `CHANGELOG.md` under `[Unreleased]`.** Written for someone who will read
it in six months without the PR open. "Fix bug" is not an entry.

---

## Additional gates by artefact type

### A new API endpoint

The endpoint-coverage gate fails the build until an integration test exercises
the route, so most of this is enforced rather than remembered.

- [ ] Integration test for the happy path
- [ ] Negative test for each documented error condition
- [ ] 401 without a token
- [ ] 403 for the wrong role, if guarded
- [ ] Validation test for each required field
- [ ] 404 for an unknown resource id, if it takes one
- [ ] Listed in the [SDS API table](../sds/sds-final.md) and the requirement catalogue

### A schema change

- [ ] Index implications considered and declared in the schema
- [ ] Migration or backfill written, if existing documents need it
- [ ] Rollback described in the PR — how to get back if it goes wrong
- [ ] [SDS §4 data design](../sds/sds-final.md) updated

### A dependency added

- [ ] Justified in the PR: what it does that the existing stack does not
- [ ] `npm audit --audit-level=high` clean
- [ ] Licence compatible
- [ ] Pinned to an exact version in the lockfile

---

## Sprint-level Definition of Done

An issue is done when the list above is satisfied. A **sprint** is done when:

- [ ] Every issue in the sprint is Done or explicitly moved to the next sprint
      with a root-cause note (Appendix B.1 item 4)
- [ ] The sprint review has been held and supervisor feedback recorded
- [ ] The retrospective is written and committed to
      [documents/retrospectives/](../retrospectives/)
- [ ] `npm run verify` passes in every repository
- [ ] Generated artefacts re-imported here (`npm run sync`) and committed
- [ ] The milestone is closed and the next milestone's backlog is populated

## Release Definition of Done

- [ ] `develop` is green and deployed to staging
- [ ] The version is bumped per [SemVer](./git-workflow.md#4-semantic-versioning-33)
- [ ] `CHANGELOG.md` `[Unreleased]` section is promoted to the new version
- [ ] Release PR merged to `main`; the merge commit is tagged `vX.Y.Z`
- [ ] The tag is deployed to production and smoke-tested
- [ ] The full suite passes against the deployed environment

---

## See also

- [Testing-specific DoD](../testing/test-strategy.md) — the same checklist with
  each testing item bound to the command that proves it
- [Sprint checklist](../project-management/sprint-checklist.md) — Appendix C,
  the setup checklist for the development phase
