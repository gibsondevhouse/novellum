---
part: part-002-define-write-subaction-contract
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

- [ ] Define supported Write sub-actions and required inputs.
- [ ] Decide whether sub-actions are chip hints or resolver-only for this plan; default to compact chip hints under active Write mode if low-risk.
- [ ] Ensure unsupported sub-actions return an explicit unsupported result.

## Post-Implementation

- [ ] Write mode contract is explicit in code and docs.
- [ ] Outline, Scene, and Revision are the only named Write actions unless a later plan expands them.
- [ ] Unsupported generation requests do not silently route to generic chat.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
