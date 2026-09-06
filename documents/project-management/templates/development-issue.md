---
name: Development issue
about: A unit of development work, per SENG 34213 §4.3
title: "[DDP-#NN] type(scope): summary"
labels: ""
assignees: ""
---

## User Story

As a [role], I want to [action] so that [benefit].

## Background / Context

<!-- Reference the SRS requirement and SDS design element that drives this
     ticket. Never implement without traceable design. -->

- SRS Reference: FR-<number>
- SDS Reference: Section <X.Y>, Class <ClassName>
- ADR Reference: ADR-<number> (if applicable)

## Acceptance Criteria

<!-- Written as BDD scenarios (Given-When-Then) or as precise testable
     statements. Each AC must have a corresponding test case. -->

### AC1: Happy Path

**Given** [precondition]
**When** [action]
**Then** [expected outcome]

### AC2: Error Handling

**Given** [invalid input or error condition]
**When** [action]
**Then** [expected error response with HTTP status and error body]

### AC3: Edge Case

**Given** [boundary condition]
**When** [action]
**Then** [expected outcome]

## Technical Notes

<!-- Implementation guidance: algorithms to use, patterns to follow, libraries
     recommended, known pitfalls, constraints -->

## Test Requirements

<!-- List specific tests that must be written and pass -->

- [ ] Unit test: <what is being tested>
- [ ] Integration test: <what is being tested>
- [ ] Negative test: <what error condition is being tested>

## Definition of Done (DoD)

- [ ] Code implemented and follows team coding standards
- [ ] All Acceptance Criteria unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Code coverage for new code >= 80%
- [ ] PR raised against `develop` branch
- [ ] At least 1 peer code review completed; all comments resolved
- [ ] No new linting errors introduced
- [ ] CI pipeline passes (build, lint, test)
- [ ] API documentation updated (if endpoint added/modified)
- [ ] Issue linked in commit messages

## Estimate

Estimated: X hours

## Dependencies

<!-- List any other issues that must be completed first -->

Blocked by: #<issue-number>
