---
part: part-001-apply-active-master-plan-updates
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

- [ ] Apply the ACTIVE-PLAN snippet from this package or equivalent repo-current edit.
- [ ] Add plan-031 to MASTER-PLAN Active Plans while retaining plan-030 closeout history.
- [ ] Add supersession note for plan-030 stages 002 and 003.
- [ ] Confirm plan-030 stage 001 is not accidentally superseded.

## Post-Implementation

- [ ] Trackers point to plan-031 as current active Nova plan.
- [ ] Plan-030 stage 002/003 are marked superseded by plan-031, not silently overwritten.
- [ ] No stale tracker row says plan-030 owns work now governed by plan-031.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
