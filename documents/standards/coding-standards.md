# Coding Standards

SRI-KO Learning Management System · TeamNova

| | |
| --- | --- |
| **Deliverable** | SENG 34213 §5.2 and Appendix C — "Coding standards document committed to `documents/standards/`" |
| **Applies to** | `app`, `testing`, `infrastructure` |
| **Status** | Adopted in Sprint 5, Week 1 |
| **Version** | `[version]` · `[date]` |

---

## 1. Principles

§5.1 requires SOLID, DRY, YAGNI and Clean Code. Those are well known; what
follows is what they mean *for this codebase*, with the judgement calls spelled
out. A principle nobody can apply to a real decision is decoration.

### Single responsibility

A module has one reason to change. In practice, for this project:

- a **route handler** translates HTTP to a domain operation and back — it does
  not contain business rules;
- a **model** holds rules that must be true however the document was created —
  password hashing, rating averages, completion dating;
- a **middleware** does one cross-cutting thing.

When a route handler grows past about 60 lines, the excess is almost always a
rule that belongs in the model.

### Open/closed, Liskov, interface segregation, dependency inversion

These matter less in a small Express application than the SOLID acronym implies,
and pretending otherwise produces abstractions with one implementation. Where
they apply concretely:

- **Open/closed** — `authorize(...roles)` is a factory, so a new role needs no
  change to the guard.
- **Dependency inversion** — routes depend on Mongoose models, not on the driver.
  Swapping the ODM would touch the models only.

### DRY, honestly

Extract when the *rule* is shared, not when the *text* is similar. Two
validators that both check a length are not duplication; two places that decide
who may edit a course are.

The counterweight: a wrong abstraction costs more than duplication, because
duplication is easy to remove later and a bad abstraction is not. Duplicate
twice, extract on the third.

### YAGNI

Implement what this sprint's acceptance criteria require. A configuration option
with one value, an interface with one implementation, and a hook nothing calls
are all cost with no benefit.

---

## 2. Language standards

| Language | Style guide | Linter | Formatter |
| --- | --- | --- | --- |
| JavaScript / JSX | Airbnb, adapted | ESLint 9 flat config | Prettier |
| TypeScript | Airbnb, adapted | ESLint + `@typescript-eslint` | Prettier |

Configuration files are committed at each repository root — `eslint.config.js`
and `.prettierrc` — as Appendix C requires.

### Formatting

Prettier decides formatting. It is not a matter of taste and not a subject for
review comments.

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

`npm run format` writes; `npm run format:check` verifies and runs in CI.

---

## 3. Naming

| Kind | Convention | Example |
| --- | --- | --- |
| Variable, function | `camelCase` | `enrolledCourses`, `calculateProgress` |
| Class, model, React component | `PascalCase` | `ApiService`, `Certificate`, `ProtectedRoute` |
| Constant | `SCREAMING_SNAKE_CASE` | `VALID_PASSWORD`, `MAX_UPLOAD_BYTES` |
| Boolean | `is` / `has` / `can` prefix | `isPublished`, `hasEnrolled`, `canCreateCourse` |
| File — model | `PascalCase.js` | `User.js` |
| File — route, middleware | `camelCase.js` | `authRoutes.js`, `validation.js` |
| File — React component | `PascalCase.jsx` | `AdminLayout.jsx` |
| Test file | `<subject>.<layer>.test.js` | `auth.middleware.test.js` |
| MongoDB collection | Lower-case plural | `users`, `discussionposts` |
| API path | Lower-case, hyphenated, plural | `/api/join-us/submissions` |

**Names state intent, not type.** `userList` is worse than `users`; `data`,
`info`, `temp` and `obj` say nothing. A name that needs a comment to explain it
is the wrong name.

---

## 4. Functions

- One job per function. If the name needs "and", it is two functions.
- Prefer four parameters or fewer; beyond that, take an options object.
- Return early. Deep nesting is usually an inverted guard clause.
- No magic numbers or strings — name them.

```js
// ✗ what is 10? what is 12?
const salt = await bcrypt.genSalt(10);
if (attempts > 12) lock();

// ✓
const BCRYPT_COST_FACTOR = 12;      // OWASP A02 minimum (§8.1)
const MAX_FAILED_ATTEMPTS = 5;

const salt = await bcrypt.genSalt(BCRYPT_COST_FACTOR);
if (attempts > MAX_FAILED_ATTEMPTS) lock();
```

---

## 5. Comments

Code says *what*. Comments say *why* — and only where the why is not obvious.

```js
// ✗ restates the code
// increment the counter
counter += 1;

// ✓ explains a decision the reader cannot infer
// paymentDate is re-synced here because the revenue aggregations group on it;
// leaving it at the creation date attributes the money to the wrong month.
this.paymentDate = now;
```

Comment when: a decision has a non-obvious reason; a workaround exists for an
external constraint; an ordering or a subtlety would otherwise look accidental;
or something is *deliberately* not done.

Delete commented-out code. Git remembers it.

Public functions, models and middleware carry a JSDoc block: one sentence of
purpose, then `@param` and `@returns` where the types are not obvious.

---

## 6. Error handling

**Every async route handler is wrapped in `try/catch`.** An unhandled rejection
in Express 5 does not reach the error middleware reliably.

