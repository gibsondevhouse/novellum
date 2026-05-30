---
part: part-001-add-mode-pill-control
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

- [ ] Render current mode as a compact pill in the action row.
- [ ] Provide an accessible menu or segmented popover for mode selection.
- [ ] Add one-sentence mode hints without expanding the composer vertically by default.
- [ ] Ensure Agent mode warning copy says proposals only, no auto-apply.

## Post-Implementation

- [ ] Mode pill shows Ask, Write, or Agent exactly.
- [ ] Changing mode updates placeholder and route state immediately.
- [ ] Mode menu is keyboard accessible and screen-reader named.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
