---
part: part-001-update-nova-module-docs
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

- [ ] Document the embedded sidepanel as the canonical Nova runtime for this branch.
- [ ] Document Ask, Write, and Agent responsibilities and boundaries.
- [ ] Document attachment limits and context disclosure behavior.
- [ ] Document proposal-only mutation rule and no auto-apply guarantee.

## Post-Implementation

- [ ] Module docs match shipped behavior and names.
- [ ] Docs explicitly state direct manuscript mutation is out of scope.
- [ ] No docs refer to old Chat/Scribe semantics except as historical migration notes.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