**Fail closed.** When a check cannot be completed, refuse. Authentication that
cannot reach the database returns 401, not 200.

**Never leak internals.** Stack traces, file paths, driver messages and
connection strings stay out of responses.

```js
// ✗
catch (error) {
  res.status(500).json({ success: false, error: error.stack });
}

// ✓
catch (error) {
  console.error('Enrolment error:', error);
  res.status(500).json({
    success: false,
    message: 'Server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message }),
  });
}
```

**Use the right status.** 400 the client sent something invalid · 401 not
authenticated · 403 authenticated but not permitted · 404 no such resource, and
also when a resource exists but belongs to someone else, so the API does not
confirm its existence · 409 a conflict with current state · 500 the server broke.

---

## 7. API conventions

Every response carries the same envelope:

```js
{ success: true,  message: '…', <resource>: … }
{ success: false, message: '…', errors: [ … ] }
```

Rules that follow from it:

- Resource nouns are plural and hyphenated: `/api/join-us/submissions`.
- Verbs live in the HTTP method, not the path — `DELETE /api/courses/:id`, never
  `/api/courses/:id/delete`.
- **Literal paths are declared before parameterised ones within a router.**
  Express matches in order, so `/:id` declared first shadows `/stats`,
  `/target-users` and every other literal sibling. This convention exists
  because that mistake was made twice in this codebase — see DEFECT-21 and
  DEFECT-24.
- Every list endpoint paginates and returns `count`, `total`, `page`, `pages`.
- Every write endpoint validates before touching the database, and reports every
  offending field at once.

---

## 8. Database conventions

- **Schema-first.** Every field is declared with a type; `strict` mode drops
  everything else.
- **Constraints belong in the database.** An application "does this already
  exist?" check is a race two concurrent requests can both pass. Uniqueness is a
  unique index; the application check is a nicer error message, not the
  guarantee.
- **`sparse` with `unique` on optional fields.** A plain unique index rejects the
  second document holding null.
- **Index what you filter and sort on**, and nothing else — every index costs on
  write.
- **Never store a secret recoverably.** Passwords are bcrypt; reset tokens are
  SHA-256; no card data is ever collected.

---

## 9. Security rules

Non-negotiable. Each maps to a control in §8.1.

| Rule | Risk |
| --- | --- |
| No secret in the repository — environment variables only | A05 |
| No credential, token or secret in a log line | A09 |
| Every non-public route composes `protect`, and `authorize` where a role applies | A01 |
| Resource lookups are scoped to the caller's own id | A01 |
| Passwords hashed with bcrypt, cost factor ≥ 12 | A02 |
| Every write endpoint validates its input | A03 |
| Uploads restricted by type and size; stored names generated server-side | A04 |
| Errors disclose nothing internal in production | A05 |
| `npm audit --audit-level=high` clean before merge | A06 |

---

## 10. Frontend conventions

- Function components with hooks. No class components.
- One component per file, named for the file.
- Data fetching goes through `services/`, never `fetch` in a component.
- Server state through React Query; client state through Context and `useReducer`.
- Every list has a `key` that is a stable id, never an array index.
- Every network call has a loading state and an error state. A screen that shows
  nothing while loading and nothing on failure looks identical to a broken one.
- Tailwind utilities in JSX; extract a component when a class list repeats.

---

## 11. Testing standards

Tests are production code (§6.1). Standards in full: `testing/docs/TEST_STRATEGY.md`.

| Rule | Why |
| --- | --- |
| Arrange–Act–Assert | §6.3.1 |
| Test names are sentences a non-programmer can read | A CI failure should be diagnosable from the test list |
| Test behaviour, not implementation | A refactor that preserves behaviour breaks nothing |
| One reason to fail per test | The failure message is then the diagnosis |
| Boundaries, not midpoints | Testing "10" says nothing about where the limit is |
| Factories, not object literals | Says what the test cares about; survives schema changes |
| No `.only` in a commit | It silently disables the rest of the suite while CI stays green |

---

## 12. Git conventions

Full detail in `documents/standards/git-workflow.md`. Summary:

- Conventional Commits (§3.4) — `feat`, `fix`, `test`, `ci`, `build`, `perf`,
  `refactor`, `docs`, `chore`, `style`, `revert`.
- One branch per issue: `feature/<id>-<slug>` or `fix/<id>-<slug>`.
- A branch open more than 5 working days without a PR means the work was not
  broken down enough (§3.2). Split the issue.
- Every commit references its issue; the PR closes it.

---

## 13. Enforcement

| Check | Where | Blocking |
| --- | --- | --- |
| ESLint — zero errors | CI, stage 1 | Yes |
| Prettier — formatted | CI, stage 1 | Yes |
| Unit tests | CI, stage 3 | Yes |
| Integration tests | CI, stage 4 | Yes |
| Coverage ≥ 80 %, ≥ 90 % critical | CI, stage 4 | Yes |
| 100 % API endpoint coverage | CI, stage 4 | Yes |
| `npm audit --audit-level=high` | CI, stage 5 | Yes |
| One approving review | Branch protection | Yes |

A standard nobody checks is a preference. Everything above is checked by the
pipeline, which is why this document is short: it explains the *reasoning*, and
the machine enforces the rules.
