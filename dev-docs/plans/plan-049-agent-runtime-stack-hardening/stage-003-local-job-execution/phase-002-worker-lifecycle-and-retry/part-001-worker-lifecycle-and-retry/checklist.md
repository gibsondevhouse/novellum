---
part: part-001-worker-lifecycle-and-retry
last_updated: 2026-06-11
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] Queue schema and claiming part is complete
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] All files listed in `part.md > Files > Create` have been created
- [ ] All files listed in `part.md > Files > Update` have been updated
- [ ] Each acceptance criterion in `part.md` is satisfied
- [ ] Edge cases addressed

## Post-Implementation

- [ ] `pnpm check` passes with zero errors
- [ ] Worker tests pass
- [ ] Targeted e2e flows pass or are documented with blocker evidence
- [ ] At least one artifact added to `evidence/`
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
