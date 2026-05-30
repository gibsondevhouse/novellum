---
part: part-001-compress-header-and-status-pill
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

- [ ] Reduce header vertical padding from the current generous layout to compact token spacing.
- [ ] Move subtitle/status copy into an inline low-contrast pill where appropriate.
- [ ] Preserve no-key, no-project, grounded, and loading state clarity.
- [ ] Verify header controls remain reachable by keyboard and screen reader labels remain accurate.

## Post-Implementation

- [ ] Header remains readable at 280px width without wrapping into a bulky block.
- [ ] Context disclosure remains visible or intentionally collapsed into a labeled affordance.
- [ ] No user-facing label says Copilot instead of Nova.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
