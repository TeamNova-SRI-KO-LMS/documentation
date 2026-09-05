<!-- Copy to .github/pull_request_template.md in each code repository. -->

## What this changes

<!-- One paragraph. What did the code do before, what does it do now, and why.
     A reviewer should be able to decide from this whether the diff is the right
     diff, before reading the diff. -->

Closes #

## Why

<!-- The failure this prevents, or the requirement it satisfies. Link the SRS
     requirement, the ADR, or the defect. -->

- SRS Reference:
- ADR Reference:

## How to verify

<!-- The steps a reviewer follows to see it working. Not "run the tests" —
     which request, which page, which account. -->

1.
2.

## Screenshots / output

<!-- For UI changes: before and after. For API changes: the request and the
     response. -->

## Risk

<!-- What could this break? What is the rollback? A schema change or a
     migration always answers this. -->

## Definition of Done

- [ ] All acceptance criteria in the issue verified as true
- [ ] Linter passes
- [ ] Unit tests written for all new logic; all pass
- [ ] Integration tests written for new API endpoints; all pass
- [ ] Coverage on new code >= 80%
- [ ] No hardcoded secrets or credentials
- [ ] Raised against `develop`
- [ ] >= 1 peer review completed; all [blocker] comments resolved
- [ ] CI pipeline green (lint + build + unit + integration)
- [ ] Deployed to staging and manually smoke-tested
- [ ] API documentation updated
- [ ] CHANGELOG.md updated under [Unreleased]
- [ ] Issue linked in commit messages (Closes #XX)
- [ ] Issue moved to Done on the Project board
