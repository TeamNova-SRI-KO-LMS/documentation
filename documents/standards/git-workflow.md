# Git Workflow & Branching Strategy

SRI-KO Learning Management System · TeamNova

| | |
| --- | --- |
| **Deliverable** | SENG 34213 §3.2 (Branch Strategy), §3.3 (Semantic Versioning), §3.4 (Commit Messages) |
| **Applies to** | Every repository in the organisation |

---

## 1. Branch strategy

```text
main ────●─────────────────●──────────────────●────────►  v0.1.0   v0.2.0   v1.0.0
          \               /                  /
           \   ┌────────●─── release/0.2.0 ─┘
            \  │
develop ─────●─●───●───●───●───●───●───●───●───●────────►
              \   /     \     /     \     /
               ●─●       ●───●       ●───●
          feature/42-  feature/51-  fix/67-
          user-auth    enrolment    token-expiry
```

| Branch | Purpose | Protected | Merges from |
| --- | --- | --- | --- |
| `main` | Production. Tagged with a SemVer release each time. | Yes | `release/*`, `hotfix/*` |
| `develop` | Integration. The default branch. | Yes | `feature/*`, `fix/*` |
| `feature/<id>-<slug>` | One GitHub issue | No | — |
| `fix/<id>-<slug>` | One bug fix | No | — |
| `hotfix/<slug>` | Emergency production fix, branched from `main` | No | — |
| `release/<version>` | Version bump, changelog, smoke tests | No | — |

### Naming

```text
feature/42-user-authentication
fix/67-login-token-expiry
hotfix/payment-double-charge
release/0.2.0
```

The issue number comes first so the board and the branch list read the same way.

### Branch hygiene (§3.2)

**A branch open for more than five working days without a PR indicates a work
breakdown problem.** Split the issue into sub-issues immediately.

This is not a style rule. A long-lived branch diverges from `develop`, and the
merge conflict it eventually produces is proportional to how long it lived. The
five-day limit exists so that conflict never gets large enough to be dangerous.

---

## 2. Commit messages

Conventional Commits, as §3.4 requires.

```text
<type>(<scope>): <subject>

<body — why, not what>

<footer — issue and ADR references>
```

### Types

| Type | Use when | Version impact |
| --- | --- | --- |
| `feat` | A new feature | MINOR |
| `fix` | A bug fix | PATCH |
| `test` | Adding or updating tests | none |
| `ci` | Pipeline configuration | none |
| `build` | Build system or dependencies | none |
| `perf` | Performance improvement | PATCH |
| `refactor` | Restructuring with no behaviour change | none |
| `docs` | Documentation | none |
| `chore` | Tooling, configuration, housekeeping | none |
| `style` | Formatting only | none |
| `revert` | Reverting an earlier commit | varies |

### Subject line

- Imperative mood: "add", not "added" or "adds".
- No trailing full stop.
- 72 characters or fewer.
- Lower case after the colon.

### Body

Explain **why**. The diff already shows what changed; what a reader six months
from now cannot recover is the reason.

### Examples

```text
feat(auth): implement JWT refresh token rotation

Implements the sliding-window refresh strategy from SDS §4.3.2. Tokens are
rotated on each use; a reused token invalidates every active session for that
user, on the assumption that reuse means theft.

Closes #54
Refs ADR-07
```

```text
fix(payment): prevent double-charge on network timeout

Added idempotency key validation before processing any charge. Resolves the
customer-reported issue where a slow connection triggered duplicate API calls
and the second was processed as a separate payment.

Closes #89
```

```text
test(inventory): add integration tests for the low-stock alert trigger

Covers the happy path and the boundaries: exactly at threshold, one below, and
zero stock. Mocks the notification service and asserts the payload rather than
the call count, so a change to retry behaviour does not break the test.

Refs #77
```

### Anti-patterns

```text
✗ update            — update what, and why?
✗ fix bug           — which bug?
✗ WIP               — do not commit work in progress to a shared branch
✗ asdf              —
✗ Fixed the thing that was broken in the admin page hopefully this works now
```

---

## 3. Pull requests

### Before opening

- [ ] Rebased on the latest `develop`
- [ ] `npm run lint` and `npm run format:check` pass
- [ ] Every test passes locally
- [ ] Coverage gates pass
- [ ] The description is complete
- [ ] `CHANGELOG.md` updated under `[Unreleased]`

### Description

