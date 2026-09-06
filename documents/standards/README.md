# Standards

What the team agreed to work to, committed to `documents/standards/` as
Appendix C requires.

| Document | Covers |
| --- | --- |
| [coding-standards.md](./coding-standards.md) | §5.1 principles, §5.2 language standards, naming, error handling, API and database conventions, security rules |
| [git-workflow.md](./git-workflow.md) | §3.2 branch strategy, §3.3 semantic versioning, §3.4 Conventional Commits, pull requests, branch protection |
| [code-review-standards.md](./code-review-standards.md) | §5.3 review dimensions, comment prefixes, etiquette, approval criteria |
| [definition-of-done.md](./definition-of-done.md) | Appendix A master checklist, plus per-artefact and per-sprint gates |

## What a standard is for

A standard is a decision made once, when nobody is under pressure, so that it
does not have to be made forty times under pressure. That is the whole
justification, and it also sets the test for whether something belongs here:
if a rule would be argued about on a Friday afternoon, write it down; if it
would never be argued about, do not.

Most of what is in these documents is enforced rather than remembered — ESLint
and Prettier decide style, branch protection decides review, the pipeline
decides coverage. The parts that are not enforceable are the parts that need
the reasoning written next to them, which is why these documents explain rather
than list.

## Precedence

When two of these disagree, the order is:

1. The course specification (SENG 34213)
2. [definition-of-done.md](./definition-of-done.md) — it is the gate everything
   passes through
3. The remaining standards
4. Existing code in the repository

Item 4 is last on purpose. "The rest of the file does it this way" is a reason
to raise the inconsistency, not a reason to extend it.
