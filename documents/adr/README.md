# Architectural Decision Records

§1.3 of the course guideline: *"It is normal for designs to evolve during
implementation. Any significant deviation from the approved SDS must be
documented as a new Architectural Decision Record and reviewed with the
supervisor within one sprint."*

An ADR records **one decision**, the context that forced it, the options
considered, and — most importantly — the consequences the team accepted. The
consequences section is the part that pays for itself: it is what stops the same
question being reopened every sprint, and what tells whoever maintains the system
next *why* it looks the way it does.

## Index

| ADR | Title | Status | Sprint |
| --- | --- | --- | --- |
| [ADR-001](./ADR-001-stateless-jwt-authentication.md) | Stateless JWT authentication over server-side sessions | Accepted | 5 |
| [ADR-002](./ADR-002-business-logic-in-models.md) | Business logic in Mongoose models rather than a service layer | Accepted | 5 |
| [ADR-003](./ADR-003-denormalised-enrolment.md) | Denormalised enrolment across three documents | Accepted | 6 |
| [ADR-004](./ADR-004-retire-global-input-filter.md) | Retire the global input filter | Proposed | 8 |
| [ADR-005](./ADR-005-route-declaration-order.md) | Literal routes precede parameterised routes | Accepted | 8 |

ADRs about the **test architecture** live in the `testing` repository, because
they are decisions about that repository:

| ADR | Title |
| --- | --- |
| ADR-T01 | A standalone test repository, wired to the application at run time |
| ADR-T02 | Jest for the backend, Vitest for the frontend |
| ADR-T03 | Recording known defects as failing-by-design tests |

## Writing one

Copy [`ADR-template.md`](./ADR-template.md), number it sequentially, and add a
row to the index above.

**Write an ADR when** the decision is hard to reverse, affects more than one
component, departs from the approved SDS, or was contested. **Do not** write one
for a decision that could be changed in an afternoon.

## Status

| Status | Meaning |
| --- | --- |
| **Proposed** | Written, not yet agreed |
| **Accepted** | Agreed and in force |
| **Deprecated** | No longer applies, but nothing replaces it |
| **Superseded by ADR-nnn** | Replaced |

An ADR is never deleted or edited after acceptance. If the decision changes, a
new ADR supersedes it — the record of *why the team once thought otherwise* is
part of the value.
