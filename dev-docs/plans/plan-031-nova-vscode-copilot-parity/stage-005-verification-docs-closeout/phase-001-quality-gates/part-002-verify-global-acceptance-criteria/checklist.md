---
part: part-002-verify-global-acceptance-criteria
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

- [ ] Verify 360px compact density and single action row.
- [ ] Verify Ask/Write/Agent mode behavior.
- [ ] Verify attachment project/file flows and disclosure counts.
- [ ] Verify Agent mode tool loop, cap, abort, chips, and proposal-only behavior.
- [ ] Verify source-contract no-mutation import test result.

## Post-Implementation

- [ ] Every global criterion is checked with evidence path or waiver.
- [ ] Known limitations are explicit and not hidden in impl logs.
- [ ] Critical acceptance criteria have no waiver unless the plan is blocked, not complete.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
