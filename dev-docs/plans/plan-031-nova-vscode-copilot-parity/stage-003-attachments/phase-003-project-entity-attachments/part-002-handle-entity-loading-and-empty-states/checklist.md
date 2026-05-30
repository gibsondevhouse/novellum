---
part: part-002-handle-entity-loading-and-empty-states
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

- [ ] Add loading state while candidates are fetched.
- [ ] Add empty states by entity category.
- [ ] Add safe error state with retry where appropriate.
- [ ] Ensure unavailable entity data does not block file attachment.

## Post-Implementation

- [ ] No project, empty project, and fetch error states are visually distinct.
- [ ] The user is never shown a selectable fake entity.
- [ ] Attachment popover remains usable when one category fails.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
