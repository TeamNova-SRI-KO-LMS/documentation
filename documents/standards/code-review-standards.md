# Code Review Standards

SRI-KO Learning Management System · TeamNova

| | |
| --- | --- |
| **Deliverable** | SENG 34213 §5.3 (Code Review Standards) |

---

## 1. Why review

Review catches defects, but that is not its main value — the test suite catches
more defects, faster. Review exists so that **at least two people understand
every part of the system**, and so that decisions are made deliberately rather
than by whoever typed first.

A review that only says "LGTM" has produced neither.

---

## 2. What a reviewer checks

| Dimension | Questions |
| --- | --- |
| **Correctness** | Does it do what the ticket specifies? Do the acceptance-criteria tests pass? Are the edge cases handled? |
| **Readability** | Could a new team member understand this without asking the author? Do the names say what they mean? |
| **Architecture** | Is it consistent with the SDS? Does business logic sit in the model, HTTP concerns in the route? |
| **Test quality** | Are the tests meaningful? Do they test behaviour, not implementation? Would they catch the bug this change prevents? |
| **Security** | Hard-coded secrets? Unvalidated input? Missing authorisation? A secret in a log line? |
| **Performance** | N+1 queries? An unindexed filter? A blocking call in an async path? |
| **Error handling** | Is every error case handled? Are errors surfaced meaningfully, and without leaking internals? |

---

## 3. Comment prefixes

Every comment carries one, so the author can tell instantly what must change and
what is a conversation.

| Prefix | Meaning | Blocks merge |
| --- | --- | --- |
| `[blocker]` | Must be fixed before merge | Yes |
| `[suggestion]` | Improvement recommended, not mandatory for this PR | No |
| `[question]` | Asking for clarification; not necessarily a problem | No |
| `[nit]` | Minor style point; reviewer's preference only | No |

**Examples**

A `[blocker]` names the failure and points at the fix. It is not "this looks
wrong":

> `[blocker]` This route reads `req.body.role` and passes it to `User.create`.
> The endpoint is unauthenticated, so anyone can create an administrator. The
> Google path in the same file already rejects this — see line 268.

A `[suggestion]` says what improves and by how much, so the author can weigh it
against the deadline:

> `[suggestion]` These three handlers each rebuild the same filter object.
> Extracting it would make the next filter a one-line change.

A `[question]` is a real question. If you already know the answer, it is a
`[blocker]` or a `[suggestion]` wearing a disguise:

> `[question]` Is the `$or` here intentional? It means a search for "korean"
> also matches descriptions, which the admin UI does not indicate.

A `[nit]` is small enough that the author may ignore it without replying:

> `[nit]` `usersList` → `users`.

---

## 4. Etiquette

### Authors

- **Do not resolve a reviewer's comment yourself** (§5.3). The reviewer resolves
  it after verifying the change. This is the only thing that distinguishes
  "addressed" from "dismissed".
- Reply to every comment, even if only to agree.
- Push fixes as new commits during review, so the reviewer can see what changed;
  squash on merge.
- Disagreement is fine — say why. "I'd rather not, because…" is a contribution.

### Reviewers

- Review within one working day. A PR waiting three days is a branch diverging
  for three days.
- Comment on the code, never the coder. "This misses the deactivated case", not
  "you forgot".
- Say what is good, not only what is wrong.
- Ask rather than assert when unsure — `[question]` exists for that.
- If a change is large enough that you cannot review it properly, say so and ask
  for it to be split. Approving something you have not understood is worse than
  refusing to review it.

---

## 5. Size

| Lines changed | Realistic review |
| --- | --- |
| < 200 | Thorough |
| 200–400 | Good, with effort |
| 400–1000 | Superficial |
| > 1000 | Rubber stamp |

A PR above 400 lines should normally be split. Where it genuinely cannot be —
a generated file, a large move — say so in the description and point the
reviewer at the parts that need real attention.

---

## 6. Approval

A PR may be approved when:

- [ ] Every `[blocker]` is resolved by the reviewer who raised it
- [ ] CI is green
- [ ] The Definition of Done in the PR template is complete
- [ ] The reviewer understands the change well enough to maintain it

That last item is the real bar. "It looks fine" is not the same as
understanding it.

---

## 7. Rejecting a review

Request changes — do not approve with reservations — when the change:

- introduces a security defect;
- has no tests for new logic;
- contradicts the SDS without an ADR;
- is too large to review properly;
- fails CI.

Requesting changes is not a judgement about the author. It is the mechanism
working.
