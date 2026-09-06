# Project Management

How the work is organised, per SENG 34213 §4 and Appendix C.

| Document | Covers |
| --- | --- |
| [sprint-checklist.md](./sprint-checklist.md) | Appendix C — the Week 1 setup checklist, sprint calendar, phase gates |
| [project-board.md](./project-board.md) | §4.1 board structure, §4.2 development epics, priority and status labels |
| [issue-guide.md](./issue-guide.md) | §4.3 how to write a development ticket, with a worked example |
| [templates/](./templates/) | The issue and pull-request templates themselves |

## Installing the templates

The templates live here so there is one copy to change. Each code repository
gets them under `.github/`:

```bash
# from the root of a code repository
mkdir -p .github/ISSUE_TEMPLATE
cp ../documentation/documents/project-management/templates/development-issue.md \
   .github/ISSUE_TEMPLATE/
cp ../documentation/documents/project-management/templates/bug-report.md \
   .github/ISSUE_TEMPLATE/
cp ../documentation/documents/project-management/templates/pull-request-template.md \
   .github/pull_request_template.md
```

GitHub then offers the issue templates in the *New issue* dialog and pre-fills
every pull request description.

## The one-paragraph version

One board, carried over from the design phase, with `Phase = Development` on the
new cards. Five columns, one card in progress per person. Every issue names the
SRS requirement it serves, states its acceptance criteria as Given–When–Then,
and lists the tests that must exist before it can close. Every issue is
estimated in hours; anything over eight is split. Four sprints of four weeks,
shipping `v0.1.0` through `v1.0.0`, each closing with a demo and a retrospective
committed to [documents/retrospectives/](../retrospectives/).

Everything else in this directory is the detail behind that paragraph.
