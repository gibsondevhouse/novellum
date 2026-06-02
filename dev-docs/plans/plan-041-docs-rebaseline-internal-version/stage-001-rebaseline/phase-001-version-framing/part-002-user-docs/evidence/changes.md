# User Docs Cleanup — Changes

## `novellum-docs/user/nova.md`

**Removed:**

> Four more agents are planned (Brainstorm, Outline, Draft, Summarize) and
> are not yet shipped. You will see them appear in future releases.

**Replaced with:**

> Additional agents may be added as Novellum's AI capabilities grow.

**Justification:** AGENTS.md (the single source of truth for the agent
ecosystem) records that BrainstormAgent, OutlineAgent, DraftAgent, and
SummaryAgent were cut from V1 by plan-025 (2026-05-13) and never wired to a
parser. Promising them in user docs is misleading.

## `novellum-docs/user/faq.md`

**Old answer:**

> Read [LICENSE](../../LICENSE), [EULA.md](../../EULA.md), and [TERMS.md](../../TERMS.md)
> for the authoritative answer. Licensing is being formalized as part of
> [plan-018-v1-product-experience](../../dev-docs/plans/plan-018-v1-product-experience/plan.md).

**New answer:**

> Read [LICENSE](../../LICENSE), [EULA.md](../../EULA.md), and [TERMS.md](../../TERMS.md)
> for the authoritative answer.

**Justification:** plan-018 closed 2026-05-06. The licensing scaffolding is
in place; LICENSE/EULA/TERMS are the canonical source. Pointing readers at a
closed plan suggests the answer is still pending.

`Last verified` rolled to 2026-06-01.
