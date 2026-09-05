# GitHub Sprint Checklist — Development Phase

SENG 34213 Appendix C. This is the setup checklist for the development phase:
it is worked through once, at the Development Kick-Off in Week 1, before the
Sprint 5 backlog is opened.

Every item is a thing that is cheap in Week 1 and expensive in Week 9. Branch
protection added after three weeks of direct pushes to `develop` does not
retroactively produce reviewed code.

---

## Repository and branch setup

- [ ] Code repositories created with the correct structure (§3.1) and branch
      protections applied
- [ ] `develop` branch created and set as the **default** branch
- [ ] `.gitignore` and `.env.example` committed to every repository
- [ ] Linter configuration committed to the repository root
- [ ] GitHub Actions CI workflow created and **passing on the first empty push**

> The last one is easy to skip and is the point of the exercise. A pipeline
> written in Week 1 against an empty repository is a pipeline that is debugged
> when nothing else is broken. A pipeline first run in Week 6 fails for reasons
> that are indistinguishable from the feature that triggered it.

### Repositories in this organisation

| Repository | Contents | §3.1 role |
| --- | --- | --- |
| `SRI-KO_LMS_MERN` | Backend (Express/Mongoose) and frontend (React/Vite) in one application repository | `backend` + `frontend`, merged — justified in [ADR-001](../adr/ADR-001-stateless-jwt-authentication.md) and the [SDS](../sds/sds-final.md) |
| `testing` | Integration, security, end-to-end and performance suites | `tests` |
| `infrastructure` | Docker, compose files, deployment scripts | `infra` |
| `documentation` | This repository — SRS, SDS, ADRs, standards, retrospectives | `documents` |

> §3.1 permits backend and frontend to share one repository for a monolith,
> provided the choice is justified in an ADR. It is: the application is a single
> deployable unit with one shared type vocabulary, and splitting it would add a
> cross-repository version handshake to every feature that touches both tiers.

## Sprint 5 setup

- [ ] Sprint 5 Milestone created with the correct dates (Weeks 1–4)
- [ ] Development epics and labels created (see [project-board.md](./project-board.md))
- [ ] Sprint 5 backlog populated with **at least 15** development issues
- [ ] Every issue has: assignee, estimate, priority label, epic label,
      acceptance criteria
- [ ] Sprint capacity calculated per member

### Calculating capacity

Capacity is hours available, not hours hoped for. Per member, per sprint:

```text
capacity = working days in sprint
         × hours per day realistically available for this module
         − known absences (exams, other module deadlines, travel)
         − 20 % for reviews, meetings and unplanned work
```

The 20 % is not padding. Code review, the sprint review, the retrospective and
the CI failures that arrive on someone else's PR are all real work that never
appears on a card. A team that plans to 100 % is a team that carries items over
every sprint and then wonders why.

## Standards and tooling

- [ ] Coding standards document committed to `documents/standards/` —
      [coding-standards.md](../standards/coding-standards.md)
- [ ] Test framework installed and the first test file committed
- [ ] README badges (CI status, coverage) added to **all** code repositories

## Verification

Run through this before declaring the kick-off complete:

| Check | How |
| --- | --- |
| `develop` is default | Repository → Settings → Branches |
| `main` and `develop` are protected | Settings → Branches → rules require 1 approval and a green CI check |
| CI runs on push and PR | Actions tab shows a green run on the initial commit |
| Secrets are not committed | `git log -p \| grep -iE 'password\|secret\|api[_-]?key'` returns only `.env.example` placeholders |
| Board reflects reality | Every open issue has an assignee, an estimate, and a Phase of Development |

---

## Sprint calendar (§2.2)

Sprint numbering continues from SENG 31242, where Sprints 1–4 were the design
phase.

| Sprint | Weeks | Focus theme | Review format | Milestone |
| --- | --- | --- | --- | --- |
| Sprint 5 | 1–4 | Foundation & Infrastructure | Demo + retrospective | `v0.1.0` |
| Sprint 6 | 5–8 | Core Features | Demo + retrospective | `v0.2.0` |
| Sprint 7 | 9–12 | Integration & UX | Demo + retrospective | `v0.3.0` |
| Sprint 8 | 13–16 | Quality & Release | Final panel demo | `v1.0.0` |

## Phase gates (§2.1)

| Week(s) | Phase | Gate |
| --- | --- | --- |
| 1 | Development Kick-Off | Repo setup |
| 1–4 | Sprint 5 — Core Foundation | Sprint review |
| 5–8 | Sprint 6 — Feature Development | Sprint review |
| 9–12 | Sprint 7 — Integration & Polish | Sprint review |
| 13–14 | Sprint 8a — Testing & Hardening | **Test coverage gate** |
| 15 | Pre-Demo Staging | Supervisor sign-off |
| 16 | Final Demo & Submission | Panel approval |