Every PR states what changed, why, how it was tested, and which issue it closes.
"Fixes stuff" is not a description; a reviewer who has to reconstruct the intent
from the diff is reviewing blind.

### Review (§5.3)

At least one approving review before merge. Reviewers assess:

| Dimension | Question |
| --- | --- |
| Correctness | Does it do what the ticket specifies? Do the AC tests pass? |
| Readability | Could a new team member understand this without the author? |
| Architecture | Is it consistent with the SDS? |
| Test quality | Do the tests test behaviour, or implementation? |
| Security | Hard-coded secrets? Unvalidated input? Missing authorisation? |
| Performance | N+1 queries? Blocking calls in an async path? |
| Error handling | Is every error case handled, and surfaced meaningfully? |

### Comment prefixes (§5.3)

| Prefix | Meaning |
| --- | --- |
| `[blocker]` | Must be fixed before merge |
| `[suggestion]` | Recommended, not mandatory for this PR |
| `[question]` | Asking for clarification; not necessarily a problem |
| `[nit]` | Minor style point; reviewer's preference only |

**The author does not resolve a reviewer's comment.** The reviewer resolves it
after verifying the change. This is not ceremony — it is the only thing that
distinguishes "addressed" from "dismissed".

### Merging

Squash-merge into `develop`. The squashed message follows Conventional Commits
and closes the issue. Delete the branch afterwards.

---

## 4. Semantic versioning (§3.3)

`vMAJOR.MINOR.PATCH`

| Segment | Increment when | Example |
| --- | --- | --- |
| MAJOR | A breaking API or data model change | v1.0.0 → v2.0.0 |
| MINOR | A backwards-compatible feature | v1.0.0 → v1.1.0 |
| PATCH | A backwards-compatible fix | v1.1.0 → v1.1.1 |

### Sprint milestones

| Sprint | Version | Theme |
| --- | --- | --- |
| Sprint 5 | v0.1.0 | Foundation and infrastructure |
| Sprint 6 | v0.2.0 | Core features |
| Sprint 7 | v0.3.0 | Integration and UX |
| Sprint 8 | v1.0.0 | Quality and release |

### Release procedure

```bash
git checkout develop && git pull
git checkout -b release/0.2.0

# bump versions, move [Unreleased] to [0.2.0] in CHANGELOG.md, smoke test
git commit -m "chore(release): prepare v0.2.0"

git checkout main && git merge --no-ff release/0.2.0
git tag -a v0.2.0 -m "Release v0.2.0 — Sprint 6: core features"
git push origin main --tags

git checkout develop && git merge --no-ff release/0.2.0
git branch -d release/0.2.0
```

---

## 5. Branch protection

| Setting | `main` | `develop` |
| --- | --- | --- |
| Require a pull request | Yes | Yes |
| Required approving reviews | 1 | 1 |
| Dismiss stale approvals on new commits | Yes | Yes |
| Require status checks to pass | Yes | Yes |
| Required check | `CI Pipeline` | `CI Pipeline` |
| Require branches to be up to date | Yes | Yes |
| Require conversation resolution | Yes | Yes |
| Allow force push | No | No |
| Allow deletion | No | No |

The pipeline exposes a single aggregate `CI Pipeline` check, so adding a stage
does not require reconfiguring the protected branch.

---

## 6. Daily workflow

```bash
# Start
git checkout develop && git pull origin develop
git checkout -b feature/42-user-authentication

# Work — commit early, commit often, each commit a coherent step
git add -p
git commit -m "feat(auth): add JWT token generation"

# Keep current — rebase rather than merge, so history stays linear
git fetch origin && git rebase origin/develop

# Publish
git push -u origin feature/42-user-authentication
# open the PR against develop

# After merge
git checkout develop && git pull origin develop
git branch -d feature/42-user-authentication
```

---

## 7. What never gets committed

| Never | Instead |
| --- | --- |
| `.env`, credentials, tokens, connection strings | Environment variables; GitHub Secrets; a committed `.env.example` |
| `node_modules/` | `.gitignore` |
| Build output — `dist/`, `build/`, `coverage/` | Regenerate; publish as CI artefacts |
| `.DS_Store`, `.idea/`, `.vscode/` | Global `.gitignore` |
| Large binaries | Git LFS, or an external store |
| Commented-out code | Delete it; git remembers |

§7 is explicit: **never commit a secret, even to a private repository.** A
private repository can become public, and a leaked credential in history
survives every later deletion.
