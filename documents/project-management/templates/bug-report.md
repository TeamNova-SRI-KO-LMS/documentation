---
name: Bug report
about: Something behaves differently from the SRS or the documented design
title: "[DDP-#NN] fix(scope): summary"
labels: "fix"
assignees: ""
---

## Summary

One sentence: what is wrong.

## Severity

<!-- Critical: data loss, security, or money. High: a primary use case is
     unusable. Medium: a use case is degraded. Low: cosmetic. -->

- [ ] Critical
- [ ] High
- [ ] Medium
- [ ] Low

## Environment

| Field | Value |
| --- | --- |
| Environment | local / staging / production |
| Branch or tag | |
| Browser / client | |
| Account role | student / instructor / admin |

## Steps to reproduce

1.
2.
3.

## Expected behaviour

<!-- Cite the requirement. "It should work" is not an expectation; "FR-05 says a
     student cannot modify a course they do not own" is. -->

- SRS Reference: FR-<number>

## Actual behaviour

<!-- Include the exact response: status code, body, and any error text.
     Redact tokens and personal data before pasting. -->

## Evidence

<!-- Logs, screenshots, a failing request. Redact secrets. -->

## Regression test

Every bug fix lands with a test that fails before the fix and passes after it.
Without one, the same bug returns and nobody notices.

- [ ] Test written that reproduces the defect
- [ ] Test added to the [test register](../../testing/test-register.md) with a
      `testCase({...})` declaration if it maps to a requirement
- [ ] Entry added to the defect register if the fix is deferred
