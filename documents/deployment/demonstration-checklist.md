# Demonstration Checklist

SENG 34213 §9.1 and §9.3. Work through this in order; the timings are relative
to the Week 16 demonstration slot.

---

## T−7 days — Pre-Demo Staging (Week 15)

Week 15 exists for exactly this. A demonstration first rehearsed in Week 16 is a
demonstration that discovers its problems in front of the panel.

- [ ] Staging deployed from `develop` and reachable on a public URL
- [ ] Production deployed from the `v1.0.0` tag, if the project deploys one
- [ ] Full test suite passes **against staging**, not only in CI
- [ ] End-to-end suite passes against staging
      (`E2E_EXTERNAL=true npm run test:e2e` in the testing repository)
- [ ] Staging seeded with realistic data — plausible course titles, prices in
      LKR, existing enrolments, reviews and forum threads
- [ ] Demonstration accounts created for student, instructor and administrator
- [ ] Full run-through against the clock; each segment inside its budget
- [ ] Supervisor sign-off on the rehearsal obtained

## T−48 hours — GitHub Repository Submission (§9.3)

Send the supervisor, in one message:

- [ ] URL of the GitHub Organisation — <https://github.com/TeamNova-SRI-KO-LMS>
- [ ] URL(s) of **all** repositories
- [ ] URL of the deployed **staging** application
- [ ] URL of the GitHub Project board
- [ ] Credentials for a demo user account

> Usernames are recorded in [TEAM.md](../../TEAM.md); **passwords are shared
> through the channel the supervisor nominates and are never committed.** A
> credential in a repository is a credential in every clone.

### README requirements (§9.3)

The README of **each** repository must contain all of the following. Check each
repository individually — the requirement is per repository, not per project.

- [ ] Project description and a link to the broader project
- [ ] Prerequisites — language runtime, environment variables required
- [ ] Step-by-step installation and run instructions that **work on a fresh
      machine**
- [ ] Link to the deployed application
- [ ] CI pipeline status badge
- [ ] Test coverage badge

> "Works on a fresh machine" is testable and worth testing: clone into an empty
> directory, follow the README literally, and note every step you had to know
> rather than read. Those steps are the bug.

Badge markup:

```markdown
[![CI](https://github.com/TeamNova-SRI-KO-LMS/<repo>/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/TeamNova-SRI-KO-LMS/<repo>/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-81%25-brightgreen)](https://github.com/TeamNova-SRI-KO-LMS/testing)
```

## T−24 hours — Documents

- [ ] `npm run sync` run in this repository; generated artefacts current
- [ ] `npm run sync:check` passes
- [ ] `npm run build:pdf:all` run; every PDF in `build/pdf/` regenerated
- [ ] SRS and SDS reconciled against the delivered system — Appendix C of the
      [SRS](../srs/srs-final.md) completed
- [ ] Final development report complete and proof-read
      ([final-development-report.md](../report/final-development-report.md))
- [ ] Hard copy of the final report printed (§10.1 #3 requires PDF **and** hard
      copy)
- [ ] All four retrospectives committed
- [ ] `TEAM.md` filled in — no `[Student Name N]` placeholders remain
      (`npm run fill-team:check`)

## T−1 day — Environment

- [ ] Staging redeployed from the exact commit that will be demonstrated
- [ ] Every demonstration account logged in and verified working
- [ ] Payment flow exercised end to end on staging with a test card
- [ ] Certificate generation and download verified on staging
- [ ] Email or notification delivery verified, if it is being shown
- [ ] Browser profiles prepared — one per role, already signed in
- [ ] Tabs pre-opened: staging app, GitHub org, a green CI run, the coverage
      report
- [ ] Screen resolution set for projection; browser zoom at a readable size
- [ ] Notifications, chat clients and email silenced on the presenting machine

## T−30 minutes

- [ ] Staging loaded and responding — check the actual application, not just
      the health endpoint
- [ ] Login works for all three roles, right now, on this network
- [ ] A second machine ready with the same tabs, in case the first fails
- [ ] Recorded fallback video available if staging is unreachable
- [ ] Every team member present

> The fallback video does not replace a live demo and will not be marked as
> one — §9.1 is explicit that an unresolved live failure is a failed
> demonstration. It exists so that a network problem in the room does not cost
> the whole session.

## During

- [ ] All team members present and each one speaks (§9.1)
- [ ] Timings held: 2 / 12 / 3 / 2 / 1 minutes
- [ ] Every primary SRS use case shown with realistic data
- [ ] CI run and coverage report shown
- [ ] Limitations stated honestly, with the real defect count

## T+48 hours

- [ ] **Every student** has individually submitted their peer evaluation as
      `PeerEval_<StudentNumber>_SENG34213.pdf` to eKelaniya (§10.2)
- [ ] Final report submitted to the Teaching Unit, PDF and hard copy
- [ ] `v1.0.0` tagged and the release notes published

> The peer evaluation is an individual obligation. A missing one costs that
> student marks from Continuous Progress, and the team leader's submission does
> not cover anybody else. Form:
> [peer-evaluation-form.md](../forms/peer-evaluation-form.md).

---

## Failure modes worth rehearsing

Each of these has ended a demonstration somewhere. Ten minutes spent on them is
cheap.

| If this happens | Do this |
| --- | --- |
| Staging is down | Redeploy the last green commit — decided **before** the session, not during it |
| The room's network is slow | Present from a phone hotspot; have it paired already |
| A demo account is locked out | Have a second account per role, created and tested |
| Payment gateway sandbox is down | Show a completed payment and its invoice from seeded data, and say why |
| A feature errors live | Say what should have happened, move on, and return to it in Q&A. Do not debug in front of the panel |
| The projector shows the wrong aspect ratio | Fixed resolution set in advance; do not resize mid-demo |
| Someone is ill | Every segment has a named backup presenter |
