---
part: part-001-add-attachment-regression-tests
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

- [ ] Test valid `.md` and `.txt` attachments.
- [ ] Test invalid extension, oversize file, malformed payload, dismiss, and clear-on-new-chat.
- [ ] Test project entity attachment appears in context payload.
- [ ] Add a constrained-width visual case for chips above the compact composer.

## Post-Implementation

- [ ] Attachment tests run without network or OpenRouter dependency.
- [ ] Rejected attachments never reach context payload assertions.
- [ ] Visual evidence covers chip wrapping or collapsed behavior.
- [ ] Relevant lint/type/test command has been run or waiver recorded.
- [ ] At least one artifact added to `evidence/`.
- [ ] `impl.log.md` updated with final implementation entry.
- [ ] Part `status` updated to `review` in `part.md` frontmatter.
- [ ] Reviewer Agent notified.
