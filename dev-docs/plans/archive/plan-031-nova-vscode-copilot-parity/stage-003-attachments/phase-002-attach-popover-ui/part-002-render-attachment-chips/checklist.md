---
part: part-002-render-attachment-chips
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

- [ ] Render entity and file chips with labels, type icons or text, and dismiss buttons.
- [ ] Wrap chips without making the composer taller than necessary.
- [ ] Expose attachment count to disclosure logic for later context wiring.

## Post-Implementation

- [ ] Chips are visible, dismissible, and do not crowd the action row.
- [ ] Chip remove actions are keyboard accessible.
- [ ] Duplicate labels remain distinguishable by type or secondary metadata.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
