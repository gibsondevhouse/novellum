---
part: part-001-run-required-quality-gates
last_updated: 2026-05-28
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`.
- [ ] All declared dependencies are `complete` or intentionally waived.
- [ ] `part.md` has been reviewed and accepted.
- [ ] Dev environment is ready.
- [ ] Stop conditions from `agent-handoff.md` have been reviewed.

## Implementation

- [ ] Run `pnpm check`.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm lint:css`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm test:visual` or targeted Nova visual substitution with rationale.
- [ ] Run `pnpm check:tokens`.

## Post-Implementation

- [ ] Each required command has recorded output or an accepted waiver.
- [ ] Failures are triaged to specific plan parts before closeout.
- [ ] No plan is marked complete with unexplained failing gates.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
