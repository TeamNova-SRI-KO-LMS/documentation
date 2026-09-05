# Sprint Ceremonies

Agendas for the recurring meetings, per SENG 34213 Appendix B.1.

| Document | When |
| --- | --- |
| [sprint-planning.md](./sprint-planning.md) | Week 1 of each sprint |
| [sprint-review-agenda.md](./sprint-review-agenda.md) | Week 4 of each sprint, with the supervisor |

The retrospective follows the review and is written up in
[documents/retrospectives/](../retrospectives/), which is where its template
lives.

## The cycle

```text
Week 1        Week 2-3           Week 4
─────────     ─────────────      ──────────────────────────
Planning  →   Development   →    Review → Retrospective → Planning (next sprint)
              (daily stand-up)
```

Four sprints of four weeks, Sprints 5 to 8, shipping `v0.1.0` through `v1.0.0`.

## Why the agendas are written down

A review that has no agenda becomes a status update, and a status update is
something an email does better. The Appendix B.1 agenda is four items and the
second one — sprint metrics: issues completed versus planned, velocity, CI pass
rate, coverage delta — is the one that gets dropped when the demo overruns. It
is also the only item that would have told the team something it did not
already know.

So: **record the planned figure at the start of the sprint**, not at the end.
A "planned" number read off the board in Week 4 has quietly absorbed everything
added mid-sprint, which is exactly the number the metric exists to expose.
