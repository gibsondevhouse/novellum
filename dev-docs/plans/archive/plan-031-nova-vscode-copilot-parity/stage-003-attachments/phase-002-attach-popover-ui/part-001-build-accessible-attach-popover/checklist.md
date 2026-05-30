---
part: part-001-build-accessible-attach-popover
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

- [ ] Create a popover anchored to the attach button.
- [ ] Add tabs for `From project` and `Upload` with roving/focusable controls.
- [ ] Close on Escape and outside click while preserving selected attachments.
- [ ] Display empty, loading, and error states without layout jump.

## Post-Implementation

- [ ] Attach button opens and closes popover reliably.
- [ ] Tabs are keyboard accessible and screen-reader named.
- [ ] Popover does not overflow the sidepanel at 280px width.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
