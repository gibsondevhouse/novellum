---
part: part-002-route-modes-through-task-resolver
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

- [ ] Add mode-aware route selection for Ask, Write, and Agent.
- [ ] Keep Ask path as single-shot chat with grounded context.
- [ ] Route Write to existing pipeline runners where supported.
- [ ] Route Agent to a feature-guarded agent resolver until Stage 004 removes the guard.

## Post-Implementation

- [ ] Mode routing is deterministic and unit-tested.
- [ ] Unsupported Write actions return honest unsupported-action state, not hallucinated output.
- [ ] Ask/Write behavior does not regress existing context grounding.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
