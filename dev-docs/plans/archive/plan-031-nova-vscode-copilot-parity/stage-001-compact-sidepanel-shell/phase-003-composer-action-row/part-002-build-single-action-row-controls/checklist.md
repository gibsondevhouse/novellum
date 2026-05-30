---
part: part-002-build-single-action-row-controls
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

- [ ] Place `[+] [</>] [Mode] [Model] ... [Send]` controls in one row with responsive truncation.
- [ ] Use 32px send/control sizing and remove decorative drop shadow from the send button.
- [ ] Keep slash/tools slot inert or honestly labeled until Stage 004 backs it with behavior.
- [ ] Verify tab order follows visual order and disabled send state is visible.

## Post-Implementation

- [ ] Action row matches the target control topology.
- [ ] All buttons have accessible names and focus styles.
- [ ] The row remains usable at 280px width without horizontal scrolling.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
